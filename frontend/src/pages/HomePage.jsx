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
