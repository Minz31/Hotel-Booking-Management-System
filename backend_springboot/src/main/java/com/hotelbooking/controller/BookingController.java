package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.dto.CreateBookingRequest;
import com.hotelbooking.model.Booking;
import com.hotelbooking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.hotelbooking.security.CustomUserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public ApiResponse<List<Booking>> getAllBookings() {
        return ApiResponse.success(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBookingById(@PathVariable String id) {
        return bookingService.getBookingById(id)
                .map(b -> ResponseEntity.ok(ApiResponse.success(b)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/guest/{guestId}")
    public ApiResponse<List<Booking>> getGuestBookings(@PathVariable String guestId) {
        return ApiResponse.success(bookingService.getBookingsByGuest(guestId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(@RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // Enforce that guest_id matches logged in user if user is a guest
        // If user is null (shouldn't be, protected), maybe throw
        if (userDetails != null && userDetails.getRole().equals("guest")) {
            // Force guest_id to be the logged in user's ID
            request.setGuest_id(userDetails.getId());
        }

        try {
            Booking booking = bookingService.createBooking(request);
            return ResponseEntity.status(201).body(ApiResponse.success(booking, "Booking created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Booking>> updateBookingStatus(@PathVariable String id,
            @RequestBody String status) {
        try {
            return ResponseEntity.ok(ApiResponse.success(bookingService.updateBookingStatus(id, status)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
