package com.hotelbooking.security;

import com.hotelbooking.model.Administrator;
import com.hotelbooking.model.Guest;
import com.hotelbooking.repository.AdministratorRepository;
import com.hotelbooking.repository.GuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1. Check Guest
        Optional<Guest> guest = guestRepository.findByEmail(email);
        if (guest.isPresent()) {
            return new CustomUserDetails(
                    guest.get().getId(),
                    guest.get().getEmail(),
                    guest.get().getPasswordHash(), // Might be null if legacy
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_GUEST")),
                    null,
                    "guest");
        }

        // 2. Check Administrator
        Optional<Administrator> admin = administratorRepository.findByEmail(email);
        if (admin.isPresent()) {
            String role = admin.get().getRole().toUpperCase(); // e.g., HOTEL_ADMIN -> ROLE_HOTEL_ADMIN
            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }

            return new CustomUserDetails(
                    admin.get().getId(),
                    admin.get().getEmail(),
                    admin.get().getPasswordHash(),
                    Collections.singletonList(new SimpleGrantedAuthority(role)),
                    admin.get().getHotelId(),
                    admin.get().getRole());
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
