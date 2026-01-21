package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.security.CustomUserDetails;
import com.hotelbooking.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getDashboardStats(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }

        Map<String, Object> stats = dashboardService.getDashboardStats(
                userDetails.getRole(),
                userDetails.getHotelId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<Object>> getRecentActivity(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }

        List<Map<String, Object>> activity = dashboardService.getRecentActivity(
                userDetails.getRole(),
                userDetails.getHotelId());
        return ResponseEntity.ok(ApiResponse.success(activity));
    }
}
