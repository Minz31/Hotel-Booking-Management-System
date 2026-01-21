package com.hotelbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "room_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomType {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    @JsonIgnore
    private Hotel hotel;

    @Column(nullable = false)
    private String name;

    @Column(name = "max_occupancy")
    private Integer maxOccupancy;

    @Column(name = "bed_type")
    private String bedType;

    // Could be a comma separated string or JSON
    private String amenities;

    private String description;

    @Column(name = "base_price")
    private Double basePrice; // Fallback price if no tariff

    @OneToMany(mappedBy = "roomType")
    @JsonIgnore
    private List<Room> rooms;

    @OneToMany(mappedBy = "roomType")
    private List<Tariff> tariffs;
}
