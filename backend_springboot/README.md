# Hotel Booking System - Spring Boot Backend

This is the Spring Boot implementation of the backend for the Hotel Booking System, designed to work with the existing MySQL database schema and be **interchangeable with the Express.js backend**.

## 🔄 Backend Switching Guide

Both backends are configured to run on **port 5000** so they can be used interchangeably with the frontend. 

### Using Spring Boot Backend:
1. **Stop Express backend** (if running)
2. Run Spring Boot from STS or command line
3. Frontend will automatically connect to `http://localhost:5000/api`

### Using Express Backend:
1. **Stop Spring Boot** (if running)
2. Run `npm start` in the `backend` folder
3. Frontend will automatically connect to `http://localhost:5000/api`

> ⚠️ **Important**: Only run ONE backend at a time since both use port 5000.

---

## Prerequisites

- Java 17 or higher
- Maven (or use STS/Eclipse built-in)
- MySQL Server
- Spring Tool Suite (STS) - Optional, for IDE development

## Setup

### 1. Database Setup
Ensure your MySQL server is running and the `hotel_booking_system` database exists.

If you haven't created the schema yet:
- Use the `create_admin.sql` and `hotel_booking_queries.sql` from the `backend` folder
- Or let Hibernate auto-update the schema (configured in `application.properties`)

### 2. Configuration
Open `src/main/resources/application.properties` and update if needed:

```properties
spring.datasource.username=root         # Your MySQL username
spring.datasource.password=manager      # Your MySQL password
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_booking_system
```

### 3. Build & Run

#### Option A: Using STS (Spring Tool Suite)
1. Import project as "Existing Maven Project"
2. Right-click project → Run As → Spring Boot App
3. Application starts on `http://localhost:5000`

#### Option B: Using Command Line
```bash
cd backend_springboot
mvn clean install
mvn spring-boot:run
```

---

## 📡 API Endpoints

The Spring Boot backend implements the same API endpoints as the Express backend:

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (guest or admin) |
| POST | `/api/auth/register` | Register new guest |
| GET | `/api/auth/me` | Get current user profile |

### Hotels (`/api/hotels`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels` | List all hotels (paginated) |
| GET | `/api/hotels/{id}` | Get hotel by ID |
| POST | `/api/hotels` | Create hotel (Admin) |

### Bookings (`/api/bookings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List all bookings (Admin) |
| GET | `/api/bookings/{id}` | Get booking by ID |
| GET | `/api/bookings/guest/{guestId}` | Get guest's bookings |
| POST | `/api/bookings` | Create booking |
| PATCH | `/api/bookings/{id}/status` | Update booking status |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check endpoint |

---

## 🏗️ Architecture

```
com.hotelbooking/
├── controller/          # REST API endpoints
│   ├── AuthController.java
│   ├── HotelController.java
│   ├── BookingController.java
│   └── RootController.java
├── service/             # Business logic
│   ├── AuthService.java
│   ├── HotelService.java
│   └── BookingService.java
├── repository/          # Data access (Spring Data JPA)
├── model/               # JPA Entities
├── dto/                 # Data Transfer Objects
│   ├── ApiResponse.java
│   ├── AuthRequest.java
│   └── AuthResponse.java
├── security/            # JWT & Spring Security
│   ├── JwtUtil.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetails.java
└── config/              # Configuration classes
    ├── SecurityConfig.java
    └── WebConfig.java
```

## 🔐 Security

- JWT-based authentication (same secret as Express)
- BCrypt password encoding
- CORS configured for frontend origins
- Spring Security for endpoint protection

## 📊 Data Model

Entities mapped to existing database tables:
- `hotels` - Hotel information
- `room_types` - Room type definitions
- `rooms` - Individual rooms
- `guests` - Guest accounts
- `administrators` - Admin accounts
- `bookings` - Booking records
- `booking_rooms` - Room assignments for bookings
- `payments` - Payment records
- `reviews` - Guest reviews

---

## 🆚 Express vs Spring Boot Feature Comparison

| Feature | Express | Spring Boot |
|---------|---------|-------------|
| Auth (Login/Register) | ✅ | ✅ |
| Auth (/me) | ✅ | ✅ |
| Hotels CRUD | ✅ | ✅ |
| Bookings CRUD | ✅ | ✅ |
| Rooms/Types CRUD | ✅ | ✅ |
| Tariffs/Pricing | ✅ | ✅ |
| Availability Calendar | ✅ | ✅ |
| Payments | ✅ | ✅ |
| Reviews | ✅ | ✅ |
| Users Management | ✅ | ✅ |
| Dashboard Stats | ✅ | ✅ |

> ✅ **Full Feature Parity Achieved!** Both backends now support all API endpoints.

---

## 🐛 Troubleshooting

### Port Already in Use
Stop the Express backend first, or change the port in `application.properties`:
```properties
server.port=8080  # Use different port
```
Then update frontend's `VITE_API_URL` accordingly.

### Database Connection Failed
- Check MySQL is running
- Verify credentials in `application.properties`
- Ensure database `hotel_booking_system` exists

### JWT Token Invalid
Both backends use the same JWT secret. If you're getting token errors:
- Clear browser localStorage
- Login again
- Ensure both backends have the same `jwt.secret` value
