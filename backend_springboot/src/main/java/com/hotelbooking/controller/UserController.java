package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String hotel_id,
            @RequestParam(required = false) String search) {
        return ApiResponse.success(userService.getAllUsers(role, hotel_id, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(ApiResponse.success((Object) user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<Object>> createHotelAdmin(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> result = userService.createHotelAdmin(payload);
            return ResponseEntity.status(201).body(ApiResponse.success(result, "Hotel admin created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updateUser(@PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        try {
            userService.updateUser(id, payload);
            return ResponseEntity.ok(ApiResponse.success(null, "User updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
