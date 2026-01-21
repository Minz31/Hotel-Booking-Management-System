package com.hotelbooking.service;

import com.hotelbooking.model.Administrator;
import com.hotelbooking.model.Guest;
import com.hotelbooking.repository.AdministratorRepository;
import com.hotelbooking.repository.GuestRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class UserService {

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public List<Map<String, Object>> getAllUsers(String role, String hotelId, String search) {
        List<Map<String, Object>> users = new ArrayList<>();

        // 1. Fetch Guests
        if (role == null || "all".equals(role) || "guest".equals(role)) {
            StringBuilder guestSql = new StringBuilder("""
                        SELECT id, first_name, last_name, email, phone, 'guest' as role, registration_date as created_at
                        FROM guests WHERE 1=1
                    """);
            Map<String, Object> params = new HashMap<>();

            if (search != null && !search.isEmpty()) {
                guestSql.append(" AND (first_name LIKE :search OR last_name LIKE :search OR email LIKE :search)");
                params.put("search", "%" + search + "%");
            }

            guestSql.append(" ORDER BY registration_date DESC LIMIT 50");

            Query query = entityManager.createNativeQuery(guestSql.toString());
            params.forEach(query::setParameter);

            @SuppressWarnings("unchecked")
            List<Object[]> guestResults = query.getResultList();

            for (Object[] row : guestResults) {
                Map<String, Object> user = new HashMap<>();
                user.put("id", row[0]);
                user.put("first_name", row[1]);
                user.put("last_name", row[2]);
                user.put("email", row[3]);
                user.put("phone", row[4]);
                user.put("role", row[5]);
                user.put("created_at", row[6]);
                users.add(user);
            }
        }

        // 2. Fetch Administrators
        if (role == null || "all".equals(role)
                || Arrays.asList("hotel_admin", "super_admin", "manager").contains(role)) {
            StringBuilder adminSql = new StringBuilder(
                    """
                                SELECT a.id, a.full_name, a.email, a.created_at, a.role, a.hotel_id, a.username, h.name as hotel_name
                                FROM administrators a
                                LEFT JOIN hotels h ON a.hotel_id = h.id
                                WHERE 1=1
                            """);
            Map<String, Object> params = new HashMap<>();

            if (search != null && !search.isEmpty()) {
                adminSql.append(" AND (a.full_name LIKE :search OR a.email LIKE :search OR a.username LIKE :search)");
                params.put("search", "%" + search + "%");
            }

            if (hotelId != null && !hotelId.isEmpty()) {
                adminSql.append(" AND a.hotel_id = :hotelId");
                params.put("hotelId", hotelId);
            }

            if (role != null && !"all".equals(role) && !"guest".equals(role)) {
                adminSql.append(" AND a.role = :role");
                params.put("role", role);
            }

            adminSql.append(" ORDER BY a.created_at DESC LIMIT 50");

            Query query = entityManager.createNativeQuery(adminSql.toString());
            params.forEach(query::setParameter);

            @SuppressWarnings("unchecked")
            List<Object[]> adminResults = query.getResultList();

            for (Object[] row : adminResults) {
                Map<String, Object> user = new HashMap<>();
                user.put("id", row[0]);
                user.put("full_name", row[1]);
                user.put("email", row[2]);
                user.put("created_at", row[3]);
                user.put("role", row[4]);
                user.put("hotel_id", row[5]);
                user.put("username", row[6]);
                user.put("hotel_name", row[7]);

                // Normalize name for frontend
                String fullName = (String) row[1];
                if (fullName != null) {
                    String[] parts = fullName.split(" ", 2);
                    user.put("first_name", parts[0]);
                    user.put("last_name", parts.length > 1 ? parts[1] : "");
                }

                users.add(user);
            }
        }

        // Sort by created_at
        users.sort((a, b) -> {
            Object dateA = a.get("created_at");
            Object dateB = b.get("created_at");
            if (dateA == null)
                return 1;
            if (dateB == null)
                return -1;
            return dateB.toString().compareTo(dateA.toString());
        });

        return users;
    }

    public Optional<Map<String, Object>> getUserById(String id) {
        Optional<Administrator> adminOpt = administratorRepository.findById(id);
        if (adminOpt.isPresent()) {
            Administrator admin = adminOpt.get();
            Map<String, Object> user = new HashMap<>();
            user.put("id", admin.getId());
            user.put("username", admin.getUsername());
            user.put("email", admin.getEmail());
            user.put("full_name", admin.getFullName());
            user.put("role", admin.getRole());
            user.put("hotel_id", admin.getHotelId());
            return Optional.of(user);
        }

        Optional<Guest> guestOpt = guestRepository.findById(id);
        if (guestOpt.isPresent()) {
            Guest guest = guestOpt.get();
            Map<String, Object> user = new HashMap<>();
            user.put("id", guest.getId());
            user.put("email", guest.getEmail());
            user.put("first_name", guest.getFirstName());
            user.put("last_name", guest.getLastName());
            user.put("phone", guest.getPhone());
            user.put("role", "guest");
            return Optional.of(user);
        }

        return Optional.empty();
    }

    @Transactional
    public Map<String, Object> createHotelAdmin(Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String password = (String) payload.get("password");
        String fullName = (String) payload.get("full_name");
        String role = (String) payload.getOrDefault("role", "hotel_admin");
        String hotelId = (String) payload.get("hotel_id");
        String username = (String) payload.getOrDefault("username", email.split("@")[0]);

        // Check if email exists
        if (administratorRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        Administrator admin = new Administrator();
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setFullName(fullName);
        admin.setRole(role);
        admin.setHotelId(hotelId);
        admin.setUsername(username);

        Administrator saved = administratorRepository.save(admin);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("username", saved.getUsername());
        result.put("email", saved.getEmail());
        result.put("full_name", saved.getFullName());
        result.put("role", saved.getRole());
        result.put("hotel_id", saved.getHotelId());

        return result;
    }

    @Transactional
    public void updateUser(String id, Map<String, Object> payload) {
        Administrator admin = administratorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (payload.containsKey("full_name"))
            admin.setFullName((String) payload.get("full_name"));
        if (payload.containsKey("email"))
            admin.setEmail((String) payload.get("email"));
        if (payload.containsKey("role"))
            admin.setRole((String) payload.get("role"));
        if (payload.containsKey("hotel_id"))
            admin.setHotelId((String) payload.get("hotel_id"));

        administratorRepository.save(admin);
    }

    @Transactional
    public void deleteUser(String id) {
        Administrator admin = administratorRepository.findById(id).orElse(null);
        if (admin != null && !"super_admin".equals(admin.getRole())) {
            administratorRepository.delete(admin);
        }
    }
}
