package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.security.CustomUserDetails;
import com.hotelbooking.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/hotel/{hotelId}")
    public ApiResponse<Object> getHotelReviews(
            @PathVariable String hotelId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "recent") String sort) {
        return ApiResponse.success(reviewService.getHotelReviews(hotelId, page, limit, sort));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createReview(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
            }
            Map<String, Object> result = reviewService.createReview(payload, userDetails.getId());
            return ResponseEntity.status(201).body(ApiResponse.success(result, "Review created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/response")
    public ResponseEntity<ApiResponse<Object>> addHotelResponse(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
            }
            reviewService.addHotelResponse(id, (String) payload.get("response"), userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success(null, "Response added successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/helpful")
    public ResponseEntity<ApiResponse<Object>> markHelpful(@PathVariable String id) {
        try {
            reviewService.markHelpful(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Review marked as helpful"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteReview(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
            }
            reviewService.deleteReview(id, userDetails.getRole(), userDetails.getHotelId());
            return ResponseEntity.ok(ApiResponse.success(null, "Review deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
