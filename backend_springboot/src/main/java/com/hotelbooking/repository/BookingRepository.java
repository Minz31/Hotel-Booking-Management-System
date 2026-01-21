package com.hotelbooking.repository;

import com.hotelbooking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    @Query("SELECT b FROM Booking b WHERE b.guest.id = :guestId ORDER BY b.checkInDate DESC")
    List<Booking> findByGuestId(@Param("guestId") String guestId);

    @Query("SELECT b FROM Booking b WHERE b.hotel.id = :hotelId ORDER BY b.checkInDate DESC")
    List<Booking> findByHotelId(@Param("hotelId") String hotelId);

    List<Booking> findByStatus(String status);
}
