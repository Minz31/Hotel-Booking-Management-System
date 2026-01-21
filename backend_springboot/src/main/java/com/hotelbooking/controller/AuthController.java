package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.dto.AuthRequest;
import com.hotelbooking.dto.AuthResponse;
import com.hotelbooking.model.Guest;
import com.hotelbooking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@RequestBody AuthRequest request) { // Generic Object to wrap
                                                                                         // nested data struct
        try {
            AuthResponse response = authService.login(request);
            // Need to wrap in "data" to match frontend expectation: data: { user: ...,
            // token: ... }
            return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Object>> register(@RequestBody Map<String, Object> payload) {
        try {
            Guest guest = new Guest();
            guest.setFirstName((String) payload.get("first_name"));
            guest.setLastName((String) payload.get("last_name"));
            guest.setEmail((String) payload.get("email"));
            guest.setPhone((String) payload.get("phone"));
            // ... set other fields address etc manually or use mapper

            String password = (String) payload.get("password");

            AuthResponse response = authService.registerGuest(guest, password);
            return ResponseEntity.status(201).body(ApiResponse.success(response, "Guest registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(ApiResponse.error(e.getMessage()));
        }
    }
}
