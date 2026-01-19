-- =====================================================
-- HOTEL BOOKING SYSTEM - SQL QUERIES
-- Complete DDL, DML, and Query Collection
-- =====================================================

-- =====================================================
-- SECTION 1: DATABASE SETUP
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS hotel_booking_system;
USE hotel_booking_system;

-- =====================================================
-- SECTION 2: DDL - TABLE CREATION
-- =====================================================

-- Table: hotels
CREATE TABLE hotels (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    description TEXT,
    star_rating INT CHECK (star_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_city_country (city, country),
    INDEX idx_email (email)
);

-- Table: room_types
CREATE TABLE room_types (
    id VARCHAR(36) PRIMARY KEY,
    hotel_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_occupancy INT NOT NULL,
    bed_type VARCHAR(50),
    amenities TEXT,
    base_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    INDEX idx_hotel_id (hotel_id)
);

-- Table: rooms
CREATE TABLE rooms (
    id VARCHAR(36) PRIMARY KEY,
    hotel_id VARCHAR(36) NOT NULL,
    room_type_id VARCHAR(36) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    floor VARCHAR(10),
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    last_maintenance_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_room_number (hotel_id, room_number),
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_room_type_id (room_type_id),
    INDEX idx_status (status),
    CHECK (status IN ('available', 'occupied', 'maintenance', 'blocked'))
);

-- Table: tariffs
CREATE TABLE tariffs (
    id VARCHAR(36) PRIMARY KEY,
    hotel_id VARCHAR(36) NOT NULL,
    room_type_id VARCHAR(36) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description VARCHAR(255),
    is_weekend BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
    INDEX idx_hotel_room_type (hotel_id, room_type_id),
    INDEX idx_dates (start_date, end_date),
    CHECK (end_date > start_date)
);

-- Table: guests
CREATE TABLE guests (
    id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    zip_code VARCHAR(20),
    date_of_birth DATE,
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_phone (phone)
);

-- Table: discounts
CREATE TABLE discounts (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    amount_type VARCHAR(20) NOT NULL,
    min_booking_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_dates (valid_from, valid_to),
    CHECK (amount_type IN ('percentage', 'fixed'))
);

-- Table: special_offers
CREATE TABLE special_offers (
    id VARCHAR(36) PRIMARY KEY,
    hotel_id VARCHAR(36),
    room_type_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_id VARCHAR(36) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    min_nights INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE RESTRICT,
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_dates (valid_from, valid_to)
);

-- Table: administrators
CREATE TABLE administrators (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(50) NOT NULL,
    hotel_id VARCHAR(36),
    permissions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES administrators(id) ON DELETE SET NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_hotel_id (hotel_id),
    CHECK (role IN ('super_admin', 'hotel_admin', 'manager', 'staff'))
);

-- Table: bookings
CREATE TABLE bookings (
    id VARCHAR(36) PRIMARY KEY,
    guest_id VARCHAR(36) NOT NULL,
    hotel_id VARCHAR(36) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    discount_id VARCHAR(36),
    special_offer_id VARCHAR(36),
    special_requests TEXT,
    number_of_guests INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by VARCHAR(36),
    cancellation_reason TEXT,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT,
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE SET NULL,
    FOREIGN KEY (special_offer_id) REFERENCES special_offers(id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by) REFERENCES administrators(id) ON DELETE SET NULL,
    INDEX idx_guest_id (guest_id),
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_status (status),
    INDEX idx_dates (check_in_date, check_out_date),
    CHECK (check_out_date > check_in_date),
    CHECK (status IN ('pending_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'))
);

-- Table: booking_rooms
CREATE TABLE booking_rooms (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    room_id VARCHAR(36) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    number_of_nights INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    tariff_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (tariff_id) REFERENCES tariffs(id) ON DELETE SET NULL,
    INDEX idx_booking_id (booking_id),
    INDEX idx_room_id (room_id),
    INDEX idx_room_dates (room_id, check_in_date, check_out_date)
);

-- Table: payments
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    status VARCHAR(30) NOT NULL,
    failure_reason TEXT,
    refund_id VARCHAR(36),
    refund_amount DECIMAL(10, 2),
    refund_date TIMESTAMP,
    gateway_name VARCHAR(50),
    gateway_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    FOREIGN KEY (refund_id) REFERENCES payments(id) ON DELETE SET NULL,
    INDEX idx_booking_id (booking_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date),
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded')),
    CHECK (payment_method IN ('credit_card', 'debit_card', 'online_wallet', 'bank_transfer', 'cash'))
);

-- Table: reviews
CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL UNIQUE,
    guest_id VARCHAR(36) NOT NULL,
    hotel_id VARCHAR(36) NOT NULL,
    room_type_id VARCHAR(36),
    rating INT NOT NULL,
    cleanliness_rating INT,
    service_rating INT,
    location_rating INT,
    value_rating INT,
    title VARCHAR(255),
    comment TEXT,
    response TEXT,
    response_by VARCHAR(36),
    response_date TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE SET NULL,
    FOREIGN KEY (response_by) REFERENCES administrators(id) ON DELETE SET NULL,
    INDEX idx_booking_id (booking_id),
    INDEX idx_guest_id (guest_id),
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at),
    CHECK (rating BETWEEN 1 AND 5),
    CHECK (cleanliness_rating IS NULL OR cleanliness_rating BETWEEN 1 AND 5),
    CHECK (service_rating IS NULL OR service_rating BETWEEN 1 AND 5),
    CHECK (location_rating IS NULL OR location_rating BETWEEN 1 AND 5),
    CHECK (value_rating IS NULL OR value_rating BETWEEN 1 AND 5)
);

