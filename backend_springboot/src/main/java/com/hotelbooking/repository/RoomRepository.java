package com.hotelbooking.repository;

import com.hotelbooking.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {
    List<Room> findByHotelId(String hotelId);

    List<Room> findByRoomTypeId(String roomTypeId);

    List<Room> findByStatus(String status);

    @Query(value = """
                SELECT * FROM rooms r
                WHERE r.room_type_id = :roomTypeId
                AND r.hotel_id = :hotelId
                AND r.status = 'available'
                AND r.id NOT IN (
                    SELECT br.room_id FROM booking_rooms br
                    JOIN bookings b ON br.booking_id = b.id
                    WHERE b.status NOT IN ('cancelled', 'no_show')
                    AND NOT (br.check_out_date <= :checkIn OR br.check_in_date >= :checkOut)
                )
                LIMIT 1
            """, nativeQuery = true)
    Room findAvailableRoom(@Param("roomTypeId") String roomTypeId,
            @Param("hotelId") String hotelId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);
}
