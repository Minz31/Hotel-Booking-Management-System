package com.hotelbooking.repository;

import com.hotelbooking.model.Administrator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdministratorRepository extends JpaRepository<Administrator, String> {
    Optional<Administrator> findByUsername(String username);

    Optional<Administrator> findByEmail(String email);
}