-- Table: room_availability_calendar
CREATE TABLE room_availability_calendar (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    blocked_reason VARCHAR(50),
    booking_room_id VARCHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_room_id) REFERENCES booking_rooms(id) ON DELETE SET NULL,
    UNIQUE KEY unique_room_date (room_id, date),
    INDEX idx_room_id (room_id),
    INDEX idx_date (date),
    INDEX idx_availability (is_available),
    CHECK (blocked_reason IS NULL OR blocked_reason IN ('booking', 'maintenance', 'hold', 'management_block'))
);

-- Table: booking_status_history
CREATE TABLE booking_status_history (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by VARCHAR(36),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES administrators(id) ON DELETE SET NULL,
    INDEX idx_booking_id (booking_id),
    INDEX idx_changed_at (changed_at)
);

-- Table: room_maintenance_log
CREATE TABLE room_maintenance_log (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    maintenance_type VARCHAR(50),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    description TEXT,
    cost DECIMAL(10, 2),
    performed_by VARCHAR(100),
    status VARCHAR(30),
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES administrators(id) ON DELETE SET NULL,
    INDEX idx_room_id (room_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    CHECK (maintenance_type IS NULL OR maintenance_type IN ('routine', 'repair', 'deep_clean', 'renovation')),
    CHECK (status IS NULL OR status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

-- Table: guest_preferences
CREATE TABLE guest_preferences (
    id VARCHAR(36) PRIMARY KEY,
    guest_id VARCHAR(36) NOT NULL UNIQUE,
    preferred_room_type VARCHAR(100),
    preferred_floor VARCHAR(10),
    smoking_preference BOOLEAN,
    bed_preference VARCHAR(50),
    special_requirements TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    INDEX idx_guest_id (guest_id)
);

-- Table: notification_preferences
CREATE TABLE notification_preferences (
    id VARCHAR(36) PRIMARY KEY,
    guest_id VARCHAR(36) NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    promotional_emails BOOLEAN DEFAULT TRUE,
    booking_reminders BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    INDEX idx_guest_id (guest_id)
);

-- =====================================================
-- SECTION 3: SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample hotels
INSERT INTO hotels (id, name, address, city, state, country, zip_code, phone, email, description, star_rating) VALUES
('h1', 'Grand Plaza Hotel', '123 Main Street', 'New York', 'NY', 'USA', '10001', '+1-555-0101', 'info@grandplaza.com', 'Luxury hotel in the heart of Manhattan', 5),
('h2', 'Seaside Resort', '456 Beach Road', 'Miami', 'FL', 'USA', '33101', '+1-555-0102', 'contact@seasideresort.com', 'Beautiful beachfront resort', 4),
('h3', 'Mountain View Inn', '789 Hill Drive', 'Denver', 'CO', 'USA', '80201', '+1-555-0103', 'reservations@mountainview.com', 'Cozy mountain retreat', 3);

-- Insert sample administrators (password: 'admin123' - should be hashed in production)
INSERT INTO administrators (id, username, password_hash, email, full_name, role, hotel_id) VALUES
('admin1', 'superadmin', '$2y$10$example_hash_here', 'admin@system.com', 'System Administrator', 'super_admin', NULL),
('admin2', 'plaza_admin', '$2y$10$example_hash_here', 'admin@grandplaza.com', 'John Smith', 'hotel_admin', 'h1'),
('admin3', 'resort_admin', '$2y$10$example_hash_here', 'admin@seasideresort.com', 'Jane Doe', 'hotel_admin', 'h2');

-- Insert sample room types
INSERT INTO room_types (id, hotel_id, name, description, max_occupancy, bed_type, base_price) VALUES
('rt1', 'h1', 'Deluxe Suite', 'Spacious suite with city view', 4, 'King', 350.00),
('rt2', 'h1', 'Standard Room', 'Comfortable standard room', 2, 'Queen', 200.00),
('rt3', 'h2', 'Ocean View Suite', 'Luxury suite facing the ocean', 4, 'King', 450.00),
('rt4', 'h2', 'Beach Cottage', 'Private cottage near beach', 2, 'Double', 300.00),
('rt5', 'h3', 'Mountain Cabin', 'Rustic cabin with fireplace', 6, 'Multiple', 250.00);

-- Insert sample rooms
INSERT INTO rooms (id, hotel_id, room_type_id, room_number, floor, status) VALUES
('r1', 'h1', 'rt1', '501', '5', 'available'),
('r2', 'h1', 'rt1', '502', '5', 'available'),
('r3', 'h1', 'rt2', '301', '3', 'available'),
('r4', 'h1', 'rt2', '302', '3', 'available'),
('r5', 'h2', 'rt3', '701', '7', 'available'),
('r6', 'h2', 'rt4', 'C1', '1', 'available'),
('r7', 'h3', 'rt5', 'A1', '1', 'available');

-- Insert sample tariffs
INSERT INTO tariffs (id, hotel_id, room_type_id, price, currency, start_date, end_date, description) VALUES
('t1', 'h1', 'rt1', 350.00, 'USD', '2026-01-01', '2026-06-30', 'Regular season rate'),
('t2', 'h1', 'rt1', 450.00, 'USD', '2026-07-01', '2026-08-31', 'Peak season rate'),
('t3', 'h1', 'rt2', 200.00, 'USD', '2026-01-01', '2026-12-31', 'Year-round rate'),
('t4', 'h2', 'rt3', 450.00, 'USD', '2026-01-01', '2026-12-31', 'Standard rate'),
('t5', 'h3', 'rt5', 250.00, 'USD', '2026-01-01', '2026-12-31', 'Standard cabin rate');

-- Insert sample guests
INSERT INTO guests (id, first_name, last_name, email, phone, city, country) VALUES
('g1', 'Alice', 'Johnson', 'alice.j@email.com', '+1-555-1001', 'Boston', 'USA'),
('g2', 'Bob', 'Williams', 'bob.w@email.com', '+1-555-1002', 'Chicago', 'USA'),
('g3', 'Carol', 'Brown', 'carol.b@email.com', '+1-555-1003', 'Los Angeles', 'USA');

-- Insert sample discounts
INSERT INTO discounts (id, code, description, amount, amount_type, valid_from, valid_to, usage_limit) VALUES
('d1', 'WELCOME10', 'Welcome discount 10%', 10.00, 'percentage', '2026-01-01', '2026-12-31', 1000),
('d2', 'SUMMER50', 'Summer special $50 off', 50.00, 'fixed', '2026-06-01', '2026-08-31', 500),
('d3', 'EARLYBIRD', 'Early bird 15%', 15.00, 'percentage', '2026-01-01', '2026-12-31', NULL);

-- =====================================================
-- SECTION 4: AVAILABILITY & SEARCH QUERIES
-- =====================================================

-- Query 1: Check room availability for specific dates
-- Usage: Find available rooms between check-in and check-out dates
SELECT 
    h.name AS hotel_name,
    rt.name AS room_type,
    r.room_number,
    r.floor,
    rt.max_occupancy,
    rt.bed_type,
    t.price AS price_per_night
FROM rooms r
JOIN hotels h ON r.hotel_id = h.id
JOIN room_types rt ON r.room_type_id = rt.id
LEFT JOIN tariffs t ON t.room_type_id = rt.id 
    AND CURDATE() BETWEEN t.start_date AND t.end_date
WHERE r.status = 'available'
    AND r.hotel_id = 'h1'  -- Replace with desired hotel
    AND r.id NOT IN (
        -- Exclude rooms already booked for overlapping dates
        SELECT br.room_id 
        FROM booking_rooms br
        JOIN bookings b ON br.booking_id = b.id
        WHERE b.status NOT IN ('cancelled', 'no_show')
            AND NOT (
                br.check_out_date <= '2026-02-01' OR  -- Replace with check-in date
                br.check_in_date >= '2026-02-05'      -- Replace with check-out date
            )
    )
ORDER BY t.price;

-- Query 2: Search hotels by location
SELECT 
    h.id,
    h.name,
    h.city,
    h.state,
    h.country,
    h.star_rating,
    h.phone,
    h.email,
    COUNT(DISTINCT r.id) AS total_rooms,
    MIN(t.price) AS starting_from_price,
    AVG(rev.rating) AS avg_rating,
    COUNT(DISTINCT rev.id) AS total_reviews
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id AND r.is_active = TRUE
LEFT JOIN room_types rt ON r.room_type_id = rt.id
LEFT JOIN tariffs t ON rt.id = t.room_type_id 
    AND CURDATE() BETWEEN t.start_date AND t.end_date
LEFT JOIN reviews rev ON h.id = rev.hotel_id AND rev.is_approved = TRUE
WHERE h.is_active = TRUE
    AND h.city = 'New York'  -- Replace with desired city
GROUP BY h.id
ORDER BY h.star_rating DESC, avg_rating DESC;

-- Query 3: Get room types with current pricing for a hotel
SELECT 
    rt.id,
    rt.name,
    rt.description,
    rt.max_occupancy,
    rt.bed_type,
    rt.amenities,
    t.price AS current_price,
    t.currency,
    COUNT(r.id) AS available_rooms
FROM room_types rt
LEFT JOIN tariffs t ON rt.id = t.room_type_id 
    AND CURDATE() BETWEEN t.start_date AND t.end_date
LEFT JOIN rooms r ON rt.id = r.room_type_id 
    AND r.status = 'available'
WHERE rt.hotel_id = 'h1'  -- Replace with desired hotel
    AND rt.is_active = TRUE
GROUP BY rt.id
ORDER BY t.price;

-- Query 4: Check specific room availability with calendar
SELECT 
    rac.date,
    rac.is_available,
    rac.blocked_reason,
    r.room_number,
    r.status
FROM room_availability_calendar rac
JOIN rooms r ON rac.room_id = r.id
WHERE rac.room_id = 'r1'  -- Replace with room ID
    AND rac.date BETWEEN '2026-02-01' AND '2026-02-28'
ORDER BY rac.date;

-- =====================================================
-- SECTION 5: BOOKING MANAGEMENT QUERIES
-- =====================================================

-- Query 5: Create a new booking (Step 1: Insert booking)
INSERT INTO bookings (
    id, guest_id, hotel_id, check_in_date, check_out_date,
    total_amount, discount_amount, final_amount, status, number_of_guests
) VALUES (
    UUID(),  -- Generate unique ID
    'g1',    -- Guest ID
    'h1',    -- Hotel ID
    '2026-02-15',  -- Check-in date
    '2026-02-20',  -- Check-out date
    1750.00,       -- Total amount (5 nights * 350)
    0.00,          -- Discount amount
    1750.00,       -- Final amount
    'confirmed',   -- Status
    2              -- Number of guests
);

-- Query 6: Add rooms to booking
INSERT INTO booking_rooms (
    id, booking_id, room_id, check_in_date, check_out_date,
    price_per_night, number_of_nights, total_price, tariff_id
) VALUES (
    UUID(),
    'booking_id_here',  -- Replace with actual booking ID
    'r1',               -- Room ID
    '2026-02-15',       -- Check-in date
    '2026-02-20',       -- Check-out date
    350.00,             -- Price per night
    5,                  -- Number of nights
    1750.00,            -- Total price
    't1'                -- Tariff ID
);

-- Query 7: Get complete booking details
SELECT 
    b.id AS booking_id,
    b.booking_date,
    b.check_in_date,
    b.check_out_date,
    b.status,
    b.final_amount,
    g.first_name,
    g.last_name,
    g.email AS guest_email,
    g.phone AS guest_phone,
    h.name AS hotel_name,
    h.address AS hotel_address,
    h.phone AS hotel_phone,
    GROUP_CONCAT(DISTINCT r.room_number) AS room_numbers,
    GROUP_CONCAT(DISTINCT rt.name) AS room_types,
    SUM(br.total_price) AS rooms_total,
    p.status AS payment_status,
    p.amount AS paid_amount
FROM bookings b
JOIN guests g ON b.guest_id = g.id
JOIN hotels h ON b.hotel_id = h.id
LEFT JOIN booking_rooms br ON b.id = br.booking_id
LEFT JOIN rooms r ON br.room_id = r.id
LEFT JOIN room_types rt ON r.room_type_id = rt.id
LEFT JOIN payments p ON b.id = p.booking_id
WHERE b.id = 'booking_id_here'  -- Replace with booking ID
GROUP BY b.id;

-- Query 8: Get guest booking history
SELECT 
    b.id,
    b.booking_date,
    b.check_in_date,
    b.check_out_date,
    b.status,
    b.final_amount,
    h.name AS hotel_name,
    h.city,
    COUNT(br.id) AS rooms_booked,
    p.status AS payment_status
FROM bookings b
JOIN hotels h ON b.hotel_id = h.id
LEFT JOIN booking_rooms br ON b.id = br.booking_id
LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'paid'
WHERE b.guest_id = 'g1'  -- Replace with guest ID
GROUP BY b.id
ORDER BY b.booking_date DESC;

-- Query 9: Update booking status
UPDATE bookings 
SET status = 'checked_in',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'booking_id_here'  -- Replace with booking ID
    AND status = 'confirmed';

-- Query 10: Cancel booking
UPDATE bookings 
SET status = 'cancelled',
    cancelled_at = CURRENT_TIMESTAMP,
    cancelled_by = 'admin1',  -- Replace with admin ID
    cancellation_reason = 'Guest requested cancellation'
WHERE id = 'booking_id_here';  -- Replace with booking ID

-- Query 11: Prevent double booking - Check for conflicts
SELECT 
    br.booking_id,
    b.status,
    br.check_in_date,
    br.check_out_date
FROM booking_rooms br
JOIN bookings b ON br.booking_id = b.id
WHERE br.room_id = 'r1'  -- Room to check
    AND b.status NOT IN ('cancelled', 'no_show')
    AND NOT (
        br.check_out_date <= '2026-02-15' OR  -- New check-in date
        br.check_in_date >= '2026-02-20'      -- New check-out date
    );
-- If this query returns any rows, the room is already booked for those dates

-- =====================================================
-- SECTION 6: PAYMENT QUERIES
-- =====================================================

-- Query 12: Record a payment
INSERT INTO payments (
    id, booking_id, amount, payment_method, transaction_id,
    status, gateway_name
) VALUES (
    UUID(),
    'booking_id_here',  -- Booking ID
    1750.00,            -- Amount
    'credit_card',      -- Payment method
    'TXN_' || UUID(),   -- Transaction ID
    'paid',             -- Status
    'Stripe'            -- Gateway name
);

-- Query 13: Get payment history for a booking
SELECT 
    p.id,
    p.payment_date,
    p.amount,
    p.payment_method,
    p.transaction_id,
    p.status,
    p.gateway_name,
    p.refund_amount,
    p.refund_date
FROM payments p
WHERE p.booking_id = 'booking_id_here'
ORDER BY p.payment_date DESC;

-- Query 14: Process refund
INSERT INTO payments (
    id, booking_id, amount, payment_method, transaction_id,
    status, refund_id, gateway_name
) VALUES (
    UUID(),
    'booking_id_here',
    -875.00,  -- Negative amount for refund (50% refund)
    'credit_card',
    'REFUND_' || UUID(),
    'refunded',
    'original_payment_id',  -- Reference to original payment
    'Stripe'
);

-- Update original payment
UPDATE payments
SET status = 'partially_refunded',
    refund_amount = 875.00,
    refund_date = CURRENT_TIMESTAMP
WHERE id = 'original_payment_id';

-- Query 15: Get payment statistics
SELECT 
    DATE_FORMAT(payment_date, '%Y-%m') AS month,
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS successful_payments,
    SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END) AS failed_payments,
    SUM(CASE WHEN status = 'refunded' THEN refund_amount ELSE 0 END) AS total_refunds
FROM payments
WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
ORDER BY month DESC;

-- =====================================================
-- SECTION 7: DISCOUNT & PRICING QUERIES
-- =====================================================

-- Query 16: Validate and apply discount code
SELECT 
    d.id,
    d.code,
    d.amount,
    d.amount_type,
    d.min_booking_amount,
    d.max_discount_amount,
    d.valid_from,
    d.valid_to,
    d.usage_limit,
    d.usage_count,
    CASE 
        WHEN d.usage_limit IS NOT NULL AND d.usage_count >= d.usage_limit THEN 'LIMIT_REACHED'
        WHEN CURDATE() < d.valid_from THEN 'NOT_YET_VALID'
        WHEN CURDATE() > d.valid_to THEN 'EXPIRED'
        WHEN d.is_active = FALSE THEN 'INACTIVE'
        ELSE 'VALID'
    END AS validation_status
FROM discounts d
WHERE d.code = 'WELCOME10'  -- Replace with discount code
    AND d.is_active = TRUE;

-- Query 17: Calculate discount amount
-- For percentage discount
SELECT 
    1750.00 AS booking_amount,
    10.00 AS discount_percentage,
    (1750.00 * 10.00 / 100) AS discount_amount,
    (1750.00 - (1750.00 * 10.00 / 100)) AS final_amount;

-- Query 18: Get active special offers
SELECT 
    so.id,
    so.name,
    so.description,
    so.min_nights,
    h.name AS hotel_name,
    rt.name AS room_type,
    d.code AS discount_code,
    d.amount AS discount_amount,
    d.amount_type
FROM special_offers so
JOIN discounts d ON so.discount_id = d.id
LEFT JOIN hotels h ON so.hotel_id = h.id
LEFT JOIN room_types rt ON so.room_type_id = rt.id
WHERE so.is_active = TRUE
    AND CURDATE() BETWEEN so.valid_from AND so.valid_to
    AND d.is_active = TRUE
ORDER BY d.amount DESC;

-- Query 19: Calculate total booking cost with tariffs
SELECT 
    rt.name AS room_type,
    t.price AS price_per_night,
    DATEDIFF('2026-02-20', '2026-02-15') AS nights,
    (t.price * DATEDIFF('2026-02-20', '2026-02-15')) AS subtotal
FROM room_types rt
JOIN tariffs t ON rt.id = t.room_type_id
WHERE rt.id = 'rt1'
    AND '2026-02-15' BETWEEN t.start_date AND t.end_date;

-- =====================================================
-- SECTION 8: REVIEW & RATING QUERIES
-- =====================================================

-- Query 20: Add a review
INSERT INTO reviews (
    id, booking_id, guest_id, hotel_id, room_type_id,
    rating, cleanliness_rating, service_rating, location_rating, value_rating,
    title, comment, is_verified
) VALUES (
    UUID(),
    'booking_id_here',
    'g1',
    'h1',
    'rt1',
    5,  -- Overall rating
    5,  -- Cleanliness
    4,  -- Service
    5,  -- Location
    4,  -- Value
    'Excellent Stay!',
    'Had a wonderful experience. Room was spotless and staff was friendly.',
    TRUE
);

-- Query 21: Get hotel reviews with guest details
SELECT 
    r.id,
    r.rating,
    r.title,
    r.comment,
    r.created_at,
    r.helpful_count,
    g.first_name,
    g.last_name,
    rt.name AS room_type,
    r.response,
    a.full_name AS responded_by,
    r.response_date
FROM reviews r
JOIN guests g ON r.guest_id = g.id
LEFT JOIN room_types rt ON r.room_type_id = rt.id
LEFT JOIN administrators a ON r.response_by = a.id
WHERE r.hotel_id = 'h1'
    AND r.is_approved = TRUE
ORDER BY r.created_at DESC
LIMIT 20;

-- Query 22: Get hotel rating statistics
SELECT 
    h.id,
    h.name,
    COUNT(r.id) AS total_reviews,
    ROUND(AVG(r.rating), 2) AS avg_overall_rating,
    ROUND(AVG(r.cleanliness_rating), 2) AS avg_cleanliness,
    ROUND(AVG(r.service_rating), 2) AS avg_service,
    ROUND(AVG(r.location_rating), 2) AS avg_location,
    ROUND(AVG(r.value_rating), 2) AS avg_value,
    SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS five_star_count,
    SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS four_star_count,
    SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS three_star_count,
    SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) AS two_star_count,
    SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS one_star_count
FROM hotels h
LEFT JOIN reviews r ON h.id = r.hotel_id AND r.is_approved = TRUE
WHERE h.id = 'h1'
GROUP BY h.id;

-- Query 23: Add hotel response to review
UPDATE reviews
SET response = 'Thank you for your wonderful feedback! We look forward to welcoming you again.',
    response_by = 'admin2',
    response_date = CURRENT_TIMESTAMP
WHERE id = 'review_id_here';

-- Query 24: Get top-rated hotels
SELECT 
    h.id,
    h.name,
    h.city,
    h.star_rating,
    COUNT(r.id) AS review_count,
    ROUND(AVG(r.rating), 2) AS avg_rating
FROM hotels h
LEFT JOIN reviews r ON h.id = r.hotel_id AND r.is_approved = TRUE
WHERE h.is_active = TRUE
GROUP BY h.id
HAVING review_count >= 5
ORDER BY avg_rating DESC, review_count DESC
LIMIT 10;

-- =====================================================
-- SECTION 9: ROOM MANAGEMENT QUERIES
-- =====================================================

-- Query 25: Update room status
UPDATE rooms
SET status = 'maintenance',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'r1';

-- Query 26: Add maintenance log
INSERT INTO room_maintenance_log (
    id, room_id, maintenance_type, start_date, end_date,
    description, cost, status, created_by
) VALUES (
    UUID(),
    'r1',
    'deep_clean',
    '2026-02-01 10:00:00',
    '2026-02-01 14:00:00',
    'Deep cleaning and carpet shampooing',
    150.00,
    'completed',
    'admin2'
);

-- Query 27: Get room occupancy status
SELECT 
    h.name AS hotel_name,
    COUNT(DISTINCT r.id) AS total_rooms,
    SUM(CASE WHEN r.status = 'available' THEN 1 ELSE 0 END) AS available_rooms,
    SUM(CASE WHEN r.status = 'occupied' THEN 1 ELSE 0 END) AS occupied_rooms,
    SUM(CASE WHEN r.status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance_rooms,
    ROUND((SUM(CASE WHEN r.status = 'occupied' THEN 1 ELSE 0 END) / COUNT(*) * 100), 2) AS occupancy_rate
FROM hotels h
JOIN rooms r ON h.id = r.hotel_id
WHERE h.id = 'h1'
GROUP BY h.id;

-- Query 28: Get maintenance history
SELECT 
    rml.id,
    r.room_number,
    rml.maintenance_type,
    rml.start_date,
    rml.end_date,
    rml.description,
    rml.cost,
    rml.status,
    a.full_name AS created_by_name
FROM room_maintenance_log rml
JOIN rooms r ON rml.room_id = r.id
LEFT JOIN administrators a ON rml.created_by = a.id
WHERE r.hotel_id = 'h1'
ORDER BY rml.start_date DESC;

-- Query 29: Update room availability calendar
INSERT INTO room_availability_calendar (
    id, room_id, date, is_available, blocked_reason
) VALUES (
    UUID(),
    'r1',
    '2026-02-15',
    FALSE,
    'maintenance'
);

-- =====================================================
-- SECTION 10: REPORTING & ANALYTICS QUERIES
-- =====================================================

-- Query 30: Daily revenue report
SELECT 
    DATE(b.check_in_date) AS date,
    COUNT(DISTINCT b.id) AS total_bookings,
    SUM(b.final_amount) AS total_revenue,
    AVG(b.final_amount) AS avg_booking_value,
    SUM(p.amount) AS collected_amount
FROM bookings b
LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'paid'
WHERE b.hotel_id = 'h1'
    AND b.status NOT IN ('cancelled', 'no_show')
    AND b.check_in_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(b.check_in_date)
ORDER BY date DESC;

-- Query 31: Monthly revenue by hotel
SELECT 
    h.name AS hotel_name,
    DATE_FORMAT(b.check_in_date, '%Y-%m') AS month,
    COUNT(b.id) AS bookings,
    SUM(b.final_amount) AS revenue,
    SUM(b.discount_amount) AS total_discounts,
    AVG(DATEDIFF(b.check_out_date, b.check_in_date)) AS avg_stay_duration
FROM hotels h
JOIN bookings b ON h.id = b.hotel_id
WHERE b.status NOT IN ('cancelled', 'no_show')
    AND b.check_in_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY h.id, DATE_FORMAT(b.check_in_date, '%Y-%m')
ORDER BY month DESC, revenue DESC;

-- Query 32: Room type performance
SELECT 
    rt.name AS room_type,
    COUNT(br.id) AS times_booked,
    SUM(br.total_price) AS total_revenue,
    AVG(br.price_per_night) AS avg_rate,
    AVG(br.number_of_nights) AS avg_nights
FROM room_types rt
JOIN booking_rooms br ON rt.id = (
    SELECT r.room_type_id 
    FROM rooms r 
    WHERE r.id = br.room_id
)
JOIN bookings b ON br.booking_id = b.id
WHERE rt.hotel_id = 'h1'
    AND b.status NOT IN ('cancelled', 'no_show')
    AND b.check_in_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
GROUP BY rt.id
ORDER BY total_revenue DESC;

-- Query 33: Guest demographics report
SELECT 
    g.country,
    COUNT(DISTINCT g.id) AS unique_guests,
    COUNT(b.id) AS total_bookings,
    SUM(b.final_amount) AS total_spent,
    AVG(b.final_amount) AS avg_booking_value
FROM guests g
JOIN bookings b ON g.id = b.guest_id
WHERE b.status NOT IN ('cancelled', 'no_show')
GROUP BY g.country
ORDER BY total_spent DESC;

-- Query 34: Cancellation analysis
SELECT 
    DATE_FORMAT(b.cancelled_at, '%Y-%m') AS month,
    COUNT(b.id) AS cancelled_bookings,
    SUM(b.final_amount) AS lost_revenue,
    AVG(DATEDIFF(b.cancelled_at, b.booking_date)) AS avg_days_before_cancellation
FROM bookings b
WHERE b.status = 'cancelled'
    AND b.cancelled_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY DATE_FORMAT(b.cancelled_at, '%Y-%m')
ORDER BY month DESC;

-- Query 35: Discount effectiveness
SELECT 
    d.code,
    d.description,
    d.amount,
    d.amount_type,
    d.usage_count,
    COUNT(b.id) AS times_used,
    SUM(b.discount_amount) AS total_discount_given,
    SUM(b.final_amount) AS revenue_generated
FROM discounts d
LEFT JOIN bookings b ON d.id = b.discount_id
    AND b.status NOT IN ('cancelled', 'no_show')
WHERE d.is_active = TRUE
GROUP BY d.id
ORDER BY revenue_generated DESC;

-- Query 36: Occupancy forecast
SELECT 
    rac.date,
    COUNT(DISTINCT rac.room_id) AS total_rooms,
    SUM(CASE WHEN rac.is_available = FALSE THEN 1 ELSE 0 END) AS booked_rooms,
    ROUND((SUM(CASE WHEN rac.is_available = FALSE THEN 1 ELSE 0 END) / COUNT(*) * 100), 2) AS occupancy_rate
FROM room_availability_calendar rac
JOIN rooms r ON rac.room_id = r.id
WHERE r.hotel_id = 'h1'
    AND rac.date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
GROUP BY rac.date
ORDER BY rac.date;

-- Query 37: Top guests (loyalty program)
SELECT 
    g.id,
    g.first_name,
    g.last_name,
    g.email,
    COUNT(b.id) AS total_bookings,
    SUM(b.final_amount) AS lifetime_value,
    MAX(b.check_out_date) AS last_stay,
    AVG(DATEDIFF(b.check_out_date, b.check_in_date)) AS avg_stay_duration
FROM guests g
JOIN bookings b ON g.id = b.guest_id
WHERE b.status IN ('checked_out', 'checked_in')
GROUP BY g.id
HAVING total_bookings >= 3
ORDER BY lifetime_value DESC
LIMIT 50;

-- =====================================================
-- SECTION 11: ADMINISTRATIVE QUERIES
-- =====================================================

-- Query 38: Get all bookings for a date range (Admin view)
SELECT 
    b.id,
    b.booking_date,
    b.check_in_date,
    b.check_out_date,
    b.status,
    g.first_name || ' ' || g.last_name AS guest_name,
    g.email,
    h.name AS hotel_name,
    GROUP_CONCAT(r.room_number) AS rooms,
    b.final_amount,
    p.status AS payment_status
FROM bookings b
JOIN guests g ON b.guest_id = g.id
JOIN hotels h ON b.hotel_id = h.id
LEFT JOIN booking_rooms br ON b.id = br.booking_id
LEFT JOIN rooms r ON br.room_id = r.id
LEFT JOIN payments p ON b.id = p.booking_id
WHERE b.check_in_date BETWEEN '2026-02-01' AND '2026-02-28'
    AND (h.id = 'h1' OR 'admin_role' = 'super_admin')  -- Filter by hotel for hotel admin
GROUP BY b.id
ORDER BY b.check_in_date;

-- Query 39: Update administrator permissions
UPDATE administrators
SET permissions = '["view_bookings", "edit_bookings", "manage_rooms", "view_reports"]',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'admin2';

-- Query 40: Audit trail - Booking status changes
SELECT 
    bsh.id,
    b.id AS booking_id,
    bsh.old_status,
    bsh.new_status,
    bsh.changed_at,
    a.full_name AS changed_by,
    bsh.notes
FROM booking_status_history bsh
JOIN bookings b ON bsh.booking_id = b.id
LEFT JOIN administrators a ON bsh.changed_by = a.id
WHERE b.id = 'booking_id_here'
ORDER BY bsh.changed_at DESC;

-- =====================================================
-- SECTION 12: UTILITY & MAINTENANCE QUERIES
-- =====================================================

-- Query 41: Clean up old availability calendar entries
DELETE FROM room_availability_calendar
WHERE date < DATE_SUB(CURDATE(), INTERVAL 90 DAY);

-- Query 42: Generate availability calendar for next 90 days
-- This would typically be done via a stored procedure or application code
-- Example for a single room:
INSERT INTO room_availability_calendar (id, room_id, date, is_available)
SELECT 
    UUID(),
    'r1',
    DATE_ADD(CURDATE(), INTERVAL seq DAY),
    TRUE
FROM (
    SELECT 0 AS seq UNION ALL SELECT 1 UNION ALL SELECT 2 -- ... continue to 89
) AS sequences
WHERE DATE_ADD(CURDATE(), INTERVAL seq DAY) NOT IN (
    SELECT date FROM room_availability_calendar WHERE room_id = 'r1'
);

-- Query 43: Update room status based on bookings (scheduled job)
UPDATE rooms r
SET status = CASE
    WHEN EXISTS (
        SELECT 1 FROM booking_rooms br
        JOIN bookings b ON br.booking_id = b.id
        WHERE br.room_id = r.id
            AND b.status = 'checked_in'
            AND CURDATE() BETWEEN br.check_in_date AND br.check_out_date
    ) THEN 'occupied'
    WHEN r.status = 'occupied' AND NOT EXISTS (
        SELECT 1 FROM booking_rooms br
        JOIN bookings b ON br.booking_id = b.id
        WHERE br.room_id = r.id
            AND b.status = 'checked_in'
            AND CURDATE() BETWEEN br.check_in_date AND br.check_out_date
    ) THEN 'available'
    ELSE r.status
END;

-- Query 44: Auto check-out past stays
UPDATE bookings
SET status = 'checked_out',
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'checked_in'
    AND check_out_date < CURDATE();

-- Query 45: Find orphaned records (data integrity check)
-- Payments without bookings
SELECT p.* FROM payments p
LEFT JOIN bookings b ON p.booking_id = b.id
WHERE b.id IS NULL;

-- Reviews without bookings
SELECT r.* FROM reviews r
LEFT JOIN bookings b ON r.booking_id = b.id
WHERE b.id IS NULL;

-- =====================================================
-- SECTION 13: ADVANCED QUERIES
-- =====================================================

-- Query 46: Calculate dynamic pricing based on occupancy
SELECT 
    rt.id,
    rt.name,
    t.price AS base_price,
    rac_stats.occupancy_rate,
    CASE 
        WHEN rac_stats.occupancy_rate > 80 THEN t.price * 1.3
        WHEN rac_stats.occupancy_rate > 60 THEN t.price * 1.15
        WHEN rac_stats.occupancy_rate < 30 THEN t.price * 0.85
        ELSE t.price
    END AS dynamic_price
FROM room_types rt
JOIN tariffs t ON rt.id = t.room_type_id 
    AND CURDATE() BETWEEN t.start_date AND t.end_date
JOIN (
    SELECT 
        r.room_type_id,
        ROUND((SUM(CASE WHEN rac.is_available = FALSE THEN 1 ELSE 0 END) / COUNT(*) * 100), 2) AS occupancy_rate
    FROM rooms r
    JOIN room_availability_calendar rac ON r.id = rac.room_id
    WHERE rac.date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    GROUP BY r.room_type_id
) rac_stats ON rt.id = rac_stats.room_type_id
WHERE rt.hotel_id = 'h1';

-- Query 47: Recommend hotels based on guest preferences
SELECT 
    h.id,
    h.name,
    h.city,
    AVG(rev.rating) AS avg_rating,
    MIN(t.price) AS min_price,
    COUNT(DISTINCT rt.id) AS room_type_variety,
    -- Scoring based on past bookings
    SUM(CASE WHEN past.hotel_id = h.id THEN 2 ELSE 0 END) AS familiarity_score
FROM hotels h
JOIN room_types rt ON h.id = rt.hotel_id
LEFT JOIN tariffs t ON rt.id = t.room_type_id 
    AND CURDATE() BETWEEN t.start_date AND t.end_date
LEFT JOIN reviews rev ON h.id = rev.hotel_id
LEFT JOIN (
    SELECT DISTINCT hotel_id 
    FROM bookings 
    WHERE guest_id = 'g1'
) past ON h.id = past.hotel_id
WHERE h.city = 'New York'  -- Based on search criteria
    AND h.is_active = TRUE
GROUP BY h.id
ORDER BY (avg_rating * 0.4 + familiarity_score * 0.3 + (5 - MIN(t.price)/100) * 0.3) DESC
LIMIT 10;

-- Query 48: Find similar hotels
SELECT 
    h2.id,
    h2.name,
    h2.city,
    h2.star_rating,
    AVG(r2.rating) AS avg_rating,
    ABS(h1.star_rating - h2.star_rating) AS rating_diff,
    MIN(t.price) AS starting_price
FROM hotels h1
JOIN hotels h2 ON h1.id != h2.id 
    AND h1.city = h2.city
    AND ABS(h1.star_rating - h2.star_rating) <= 1
LEFT JOIN reviews r2 ON h2.id = r2.hotel_id
LEFT JOIN room_types rt ON h2.id = rt.hotel_id
LEFT JOIN tariffs t ON rt.id = t.room_type_id 
    AND CURDATE() BETWEEN t.start_date AND t.end_date
WHERE h1.id = 'h1'  -- Find hotels similar to this one
    AND h2.is_active = TRUE
GROUP BY h2.id
ORDER BY rating_diff, avg_rating DESC
LIMIT 5;

-- Query 49: Booking conversion funnel
SELECT 
    'Total Searches' AS stage,
    0 AS stage_order,
    COUNT(*) AS count
FROM (SELECT 1) AS dummy  -- Replace with actual search log table
UNION ALL
SELECT 
    'Bookings Created',
    1,
    COUNT(*)
FROM bookings
WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
UNION ALL
SELECT 
    'Payments Completed',
    2,
    COUNT(DISTINCT b.id)
FROM bookings b
JOIN payments p ON b.id = p.booking_id AND p.status = 'paid'
WHERE b.booking_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
UNION ALL
SELECT 
    'Check-ins Completed',
    3,
    COUNT(*)
FROM bookings
WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    AND status IN ('checked_in', 'checked_out')
ORDER BY stage_order;

-- Query 50: Guest lifetime value prediction
SELECT 
    g.id,
    g.first_name,
    g.last_name,
    COUNT(b.id) AS past_bookings,
    SUM(b.final_amount) AS total_spent,
    AVG(b.final_amount) AS avg_booking_value,
    MAX(b.booking_date) AS last_booking_date,
    DATEDIFF(CURDATE(), MAX(b.booking_date)) AS days_since_last_booking,
    -- Predict next booking value
    AVG(b.final_amount) * 1.1 AS predicted_next_value,
    -- Calculate churn risk
    CASE 
        WHEN DATEDIFF(CURDATE(), MAX(b.booking_date)) > 365 THEN 'High Risk'
        WHEN DATEDIFF(CURDATE(), MAX(b.booking_date)) > 180 THEN 'Medium Risk'
        ELSE 'Low Risk'
    END AS churn_risk
FROM guests g
JOIN bookings b ON g.id = b.guest_id
WHERE b.status NOT IN ('cancelled', 'no_show')
GROUP BY g.id
HAVING past_bookings >= 2
ORDER BY total_spent DESC;

-- =====================================================
-- END OF QUERIES
-- Total: 50 comprehensive SQL queries covering all aspects
-- of the hotel booking system
-- =====================================================
