package com.hotelbooking.service;

import com.hotelbooking.dto.CreateBookingRequest;
import com.hotelbooking.model.*;
import com.hotelbooking.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingRoomRepository bookingRoomRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private TariffRepository tariffRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private HotelRepository hotelRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> getBookingsByGuest(String guestId) {
        return bookingRepository.findByGuestId(guestId);
    }

    @Transactional
    public Booking createBooking(CreateBookingRequest request) {
        // 1. Validate dates
        if (!request.getCheck_out_date().isAfter(request.getCheck_in_date())) {
            throw new RuntimeException("Check-out must be after check-in");
        }

        long nights = ChronoUnit.DAYS.between(request.getCheck_in_date(), request.getCheck_out_date());

        // 2. Resolve Rooms
        List<String> resolvedRoomIds = new ArrayList<>();

        for (String id : request.getRoom_ids()) {
            boolean isRoomType = roomTypeRepository.existsById(id);

            if (isRoomType) {
                // Find available room
                Room availableRoom = roomRepository.findAvailableRoom(
                        id, request.getHotel_id(), request.getCheck_in_date(), request.getCheck_out_date());

                if (availableRoom == null) {
                    throw new RuntimeException("No available rooms for the selected room type and dates");
                }
                resolvedRoomIds.add(availableRoom.getId());
            } else {
                resolvedRoomIds.add(id);
            }
        }

        // 3. Conflict Check
        for (String roomId : resolvedRoomIds) {
            Long conflicts = bookingRoomRepository.countConflictingBookings(
                    roomId, request.getCheck_in_date(), request.getCheck_out_date());
            if (conflicts > 0) {
                throw new RuntimeException("Room " + roomId + " is not available for selected dates");
            }
        }

        // 4. Calculate Price & Prepare BookingRooms
        double totalAmount = 0.0;
        List<BookingRoom> bookingRooms = new ArrayList<>();

        for (String roomId : resolvedRoomIds) {
            Room room = roomRepository.findById(roomId).orElseThrow();
            RoomType rt = room.getRoomType();

            // Find tariff (Simplistic: take tariff at check-in, or avg? Node took tariff at
            // check-in)
            Optional<Tariff> tariff = tariffRepository.findByRoomTypeIdAndDate(rt.getId(), request.getCheck_in_date());

            double pricePerNight = tariff.map(Tariff::getPrice)
                    .orElse(rt.getBasePrice() != null ? rt.getBasePrice() : 0.0);
            double roomTotal = pricePerNight * nights;
            totalAmount += roomTotal;

            BookingRoom br = new BookingRoom();
            br.setRoom(room);
            br.setCheckInDate(request.getCheck_in_date());
            br.setCheckOutDate(request.getCheck_out_date());
            br.setPricePerNight(pricePerNight);
            br.setNumberOfNights((int) nights);
            br.setTotalPrice(roomTotal);
            tariff.ifPresent(t -> br.setTariffId(t.getId()));

            bookingRooms.add(br);
        }

        // 5. Build Booking
        Booking booking = new Booking();
        booking.setGuest(guestRepository.findById(request.getGuest_id())
                .orElseThrow(() -> new RuntimeException("Guest not found")));
        booking.setHotel(hotelRepository.findById(request.getHotel_id())
                .orElseThrow(() -> new RuntimeException("Hotel not found")));
        booking.setCheckInDate(request.getCheck_in_date());
        booking.setCheckOutDate(request.getCheck_out_date());
        booking.setTotalAmount(totalAmount);

        // Discount would go here
        double discountAmount = 0.0;
        booking.setDiscountAmount(discountAmount);
        booking.setFinalAmount(totalAmount - discountAmount);

        booking.setStatus("pending_payment");

        // Save Booking
        Booking savedBooking = bookingRepository.save(booking);

        // Save BookingRooms
        for (BookingRoom br : bookingRooms) {
            br.setBooking(savedBooking);
            bookingRoomRepository.save(br);
        }

        return savedBooking;
    }

    public Booking updateBookingStatus(String id, String status) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}
