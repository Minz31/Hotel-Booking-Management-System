package com.hotelbooking.repository;

import com.hotelbooking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByGuestId(String guestId);

    List<Booking> findByHotelId(String hotelId);

    List<Booking> findByStatus(String status);
}
