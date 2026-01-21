package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.model.Room;
import com.hotelbooking.model.RoomType;
import com.hotelbooking.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    // ==================== ROOM TYPES ====================

    @GetMapping("/types/{hotelId}")
    public ApiResponse<List<Map<String, Object>>> getRoomTypes(@PathVariable String hotelId) {
        return ApiResponse.success(roomService.getRoomTypes(hotelId));
    }

    @PostMapping("/types")
    public ResponseEntity<ApiResponse<RoomType>> createRoomType(@RequestBody Map<String, Object> payload) {
        try {
            RoomType roomType = roomService.createRoomType(payload);
            return ResponseEntity.status(201).body(ApiResponse.success(roomType, "Room type created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/types/{id}")
    public ResponseEntity<ApiResponse<Object>> updateRoomType(@PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        try {
            roomService.updateRoomType(id, payload);
            return ResponseEntity.ok(ApiResponse.success(null, "Room type updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/types/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteRoomType(@PathVariable String id) {
        try {
            roomService.deleteRoomType(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Room type deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== ROOMS ====================

    @GetMapping("/{hotelId}")
    public ApiResponse<List<Map<String, Object>>> getRooms(@PathVariable String hotelId) {
        return ApiResponse.success(roomService.getRooms(hotelId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Room>> createRoom(@RequestBody Map<String, Object> payload) {
        try {
            Room room = roomService.createRoom(payload);
            return ResponseEntity.status(201).body(ApiResponse.success(room, "Room created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updateRoom(@PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        try {
            roomService.updateRoom(id, payload);
            return ResponseEntity.ok(ApiResponse.success(null, "Room updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteRoom(@PathVariable String id) {
        try {
            roomService.deleteRoom(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Room deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== TARIFFS ====================

    @GetMapping("/tariffs/{hotelId}")
    public ApiResponse<List<Map<String, Object>>> getTariffs(@PathVariable String hotelId) {
        return ApiResponse.success(roomService.getTariffs(hotelId));
    }

    @PostMapping("/tariffs")
    public ResponseEntity<ApiResponse<Object>> createTariff(@RequestBody Map<String, Object> payload) {
        try {
            roomService.createTariff(payload);
            return ResponseEntity.status(201).body(ApiResponse.success(null, "Tariff created successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/tariffs/{id}")
    public ResponseEntity<ApiResponse<Object>> updateTariff(@PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        try {
            roomService.updateTariff(id, payload);
            return ResponseEntity.ok(ApiResponse.success(null, "Tariff updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/tariffs/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteTariff(@PathVariable String id) {
        try {
            roomService.deleteTariff(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Tariff deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== AVAILABILITY ====================

    @GetMapping("/availability/{hotelId}")
    public ApiResponse<List<Map<String, Object>>> getAvailability(
            @PathVariable String hotelId,
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date) {
        return ApiResponse.success(roomService.getAvailabilityCalendar(hotelId, start_date, end_date));
    }
}
