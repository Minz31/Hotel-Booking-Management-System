package com.hotelbooking.service;

import com.hotelbooking.dto.HotelDTO;
import com.hotelbooking.model.Hotel;
import com.hotelbooking.repository.HotelRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class HotelService {

    private static final Logger log = LoggerFactory.getLogger(HotelService.class);

    @Autowired
    private HotelRepository hotelRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public Page<HotelDTO> getAllHotels(String city, Integer starRating, int page, int limit) {
        try {
            StringBuilder sql = new StringBuilder("""
                        SELECT h.id, h.name, h.city, h.country, h.star_rating, h.address,
                               h.description, h.phone, h.email, h.website, h.check_in_time,
                               h.check_out_time, h.is_active,
                               COUNT(DISTINCT r.id) AS total_rooms,
                               MIN(t.price) AS starting_price,
                               ROUND(AVG(rev.rating), 2) AS avg_rating,
                               COUNT(DISTINCT rev.id) AS review_count
                        FROM hotels h
                        LEFT JOIN rooms r ON h.id = r.hotel_id AND r.is_active = TRUE
                        LEFT JOIN room_types rt ON r.room_type_id = rt.id
                        LEFT JOIN tariffs t ON rt.id = t.room_type_id AND CURDATE() BETWEEN t.start_date AND t.end_date
                        LEFT JOIN reviews rev ON h.id = rev.hotel_id AND rev.is_approved = TRUE
                        WHERE h.is_active = TRUE
                    """);

            Map<String, Object> params = new HashMap<>();

            if (city != null && !city.isEmpty()) {
                sql.append(" AND h.city = :city");
                params.put("city", city);
            }

            if (starRating != null) {
                sql.append(" AND h.star_rating = :starRating");
                params.put("starRating", starRating);
            }

            sql.append(" GROUP BY h.id ORDER BY h.star_rating DESC, avg_rating DESC");

            // Get total count first
            String countSql = "SELECT COUNT(*) FROM hotels h WHERE h.is_active = TRUE";
            if (city != null && !city.isEmpty()) {
                countSql += " AND h.city = :city";
            }
            if (starRating != null) {
                countSql += " AND h.star_rating = :starRating";
            }
            Query countQuery = entityManager.createNativeQuery(countSql);
            params.forEach(countQuery::setParameter);
            Number total = (Number) countQuery.getSingleResult();

            // Add pagination
            int offset = (page - 1) * limit;
            sql.append(" LIMIT :limit OFFSET :offset");
            params.put("limit", limit);
            params.put("offset", offset);

            Query query = entityManager.createNativeQuery(sql.toString());
            params.forEach(query::setParameter);

            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();

            List<HotelDTO> hotels = new ArrayList<>();
            for (Object[] row : results) {
                HotelDTO dto = new HotelDTO();
                dto.setId((String) row[0]);
                dto.setName((String) row[1]);
                dto.setCity((String) row[2]);
                dto.setCountry((String) row[3]);
                dto.setStarRating(row[4] != null ? ((Number) row[4]).intValue() : null);
                dto.setAddress((String) row[5]);
                dto.setDescription((String) row[6]);
                dto.setPhone((String) row[7]);
                dto.setEmail((String) row[8]);
                dto.setWebsite((String) row[9]);
                dto.setCheckInTime((String) row[10]);
                dto.setCheckOutTime((String) row[11]);
                dto.setIsActive(row[12] != null ? (Boolean) row[12] : true);
                dto.setTotalRooms(row[13] != null ? ((Number) row[13]).longValue() : 0L);
                dto.setStartingPrice(row[14] != null ? ((Number) row[14]).doubleValue() : null);
                dto.setAvgRating(row[15] != null ? ((Number) row[15]).doubleValue() : null);
                dto.setReviewCount(row[16] != null ? ((Number) row[16]).longValue() : 0L);
                hotels.add(dto);
            }

            return new PageImpl<>(hotels, PageRequest.of(page - 1, limit), total.longValue());
        } catch (Exception e) {
            log.error("Error getting hotels", e);
            return new PageImpl<>(Collections.emptyList(), PageRequest.of(page - 1, limit), 0);
        }
    }

    public Optional<HotelDTO> getHotelById(String id) {
        try {
            String sql = """
                        SELECT h.id, h.name, h.city, h.country, h.star_rating, h.address,
                               h.description, h.phone, h.email, h.website, h.check_in_time,
                               h.check_out_time, h.is_active,
                               COUNT(DISTINCT r.id) AS total_rooms,
                               ROUND(AVG(rev.rating), 2) AS avg_rating,
                               COUNT(DISTINCT rev.id) AS review_count
                        FROM hotels h
                        LEFT JOIN rooms r ON h.id = r.hotel_id
                        LEFT JOIN reviews rev ON h.id = rev.hotel_id AND rev.is_approved = TRUE
                        WHERE h.id = :id AND h.is_active = TRUE
                        GROUP BY h.id
                    """;

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("id", id);

            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();

            if (results.isEmpty()) {
                return Optional.empty();
            }

            Object[] row = results.get(0);
            HotelDTO dto = new HotelDTO();
            dto.setId((String) row[0]);
            dto.setName((String) row[1]);
            dto.setCity((String) row[2]);
            dto.setCountry((String) row[3]);
            dto.setStarRating(row[4] != null ? ((Number) row[4]).intValue() : null);
            dto.setAddress((String) row[5]);
            dto.setDescription((String) row[6]);
            dto.setPhone((String) row[7]);
            dto.setEmail((String) row[8]);
            dto.setWebsite((String) row[9]);
            dto.setCheckInTime((String) row[10]);
            dto.setCheckOutTime((String) row[11]);
            dto.setIsActive(row[12] != null ? (Boolean) row[12] : true);
            dto.setTotalRooms(row[13] != null ? ((Number) row[13]).longValue() : 0L);
            dto.setAvgRating(row[14] != null ? ((Number) row[14]).doubleValue() : null);
            dto.setReviewCount(row[15] != null ? ((Number) row[15]).longValue() : 0L);

            return Optional.of(dto);
        } catch (Exception e) {
            log.error("Error getting hotel by id: " + id, e);
            return Optional.empty();
        }
    }

    public List<Map<String, Object>> getRoomTypesForHotel(String hotelId) {
        try {
            String sql = """
                        SELECT rt.id, rt.hotel_id, rt.name, rt.description,
                               rt.max_occupancy, rt.bed_type, rt.amenities, rt.base_price,
                               rt.created_at, rt.updated_at, rt.is_active,
                               MAX(t.price) AS current_price,
                               MAX(t.currency) AS currency,
                               COUNT(DISTINCT r.id) AS available_rooms
                        FROM room_types rt
                        LEFT JOIN tariffs t ON rt.id = t.room_type_id
                            AND CURDATE() BETWEEN t.start_date AND t.end_date
                        LEFT JOIN rooms r ON rt.id = r.room_type_id
                            AND r.status = 'available' AND r.is_active = TRUE
                        WHERE rt.hotel_id = :hotelId AND rt.is_active = TRUE
                        GROUP BY rt.id, rt.hotel_id, rt.name, rt.description,
                            rt.max_occupancy, rt.bed_type, rt.amenities, rt.base_price,
                            rt.created_at, rt.updated_at, rt.is_active
                        ORDER BY MAX(t.price)
                    """;

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("hotelId", hotelId);

            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();

            List<Map<String, Object>> roomTypes = new ArrayList<>();
            for (Object[] row : results) {
                Map<String, Object> rt = new HashMap<>();
                rt.put("id", row[0]);
                rt.put("hotel_id", row[1]);
                rt.put("name", row[2]);
                rt.put("description", row[3]);
                rt.put("max_occupancy", row[4]);
                rt.put("bed_type", row[5]);
                rt.put("amenities", row[6]);
                rt.put("base_price", row[7]);
                rt.put("created_at", row[8]);
                rt.put("updated_at", row[9]);
                rt.put("is_active", row[10]);
                rt.put("current_price", row[11]);
                rt.put("currency", row[12]);
                rt.put("available_rooms", row[13] != null ? ((Number) row[13]).longValue() : 0L);
                roomTypes.add(rt);
            }
            return roomTypes;
        } catch (Exception e) {
            log.error("Error getting room types for hotel: " + hotelId, e);
            return new ArrayList<>();
        }
    }

    public Map<String, Object> searchAvailableRooms(String hotelId, String checkIn, String checkOut, Integer guests) {
        try {
            StringBuilder sql = new StringBuilder("""
                        SELECT r.id, r.room_number, r.floor, r.status,
                               rt.id AS room_type_id, rt.name AS room_type, rt.max_occupancy, rt.bed_type, rt.amenities,
                               t.price AS price_per_night, t.currency
                        FROM rooms r
                        JOIN room_types rt ON r.room_type_id = rt.id
                        LEFT JOIN tariffs t ON rt.id = t.room_type_id
                            AND :checkIn BETWEEN t.start_date AND t.end_date
                        WHERE r.hotel_id = :hotelId
                            AND r.status = 'available'
                            AND r.is_active = TRUE
                    """);

            if (guests != null) {
                sql.append(" AND rt.max_occupancy >= :guests");
            }

            sql.append("""
                            AND r.id NOT IN (
                                SELECT br.room_id
                                FROM booking_rooms br
                                JOIN bookings b ON br.booking_id = b.id
                                WHERE b.status NOT IN ('cancelled', 'no_show')
                                    AND NOT (br.check_out_date <= :checkIn OR br.check_in_date >= :checkOut)
                            )
                        ORDER BY t.price
                    """);

            Query query = entityManager.createNativeQuery(sql.toString());
            query.setParameter("hotelId", hotelId);
            query.setParameter("checkIn", checkIn);
            query.setParameter("checkOut", checkOut);
            if (guests != null) {
                query.setParameter("guests", guests);
            }

            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();

            List<Map<String, Object>> rooms = new ArrayList<>();
            for (Object[] row : results) {
                Map<String, Object> room = new HashMap<>();
                room.put("id", row[0]);
                room.put("room_number", row[1]);
                room.put("floor", row[2]);
                room.put("status", row[3]);
                room.put("room_type_id", row[4]);
                room.put("room_type", row[5]);
                room.put("max_occupancy", row[6]);
                room.put("bed_type", row[7]);
                room.put("amenities", row[8]);
                room.put("price_per_night", row[9]);
                room.put("currency", row[10]);
                rooms.add(room);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("rooms", rooms);
            response.put("search_params", Map.of(
                    "check_in", checkIn,
                    "check_out", checkOut,
                    "guests", guests != null ? guests : "any"));
            return response;
        } catch (Exception e) {
            log.error("Error searching available rooms", e);
            return Map.of("rooms", new ArrayList<>());
        }
    }

    public Hotel createHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    public Hotel updateHotel(String id, Hotel hotelDetails) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new RuntimeException("Hotel not found"));
        hotel.setName(hotelDetails.getName());
        hotel.setCity(hotelDetails.getCity());
        hotel.setCountry(hotelDetails.getCountry());
        hotel.setDescription(hotelDetails.getDescription());
        hotel.setAddress(hotelDetails.getAddress());
        hotel.setPhone(hotelDetails.getPhone());
        hotel.setEmail(hotelDetails.getEmail());
        hotel.setStarRating(hotelDetails.getStarRating());
        return hotelRepository.save(hotel);
    }

    public void deleteHotel(String id) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new RuntimeException("Hotel not found"));
        hotel.setIsActive(false);
        hotelRepository.save(hotel);
    }
}
