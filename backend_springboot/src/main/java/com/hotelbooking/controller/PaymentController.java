package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.security.CustomUserDetails;
import com.hotelbooking.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ApiResponse<Object> getAllPayments(
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String hotelId = null;
        if (userDetails != null && "hotel_admin".equals(userDetails.getRole())) {
            hotelId = userDetails.getHotelId();
        }
        return paymentService.getAllPayments(limit, offset, hotelId);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createPayment(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> result = paymentService.createPayment(payload);
            return ResponseEntity.status(201).body(ApiResponse.success(result, "Payment processed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ApiResponse<List<Map<String, Object>>> getBookingPayments(@PathVariable String bookingId) {
        return ApiResponse.success(paymentService.getBookingPayments(bookingId));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<Object>> processRefund(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> result = paymentService.processRefund(id, payload);
            return ResponseEntity.ok(ApiResponse.success(result, "Refund processed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
