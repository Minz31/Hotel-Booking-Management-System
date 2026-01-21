package com.hotelbooking.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

public class CustomUserDetails implements UserDetails {

    private String id;
    private String username; // email
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private String hotelId;

    // Custom fields easier to access
    private String role;

    public CustomUserDetails(String id, String username, String password,
            Collection<? extends GrantedAuthority> authorities, String hotelId, String role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.hotelId = hotelId;
        this.role = role;
    }

    public String getId() {
        return id;
    }

    public String getHotelId() {
        return hotelId;
    }

    public String getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
