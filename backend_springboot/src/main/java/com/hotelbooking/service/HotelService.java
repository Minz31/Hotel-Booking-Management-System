package com.hotelbooking.service;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.dto.HotelDTO;
import com.hotelbooking.model.Hotel;
import com.hotelbooking.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@Service
public class HotelService {

    @Autowired
    private HotelRepository hotelRepository;

    public Page<HotelDTO> getAllHotels(String city, Integer starRating, int page, int limit) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit); // Spring Page is 0-indexed

        Page<Map<String, Object>> result = hotelRepository.findAllHotelsWithStats(city, starRating, pageRequest);

        return result.map(this::mapToHotelDTO);
    }

    public Optional<HotelDTO> getHotelById(String id) {
        Map<String, Object> result = hotelRepository.findHotelWithStatsById(id);
        if (result == null)
            return Optional.empty();
        return Optional.of(mapToHotelDTO(result));
    }

    private HotelDTO mapToHotelDTO(Map<String, Object> row) {
        HotelDTO dto = new HotelDTO();
        dto.setId((String) row.get("id"));
        dto.setName((String) row.get("name"));
        dto.setCity((String) row.get("city"));
        dto.setCountry((String) row.get("country"));
        dto.setStarRating(row.get("star_rating") != null ? ((Number) row.get("star_rating")).intValue() : null);
        dto.setAddress((String) row.get("address"));
        dto.setDescription((String) row.get("description"));
        dto.setPhone((String) row.get("phone"));
        dto.setEmail((String) row.get("email"));
        dto.setWebsite((String) row.get("website"));
        dto.setCheckInTime((String) row.get("check_in_time"));
        dto.setCheckOutTime((String) row.get("check_out_time"));
        dto.setIsActive((Boolean) row.get("is_active"));

        dto.setTotalRooms(row.get("total_rooms") != null ? ((Number) row.get("total_rooms")).longValue() : 0L);
        dto.setReviewCount(row.get("review_count") != null ? ((Number) row.get("review_count")).longValue() : 0L);
        dto.setStartingPrice(
                row.get("starting_price") != null ? ((Number) row.get("starting_price")).doubleValue() : null);
        dto.setAvgRating(row.get("avg_rating") != null ? ((Number) row.get("avg_rating")).doubleValue() : null);

        return dto;
    }

    // Keep existing crud for admin
    public Hotel createHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    public Hotel updateHotel(String id, Hotel hotelDetails) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new RuntimeException("Hotel not found"));
        hotel.setName(hotelDetails.getName());
        hotel.setCity(hotelDetails.getCity());
        // ... set other fields
        return hotelRepository.save(hotel);
    }

    public void deleteHotel(String id) {
        hotelRepository.deleteById(id);
    }
}
