# 🔧 Dashboard Not Loading - Troubleshooting

## Issue: Dashboard page not visible after login

### ✅ Quick Fixes

#### Fix 1: Check Backend is Running

**The #1 cause of this issue is the backend not running!**

```bash
# Open a new terminal
cd "d:\Hotel Booking System\backend"
npm run dev
```

**You should see:**
```
✅ Database connected successfully
🚀 Hotel Booking API Server
🌐 Server running on port 5000
```

**If backend is NOT running, login will fail silently!**

---

#### Fix 2: Clear Browser Storage

Open browser console (F12) and run:

```javascript
// Clear everything
localStorage.clear();
sessionStorage.clear();

// Reload page
location.reload();
```

---

#### Fix 3: Check Browser Console

1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Try to login**
4. **Look for errors:**

**Common errors:**
- `ERR_CONNECTION_REFUSED` → Backend not running
- `401 Unauthorized` → Wrong email/password
- `Network Error` → CORS issue or backend offline

---

### 🧪 Test if Backend is Running

**Open this in browser:**
```
http://localhost:5000/health
```

**Should show:**
```json
{
  "success": true,
  "message": "Hotel Booking API is running"
}
```

**❌ If it doesn't work:** Backend is not running!

---

### 🔍 Debug Steps

#### Step 1: Start Backend

**Terminal 1:**
```bash
cd "d:\Hotel Booking System\backend"
npm run dev
```

#### Step 2: Start Frontend

**Terminal 2:**
```bash
cd "d:\Hotel Booking System\frontend"
npm run dev
```

#### Step 3: Clear Storage & Login

1. Go to `http://localhost:3000`
2. Press `F12` (DevTools)
3. Go to **Application** tab
4. Select **Local Storage** → `http://localhost:3000`
5. Click **Clear All**
6. Refresh page
7. Try to register/login again

#### Step 4: Watch Console

Keep DevTools open and watch for:
- ✅ **200 OK** responses = Working!
- ❌ **Failed to fetch** = Backend offline
- ❌ **401** = Wrong credentials
- ❌ **500** = Server error

---

### 📝 Manual Test

Try this in browser console **(F12)**:

```javascript
// Test backend connection
fetch('http://localhost:5000/api/hotels')
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Failed:', err));
```

**If you see:**
- ✅ `Success: { success: true, data: [...] }` → Backend working!
- ❌ `Failed: TypeError: Failed to fetch` → Backend offline!

---

### 🎯 Complete Test Flow

**1. Test backend:**
```bash
# Visit in browser:
http://localhost:5000/health

# Should show:
{"success":true,"message":"Hotel Booking API is running"}
```

**2. Register new account:**
```
http://localhost:3000/register

Fill form:
- First Name: Test
- Last Name: User
- Email: test123@example.com
- Password: password123

Click "Sign up"
```

**3. Watch what happens:**

**✅ Should happen:**
- Toast: "Account created successfully!"
- Redirect to `/dashboard`
- Shows dashboard with profile
- Navbar shows "Test" and "Logout"

**❌ If nothing happens:**
- Check console for errors
- Backend probably offline

---

### 🐛 Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Blank page after login | Backend offline | Start backend |
| "Failed to fetch" | Port 5000 not responding | Check backend running |
| Stays on login page | API error | Check console |
| "Network Error" | CORS issue | Restart backend |
| 401 Unauthorized | Wrong credentials | Check DB for user |

---

### 🔧 Nuclear Option (Reset Everything)

If nothing works:

```bash
# 1. Stop both servers (Ctrl+C)

# 2. Backend
cd "d:\Hotel Booking System\backend"
rm -rf node_modules
npm install
npm run dev

# 3. Frontend (new terminal)
cd "d:\Hotel Booking System\frontend"
rm -rf node_modules .vite
npm install
npm run dev

# 4. Clear browser
# F12 → Application → Clear Storage → Reload

# 5. Try again
```

---

## ✅ Correct Setup

You should have **TWO terminals running:**

**Terminal 1 - Backend:**
```
PS D:\Hotel Booking System\backend> npm run dev

> hotel-booking-backend@1.0.0 dev
> nodemon server.js

✅ Database connected successfully
🚀 Hotel Booking API Server
🌐 Server running on port 5000
```

**Terminal 2 - Frontend:**
```
PS D:\Hotel Booking System\frontend> npm run dev

> hotel-booking-frontend@1.0.0 dev
> vite

VITE v5.4.21  ready in 421 ms

➜  Local:   http://localhost:3000/
```

**Both must be running simultaneously!**

---

## 🎯 Quick Diagnostic

**Run this checklist:**

```
 Backend Status:
  → Backend running on port 5000?
  → Health endpoint works (http://localhost:5000/health)?
  → Database connected?

 Frontend Status:
  → Frontend running on port 3000?
  → No console errors?
  → Can see login page?

 Login Test:
  → Filled email + password?
  → Clicked "Sign in"?
  → Saw "Signing in..." text?
  → Check console for API call?
  → Saw any error messages?
```

---

## 💡 Most Likely Issue

**99% of the time, this is the issue:**

```
❌ Backend is not running
```

**Solution:**
```bash
cd "d:\Hotel Booking System\backend"
npm run dev
```

Then try logging in again!

---

**Once both servers are running and you can log in, you should be automatically redirected to the dashboard!** 🎉
