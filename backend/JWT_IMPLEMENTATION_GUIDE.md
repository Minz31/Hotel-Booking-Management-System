# 🔐 JWT Token Implementation Guide

## 📖 Table of Contents
1. [What is JWT?](#what-is-jwt)
2. [How JWT Works in Your Backend](#how-jwt-works-in-your-backend)
3. [Files Already Configured](#files-already-configured)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Testing JWT Flow](#testing-jwt-flow)
6. [Troubleshooting](#troubleshooting)
7. [Additional Resources](#additional-resources)

---

## 🎯 What is JWT?

**JWT (JSON Web Token)** is a secure way to transmit information between client and server.

### Structure of JWT Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

[HEADER].[PAYLOAD].[SIGNATURE]
```

1. **Header**: Algorithm & token type
2. **Payload**: User data (id, email, role)
3. **Signature**: Encrypted using secret key

---

## ✅ How JWT Works in Your Backend

### Flow Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    JWT AUTHENTICATION FLOW                   │
└─────────────────────────────────────────────────────────────┘

STEP 1: Registration/Login
─────────────────────────
Client                          Server (authController.js)
  │                                    │
  │  POST /api/auth/register           │
  │  or /api/auth/login                │
  ├───────────────────────────────────>│
  │                                    │ 1. Verify credentials
  │                                    │ 2. Call generateToken()
  │                                    │ 3. Create JWT with:
  │                                    │    - User ID
  │                                    │    - Email
  │                                    │    - Role
  │                                    │    - Expiry (7 days)
  │                                    │
  │  Response: { token: "jwt..." }     │
  │<───────────────────────────────────┤
  │                                    │
  │ 4. Store token in:                 │
  │    - localStorage                  │
  │    - sessionStorage                │
  │    - Cookie                        │
  │                                    │

STEP 2: Making Protected Requests
──────────────────────────────────
Client                          Server (middleware/auth.js)
  │                                    │
  │  GET /api/bookings                 │
  │  Authorization: Bearer <token>     │
  ├───────────────────────────────────>│
  │                                    │ 1. Extract token from header
  │                                    │ 2. Verify token with JWT_SECRET
  │                                    │ 3. Decode payload
  │                                    │ 4. Attach user to req.user
  │                                    │ 5. Call next() → Controller
  │                                    │
  │  Response: { bookings: [...] }     │
  │<───────────────────────────────────┤
  │                                    │
```

---

## 📂 Files Already Configured

### ✅ **1. Environment Variables** (`.env.example`)

**Location**: `backend/.env.example`

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

**What it does:**
- `JWT_SECRET`: Secret key to sign/verify tokens (like a password)
- `JWT_EXPIRE`: Token expiration time (7 days)

---

### ✅ **2. Token Generation** (`controllers/authController.js`)

**Location**: `backend/controllers/authController.js` (Lines 6-17)

```javascript
// Function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,          // User's unique ID
      email: user.email,    // User's email
      role: user.role || 'guest',  // User role (guest/admin)
      hotel_id: user.hotel_id || null  // Hotel ID for admins
    },
    process.env.JWT_SECRET,  // Secret key from .env
    { expiresIn: process.env.JWT_EXPIRE || '7d' }  // Expiry time
  );
};
```

**What it does:**
- Creates a JWT token with user information
- Signs it with your secret key
- Sets expiration time

**Used in:**
- ✅ `registerGuest()` - After registration (Line 39)
- ✅ `login()` - After successful login (Line 86)

---

### ✅ **3. Token Verification** (`middleware/auth.js`)

**Location**: `backend/middleware/auth.js` (Lines 4-23)

```javascript
const verifyToken = (req, res, next) => {
  // 1. Extract token from Authorization header
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // 2. Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach user info to request
    req.user = decoded; // { id, email, role, hotel_id }
    
    // 4. Allow request to proceed
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};
```

**What it does:**
- Extracts token from request header
- Verifies token signature
- Decodes user information
- Attaches to `req.user` for controllers to use

**Used in:**
- ✅ All protected routes in `routes/` folder

---

### ✅ **4. Role-Based Access Control** (`middleware/auth.js`)

**Additional Functions:**

```javascript
// Only admins can access
const isAdmin = (req, res, next) => {
  if (!['super_admin', 'hotel_admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Only super admins can access
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }
  next();
};
```

**What it does:**
- Checks user role after token verification
- Grants/denies access based on role

---

### ✅ **5. Protected Routes** (All route files)

**Example**: `routes/bookings.js`

```javascript
const { verifyToken, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);  // ← JWT verification applied to all routes below

router.post('/', validateBooking, createBooking);  // ✅ Protected
router.get('/guest/:guestId', getGuestBookings);   // ✅ Protected
router.get('/:id', getBookingById);                // ✅ Protected
router.patch('/:id/status', isAdmin, updateBookingStatus);  // ✅ Protected + Admin only
router.post('/:id/cancel', cancelBooking);         // ✅ Protected
```

---

## 🛠️ Step-by-Step Setup

### **Step 1: Install Dependencies** (Already Done ✅)

Your `package.json` already includes:

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.2",  // ✅ JWT library
    "bcryptjs": "^2.4.3",      // ✅ Password hashing
    "dotenv": "^16.3.1"        // ✅ Environment variables
  }
}
```

**Action Required:**
```bash
cd "d:\Hotel Booking System\backend"
npm install
```

---

### **Step 2: Create `.env` File**

**Action Required:**

1. **Copy the example file:**
```bash
copy .env.example .env
```

2. **Edit `.env` file:**
```env
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here    # ← Change this
DB_NAME=hotel_booking_system
DB_PORT=3306

# JWT Secret - CHANGE THIS!
JWT_SECRET=my_super_secret_key_12345_change_in_production    # ← Change this
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

**⚠️ IMPORTANT: JWT_SECRET**

Your `JWT_SECRET` should be:
- ✅ Long and random
- ✅ Hard to guess
- ✅ Different in production

**Generate a strong secret:**

**Option A - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option B - Online:**
Visit: https://www.grc.com/passwords.htm
Copy the "63 random alpha-numeric characters" field

**Option C - Command Line:**
```bash
# Use any random string
JWT_SECRET=HJk89hjk2HJ_kjh2KJH89kjh2_89KJHG89kjhg2KJH
```

---

### **Step 3: Verify JWT is Working**

**No modifications needed!** JWT is already fully integrated.

**Test the flow:**

#### 1️⃣ **Register a User**

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "first_name": "Test",
  "last_name": "User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Guest registered successfully",
  "data": {
    "id": "uuid-here",
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // ← JWT Token
  }
}
```

**✅ Copy this token!**

---

#### 2️⃣ **Use Token in Protected Route**

```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone": "+1234567890"
  }
}
```

**✅ If you get data back, JWT is working!**

---

## 🧪 Testing JWT Flow

### **Method 1: Using Postman**

1. **Import Collection:**
   - File → Import → `Hotel_Booking_API.postman_collection.json`

2. **Test Registration:**
   - Request: `Authentication → Register Guest`
   - Click "Send"
   - Copy the `token` from response

3. **Set Environment Variable:**
   - Click "Environments" (top right)
   - Edit `token` variable
   - Paste JWT token
   - Save

4. **Test Protected Route:**
   - Request: `Authentication → Get My Profile`
   - Token is automatically included via `{{token}}`
   - Click "Send"

**✅ Success!** You can now use all protected endpoints.

---

### **Method 2: Using cURL**

```bash
# 1. Register and get token
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"first_name\":\"John\",\"last_name\":\"Doe\",\"email\":\"john@test.com\",\"password\":\"pass123\"}"

