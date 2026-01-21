package com.hotelbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
@Table(name = "booking_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRoom {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "check_in_date")
    private LocalDate checkInDate;

    @Column(name = "check_out_date")
    private LocalDate checkOutDate;

    @Column(name = "price_per_night")
    private Double pricePerNight;

    @Column(name = "number_of_nights")
    private Integer numberOfNights;

    @Column(name = "total_price")
    private Double totalPrice;

    @Column(name = "tariff_id")
    private String tariffId; // Could be a relationship to Tariff, but might not exist if custom price? Let's
                             // keep ID for now or relationship. Doc says fk.
}
