# 🧪 Postman Testing Guide - Hotel Booking API

## 📋 Table of Contents
1. [Setup Postman](#setup-postman)
2. [Test Hotel Endpoints](#test-hotel-endpoints)
3. [Test Authentication](#test-authentication)
4. [Test Bookings](#test-bookings)
5. [Common Errors & Solutions](#common-errors--solutions)

---

## 🚀 Setup Postman

### Method 1: Import Collection (Recommended)
1. Open Postman
2. Click **Import** (top left)
3. Select `Hotel_Booking_API.postman_collection.json`
4. Collection is ready to use! ✅

### Method 2: Manual Setup
Create requests manually following this guide.

---

## 🏨 Test Hotel Endpoints

### ✅ TEST 1: Get All Hotels

**Request:**
```
Method: GET
URL: http://localhost:5000/api/hotels
```

**Query Parameters (Optional):**
- `city`: New York
- `country`: USA
- `star_rating`: 5
- `page`: 1
- `limit`: 10

**In Postman:**
1. Create new request
2. Method: **GET**
3. URL: `http://localhost:5000/api/hotels`
4. Click **Params** tab
5. Add key-value pairs:
   ```
   city = New York
   page = 1
   limit = 10
   ```
6. Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "h1",
      "name": "Grand Plaza Hotel",
      "city": "New York",
      "star_rating": 5,
      "total_rooms": 10,
      "starting_price": 200.00,
      "avg_rating": 4.5,
      "review_count": 25
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
```

---

### ✅ TEST 2: Get Hotel by ID

**Request:**
```
Method: GET
URL: http://localhost:5000/api/hotels/h1
```

**In Postman:**
1. Create new request
2. Method: **GET**
3. URL: `http://localhost:5000/api/hotels/h1`
   - Replace `h1` with actual hotel ID from database
4. Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "h1",
    "name": "Grand Plaza Hotel",
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zip_code": "10001",
    "phone": "+1-555-0101",
    "email": "info@grandplaza.com",
    "description": "Luxury hotel in the heart of Manhattan",
    "star_rating": 5,
    "total_rooms": 10,
    "avg_rating": 4.50,
    "review_count": 25
  }
}
```

---

### ✅ TEST 3: Get Hotel Room Types (FIXED!)

This is the endpoint that was giving you the error. It's now fixed!

**Request:**
```
Method: GET
URL: http://localhost:5000/api/hotels/h1/room-types
```

**In Postman:**
1. Create new request
2. Method: **GET**
3. URL: `http://localhost:5000/api/hotels/h1/room-types`
4. No headers or body needed (public endpoint)
5. Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rt1",
      "hotel_id": "h1",
      "name": "Deluxe Suite",
      "description": "Spacious suite with city view",
      "max_occupancy": 4,
      "bed_type": "King",
      "amenities": "WiFi, TV, Mini-bar, Balcony",
      "base_price": 350.00,
      "current_price": 350.00,
      "currency": "USD",
      "available_rooms": 2,
      "created_at": "2026-01-19T10:00:00.000Z",
      "updated_at": "2026-01-19T10:00:00.000Z",
      "is_active": 1
    },
    {
      "id": "rt2",
      "hotel_id": "h1",
      "name": "Standard Room",
      "description": "Comfortable standard room",
      "max_occupancy": 2,
      "bed_type": "Queen",
      "amenities": "WiFi, TV",
      "base_price": 200.00,
      "current_price": 200.00,
      "currency": "USD",
      "available_rooms": 3,
      "created_at": "2026-01-19T10:00:00.000Z",
      "updated_at": "2026-01-19T10:00:00.000Z",
      "is_active": 1
    }
  ]
}
```

**Screenshot Guide:**

```
┌─────────────────────────────────────────────────────────┐
│ Postman Window                                          │
├─────────────────────────────────────────────────────────┤
│ Method: [GET ▼]  URL: http://localhost:5000/api/hotels/h1/room-types  │
├─────────────────────────────────────────────────────────┤
│ Params | Authorization | Headers | Body | Tests         │
├─────────────────────────────────────────────────────────┤
│ (No params needed for this request)                    │
│                                                         │
│                           [Send Button]                 │
├─────────────────────────────────────────────────────────┤
│ Response:                                               │
│ Status: 200 OK                                          │
│ {                                                       │
│   "success": true,                                      │
│   "data": [...]                                         │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
```

---

### ✅ TEST 4: Search Available Rooms

**Request:**
```
Method: GET
URL: http://localhost:5000/api/hotels/h1/available-rooms
```

**Query Parameters (Required):**
- `check_in`: 2026-02-15
- `check_out`: 2026-02-20
- `guests`: 2 (optional)

**In Postman:**
1. Create new request
2. Method: **GET**
3. URL: `http://localhost:5000/api/hotels/h1/available-rooms`
4. Click **Params** tab
5. Add parameters:
   ```
   check_in = 2026-02-15
   check_out = 2026-02-20
   guests = 2
   ```
6. Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "r1",
      "hotel_id": "h1",
      "room_type_id": "rt1",
      "room_number": "501",
      "floor": "5",
      "status": "available",
      "room_type": "Deluxe Suite",
      "max_occupancy": 4,
      "bed_type": "King",
      "amenities": "WiFi, TV, Mini-bar",
      "price_per_night": 350.00,
      "currency": "USD"
    }
  ],
  "search_params": {
    "check_in": "2026-02-15",
    "check_out": "2026-02-20",
    "guests": "2"
  }
}
```

---

## 🔐 Test Authentication

### ✅ TEST 5: Register Guest

**Request:**
```
Method: POST
URL: http://localhost:5000/api/auth/register
```

**In Postman:**
1. Create new request
2. Method: **POST**
3. URL: `http://localhost:5000/api/auth/register`
4. Click **Body** tab
5. Select **raw** and **JSON** from dropdown
6. Paste this JSON:
   ```json
   {
     "first_name": "John",
     "last_name": "Doe",
     "email": "john.doe@example.com",
     "password": "password123",
     "phone": "+1-555-1234"
   }
   ```
7. Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "message": "Guest registered successfully",
  "data": {
    "id": "uuid-generated",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**📝 Important: Copy the token!** You'll need it for protected endpoints.

---

### ✅ TEST 6: Login

**Request:**
```
Method: POST
URL: http://localhost:5000/api/auth/login
```

**In Postman:**
1. Create new request
2. Method: **POST**
3. URL: `http://localhost:5000/api/auth/login`
4. Click **Body** tab
5. Select **raw** and **JSON**
6. Paste:
   ```json
   {
     "email": "john.doe@example.com",
     "password": "password123"
   }
   ```
7. Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "guest"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save Token to Environment:**
1. Click on response
2. Copy the `token` value
3. Click **Environments** (top right)
4. Create new environment or edit existing
5. Add variable:
   - Name: `token`
   - Value: `paste_token_here`
6. Save

---

### ✅ TEST 7: Get My Profile (Protected Route)

**Request:**
```
Method: GET
URL: http://localhost:5000/api/auth/me
Headers: Authorization: Bearer YOUR_TOKEN
```

**In Postman:**
1. Create new request
2. Method: **GET**
3. URL: `http://localhost:5000/api/auth/me`
4. Click **Authorization** tab
5. Type: **Bearer Token**
6. Token: Paste your token OR use `{{token}}` if using environment
7. Click **Send**

**Alternative (Manual Header):**
1. Click **Headers** tab
2. Add header:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-1234",
    "registration_date": "2026-01-19T10:00:00.000Z"
  }
}
```

---

## 📅 Test Bookings (Protected)

### ✅ TEST 8: Create Booking

**Request:**
```
Method: POST
URL: http://localhost:5000/api/bookings
Headers: Authorization: Bearer YOUR_TOKEN
```

**In Postman:**
1. Create new request
2. Method: **POST**
3. URL: `http://localhost:5000/api/bookings`
4. **Authorization** tab → Bearer Token → `{{token}}`
5. **Body** tab → raw → JSON
6. Paste:
   ```json
   {
     "guest_id": "your_guest_id_here",
     "hotel_id": "h1",
     "check_in_date": "2026-03-01",
     "check_out_date": "2026-03-05",
     "room_ids": ["r1"],
     "number_of_guests": 2,
     "discount_code": "WELCOME10",
     "special_requests": "Late check-in please"
   }
   ```
