package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.dto.HotelDTO;
import com.hotelbooking.model.Hotel;
import com.hotelbooking.service.HotelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    @Autowired
    private HotelService hotelService;

    @GetMapping
    public ApiResponse<Object> getAllHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false, name = "star_rating") Integer starRating,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        Page<HotelDTO> result = hotelService.getAllHotels(city, starRating, page, limit);

        ApiResponse.PaginationMetadata pagination = new ApiResponse.PaginationMetadata(
                page, limit, result.getTotalElements(), result.getTotalPages());

        return ApiResponse.success(result.getContent(), pagination);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelDTO>> getHotelById(@PathVariable String id) {
        return hotelService.getHotelById(id)
                .map(dto -> ResponseEntity.ok(ApiResponse.success(dto)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/room-types")
    public ApiResponse<List<Map<String, Object>>> getHotelRoomTypes(@PathVariable String id) {
        return ApiResponse.success(hotelService.getRoomTypesForHotel(id));
    }

    @GetMapping("/{id}/available-rooms")
    public ApiResponse<Object> searchAvailableRooms(
            @PathVariable String id,
            @RequestParam(name = "check_in") String checkIn,
            @RequestParam(name = "check_out") String checkOut,
            @RequestParam(required = false) Integer guests) {
        return ApiResponse.success(hotelService.searchAvailableRooms(id, checkIn, checkOut, guests));
    }

    @PostMapping
    public ApiResponse<Hotel> createHotel(@RequestBody Hotel hotel) {
        Hotel created = hotelService.createHotel(hotel);
        return ApiResponse.success(created, "Hotel created successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> updateHotel(@PathVariable String id, @RequestBody Hotel hotel) {
        try {
            Hotel updated = hotelService.updateHotel(id, hotel);
            return ResponseEntity.ok(ApiResponse.success(updated, "Hotel updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteHotel(@PathVariable String id) {
        try {
            hotelService.deleteHotel(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Hotel deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
