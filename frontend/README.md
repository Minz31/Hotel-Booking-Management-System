# 🏨 Hotel Booking System - Frontend

A modern, responsive hotel booking application built with React, Tailwind CSS, and Vite. Inspired by Trivago's clean design.

## 🚀 Features

- ✅ **Modern UI/UX** - Clean, responsive design inspired by Trivago
- ✅ **Hotel Search** - Search by location, dates, and number of guests
- ✅ **Real-time Availability** - Check room availability instantly
- ✅ **User Authentication** - JWT-based secure login/register
- ✅ **Booking Management** - Create, view, and manage bookings
- ✅ **Payment Integration** - Process payments securely
- ✅ **Reviews & Ratings** - Read and write hotel reviews
- ✅ **User Dashboard** - Manage profile and bookings
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

## 🛠️ Installation

### Step 1: Navigate to frontend directory
```bash
cd "d:\Hotel Booking System\frontend"
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Create environment file
Create `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Start development server
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable components
│   │   ├── layout/       # Navbar, Footer
│   │   ├── hotel/        # Hotel cards, filters
│   │   ├── search/       # Search components
│   │   └── booking/      # Booking components
│   ├── pages/            # Page components
│   │   ├── HomePage.jsx
│   │   ├── HotelsPage.jsx
│   │   ├── HotelDetailsPage.jsx
│   │   ├── BookingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── DashboardPage.jsx
│   ├── services/         # API service layer
│   │   └── api.js
│   ├── store/            # State management (Zustand)
│   │   └── index.js
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── .env                  # Environment variables
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🎨 Key Features & Pages

### 1. Home Page
- Hero section with search bar
- Popular destinations
- Featured hotels
- How it works section

### 2. Hotels Listing Page
- Hotel cards with images, ratings, prices
- Filters (price, rating, amenities)
- Search and sort options
- Pagination

### 3. Hotel Details Page
- Image gallery
- Room types and pricing
- Amenities list
- Reviews and ratings
- Availability calendar
- Book now button

### 4. Booking Page
- Selected rooms summary
- Guest information form
- Payment method selection
- Booking confirmation

### 5. User Dashboard
- Profile management
- Booking history
- Upcoming reservations
- Past stays
- Write reviews

## 🔧 Technologies Used

| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Styling framework |
| **React Router** | Client-side routing |
| **Axios** | HTTP client |
| **Zustand** | State management |
| **React Icons** | Icon library |
| **React DatePicker** | Date selection |
| **React Hot Toast** | Notifications |
| **date-fns** | Date utilities |

## 🌐 API Integration

The frontend connects to the backend API endpoints:

```javascript
// Example API URLs
BASE_URL: http://localhost:5000/api

// Auth
POST   /auth/register
POST   /auth/login
GET    /auth/me

// Hotels
GET    /hotels
GET    /hotels/:id
GET    /hotels/:id/room-types
GET    /hotels/:id/available-rooms

// Bookings
POST   /bookings
GET    /bookings/guest/:guestId
GET    /bookings/:id
POST   /bookings/:id/cancel

// Payments
POST   /payments

// Reviews
POST   /reviews
GET    /reviews/hotel/:hotelId
```

## 🎯 Component Examples

### Search Bar Component
```jsx
import { useState } from 'react';
import { useSearchStore } from '../store';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const { setSearchParams } = useSearchStore();
  const navigate = useNavigate();
  
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(2);
  
  const handleSearch = () => {
    setSearchParams({ city, checkIn, checkOut, guests });
    navigate('/hotels');
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-soft">
      {/* Search form */}
    </div>
  );
};
```

### Hotel Card Component
```jsx
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const HotelCard = ({ hotel }) => {
  return (
    <Link to={`/hotels/${hotel.id}`}>
      <div className="card overflow-hidden cursor-pointer">
        <img 
          src={hotel.image || '/placeholder-hotel.jpg'} 
          alt={hotel.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-bold text-lg">{hotel.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <FaMapMarkerAlt />
            <span>{hotel.city}, {hotel.country}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400" />
              <span className="font-semibold">{hotel.avg_rating}</span>
              <span className="text-sm text-gray-500">
                ({hotel.review_count} reviews)
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">From</div>
              <div className="font-bold text-xl text-primary-600">
                ${hotel.starting_price}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
```

## 🔐 Authentication Flow

```javascript
// Login
import { authAPI } from '../services/api';
import { useAuthStore } from '../store';

const handleLogin = async (email, password) => {
  try {
    const { data } = await authAPI.login({ email, password });
    
    // Store token
    localStorage.setItem('token', data.data.token);
    
    // Update auth state
    setAuth(data.data.user, data.data.token);
    
    toast.success('Login successful!');
    navigate('/dashboard');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Login failed');
  }
};
```

## 🎨 Design System

### Colors
```javascript
Primary (Blue):
- 50:  #eff6ff
- 500: #3b82f6 (Main)
- 700: #1d4ed8 (Hover)

Secondary (Green):
- 500: #22c55e (Success)
- 600: #16a34a

Gray:
- 50:  #f9fafb (Background)
- 100: #f3f4f6
- 900: #111827 (Text)
```

### Typography
```css
Font Family: Inter
Headings: font-bold
Body: font-normal
Small: font-light
```

### Components
```css
Buttons: rounded-lg, shadow-md
Cards: rounded-xl, shadow-soft
Inputs: rounded-lg, border-gray-300
```

## 📱 Responsive Breakpoints

```javascript
sm:  640px  // Mobile landscape
md:  768px  // Tablet
lg:  1024px // Desktop
xl:  1280px // Large desktop
2xl: 1536px // Extra large
```

## 🚀 Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview

# Output will be in /dist folder
```

## 🧪 Testing

```bash
# Run linter
npm run lint
```

## 📦 Environment Variables

Create `.env` file:
```env
# API Base URL
VITE_API_URL=http://localhost:5000/api

# App Name
VITE_APP_NAME=Hotel Booking System

# Other configs
VITE_ENV=development
```

## 🎯 TODO / Future Enhancements

- [ ] Image upload for user profile
- [ ] Google Maps integration for hotel locations
- [ ] Advanced filters (amenities, price range)
- [ ] Compare hotels feature
- [ ] Favorite/Wishlist hotels
- [ ] Email notifications
- [ ] Social media login (Google, Facebook)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA support

## 🐛 Common Issues & Solutions

### Issue 1: API Connection Failed
**Solution:** Ensure backend server is running on `http://localhost:5000`

### Issue 2: CORS Error
**Solution:** Backend has CORS enabled. Check `CORS_ORIGIN` in backend `.env`

### Issue 3: Build Fails
**Solution:** Delete `node_modules` and `package-lock.json`, then run `npm install` again

## 📚 Documentation

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Zustand](https://github.com/pmndrs/zustand)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License

---

**Built with ❤️ for Hotel Booking Management System**

For backend documentation, see: `../backend/README.md`
