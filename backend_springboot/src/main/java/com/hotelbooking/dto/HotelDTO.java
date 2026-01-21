package com.hotelbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelDTO {
    private String id;
    private String name;
    private String city;
    private String country;
    private Integer starRating;
    private String description;
    private String address;
    private String phone;
    private String email;
    private String website;
    private String checkInTime;
    private String checkOutTime;
    private Boolean isActive;

    // Computed fields
    private Long totalRooms;
    private Double startingPrice;
    private Double avgRating;
    private Long reviewCount;
}
