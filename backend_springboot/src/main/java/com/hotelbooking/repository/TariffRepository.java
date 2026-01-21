package com.hotelbooking.repository;

import com.hotelbooking.model.Tariff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TariffRepository extends JpaRepository<Tariff, String> {

    @Query("SELECT t FROM Tariff t WHERE t.roomType.id = :roomTypeId AND :date BETWEEN t.startDate AND t.endDate")
    Optional<Tariff> findByRoomTypeIdAndDate(@Param("roomTypeId") String roomTypeId, @Param("date") LocalDate date);
}
