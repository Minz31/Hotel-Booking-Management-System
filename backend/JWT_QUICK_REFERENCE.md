# 🔐 Quick JWT Reference Card

## 🎯 What You Need to Do (3 Steps Only!)

### ✅ Step 1: Install Dependencies
```bash
cd "d:\Hotel Booking System\backend"
npm install
```

### ✅ Step 2: Create .env File
```bash
# Copy the example
copy .env.example .env

# Edit .env and set:
JWT_SECRET=my_super_secret_key_abc123XYZ
```

**Generate a strong JWT_SECRET:**
```bash
# Run this in Node.js terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output to JWT_SECRET in .env
```

### ✅ Step 3: Start Server
```bash
npm run dev
```

**That's it! JWT is already coded and working!** ✅

---

## 📖 How JWT Works (Visual Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    JWT AUTHENTICATION FLOW                   │
└─────────────────────────────────────────────────────────────┘

PHASE 1: User Registration/Login
═══════════════════════════════════════════════════════════════

Frontend                         Backend (authController.js)
   │                                      │
   │  1. POST /api/auth/register          │
   │     {                                │
   │       "email": "user@test.com",      │
   │       "password": "pass123"          │
   │     }                                │
   ├─────────────────────────────────────>│
   │                                      │
   │                                      │ 2. Hash password
   │                                      │    bcrypt.hash()
   │                                      │
   │                                      │ 3. Save to database
   │                                      │
   │                                      │ 4. Generate JWT token
   │                                      │    jwt.sign({
   │                                      │      id: user.id,
   │                                      │      email: user.email,
   │                                      │      role: 'guest'
   │                                      │    }, JWT_SECRET)
   │                                      │
   │  5. Response with token              │
   │     {                                │
   │       "token": "eyJhbGc..."         │
   │     }                                 │
   │<─────────────────────────────────────┤
   │                                      │
   │ 6. Store token                       │
   │    localStorage.setItem('token', ...) │
   │                                      │


PHASE 2: Making Protected Requests
═══════════════════════════════════════════════════════════════

Frontend                         Backend (middleware/auth.js)
   │                                      │
   │  1. GET /api/bookings                │
   │     Headers:                         │
   │       Authorization: Bearer eyJhbG...│
   ├─────────────────────────────────────>│
   │                                      │
   │                                      │ 2. Extract token
   │                                      │    from header
   │                                      │
   │                                      │ 3. Verify token
   │                                      │    jwt.verify(
   │                                      │      token,
   │                                      │      JWT_SECRET
   │                                      │    )
   │                                      │
   │                                      │ 4. Decode payload
   │                                      │    { id, email, role }
   │                                      │
   │                                      │ 5. Attach to request
   │                                      │    req.user = decoded
   │                                      │
   │                                      │ 6. Call controller
   │                                      │    next() →
   │                                      │    bookingController
   │                                      │
   │  7. Response with data               │
   │     {                                │
   │       "bookings": [...]              │
   │     }                                │
   │<─────────────────────────────────────┤
   │                                      │
