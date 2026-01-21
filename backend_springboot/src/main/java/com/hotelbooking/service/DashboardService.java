package com.hotelbooking.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    @PersistenceContext
    private EntityManager entityManager;

    public Map<String, Object> getDashboardStats(String role, String hotelId) {
        Map<String, Object> stats = new HashMap<>();

        boolean isHotelAdmin = "hotel_admin".equals(role) && hotelId != null;

        try {
            // 1. Total Bookings
            String bookingCountSql = "SELECT COUNT(*) FROM bookings"
                    + (isHotelAdmin ? " WHERE hotel_id = :hotelId" : "");
            Query bookingQuery = entityManager.createNativeQuery(bookingCountSql);
            if (isHotelAdmin)
                bookingQuery.setParameter("hotelId", hotelId);
            Number bookingCount = (Number) bookingQuery.getSingleResult();
            stats.put("total_bookings", bookingCount != null ? bookingCount.longValue() : 0L);
        } catch (Exception e) {
            log.error("Error getting booking count", e);
            stats.put("total_bookings", 0L);
        }

        try {
            // 2. Total Hotels
            if ("super_admin".equals(role)) {
                Query hotelQuery = entityManager.createNativeQuery("SELECT COUNT(*) FROM hotels");
                Number hotelCount = (Number) hotelQuery.getSingleResult();
                stats.put("total_hotels", hotelCount != null ? hotelCount.longValue() : 0L);
            } else {
                stats.put("total_hotels", 1L);
            }
        } catch (Exception e) {
            log.error("Error getting hotel count", e);
            stats.put("total_hotels", 0L);
        }

        try {
            // 3. Total Users/Guests
            if ("super_admin".equals(role)) {
                Query guestQuery = entityManager.createNativeQuery("SELECT COUNT(*) FROM guests");
                Number guestCount = (Number) guestQuery.getSingleResult();
                stats.put("total_users", guestCount != null ? guestCount.longValue() : 0L);
            } else if (hotelId != null) {
                String guestCountSql = "SELECT COUNT(DISTINCT guest_id) FROM bookings WHERE hotel_id = :hotelId";
                Query guestQuery = entityManager.createNativeQuery(guestCountSql);
                guestQuery.setParameter("hotelId", hotelId);
                Number guestCount = (Number) guestQuery.getSingleResult();
                stats.put("total_users", guestCount != null ? guestCount.longValue() : 0L);
            } else {
                stats.put("total_users", 0L);
            }
        } catch (Exception e) {
            log.error("Error getting user count", e);
            stats.put("total_users", 0L);
        }

        try {
            // 4. Revenue
            String revenueSql = """
                        SELECT COALESCE(SUM(final_amount), 0)
                        FROM bookings
                        WHERE status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
                    """;
            if (isHotelAdmin) {
                revenueSql += " AND hotel_id = :hotelId";
            }
            Query revenueQuery = entityManager.createNativeQuery(revenueSql);
            if (isHotelAdmin)
                revenueQuery.setParameter("hotelId", hotelId);
            Number revenue = (Number) revenueQuery.getSingleResult();
            stats.put("revenue", revenue != null ? revenue.doubleValue() : 0.0);
        } catch (Exception e) {
            log.error("Error getting revenue", e);
            stats.put("revenue", 0.0);
        }

        return stats;
    }

    public List<Map<String, Object>> getRecentActivity(String role, String hotelId) {
        List<Map<String, Object>> activities = new ArrayList<>();
        int limit = 10;

        boolean isHotelAdmin = "hotel_admin".equals(role) && hotelId != null;

        try {
            // 1. Recent Bookings
            String bookingSql = """
                        SELECT
                            b.id, 'booking' as type, b.created_at,
                            CONCAT(g.first_name, ' ', g.last_name) as user_name,
                            h.name as hotel_name,
                            b.status
                        FROM bookings b
                        JOIN guests g ON b.guest_id = g.id
                        JOIN hotels h ON b.hotel_id = h.id
                        WHERE 1=1
                    """;
            if (isHotelAdmin) {
                bookingSql += " AND b.hotel_id = :hotelId";
            }
            bookingSql += " ORDER BY b.created_at DESC LIMIT :limit";

            Query bookingQuery = entityManager.createNativeQuery(bookingSql);
            if (isHotelAdmin)
                bookingQuery.setParameter("hotelId", hotelId);
            bookingQuery.setParameter("limit", limit);

            @SuppressWarnings("unchecked")
            List<Object[]> bookingResults = bookingQuery.getResultList();
            for (Object[] row : bookingResults) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", row[0]);
                activity.put("type", row[1]);
                activity.put("created_at", row[2]);
                activity.put("user_name", row[3]);
                activity.put("hotel_name", row[4]);
                activity.put("status", row[5]);
                activities.add(activity);
            }
        } catch (Exception e) {
            log.error("Error getting recent bookings", e);
        }

        try {
            // 2. Recent Reviews - Check if reviews table has data first
            String reviewCountSql = "SELECT COUNT(*) FROM reviews";
            Query countQuery = entityManager.createNativeQuery(reviewCountSql);
            Number reviewCount = (Number) countQuery.getSingleResult();

            if (reviewCount != null && reviewCount.longValue() > 0) {
                String reviewSql = """
                            SELECT
                                r.id, 'review' as type, r.created_at,
                                CONCAT(g.first_name, ' ', g.last_name) as user_name,
                                h.name as hotel_name,
                                r.rating
                            FROM reviews r
                            JOIN guests g ON r.guest_id = g.id
                            JOIN hotels h ON r.hotel_id = h.id
                            WHERE 1=1
                        """;
                if (isHotelAdmin) {
                    reviewSql += " AND r.hotel_id = :hotelId";
                }
                reviewSql += " ORDER BY r.created_at DESC LIMIT :limit";

                Query reviewQuery = entityManager.createNativeQuery(reviewSql);
                if (isHotelAdmin)
                    reviewQuery.setParameter("hotelId", hotelId);
                reviewQuery.setParameter("limit", limit);

                @SuppressWarnings("unchecked")
                List<Object[]> reviewResults = reviewQuery.getResultList();
                for (Object[] row : reviewResults) {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("id", row[0]);
                    activity.put("type", row[1]);
                    activity.put("created_at", row[2]);
                    activity.put("user_name", row[3]);
                    activity.put("hotel_name", row[4]);
                    activity.put("rating", row[5]);
                    activities.add(activity);
                }
            }
        } catch (Exception e) {
            log.error("Error getting recent reviews", e);
        }

        // Sort by created_at
        activities.sort((a, b) -> {
            Object dateA = a.get("created_at");
            Object dateB = b.get("created_at");
            if (dateA == null)
                return 1;
            if (dateB == null)
                return -1;
            return dateB.toString().compareTo(dateA.toString());
        });

        // Return top N
        return activities.stream().limit(limit).toList();
    }
}