# Response will contain token - copy it

# 2. Use token in protected route
curl -X GET http://localhost:5000/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### **Method 3: Using JavaScript (Frontend)**

```javascript
// 1. Register/Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.data.token;

// 2. Store token
localStorage.setItem('token', token);

// 3. Use token in future requests
const bookingsResponse = await fetch('http://localhost:5000/api/bookings', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

---

## 🔍 How to Decode JWT (For Debugging)

### **Option 1: jwt.io (Online)**

1. Visit: **https://jwt.io**
2. Paste your token in the "Encoded" section
3. See decoded payload on the right

**Example Decoded Payload:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "test@example.com",
  "role": "guest",
  "hotel_id": null,
  "iat": 1705678901,  // Issued at timestamp
  "exp": 1706283701   // Expiry timestamp
}
```

---

### **Option 2: Node.js**

```javascript
const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const decoded = jwt.decode(token);

console.log(decoded);
// { id: '...', email: '...', role: 'guest', iat: ..., exp: ... }
```

---

## ❌ Troubleshooting

### Problem 1: "Invalid or expired token"

**Cause:** Token is expired or JWT_SECRET doesn't match

**Solution:**
```bash
# 1. Check JWT_SECRET in .env matches the one used to create token
# 2. Login again to get a fresh token
# 3. Verify token hasn't expired (default: 7 days)
```

