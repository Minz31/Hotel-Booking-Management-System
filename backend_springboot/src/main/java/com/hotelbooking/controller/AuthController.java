package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.dto.AuthRequest;
import com.hotelbooking.dto.AuthResponse;
import com.hotelbooking.model.Guest;
import com.hotelbooking.model.Administrator;
import com.hotelbooking.repository.GuestRepository;
import com.hotelbooking.repository.AdministratorRepository;
import com.hotelbooking.service.AuthService;
import com.hotelbooking.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            // Wrap in the format frontend expects: { data: { user: {...}, token: "..." } }
            Map<String, Object> data = new HashMap<>();
            data.put("user", response.getUser());
            data.put("token", response.getToken());
            return ResponseEntity.ok(ApiResponse.success(data, "Login successful"));
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

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> getMe(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }

        String userId = userDetails.getId();
        String role = userDetails.getRole();

        Map<String, Object> user = new HashMap<>();

        if ("guest".equals(role)) {
            Optional<Guest> guestOpt = guestRepository.findById(userId);
            if (guestOpt.isPresent()) {
                Guest guest = guestOpt.get();
                user.put("id", guest.getId());
                user.put("first_name", guest.getFirstName());
                user.put("last_name", guest.getLastName());
                user.put("email", guest.getEmail());
                user.put("phone", guest.getPhone());
                user.put("role", "guest");
            } else {
                return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
            }
        } else {
            Optional<Administrator> adminOpt = administratorRepository.findById(userId);
            if (adminOpt.isPresent()) {
                Administrator admin = adminOpt.get();
                user.put("id", admin.getId());
                user.put("username", admin.getUsername());
                user.put("email", admin.getEmail());
                user.put("full_name", admin.getFullName());
                user.put("role", admin.getRole());
                user.put("hotel_id", admin.getHotelId());
            } else {
                return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
            }
        }

        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
