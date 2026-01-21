package com.hotelbooking.controller;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.dto.HotelDTO;
import com.hotelbooking.model.Hotel;
import com.hotelbooking.service.HotelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
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

    @PostMapping
    public ApiResponse<Hotel> createHotel(@RequestBody Hotel hotel) {
        Hotel created = hotelService.createHotel(hotel);
        return ApiResponse.success(created, "Hotel created successfully");
    }

    // ... keeping other methods simple for now
}
