package com.hotelbooking.repository;

import com.hotelbooking.model.BookingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRoomRepository extends JpaRepository<BookingRoom, String> {

    @Query("SELECT COUNT(br) FROM BookingRoom br " +
            "JOIN br.booking b " +
            "WHERE br.room.id = :roomId " +
            "AND b.status NOT IN ('cancelled', 'no_show') " +
            "AND NOT (br.checkOutDate <= :checkIn OR br.checkInDate >= :checkOut)")
    Long countConflictingBookings(@Param("roomId") String roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);
}
