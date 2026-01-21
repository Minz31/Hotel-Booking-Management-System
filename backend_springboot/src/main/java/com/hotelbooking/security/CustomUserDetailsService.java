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
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // 1. Check Guest by email
        Optional<Guest> guest = guestRepository.findByEmail(identifier);
        if (guest.isPresent()) {
            return new CustomUserDetails(
                    guest.get().getId(),
                    guest.get().getEmail(),
                    guest.get().getPasswordHash(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_GUEST")),
                    null,
                    "guest");
        }

        // 2. Check Administrator by email
        Optional<Administrator> admin = administratorRepository.findByEmail(identifier);
        if (admin.isPresent()) {
            return buildAdminUserDetails(admin.get());
        }

        // 3. Check Administrator by username (fallback for Express tokens)
        Optional<Administrator> adminByUsername = administratorRepository.findByUsername(identifier);
        if (adminByUsername.isPresent()) {
            return buildAdminUserDetails(adminByUsername.get());
        }

        throw new UsernameNotFoundException("User not found with identifier: " + identifier);
    }

    private CustomUserDetails buildAdminUserDetails(Administrator admin) {
        String role = admin.getRole().toUpperCase();
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return new CustomUserDetails(
                admin.getId(),
                admin.getEmail(),
                admin.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority(role)),
                admin.getHotelId(),
                admin.getRole());
    }
}
