# 🔐 Admin Login Guide

## ✅ Admin Login is Ready!

I've implemented **role-based authentication** with automatic redirect for admins!

---

## 🎯 How Admin Login Works

### **Step 1: Admin Goes to Login Page**
```
http://localhost:3000/login
```

### **Step 2: Admin Enters Credentials**

Admin uses email from `admins` table in database:

**Example Admin Credentials:**
```
Email: admin@hotelbook.com
Password: admin123
```

*(Check your database `admins` table for actual admin accounts)*

### **Step 3: Auto-Redirect**

✅ **If Guest:** Redirects to `/dashboard`  
✅ **If Admin:** Redirects to `/admin` (Admin Dashboard)

---

## 📊 What Changed

### **1. LoginPage.jsx** ✅
- Added role detection
- Auto-redirect based on role:
  ```javascript
  if (user.role === 'admin' || user.role === 'super_admin') {
      navigate('/admin');  // Admin dashboard
  } else {
      navigate('/dashboard');  // Guest dashboard
  }
  ```

### **2. AdminDashboardPage.jsx** ✅ NEW!
- Stats cards (Bookings, Hotels, Users, Revenue)
- Quick actions panel
- Recent activity feed
- Clean admin UI

### **3. App.jsx** ✅
- Added `/admin` route
- Protected with authentication

---

## 🗄️ Admin Accounts in Database

### **Check Existing Admins:**

Run this SQL query:
```sql
SELECT id, first_name, last_name, email, role 
FROM admins;
```

### **Create New Admin:**

```sql
INSERT INTO admins (id, first_name, last_name, email, password, role, hotel_id)
VALUES (
  UUID(),
  'Admin',
  'User',
  'admin@hotelbook.com',
  '$2a$10$YourHashedPasswordHere',  -- Use bcrypt hash
  'admin',  -- or 'super_admin'
  NULL
);
```

**Note:** Password must be hashed with bcrypt!

### **Easy Way - Use Backend to Create Admin:**

You can create a temporary route or use the register endpoint with manual DB update:

1. Register as normal user
2. Update in database:
   ```sql
   UPDATE guests 
   SET role = 'admin' 
   WHERE email = 'youremail@example.com';
   ```

---

## 🧪 Test Admin Login

### **Option 1: Existing Admin**

1. Check database for admin accounts
2. Go to `/login`
3. Enter admin email/password
4. Should redirect to `/admin`
5. See admin dashboard!

### **Option 2: Create Test Admin**

**Quick SQL:**
```sql
-- First, register a normal user through the app
-- Then run this:

UPDATE guests 
SET role = 'admin' 
WHERE email = 'test@example.com';
```

Now login with that email - will go to admin dashboard!

---

## 🎨 Admin Dashboard Features

### **Stats Cards:**
- 📊 Total Bookings
- 🏨 Total Hotels
- 👥 Total Users  
- 💰 Revenue

### **Quick Actions:**
- Manage Hotels
- View Bookings
- Manage Users
- Reviews
- Payments

### **Recent Activity:**
- New bookings
- User registrations
- Reviews

*(Currently showing sample data - connect to real APIs later)*

---

## 🔐 Security Notes

### **Role-Based Access:**
```javascript
// In components, check role:
const { user } = useAuthStore();

if (user.role === 'admin' || user.role === 'super_admin') {
  // Show admin features
}
```

### **Protected Routes:**
All admin routes use `<ProtectedRoute>` wrapper which:
- ✅ Checks if user is authenticated
- ✅ Redirects to `/login` if not
- ✅ Allows access if logged in

### **Future Enhancement:**
Create `AdminOnlyRoute` component that also checks role:
```javascript
const AdminOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};
```

---

## 📱 User Journey

### **Guest Login:**
```
Login → Guest Dashboard
- View bookings
- Make new bookings
- View profile
```

### **Admin Login:**
```
Login → Admin Dashboard
- View stats
- Manage hotels
- View all bookings
- Manage users
- Respond to reviews
```

---

## 🚀 Testing

### **Test Guest Login:**
```
Email: john@test.com (or any registered user)
Password: password123
→ Redirects to /dashboard
```

### **Test Admin Login:**
```
Email: admin@hotelbook.com (or admin from DB)
Password: admin123
→ Redirects to /admin
→ Shows "Welcome back, Admin!" toast
```

---

## 📊 Database Roles

Your app supports 3 roles:

| Role | Table | Access | Dashboard |
|------|-------|--------|-----------|
| **guest** | `guests` | Guest features | `/dashboard` |
| **admin** | `admins` | Hotel management | `/admin` |
| **super_admin** | `admins` | Full system access | `/admin` |

---

## 💡 Admin vs Guest Differences

### **Navbar:**
- **Guest:** HotelBook | Hotels | My Bookings | User | Logout
- **Admin:** Could show different menu (future enhancement)

### **Dashboard:**
- **Guest:** Personal bookings, upcoming trips
- **Admin:** System stats, management tools

### **Permissions:**
- **Guest:** Book rooms, view own data
- **Admin:** Manage all hotels, view all bookings
- **Super Admin:** Everything + user management

---

## ✅ Summary

**Admin login is working!** Here's what happens:

1. ✅ Admin goes to `/login`
2. ✅ Enters admin credentials
3. ✅ System checks `admins` table
4. ✅ Returns user with `role: 'admin'`
5. ✅ Auto-redirects to `/admin`
6. ✅ Shows admin dashboard

**Same login page, different destination based on role!** 🎉

---

## 🔧 Quick Setup

1. **Check your database:**
   ```sql
   SELECT * FROM admins;
   ```

2. **If no admins exist, create one:**
   - Register as normal user through app
   - Update role in database:
     ```sql
     UPDATE guests SET role = 'admin' WHERE email = 'your@email.com';
     ```

3. **Login with that email:**
   - Should redirect to `/admin`
   - See admin dashboard

4. **Done!** ✅

---

**Admin system is ready to use!** 🚀
