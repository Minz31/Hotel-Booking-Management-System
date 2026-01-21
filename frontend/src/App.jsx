import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DebugPage from './pages/DebugPage';
import ManageHotelsPage from './pages/admin/ManageHotelsPage';
import ViewBookingsPage from './pages/admin/ViewBookingsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageRoomsPage from './pages/admin/ManageRoomsPage';
import ManageReviewsPage from './pages/admin/ManageReviewsPage';
import ManagePaymentsPage from './pages/admin/ManagePaymentsPage';
import CreateBookingPage from './pages/admin/CreateBookingPage';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import SuperAdminRoute from './components/SuperAdminRoute';

function App() {
    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />

                <main className="flex-grow">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/hotels" element={<HotelsPage />} />
                        <Route path="/hotels/:id" element={<HotelDetailsPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/debug" element={<DebugPage />} />

                        {/* Protected Routes  */}
                        <Route
                            path="/booking"
                            element={
                                <ProtectedRoute>
                                    <BookingPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <GuestRoute>
                                    <DashboardPage />
                                </GuestRoute>
                            }
                        />
                        <Route
                            path="/bookings/:id"
                            element={
                                <GuestRoute>
                                    <BookingDetailsPage />
                                </GuestRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/hotels"
                            element={
                                <ProtectedRoute>
                                    <ManageHotelsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/bookings"
                            element={
                                <ProtectedRoute>
                                    <ViewBookingsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/bookings/new"
                            element={
                                <ProtectedRoute>
                                    <CreateBookingPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <SuperAdminRoute>
                                    <ManageUsersPage />
                                </SuperAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/rooms/:hotelId"
                            element={
                                <ProtectedRoute>
                                    <ManageRoomsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/reviews/:hotelId"
                            element={
                                <ProtectedRoute>
                                    <ManageReviewsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/payments"
                            element={
                                <ProtectedRoute>
                                    <ManagePaymentsPage />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>

                <Footer />

                {/* Toast Notifications */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#22c55e',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </div>
        </Router>
    );
}

export default App;
