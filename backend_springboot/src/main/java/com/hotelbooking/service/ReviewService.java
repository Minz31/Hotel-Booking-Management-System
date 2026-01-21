package com.hotelbooking.service;

import com.hotelbooking.model.Booking;
import com.hotelbooking.model.Guest;
import com.hotelbooking.model.Review;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.GuestRepository;
import com.hotelbooking.repository.ReviewRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GuestRepository guestRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public Map<String, Object> getHotelReviews(String hotelId, int page, int limit, String sort) {
        String orderClause = switch (sort) {
            case "rating_high" -> "r.rating DESC";
            case "rating_low" -> "r.rating ASC";
            case "helpful" -> "r.helpful_count DESC";
            default -> "r.created_at DESC";
        };

        int offset = (page - 1) * limit;

        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("""
                SELECT r.*,
                    g.first_name, g.last_name,
                    rt.name AS room_type,
                    a.full_name AS responded_by
                FROM reviews r
                JOIN guests g ON r.guest_id = g.id
                LEFT JOIN room_types rt ON r.room_type_id = rt.id
                LEFT JOIN administrators a ON r.response_by = a.id
                WHERE r.hotel_id = :hotelId AND r.is_approved = TRUE
                ORDER BY
                """);
        sqlBuilder.append(orderClause);
        sqlBuilder.append(" LIMIT :limit OFFSET :offset");
        String sql = sqlBuilder.toString();

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("hotelId", hotelId);
        query.setParameter("limit", limit);
        query.setParameter("offset", offset);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        List<Map<String, Object>> reviews = results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("booking_id", row[1]);
            map.put("guest_id", row[2]);
            map.put("hotel_id", row[3]);
            map.put("rating", row[4]);
            map.put("title", row[5]);
            map.put("comment", row[6]);
            map.put("response", row[7]);
            map.put("first_name", row.length > 8 ? row[8] : null);
            map.put("last_name", row.length > 9 ? row[9] : null);
            return map;
        }).toList();

        // Get statistics
        String statsSql = """
                    SELECT
                        COUNT(*) AS total_reviews,
                        ROUND(AVG(rating), 2) AS avg_overall,
                        ROUND(AVG(cleanliness_rating), 2) AS avg_cleanliness,
                        ROUND(AVG(service_rating), 2) AS avg_service,
                        ROUND(AVG(location_rating), 2) AS avg_location,
                        ROUND(AVG(value_rating), 2) AS avg_value,
                        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
                        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
                        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
                        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
                        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star
                    FROM reviews
                    WHERE hotel_id = :hotelId AND is_approved = TRUE
                """;

        Query statsQuery = entityManager.createNativeQuery(statsSql);
        statsQuery.setParameter("hotelId", hotelId);
        Object[] statsRow = (Object[]) statsQuery.getSingleResult();

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("total_reviews", statsRow[0]);
        statistics.put("avg_overall", statsRow[1]);
        statistics.put("avg_cleanliness", statsRow[2]);
        statistics.put("avg_service", statsRow[3]);
        statistics.put("avg_location", statsRow[4]);
        statistics.put("avg_value", statsRow[5]);
        statistics.put("five_star", statsRow[6]);
        statistics.put("four_star", statsRow[7]);
        statistics.put("three_star", statsRow[8]);
        statistics.put("two_star", statsRow[9]);
        statistics.put("one_star", statsRow[10]);

        Map<String, Object> response = new HashMap<>();
        response.put("reviews", reviews);
        response.put("statistics", statistics);

        return response;
    }

    @Transactional
    public Map<String, Object> createReview(Map<String, Object> payload, String guestId) {
        String bookingId = (String) payload.get("booking_id");

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getGuest().getId().equals(guestId)) {
            throw new RuntimeException("You can only review your own bookings");
        }

        if (!"checked_out".equals(booking.getStatus())) {
            throw new RuntimeException("You can only review after checkout");
        }

        // Check if review already exists
        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new RuntimeException("Review already exists for this booking");
        }

        Guest guest = guestRepository.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Guest not found"));

        Review review = new Review();
        review.setBooking(booking);
        review.setGuest(guest);
        review.setHotelId(booking.getHotel().getId());
        review.setRating(Integer.parseInt(payload.get("rating").toString()));
        review.setTitle((String) payload.get("title"));
        review.setComment((String) payload.get("comment"));
        review.setIsVerified(true);
        review.setDate(LocalDate.now());

        if (payload.containsKey("cleanliness_rating"))
            review.setCleanlinessRating(Integer.parseInt(payload.get("cleanliness_rating").toString()));
        if (payload.containsKey("service_rating"))
            review.setServiceRating(Integer.parseInt(payload.get("service_rating").toString()));
        if (payload.containsKey("location_rating"))
            review.setLocationRating(Integer.parseInt(payload.get("location_rating").toString()));
        if (payload.containsKey("value_rating"))
            review.setValueRating(Integer.parseInt(payload.get("value_rating").toString()));

        Review saved = reviewRepository.save(review);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        return result;
    }

    @Transactional
    public void addHotelResponse(String reviewId, String response, String adminId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setResponse(response);
        review.setResponseBy(adminId);
        reviewRepository.save(review);
    }

    @Transactional
    public void markHelpful(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setHelpfulCount((review.getHelpfulCount() != null ? review.getHelpfulCount() : 0) + 1);
        reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(String reviewId, String userRole, String userHotelId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if ("hotel_admin".equals(userRole) && !review.getHotelId().equals(userHotelId)) {
            throw new RuntimeException("Not authorized to delete this review");
        }

        reviewRepository.delete(review);
    }
}
