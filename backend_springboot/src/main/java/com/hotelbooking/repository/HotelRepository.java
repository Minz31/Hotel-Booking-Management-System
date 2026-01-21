package com.hotelbooking.repository;

import com.hotelbooking.model.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, String> {

    // We use a Map to project the custom fields easily without creating a
    // constructor expression for now,
    // or we could map to an Interface projection. Map is flexible for native query.
    // However, JPQL is cleaner if we can manage.
    // The query is complex with Group By, so Native Query is safest to match exact
    // SQL logic.

    @Query(value = """
                SELECT h.*,
                COUNT(DISTINCT r.id) AS total_rooms,
                MIN(t.price) AS starting_price,
                ROUND(AVG(rev.rating), 2) AS avg_rating,
                COUNT(DISTINCT rev.id) AS review_count
                FROM hotels h
                LEFT JOIN rooms r ON h.id = r.hotel_id AND r.status != 'blocked'
                LEFT JOIN room_types rt ON r.room_type_id = rt.id
                LEFT JOIN tariffs t ON rt.id = t.room_type_id AND (t.start_date <= CURRENT_DATE AND t.end_date >= CURRENT_DATE)
                LEFT JOIN reviews rev ON h.id = rev.hotel_id
                WHERE h.is_active = TRUE
                AND (:city IS NULL OR h.city = :city)
                AND (:starRating IS NULL OR h.star_rating = :starRating)
                GROUP BY h.id
                ORDER BY h.star_rating DESC
            """, nativeQuery = true)
    Page<Map<String, Object>> findAllHotelsWithStats(
            @Param("city") String city,
            @Param("starRating") Integer starRating,
            Pageable pageable);

    @Query(value = """
                SELECT h.*,
                COUNT(DISTINCT r.id) AS total_rooms,
                ROUND(AVG(rev.rating), 2) AS avg_rating,
                COUNT(DISTINCT rev.id) AS review_count
                FROM hotels h
                LEFT JOIN rooms r ON h.id = r.hotel_id
                LEFT JOIN reviews rev ON h.id = rev.hotel_id
                WHERE h.id = :id AND h.is_active = TRUE
                GROUP BY h.id
            """, nativeQuery = true)
    Map<String, Object> findHotelWithStatsById(@Param("id") String id);
}
