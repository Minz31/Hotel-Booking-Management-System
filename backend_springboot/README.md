# Hotel Booking System - Spring Boot Backend

This is the Spring Boot implementation of the backend for the Hotel Booking System, designed to work with the existing MySQL database schema.

## Prerequisites

- Java 17 or higher
- Maven
- MySQL Server

## Setup

1.  **Database**: Ensure your MySQL server is running and the `hotel_booking_system` database exists.
    - If you haven't created the schema yet, use the `create_admin.sql` and `hotel_booking_queries.sql` from the `backend` folder, or let Hibernate auto-update the schema (configured in `application.properties`).

2.  **Configuration**:
    - Open `src/main/resources/application.properties`.
    - Update `spring.datasource.username` and `spring.datasource.password` if they differ from the defaults (`root` / `manager`).

3.  **Build**:
    ```bash
    mvn clean install
    ```

4.  **Run**:
    ```bash
    mvn spring-boot:run
    ```

## Architecture

- **Controller**: REST API endpoints (`/api/hotels`, `/api/bookings`).
- **Service**: Business logic.
- **Repository**: Data access using Spring Data JPA.
- **Model**: JPA Entities mapping to the database tables.

## Data Model

The entities are mapped to the existing database tables:
- `hotels`
- `room_types`
- `rooms`
- `guests`
- `bookings`
- `booking_rooms`
- etc.

## API Endpoints

- `GET /api/hotels` - List all hotels
- `GET /api/hotels/{id}` - Get hotel details
- `POST /api/bookings` - Create a booking