7. Click **Send**

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking-uuid",
    "guest_id": "guest-uuid",
    "hotel_id": "h1",
    "hotel_name": "Grand Plaza Hotel",
    "check_in_date": "2026-03-01",
    "check_out_date": "2026-03-05",
    "status": "pending_payment",
    "total_amount": 1750.00,
    "discount_amount": 175.00,
    "final_amount": 1575.00,
    "room_numbers": "501"
  }
}
```

---

## ❌ Common Errors & Solutions

### Error 1: GROUP BY Error (FIXED!)

**Error:**
```json
{
  "success": false,
  "message": "Expression #12 of SELECT list is not in GROUP BY clause..."
}
```

**✅ Solution:** Already fixed in `hotelController.js`!  
Restart your server: `npm run dev`

---

### Error 2: Cannot GET /api/hotels/room-types

**Error:**
```
Cannot GET /api/hotels/room-types
```

**❌ Wrong:** `/api/hotels/room-types`  
**✅ Correct:** `/api/hotels/h1/room-types`

**Solution:** Include the hotel ID in the URL!

---

### Error 3: 404 - Hotel not found

**Error:**
```json
{
  "success": false,
  "message": "Hotel not found"
}
```

**Solution:**
Check if hotel ID exists in database:
```sql
SELECT id, name FROM hotels;
```
Use an existing hotel ID (e.g., `h1`, `h2`, `h3`)

---

### Error 4: No data returned (Empty array)

**Response:**
```json
{
  "success": true,
  "data": []
}
```

**Possible Causes:**
1. No room types created for this hotel
2. Hotel ID doesn't exist
3. All room types marked as `is_active = FALSE`

**Solution:**
Insert sample data:
```sql
-- Check if room types exist
SELECT * FROM room_types WHERE hotel_id = 'h1';

-- If empty, run the sample data from hotel_booking_queries.sql
```

---

### Error 5: 401 Unauthorized

**Error:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Solution:**
You forgot to include the JWT token! Add Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### Error 6: 500 - Database connection failed

**Error:**
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

**Solution:**
1. Check MySQL is running
2. Verify `.env` database credentials
3. Ensure database `hotel_booking_system` exists
4. Check server logs for details

---

## 🎯 Quick Testing Checklist

```
✅ Server running (npm run dev)
✅ Database connected
✅ Sample data inserted

Test in this order:
1. [ ] GET /api/hotels (no auth)
2. [ ] GET /api/hotels/h1 (no auth)
3. [ ] GET /api/hotels/h1/room-types (no auth) ← Fixed!
4. [ ] GET /api/hotels/h1/available-rooms?check_in=2026-02-15&check_out=2026-02-20
5. [ ] POST /api/auth/register → Get token
6. [ ] POST /api/auth/login → Get token
7. [ ] GET /api/auth/me (with token)
8. [ ] POST /api/bookings (with token)
```

---

## 📸 Postman Screenshots Guide

### Setting Up Authorization

**Step 1: Authorization Tab**
```
┌─────────────────────────────────────┐
│ Authorization Tab                   │
├─────────────────────────────────────┤
│ Type: Bearer Token                  │
│                                     │
│ Token: [Paste or {{token}}]        │
│                                     │
│ ✅ Add to: Header                  │
└─────────────────────────────────────┘
```

### Setting Up Body (JSON)

**Step 1: Body Tab**
```
┌─────────────────────────────────────┐
│ Body Tab                            │
├─────────────────────────────────────┤
│ ○ none                              │
│ ○ form-data                         │
│ ○ x-www-form-urlencoded             │
│ ● raw         [JSON ▼]             │
│                                     │
│ {                                   │
│   "email": "test@example.com",     │
│   "password": "pass123"            │
│ }                                   │
└─────────────────────────────────────┘
```

---

## 🚀 Pro Tips

### Tip 1: Use Environment Variables
```
URL: http://localhost:5000/api/hotels/{{hotel_id}}/room-types

Variables:
- base_url: http://localhost:5000/api
- token: your_jwt_token
- hotel_id: h1
```

### Tip 2: Pre-request Script (Auto Login)
In Postman, add to Pre-request Script:
```javascript
// Auto-login before each request
pm.sendRequest({
    url: 'http://localhost:5000/api/auth/login',
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
        })
    }
}, (err, res) => {
    if (!err) {
        const token = res.json().data.token;
        pm.environment.set('token', token);
    }
});
```

### Tip 3: Test Scripts
Add to Tests tab:
```javascript
// Verify response
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Data is array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});
```

---

**🎉 You're ready to test! The GROUP BY error is fixed and all endpoints are working!**

For more endpoints, check: `README.md` or import the Postman collection.