```

---

## 🗂️ Files Involved (No Changes Needed!)

| File | What It Does | Status |
|------|--------------|--------|
| `controllers/authController.js` | Generates JWT on login | ✅ Done |
| `middleware/auth.js` | Verifies JWT on protected routes | ✅ Done |
| `routes/*.js` | Applies auth middleware | ✅ Done |
| `.env` | Stores JWT_SECRET | ⚠️ You create this |

---

## 🧪 Test JWT (Copy-Paste Commands)

### 1️⃣ Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"first_name\":\"John\",\"last_name\":\"Doe\",\"email\":\"john@test.com\",\"password\":\"pass123\"}"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidXNlckB0ZXN0LmNvbSIsInJvbGUiOiJndWVzdCIsImlhdCI6MTcwNTY3ODkwMSwiZXhwIjoxNzA2Mjgz NzAxfQ.abc123xyz"
  }
}
```

**📋 Copy the token value!**

---

### 2️⃣ Use Token in Protected Route
```bash
# Replace YOUR_TOKEN_HERE with the token from step 1
curl -X GET http://localhost:5000/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@test.com"
  }
}
```

**✅ If you see user data, JWT is working!**

---

## 🔧 Frontend Integration (React Example)

```javascript
// 1. Login and save token
const handleLogin = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Save token to localStorage
  localStorage.setItem('token', data.data.token);
};

// 2. Create axios instance with token (Recommended)
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Use in your app
const getBookings = async () => {
  const response = await api.get('/bookings/guest/123');
  return response.data;
};

// 4. Handle logout
const handleLogout = () => {
  localStorage.removeItem('token');
  // Redirect to login page
};
```

---

## 🌐 Useful Websites

| Website | Purpose | URL |
|---------|---------|-----|
| **JWT.io** | Decode & debug tokens | https://jwt.io |
| **JWT Docs** | Official documentation | https://jwt.io/introduction |
| **npm jsonwebtoken** | Library documentation | https://www.npmjs.com/package/jsonwebtoken |
| **Password Generator** | Generate strong secrets | https://www.grc.com/passwords.htm |
| **REST Client** | Test API (VS Code) | https://marketplace.visualstudio.com/items?itemName=humao.rest-client |
| **Postman** | API testing tool | https://www.postman.com/downloads/ |

---

## 📝 JWT Token Structure

```javascript
// What gets signed into the JWT token:
{
  "id": "uuid-of-user",           // User's unique ID
  "email": "user@example.com",    // User's email
  "role": "guest",                // User role (guest/admin)
  "hotel_id": null,               // Hotel ID (for admins only)
  "iat": 1705678901,              // Issued at (timestamp)
  "exp": 1706283701               // Expires at (timestamp)
}

// This is what req.user contains in controllers!
```

---

## ❓ FAQs

### Q: Do I need to modify any code?
**A:** No! JWT is fully implemented. Just create `.env` file.

### Q: How do I change token expiry?
**A:** Edit `.env` → `JWT_EXPIRE=7d` (7 days, 30d, 1h, etc.)

### Q: Where is the token stored?
**A:** Frontend stores it (localStorage/sessionStorage/cookies). Backend doesn't store it!

### Q: Can I use the same token from multiple devices?
**A:** Yes! JWT is stateless. Same token works everywhere until it expires.

### Q: How do I invalidate a token?
**A:** 
- Change `JWT_SECRET` (invalidates ALL tokens)
- Wait for expiry (7 days by default)
- Implement token blacklist (advanced)

### Q: Is JWT secure?
**A:** Yes, if:
- ✅ Use HTTPS in production
- ✅ Keep JWT_SECRET secret
- ✅ Set reasonable expiry time
- ✅ Don't store sensitive data in payload

### Q: What if token is stolen?
**A:** Token is valid until expiry. Best practices:
- Use short expiry times
- Implement refresh tokens (advanced)
- Use HTTPS only
- Store in httpOnly cookies (more secure than localStorage)

---

## ✅ Quick Checklist

Before using JWT in frontend:

- [ ] `npm install` completed
- [ ] `.env` file created
- [ ] `JWT_SECRET` set in `.env`
- [ ] Server starts without errors
- [ ] Registration returns token ✅
- [ ] Login returns token ✅
- [ ] Protected route works with token ✅
- [ ] Protected route fails without token (401) ✅
- [ ] Token can be decoded at jwt.io ✅

---

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "JWT_SECRET is required" | Missing .env file | Create `.env` with JWT_SECRET |
| "Invalid token" | Wrong JWT_SECRET | Ensure .env JWT_SECRET matches |
| "Token expired" | Token older than 7 days | Login again to get new token |
| "No token provided" | Missing Authorization header | Add `Authorization: Bearer TOKEN` |
| "Forbidden" | Wrong role | Use admin token for admin routes |

---

## 🎉 Summary

### What JWT Does:
1. ✅ Secures your API endpoints
2. ✅ Identifies users in requests
3. ✅ Enables role-based access control
4. ✅ Works without server-side sessions

### How to Use:
1. ✅ Login → Get token
2. ✅ Store token (localStorage)
3. ✅ Send token in headers: `Authorization: Bearer TOKEN`
4. ✅ Backend automatically verifies and identifies user

### Your Next Step:
**Start building your frontend!** JWT backend is 100% ready. 🚀

For detailed explanation, read: `JWT_IMPLEMENTATION_GUIDE.md`
