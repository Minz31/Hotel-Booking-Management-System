package com.hotelbooking.repository;

import com.hotelbooking.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, String> {
    List<RoomType> findByHotelId(String hotelId);
}
