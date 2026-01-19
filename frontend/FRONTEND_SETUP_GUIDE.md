# 🚀 Frontend Setup Guide - Complete Implementation

## 📋 What Has Been Created

I've set up the foundational structure for your React + Tailwind CSS frontend. Here's what's ready:

### ✅ Configuration Files (6 files)
1. `package.json` - Dependencies and scripts
2. `vite.config.js` - Vite configuration with API proxy
3. `tailwind.config.js` - Tailwind CSS theme customization
4. `index.html` - HTML entry point
5. `.env.example` - Environment variables template
6. `README.md` - Complete documentation

### ✅ Core Application Files (4 files)
1. `src/main.jsx` - React entry point
2. `src/App.jsx` - Main app component with routing
3. `src/index.css` - Global styles with Tailwind
4. `src/services/api.js` - API integration layer
5. `src/store/index.js` - State management (Zustand)

---

## 🛠️ Quick Setup (3 Steps)

### Step 1: Install Dependencies
```bash
cd "d:\Hotel Booking System\frontend"
npm install
```

This will install:
- ✅ React 18
- ✅ React Router DOM
- ✅ Tailwind CSS
- ✅ Axios
- ✅ Zustand (state management)
- ✅ React Icons
- ✅ React DatePicker
- ✅ React Hot Toast
- ✅ Vite

### Step 2: Create Environment File
```bash
# Create .env file
echo VITE_API_URL=http://localhost:5000/api > .env
```

Or manually create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start Development Server
```bash
npm run dev
```

Frontend will start at: **http://localhost:3000** ✅

---

## 📂 Next Steps - Create Components

I've created the foundation. Now you need to create the actual page and component files. Here's the complete code for each:

### 1️⃣ Create ProtectedRoute Component

**File:** `src/components/ProtectedRoute.jsx`

```jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

### 2️⃣ Create Navbar Component

**File:** `src/components/layout/Navbar.jsx`

```jsx
import { Link, useNavigate } from 'react-router-dom';
import { FaHotel, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuthStore } from '../../store';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <FaHotel className="text-primary-600 text-3xl" />
            <span className="text-2xl font-bold text-gray-800">
              HotelBook
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/hotels"
              className="text-gray-700 hover:text-primary-600 font-medium transition"
            >
              Hotels
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 font-medium transition"
                >
                  My Bookings
                </Link>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-600" />
                    <span className="text-gray-700">
                      {user?.first_name || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

---

### 3️⃣ Create Footer Component

**File:** `src/components/layout/Footer.jsx`

```jsx
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">HotelBook</h3>
            <p className="text-gray-400">
              Find and book hotels worldwide with the best prices.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/hotels" className="text-gray-400 hover:text-white">Hotels</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="/faq" className="text-gray-400 hover:text-white">FAQ</a></li>
              <li><a href="/terms" className="text-gray-400 hover:text-white">Terms</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <FaFacebook className="text-2xl cursor-pointer hover:text-primary-400" />
              <FaTwitter className="text-2xl cursor-pointer hover:text-primary-400" />
              <FaInstagram className="text-2xl cursor-pointer hover:text-primary-400" />
              <FaLinkedin className="text-2xl cursor-pointer hover:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Hotel Booking System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

---

### 4️⃣ Create HomePage

**File:** `src/pages/HomePage.jsx`

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaCalendar, FaUsers, FaHotel, FaCreditCard, FaStar } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSearchStore } from '../store';

const HomePage = () => {
  const navigate = useNavigate();
  const { setSearchParams } = useSearchStore();

  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(2);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city && checkIn && checkOut) {
      setSearchParams({ city, checkIn, checkOut, guests });
      navigate('/hotels');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl text-primary-100">
              Search hotels worldwide and get the best deals
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Location */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-field pl-10 text-gray-800"
                  required
                />
              </div>

              {/* Check-in Date */}
              <div className="relative">
                <FaCalendar className="absolute left-3 top-4 text-gray-400 z-10" />
                <DatePicker
                  selected={checkIn}
                  onChange={(date) => setCheckIn(date)}
                  selectsStart
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={new Date()}
                  placeholderText="Check-in"
                  className="input-field pl-10 text-gray-800"
                  required
                />
              </div>

              {/* Check-out Date */}
              <div className="relative">
                <FaCalendar className="absolute left-3 top-4 text-gray-400 z-10" />
                <DatePicker
                  selected={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  selectsEnd
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={checkIn || new Date()}
                  placeholderText="Check-out"
                  className="input-field pl-10 text-gray-800"
                  required
                />
              </div>

              {/* Guests */}
              <div className="relative">
                <FaUsers className="absolute left-3 top-4 text-gray-400" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="input-field pl-10 text-gray-800"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-4">
              Search Hotels
            </button>
          </form>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHotel className="text-primary-600 text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Search</h3>
              <p className="text-gray-600">
                Find hotels by location, dates, and preferences
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-primary-600 text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Compare</h3>
              <p className="text-gray-600">
                Read reviews and compare prices to find the best deal
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCreditCard className="text-primary-600 text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">Book</h3>
              <p className="text-gray-600">
                Secure your booking with instant confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
```

---

## 🎯 Component File Structure

Create these folders and files:

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx ✅ (Code above)
│   │   └── Footer.jsx ✅ (Code above)
│   ├── hotel/
│   │   ├── HotelCard.jsx
│   │   ├── HotelFilter.jsx
│   │   └── RoomCard.jsx
│   ├── booking/
│   │   ├── BookingSummary.jsx
│   │   └── PaymentForm .jsx
│   └── ProtectedRoute.jsx ✅ (Code above)
├── pages/
│   ├── HomePage.jsx ✅ (Code above)
│   ├── HotelsPage.jsx
│   ├── HotelDetailsPage.jsx
│   ├── BookingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   └── BookingDetailsPage.jsx
```

---

## 📝 Quick Reference - Create Missing Pages

I've provided complete code for the foundation. To complete the frontend, create these remaining pages using similar patterns:

### LoginPage.jsx Template
```jsx
import { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAPI.login({ email, password });
      setAuth(data.data.user, data.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      {/* Login form JSX */}
    </div>
  );
};
```

---

## ✅ Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Create `.env` file
- [ ] Create missing component files
- [ ] Create missing page files
- [ ] Test with backend running
- [ ] Customize design as needed

---

## 🚀 Start Development

```bash
# Terminal 1: Backend
cd "d:\Hotel Booking System\backend"
npm run dev

# Terminal 2: Frontend
cd "d:\Hotel Booking System\frontend"
npm run dev
```

Visit: **http://localhost:3000** 🎉

---

## 📖 Full Code Repository

For complete page implementations, component examples, and advanced features, refer to:
- `README.md` - Project documentation
- `src/` folder structure above
- React Router official docs for routing patterns

---

**🎉 Your React + Tailwind frontend foundation is ready! Create the remaining pages to complete the full application.**
