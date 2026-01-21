package com.hotelbooking.service;

import com.hotelbooking.model.Hotel;
import com.hotelbooking.model.Room;
import com.hotelbooking.model.RoomType;
import com.hotelbooking.model.Tariff;
import com.hotelbooking.repository.HotelRepository;
import com.hotelbooking.repository.RoomRepository;
import com.hotelbooking.repository.RoomTypeRepository;
import com.hotelbooking.repository.TariffRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class RoomService {

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private TariffRepository tariffRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // ==================== ROOM TYPES ====================

    public List<Map<String, Object>> getRoomTypes(String hotelId) {
        String sql = """
                    SELECT rt.*,
                        COUNT(DISTINCT r.id) as total_rooms,
                        COUNT(DISTINCT CASE WHEN r.is_active = TRUE THEN r.id END) as active_rooms
                    FROM room_types rt
                    LEFT JOIN rooms r ON rt.id = r.room_type_id
                    WHERE rt.hotel_id = :hotelId
                    GROUP BY rt.id
                    ORDER BY rt.name
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("hotelId", hotelId);
        return convertToMapList(query.getResultList(),
                new String[] { "id", "hotel_id", "name", "description", "max_occupancy", "bed_type", "amenities",
                        "base_price", "total_rooms", "active_rooms" });
    }

    @Transactional
    public RoomType createRoomType(Map<String, Object> payload) {
        String hotelId = (String) payload.get("hotel_id");
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        RoomType roomType = new RoomType();
        roomType.setHotel(hotel);
        roomType.setName((String) payload.get("type_name"));
        roomType.setDescription((String) payload.get("description"));
        roomType.setMaxOccupancy(
                payload.get("max_occupancy") != null ? Integer.parseInt(payload.get("max_occupancy").toString())
                        : null);
        roomType.setAmenities((String) payload.get("amenities"));

        return roomTypeRepository.save(roomType);
    }

    @Transactional
    public void updateRoomType(String id, Map<String, Object> payload) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room type not found"));

        if (payload.containsKey("type_name"))
            roomType.setName((String) payload.get("type_name"));
        if (payload.containsKey("description"))
            roomType.setDescription((String) payload.get("description"));
        if (payload.containsKey("max_occupancy"))
            roomType.setMaxOccupancy(Integer.parseInt(payload.get("max_occupancy").toString()));
        if (payload.containsKey("amenities"))
            roomType.setAmenities((String) payload.get("amenities"));

        roomTypeRepository.save(roomType);
    }

    @Transactional
    public void deleteRoomType(String id) {
        long roomCount = roomRepository.countByRoomTypeId(id);
        if (roomCount > 0) {
            throw new RuntimeException("Cannot delete room type with existing rooms");
        }
        roomTypeRepository.deleteById(id);
    }

    // ==================== ROOMS ====================

    public List<Map<String, Object>> getRooms(String hotelId) {
        String sql = """
                    SELECT r.*, rt.name as type_name, rt.max_occupancy,
                        (SELECT COUNT(*) FROM booking_rooms br
                         JOIN bookings b ON br.booking_id = b.id
                         WHERE br.room_id = r.id
                         AND b.status IN ('confirmed', 'checked_in')
                         AND CURDATE() BETWEEN b.check_in_date AND b.check_out_date) as is_currently_booked
                    FROM rooms r
                    JOIN room_types rt ON r.room_type_id = rt.id
                    WHERE r.hotel_id = :hotelId AND r.is_active = TRUE
                    ORDER BY r.floor, r.room_number
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("hotelId", hotelId);
        return convertToMapList(query.getResultList(),
                new String[] { "id", "hotel_id", "room_type_id", "room_number", "floor", "status", "notes", "is_active",
                        "type_name", "max_occupancy", "is_currently_booked" });
    }

    @Transactional
    public Room createRoom(Map<String, Object> payload) {
        String hotelId = (String) payload.get("hotel_id");
        String roomTypeId = (String) payload.get("room_type_id");

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new RuntimeException("Room type not found"));

        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomType(roomType);
        room.setRoomNumber((String) payload.get("room_number"));
        room.setFloor((String) payload.get("floor"));
        room.setStatus("available");

        return roomRepository.save(room);
    }

    @Transactional
    public void updateRoom(String id, Map<String, Object> payload) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (payload.containsKey("room_number"))
            room.setRoomNumber((String) payload.get("room_number"));
        if (payload.containsKey("floor"))
            room.setFloor((String) payload.get("floor"));
        if (payload.containsKey("status"))
            room.setStatus((String) payload.get("status"));

        roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(String id) {
        // Soft delete
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        room.setStatus("blocked");
        roomRepository.save(room);
    }

    // ==================== TARIFFS ====================

    public List<Map<String, Object>> getTariffs(String hotelId) {
        String sql = """
                    SELECT t.*, rt.name as type_name
                    FROM tariffs t
                    JOIN room_types rt ON t.room_type_id = rt.id
                    WHERE rt.hotel_id = :hotelId
                    ORDER BY t.start_date DESC
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("hotelId", hotelId);
        return convertToMapList(query.getResultList(),
                new String[] { "id", "room_type_id", "price", "currency", "start_date", "end_date", "is_weekend",
                        "description", "type_name" });
    }

    @Transactional
    public void createTariff(Map<String, Object> payload) {
        String roomTypeId = (String) payload.get("room_type_id");
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new RuntimeException("Room type not found"));

        Tariff tariff = new Tariff();
        tariff.setRoomType(roomType);
        tariff.setPrice(Double.parseDouble(payload.get("price").toString()));
        tariff.setStartDate(LocalDate.parse((String) payload.get("start_date")));
        tariff.setEndDate(LocalDate.parse((String) payload.get("end_date")));

        tariffRepository.save(tariff);
    }

    @Transactional
    public void updateTariff(String id, Map<String, Object> payload) {
        Tariff tariff = tariffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tariff not found"));

        if (payload.containsKey("price"))
            tariff.setPrice(Double.parseDouble(payload.get("price").toString()));
        if (payload.containsKey("start_date"))
            tariff.setStartDate(LocalDate.parse((String) payload.get("start_date")));
        if (payload.containsKey("end_date"))
            tariff.setEndDate(LocalDate.parse((String) payload.get("end_date")));

        tariffRepository.save(tariff);
    }

    @Transactional
    public void deleteTariff(String id) {
        tariffRepository.deleteById(id);
    }

    // ==================== AVAILABILITY ====================

    public List<Map<String, Object>> getAvailabilityCalendar(String hotelId, String startDate, String endDate) {
        String sql = """
                    SELECT
                        r.id, r.room_number, r.floor,
                        rt.name as type_name,
                        ab.booking_id,
                        ab.check_in_date,
                        ab.check_out_date,
                        ab.status,
                        CONCAT(g.first_name, ' ', g.last_name) as guest_name
                    FROM rooms r
                    JOIN room_types rt ON r.room_type_id = rt.id
                    LEFT JOIN (
                        SELECT br.room_id, b.id as booking_id, b.check_in_date, b.check_out_date, b.status, b.guest_id
                        FROM booking_rooms br
                        JOIN bookings b ON br.booking_id = b.id
                        WHERE b.status IN ('confirmed', 'checked_in')
                        AND (b.check_in_date <= :endDate AND b.check_out_date >= :startDate)
                    ) ab ON r.id = ab.room_id
                    LEFT JOIN guests g ON ab.guest_id = g.id
                    WHERE r.hotel_id = :hotelId AND r.is_active = TRUE
                    ORDER BY r.floor, r.room_number
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("hotelId", hotelId);
        query.setParameter("startDate", startDate != null ? startDate : LocalDate.now().toString());
        query.setParameter("endDate", endDate != null ? endDate : LocalDate.now().plusDays(30).toString());
        return convertToMapList(query.getResultList(),
                new String[] { "id", "room_number", "floor", "type_name", "booking_id", "check_in_date",
                        "check_out_date", "status", "guest_name" });
    }

    // Helper method to convert native query result to List<Map>
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> convertToMapList(List<Object[]> results, String[] columns) {
        return results.stream().map(row -> {
            java.util.HashMap<String, Object> map = new java.util.HashMap<>();
            for (int i = 0; i < columns.length && i < row.length; i++) {
                map.put(columns[i], row[i]);
            }
            return (Map<String, Object>) map;
        }).toList();
    }
}
