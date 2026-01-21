package com.hotelbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "administrators")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Administrator {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "VARCHAR(36)")
    private String id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String role; // super_admin, hotel_admin, manager, staff

    @Column(name = "hotel_id")
    private String hotelId; // Can be null for super_admin

    @Column(columnDefinition = "JSON")
    private String permissions; // JSON string
}
