import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { hotelAPI } from '../services/api';
import { useSearchStore } from '../store';
import toast from 'react-hot-toast';

const HotelsPage = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        city: '',
        star_rating: '',
        page: 1,
        limit: 12
    });

    const { searchParams } = useSearchStore();

    useEffect(() => {
        fetchHotels();
    }, [filters, searchParams]);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const params = {
                ...filters,
                city: searchParams.city || filters.city
            };

            const { data } = await hotelAPI.getAllHotels(params);
            setHotels(data.data);
        } catch (error) {
            toast.error('Failed to load hotels');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Search Bar */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by city..."
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                className="input-field pl-10"
                            />
                        </div>
                        <select
                            value={filters.star_rating}
                            onChange={(e) => setFilters({ ...filters, star_rating: e.target.value })}
                            className="input-field w-48"
                        >
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Hotels Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-600">Loading hotels...</p>
                    </div>
                ) : hotels.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-600">No hotels found</p>
                        <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold mb-8">
                            {searchParams.city ? `Hotels in ${searchParams.city}` : 'All Hotels'}
                        </h1>

                        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {hotels.map((hotel) => (
                                <Link
                                    key={hotel.id}
                                    to={`/hotels/${hotel.id}`}
                                    className="card overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                                >
                                    <div className="relative">
                                        <img
                                            src={`https://source.unsplash.com/400x300/?hotel,${hotel.city}`}
                                            alt={hotel.name}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-sm font-semibold">
                                            {hotel.star_rating} ⭐
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-1 truncate">{hotel.name}</h3>

                                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                            <FaMapMarkerAlt className="text-primary-600" />
                                            <span>{hotel.city}, {hotel.country}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <FaStar className="text-yellow-400" />
                                                <span className="font-semibold">{hotel.avg_rating || 'New'}</span>
                                                {hotel.review_count > 0 && (
                                                    <span className="text-sm text-gray-500">
                                                        ({hotel.review_count})
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">From</div>
                                                <div className="font-bold text-lg text-primary-600">
                                                    ${hotel.starting_price || '---'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HotelsPage;