---

### Problem 2: "No token provided"

**Cause:** Token not included in request header

**Solution:**
```bash
# Ensure header format is correct:
Authorization: Bearer YOUR_TOKEN_HERE

# NOT just:
Authorization: YOUR_TOKEN_HERE
```

---

### Problem 3: "Access denied. Admin privileges required"

**Cause:** User role is 'guest' but route requires admin

**Solution:**
```bash
# This is correct behavior!
# Only admin users can access admin-only routes
# For testing, you need to:
# 1. Insert an admin user in database
# 2. Login as admin to get admin token
```

**Insert admin user:**
```sql
INSERT INTO administrators (id, username, password_hash, email, full_name, role)
VALUES (
  UUID(),
  'admin',
  '$2a$10$example_hash_here',  -- Use bcrypt to hash password
  'admin@hotel.com',
  'System Admin',
  'super_admin'
);
```

---

### Problem 4: Server crashes on startup

**Cause:** Missing JWT_SECRET in .env

**Solution:**
```bash
# Ensure .env file exists and contains:
JWT_SECRET=your_secret_key_here
```

---

## 📚 Additional Resources

### Official Documentation
- **JWT Official Site**: https://jwt.io
- **jsonwebtoken Package**: https://www.npmjs.com/package/jsonwebtoken
- **JWT Best Practices**: https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/

### Tutorials
- **JWT Explained (Video)**: https://www.youtube.com/watch?v=7Q17ubqLfaM
- **Node.js JWT Auth**: https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs

### Tools
- **JWT Decoder**: https://jwt.io
- **Password Generator**: https://www.grc.com/passwords.htm
- **Postman**: https://www.postman.com/downloads/

---

## 🎓 Understanding Your Implementation

### What Happens When User Logs In?

```javascript
// 1. authController.js - login function
const login = async (req, res, next) => {
  // Find user in database
  const user = await findUserByEmail(email);
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Return token to client
  res.json({ token });
};
```

### What Happens on Protected Route?

```javascript
// 1. middleware/auth.js - verifyToken
const verifyToken = (req, res, next) => {
  // Extract: "Bearer eyJhbG..." → "eyJhbG..."
  const token = req.headers.authorization?.split(' ')[1];
  
  // Verify signature and decode
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // decoded = { id: '123', email: 'user@email.com', role: 'guest' }
  
  // Attach to request
  req.user = decoded;
  
  // Continue to controller
  next();
};

// 2. controller can now access req.user
const getBookings = (req, res) => {
  const userId = req.user.id;  // Available because of middleware!
  // Fetch bookings for this user...
};
```

---

## ✅ Checklist

Before proceeding with frontend development:

- [ ] ✅ Dependencies installed (`npm install`)
- [ ] ✅ `.env` file created from `.env.example`
- [ ] ✅ `JWT_SECRET` set to a strong random value
- [ ] ✅ Server starts successfully (`npm run dev`)
- [ ] ✅ Registration endpoint returns JWT token
- [ ] ✅ Login endpoint returns JWT token
- [ ] ✅ Protected route works with token in header
- [ ] ✅ Protected route fails without token (401 error)
- [ ] ✅ Token can be decoded at jwt.io

---

## 🎯 Summary

### **JWT in Your Backend:**

1. **Already Implemented** ✅
   - Token generation in `authController.js`
   - Token verification in `middleware/auth.js`
   - Protected routes in all route files

2. **You Only Need To:**
   - Install dependencies: `npm install`
   - Create `.env` file with `JWT_SECRET`
   - Start server: `npm run dev`

3. **How It Works:**
   ```
   Register/Login → Get JWT Token → Store Token → 
   Use in Header → Access Protected Routes
   ```

4. **Frontend Integration:**
   ```javascript
   // Save token after login
   localStorage.setItem('token', token);
   
   // Use in requests
   fetch(url, {
     headers: { 'Authorization': `Bearer ${token}` }
   });
   ```

---

**🎉 Your JWT setup is complete!** No code modifications needed - it's already fully integrated and ready to use!
