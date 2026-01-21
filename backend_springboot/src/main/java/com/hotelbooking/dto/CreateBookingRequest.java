package com.hotelbooking.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateBookingRequest {
    private String guest_id;
    private String hotel_id;
    private LocalDate check_in_date;
    private LocalDate check_out_date;
    private List<String> room_ids; // Can be room IDs or room type IDs
    private Integer number_of_guests;
    private String special_requests;
    private String discount_code;
}
