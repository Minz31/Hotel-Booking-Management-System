package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.dto.CreateBookingRequest;
import com.hotelbooking.service.BookingService;
import com.hotelbooking.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String hotel_id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String hotelId = hotel_id;
        // Hotel admins can only see their hotel's bookings
        if (userDetails != null && "hotel_admin".equals(userDetails.getRole())) {
            hotelId = userDetails.getHotelId();
        }
        return ApiResponse.success(bookingService.getAllBookings(status, hotelId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBookingById(@PathVariable String id) {
        return bookingService.getBookingById(id)
                .map(b -> ResponseEntity.ok(ApiResponse.success(b)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/guest/{guestId}")
    public ApiResponse<List<Map<String, Object>>> getGuestBookings(
            @PathVariable String guestId,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(bookingService.getBookingsByGuest(guestId, status));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createBooking(
            @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // Force guest_id to be the logged-in user's ID for guests
        if (userDetails != null && "guest".equals(userDetails.getRole())) {
            request.setGuest_id(userDetails.getId());
        }

        try {
            Map<String, Object> booking = bookingService.createBooking(request);
            return ResponseEntity.status(201).body(ApiResponse.success(booking, "Booking created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Object>> updateBookingStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String status = payload.get("status");
            String notes = payload.get("notes");
            bookingService.updateBookingStatus(id, status, notes, userDetails != null ? userDetails.getId() : null);
            return ResponseEntity.ok(ApiResponse.success(null, "Booking status updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Object>> cancelBooking(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String reason = payload.get("reason");
            bookingService.cancelBooking(id, reason, userDetails);
            return ResponseEntity.ok(ApiResponse.success(null, "Booking cancelled successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
