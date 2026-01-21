package com.hotelbooking.service;

import com.hotelbooking.dto.CreateBookingRequest;
import com.hotelbooking.model.*;
import com.hotelbooking.repository.*;
import com.hotelbooking.security.CustomUserDetails;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingRoomRepository bookingRoomRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private TariffRepository tariffRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public List<Map<String, Object>> getAllBookings(String status, String hotelId) {
        try {
            StringBuilder sql = new StringBuilder("""
                        SELECT b.id, b.check_in_date, b.check_out_date, b.status,
                               b.total_amount, b.discount_amount, b.final_amount,
                               b.number_of_guests, b.special_requests, b.booking_date, b.created_at,
                               h.name AS hotel_name, h.city,
                               CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
                               g.email AS guest_email,
                               COUNT(br.id) AS rooms_count,
                               GROUP_CONCAT(r.room_number) AS room_numbers
                        FROM bookings b
                        JOIN hotels h ON b.hotel_id = h.id
                        JOIN guests g ON b.guest_id = g.id
                        LEFT JOIN booking_rooms br ON b.id = br.booking_id
                        LEFT JOIN rooms r ON br.room_id = r.id
                        WHERE 1=1
                    """);

            Map<String, Object> params = new HashMap<>();

            if (hotelId != null && !hotelId.isEmpty()) {
                sql.append(" AND b.hotel_id = :hotelId");
                params.put("hotelId", hotelId);
            }

            if (status != null && !status.isEmpty()) {
                sql.append(" AND b.status = :status");
                params.put("status", status);
            }

            sql.append(" GROUP BY b.id ORDER BY b.created_at DESC LIMIT 50");

            Query query = entityManager.createNativeQuery(sql.toString());
            params.forEach(query::setParameter);

            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();

            return mapBookingResults(results, true);
        } catch (Exception e) {
            log.error("Error getting all bookings", e);
            return new ArrayList<>();
        }
    }

    public List<Map<String, Object>> getBookingsByGuest(String guestId, String status) {
        try {
            StringBuilder sql = new StringBuilder("""
                        SELECT b.id, b.check_in_date, b.check_out_date, b.status,
                               b.total_amount, b.discount_amount, b.final_amount,
                               b.number_of_guests, b.special_requests, b.booking_date, b.created_at,
                               h.name AS hotel_name, h.city,
                               CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
                               g.email AS guest_email,
                               COUNT(br.id) AS rooms_count,
                               GROUP_CONCAT(r.room_number) AS room_numbers
                        FROM bookings b
                        JOIN hotels h ON b.hotel_id = h.id
                        JOIN guests g ON b.guest_id = g.id
                        LEFT JOIN booking_rooms br ON b.id = br.booking_id
                        LEFT JOIN rooms r ON br.room_id = r.id
                        WHERE b.guest_id = :guestId
                    """);

            Map<String, Object> params = new HashMap<>();
            params.put("guestId", guestId);

            if (status != null && !status.isEmpty()) {
                sql.append(" AND b.status = :status");
                params.put("status", status);
            }

            sql.append(" GROUP BY b.id ORDER BY b.created_at DESC");

            Query query = entityManager.createNativeQuery(sql.toString());
            params.forEach(query::setParameter);

            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();

            return mapBookingResults(results, true);
        } catch (Exception e) {
            log.error("Error getting guest bookings for: " + guestId, e);
            return new ArrayList<>();
        }
    }

    public Optional<Map<String, Object>> getBookingById(String id) {
        try {
            String sql = """
                        SELECT b.id, b.check_in_date, b.check_out_date, b.status,
                               b.total_amount, b.discount_amount, b.final_amount,
                               b.number_of_guests, b.special_requests, b.booking_date, b.created_at,
                               h.name AS hotel_name, h.city, h.address, h.state, h.country, h.phone AS hotel_phone,
                               g.first_name, g.last_name, g.email AS guest_email, g.phone AS guest_phone,
                               COUNT(br.id) AS rooms_count,
                               GROUP_CONCAT(DISTINCT r.room_number) AS room_numbers,
                               GROUP_CONCAT(DISTINCT rt.name) AS room_types,
                               SUM(br.total_price) AS rooms_total
                        FROM bookings b
                        JOIN hotels h ON b.hotel_id = h.id
                        JOIN guests g ON b.guest_id = g.id
                        LEFT JOIN booking_rooms br ON b.id = br.booking_id
                        LEFT JOIN rooms r ON br.room_id = r.id
                        LEFT JOIN room_types rt ON r.room_type_id = rt.id
                        WHERE b.id = :id
                        GROUP BY b.id
                    """;

            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("id", id);

            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();

            if (results.isEmpty()) {
                return Optional.empty();
            }

            Object[] row = results.get(0);
            Map<String, Object> booking = new HashMap<>();
            booking.put("id", row[0]);
            booking.put("check_in_date", row[1]);
            booking.put("check_out_date", row[2]);
            booking.put("status", row[3]);
            booking.put("total_amount", row[4]);
            booking.put("discount_amount", row[5]);
            booking.put("final_amount", row[6]);
            booking.put("number_of_guests", row[7]);
            booking.put("special_requests", row[8]);
            booking.put("booking_date", row[9]);
            booking.put("created_at", row[10]);
            booking.put("hotel_name", row[11]);
            booking.put("city", row[12]);
            booking.put("address", row[13]);
            booking.put("state", row[14]);
            booking.put("country", row[15]);
            booking.put("hotel_phone", row[16]);
            booking.put("first_name", row[17]);
            booking.put("last_name", row[18]);
            booking.put("guest_email", row[19]);
            booking.put("guest_phone", row[20]);
            booking.put("rooms_count", row[21]);
            booking.put("room_numbers", row[22]);
            booking.put("room_types", row[23]);
            booking.put("rooms_total", row[24]);

            // Get payments
            String paymentSql = "SELECT * FROM payments WHERE booking_id = :bookingId ORDER BY payment_date DESC";
            Query paymentQuery = entityManager.createNativeQuery(paymentSql, Payment.class);
            paymentQuery.setParameter("bookingId", id);
            @SuppressWarnings("unchecked")
            List<Payment> payments = paymentQuery.getResultList();
            booking.put("payments", payments);

            return Optional.of(booking);
        } catch (Exception e) {
            log.error("Error getting booking by id: " + id, e);
            return Optional.empty();
        }
    }

    private List<Map<String, Object>> mapBookingResults(List<Object[]> results, boolean includeGuest) {
        List<Map<String, Object>> bookings = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> booking = new HashMap<>();
            booking.put("id", row[0]);
            booking.put("check_in_date", row[1]);
            booking.put("check_out_date", row[2]);
            booking.put("status", row[3]);
            booking.put("total_amount", row[4]);
            booking.put("discount_amount", row[5]);
            booking.put("final_amount", row[6]);
            booking.put("number_of_guests", row[7]);
            booking.put("special_requests", row[8]);
            booking.put("booking_date", row[9]);
            booking.put("created_at", row[10]);
            booking.put("hotel_name", row[11]);
            booking.put("city", row[12]);
            if (includeGuest) {
                booking.put("guest_name", row[13]);
                booking.put("guest_email", row[14]);
            }
            booking.put("rooms_count", row[15]);
            booking.put("room_numbers", row[16]);
            bookings.add(booking);
        }
        return bookings;
    }

    @Transactional
    public Map<String, Object> createBooking(CreateBookingRequest request) {
        // 1. Validate dates
        if (!request.getCheck_out_date().isAfter(request.getCheck_in_date())) {
            throw new RuntimeException("Check-out must be after check-in");
        }

        long nights = ChronoUnit.DAYS.between(request.getCheck_in_date(), request.getCheck_out_date());

        // 2. Resolve Rooms
        List<String> resolvedRoomIds = new ArrayList<>();

        for (String id : request.getRoom_ids()) {
            boolean isRoomType = roomTypeRepository.existsById(id);

            if (isRoomType) {
                Room availableRoom = roomRepository.findAvailableRoom(
                        id, request.getHotel_id(), request.getCheck_in_date(), request.getCheck_out_date());

                if (availableRoom == null) {
                    throw new RuntimeException("No available rooms for the selected room type and dates");
                }
                resolvedRoomIds.add(availableRoom.getId());
            } else {
                resolvedRoomIds.add(id);
            }
        }

        // 3. Conflict Check
        for (String roomId : resolvedRoomIds) {
            Long conflicts = bookingRoomRepository.countConflictingBookings(
                    roomId, request.getCheck_in_date(), request.getCheck_out_date());
            if (conflicts > 0) {
                throw new RuntimeException("Room " + roomId + " is not available for selected dates");
            }
        }

        // 4. Calculate Price
        double totalAmount = 0.0;
        List<BookingRoom> bookingRooms = new ArrayList<>();

        for (String roomId : resolvedRoomIds) {
            Room room = roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
            RoomType rt = room.getRoomType();

            Optional<Tariff> tariff = tariffRepository.findByRoomTypeIdAndDate(rt.getId(), request.getCheck_in_date());

            double pricePerNight = tariff.map(Tariff::getPrice)
                    .orElse(rt.getBasePrice() != null ? rt.getBasePrice() : 0.0);
            double roomTotal = pricePerNight * nights;
            totalAmount += roomTotal;

            BookingRoom br = new BookingRoom();
            br.setRoom(room);
            br.setCheckInDate(request.getCheck_in_date());
            br.setCheckOutDate(request.getCheck_out_date());
            br.setPricePerNight(pricePerNight);
            br.setNumberOfNights((int) nights);
            br.setTotalPrice(roomTotal);
            tariff.ifPresent(t -> br.setTariffId(t.getId()));

            bookingRooms.add(br);
        }

        // 5. Build Booking
        Booking booking = new Booking();
        booking.setGuest(guestRepository.findById(request.getGuest_id())
                .orElseThrow(() -> new RuntimeException("Guest not found")));
        booking.setHotel(hotelRepository.findById(request.getHotel_id())
                .orElseThrow(() -> new RuntimeException("Hotel not found")));
        booking.setCheckInDate(request.getCheck_in_date());
        booking.setCheckOutDate(request.getCheck_out_date());
        booking.setTotalAmount(totalAmount);
        booking.setDiscountAmount(0.0);
        booking.setFinalAmount(totalAmount);
        booking.setStatus("pending_payment");

        Booking savedBooking = bookingRepository.save(booking);

        // Save BookingRooms
        for (BookingRoom br : bookingRooms) {
            br.setBooking(savedBooking);
            bookingRoomRepository.save(br);
        }

        // Return the booking in the expected format
        return getBookingById(savedBooking.getId()).orElse(Map.of("id", savedBooking.getId()));
    }

    @Transactional
    public void updateBookingStatus(String id, String status, String notes, String changedBy) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));

        String oldStatus = booking.getStatus();
        booking.setStatus(status);
        bookingRepository.save(booking);

        // Log status change
        if (changedBy != null) {
            String logSql = """
                        INSERT INTO booking_status_history (id, booking_id, old_status, new_status, changed_by, notes)
                        VALUES (:id, :bookingId, :oldStatus, :newStatus, :changedBy, :notes)
                    """;
            Query logQuery = entityManager.createNativeQuery(logSql);
            logQuery.setParameter("id", UUID.randomUUID().toString());
            logQuery.setParameter("bookingId", id);
            logQuery.setParameter("oldStatus", oldStatus);
            logQuery.setParameter("newStatus", status);
            logQuery.setParameter("changedBy", changedBy);
            logQuery.setParameter("notes", notes);
            logQuery.executeUpdate();
        }

        // Update room statuses
        if ("checked_in".equals(status)) {
            String updateSql = """
                        UPDATE rooms r
                        INNER JOIN booking_rooms br ON r.id = br.room_id
                        SET r.status = 'occupied'
                        WHERE br.booking_id = :bookingId
                    """;
            Query updateQuery = entityManager.createNativeQuery(updateSql);
            updateQuery.setParameter("bookingId", id);
            updateQuery.executeUpdate();
        } else if ("checked_out".equals(status)) {
            String updateSql = """
                        UPDATE rooms r
                        INNER JOIN booking_rooms br ON r.id = br.room_id
                        SET r.status = 'available'
                        WHERE br.booking_id = :bookingId
                    """;
            Query updateQuery = entityManager.createNativeQuery(updateSql);
            updateQuery.setParameter("bookingId", id);
            updateQuery.executeUpdate();
        }
    }

    @Transactional
    public void cancelBooking(String id, String reason, CustomUserDetails userDetails) {
        String cancelledBy = userDetails != null && !"guest".equals(userDetails.getRole()) ? userDetails.getId() : null;
        String finalReason = userDetails != null && "guest".equals(userDetails.getRole())
                ? "Cancelled by guest: " + (reason != null ? reason : "No reason provided")
                : reason;

        String sql = """
                    UPDATE bookings
                    SET status = 'cancelled',
                        cancelled_at = NOW(),
                        cancelled_by = :cancelledBy,
                        cancellation_reason = :reason
                    WHERE id = :id
                """;
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("id", id);
        query.setParameter("cancelledBy", cancelledBy);
        query.setParameter("reason", finalReason);
        query.executeUpdate();
    }
}
