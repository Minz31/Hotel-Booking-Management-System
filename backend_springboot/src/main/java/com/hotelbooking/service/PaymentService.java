package com.hotelbooking.service;

import com.hotelbooking.dto.ApiResponse;
import com.hotelbooking.model.Booking;
import com.hotelbooking.model.Payment;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.PaymentRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public ApiResponse<Object> getAllPayments(int limit, int offset, String hotelId) {
        String sql = """
                    SELECT p.*,
                        b.id as booking_number,
                        h.name as hotel_name,
                        CONCAT(g.first_name, ' ', g.last_name) as guest_name
                    FROM payments p
                    JOIN bookings b ON p.booking_id = b.id
                    JOIN hotels h ON b.hotel_id = h.id
                    JOIN guests g ON b.guest_id = g.id
                    WHERE 1=1
                """;

        String countSql = "SELECT COUNT(*) FROM payments p JOIN bookings b ON p.booking_id = b.id WHERE 1=1";

        if (hotelId != null) {
            sql += " AND b.hotel_id = :hotelId";
            countSql += " AND b.hotel_id = :hotelId";
        }

        sql += " ORDER BY p.payment_date DESC LIMIT :limit OFFSET :offset";

        Query query = entityManager.createNativeQuery(sql);
        Query countQuery = entityManager.createNativeQuery(countSql);

        if (hotelId != null) {
            query.setParameter("hotelId", hotelId);
            countQuery.setParameter("hotelId", hotelId);
        }
        query.setParameter("limit", limit);
        query.setParameter("offset", offset);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        Number total = (Number) countQuery.getSingleResult();

        List<Map<String, Object>> payments = results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("booking_id", row[1]);
            map.put("amount", row[2]);
            map.put("payment_method", row[3]);
            map.put("transaction_id", row[4]);
            map.put("status", row[5]);
            map.put("gateway_name", row[6]);
            map.put("payment_date", row[7]);
            map.put("booking_number", row[8]);
            map.put("hotel_name", row[9]);
            map.put("guest_name", row[10]);
            return map;
        }).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("payments", payments);

        ApiResponse.PaginationMetadata pagination = new ApiResponse.PaginationMetadata(
                (offset / limit) + 1,
                limit,
                total.longValue(),
                (int) Math.ceil((double) total.longValue() / limit));

        return ApiResponse.success(payments, pagination);
    }

    @Transactional
    public Map<String, Object> createPayment(Map<String, Object> payload) {
        String bookingId = (String) payload.get("booking_id");
        Double amount = Double.parseDouble(payload.get("amount").toString());
        String paymentMethod = (String) payload.get("payment_method");
        String transactionId = (String) payload.get("transaction_id");
        String gatewayName = (String) payload.get("gateway_name");

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionId(transactionId);
        payment.setGatewayName(gatewayName);
        payment.setStatus("paid");
        payment.setPaymentDate(LocalDateTime.now());

        Payment saved = paymentRepository.save(payment);

        // Update booking status to confirmed
        booking.setStatus("confirmed");
        bookingRepository.save(booking);

        Map<String, Object> result = new HashMap<>();
        result.put("payment_id", saved.getId());
        result.put("booking_id", bookingId);
        result.put("amount", amount);
        result.put("status", "paid");

        return result;
    }

    public List<Map<String, Object>> getBookingPayments(String bookingId) {
        List<Payment> payments = paymentRepository.findByBookingIdOrderByPaymentDateDesc(bookingId);
        return payments.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("booking_id", p.getBooking().getId());
            map.put("amount", p.getAmount());
            map.put("payment_method", p.getPaymentMethod());
            map.put("transaction_id", p.getTransactionId());
            map.put("status", p.getStatus());
            map.put("gateway_name", p.getGatewayName());
            map.put("payment_date", p.getPaymentDate());
            return map;
        }).toList();
    }

    @Transactional
    public Map<String, Object> processRefund(String id, Map<String, Object> payload) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Double refundAmount = Double.parseDouble(payload.get("refund_amount").toString());

        // Create refund payment record
        Payment refundPayment = new Payment();
        refundPayment.setBooking(payment.getBooking());
        refundPayment.setAmount(refundAmount);
        refundPayment.setPaymentMethod(payment.getPaymentMethod());
        refundPayment.setTransactionId("REFUND_" + UUID.randomUUID().toString());
        refundPayment.setStatus("refunded");
        refundPayment.setGatewayName(payment.getGatewayName());
        refundPayment.setPaymentDate(LocalDateTime.now());

        Payment savedRefund = paymentRepository.save(refundPayment);

        // Update original payment status
        String newStatus = refundAmount >= payment.getAmount() ? "refunded" : "partially_refunded";
        payment.setStatus(newStatus);
        paymentRepository.save(payment);

        Map<String, Object> result = new HashMap<>();
        result.put("refund_id", savedRefund.getId());
        result.put("amount", refundAmount);
        result.put("status", newStatus);

        return result;
    }
}
