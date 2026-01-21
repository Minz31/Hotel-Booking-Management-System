package com.hotelbooking.service;

import com.hotelbooking.dto.AuthRequest;
import com.hotelbooking.dto.AuthResponse;
import com.hotelbooking.model.Administrator;
import com.hotelbooking.model.Guest;
import com.hotelbooking.repository.AdministratorRepository;
import com.hotelbooking.repository.GuestRepository;
import com.hotelbooking.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse login(AuthRequest request) {
        // 1. Check Guest
        Optional<Guest> guestOpt = guestRepository.findByEmail(request.getEmail());
        if (guestOpt.isPresent()) {
            Guest guest = guestOpt.get();
            // Verify password (if present, legacy support might skip this but let's enforce
            // or be lenient?)
            // Node code didn't check PWD for guest. I will enforce it for NEW flow, but if
            // hash is null, maybe fail?
            // If the user was migrated from legacy Node backend without password, they
            // can't login here securely.
            // For now, let's assume we check password.

            if (guest.getPasswordHash() != null
                    && passwordEncoder.matches(request.getPassword(), guest.getPasswordHash())) {
                String token = jwtUtil.generateToken(guest.getEmail(), "guest", guest.getId(), null);
                return AuthResponse.builder()
                        .token(token)
                        .user(AuthResponse.UserDTO.builder()
                                .id(guest.getId())
                                .email(guest.getEmail())
                                .firstName(guest.getFirstName())
                                .lastName(guest.getLastName())
                                .role("guest")
                                .build())
                        .build();
            } else if (guest.getPasswordHash() == null) {
                // FALLBACK for legacy (INSECURE BUT MATCHES NODE)
                // If the user has no password hash set, we might let them in? Or force reset?
                // Let's matching node logic: Just let them in?
                // Node: "check in guests table... if found... generate token". It IGNORED
                // password.
                // Okay, implementing Node parity behavior for passwordless guests:
                String token = jwtUtil.generateToken(guest.getEmail(), "guest", guest.getId(), null);
                return AuthResponse.builder()
                        .token(token)
                        .user(AuthResponse.UserDTO.builder()
                                .id(guest.getId())
                                .email(guest.getEmail())
                                .firstName(guest.getFirstName())
                                .lastName(guest.getLastName())
                                .role("guest")
                                .build())
                        .build();
            }
        }

        // 2. Check Admin
        Optional<Administrator> adminOpt = administratorRepository.findByEmail(request.getEmail());
        if (adminOpt.isPresent()) {
            Administrator admin = adminOpt.get();
            if (passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
                String token = jwtUtil.generateToken(admin.getUsername(), admin.getRole(), admin.getId(),
                        admin.getHotelId());

                String[] names = admin.getFullName() != null ? admin.getFullName().split(" ")
                        : new String[] { "Admin", "" };

                return AuthResponse.builder()
                        .token(token)
                        .user(AuthResponse.UserDTO.builder()
                                .id(admin.getId())
                                .email(admin.getEmail())
                                .firstName(names[0])
                                .lastName(names.length > 1 ? names[1] : "")
                                .role(admin.getRole())
                                .hotelId(admin.getHotelId())
                                .build())
                        .build();
            }
        }

        throw new RuntimeException("Invalid email or password");
    }

    public AuthResponse registerGuest(Guest guest, String password) {
        if (guestRepository.findByEmail(guest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        guest.setPasswordHash(passwordEncoder.encode(password));
        Guest saved = guestRepository.save(guest);

        String token = jwtUtil.generateToken(saved.getEmail(), "guest", saved.getId(), null);

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDTO.builder()
                        .id(saved.getId())
                        .email(saved.getEmail())
                        .firstName(saved.getFirstName())
                        .lastName(saved.getLastName())
                        .role("guest")
                        .build())
                .build();
    }
}
