import { useState, useEffect } from 'react';
import { FaStar, FaThumbsUp, FaUserCircle, FaReply } from 'react-icons/fa';
import { reviewAPI } from '../../services/api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';
import AddReviewModal from './AddReviewModal';

const ReviewsList = ({ hotelId, hotelName }) => {
    const { user, isAuthenticated } = useAuthStore();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchReviews();
    }, [hotelId, sortBy, page]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await reviewAPI.getHotelReviews(hotelId, {
                page,
                limit: 5,
                sort: sortBy
            });
            setReviews(data.data?.reviews || []);
            setTotalPages(data.pagination?.pages || 1);
        } catch (error) {
            console.error('Failed to load reviews:', error);
            // Don't show toast on load error to avoid annoying the user if there are simply no reviews
        } finally {
            setLoading(false);
        }
    };

    const handleMarkHelpful = async (reviewId) => {
        if (!isAuthenticated) {
            toast.error('Please login to vote');
            return;
        }

        try {
            await reviewAPI.markHelpful(reviewId);
            // Optimistic update
            setReviews(prev => prev.map(r =>
                r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r
            ));
            toast.success('Marked as helpful');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to action');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Guest Reviews</h3>
                {isAuthenticated && (
                    <button
                        onClick={() => setIsAddReviewModalOpen(true)}
                        className="btn-secondary"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-600 text-sm font-medium">Sort by:</span>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border text-sm rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                    <option value="newest">Newest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                </select>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No reviews yet. Be the first to share your experience!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-200 rounded-full p-2">
                                        <FaUserCircle className="text-gray-500 text-2xl" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{review.user_name || 'Anonymous Guest'}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-primary-50 px-2 py-1 rounded">
                                    <span className="font-bold text-primary-700">{review.rating}</span>
                                    <FaStar className="text-yellow-400 text-sm" />
                                </div>
                            </div>

                            <p className="text-gray-700 mb-3">{review.comment}</p>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <button
                                    onClick={() => handleMarkHelpful(review.id)}
                                    className="flex items-center gap-1 hover:text-primary-600 transition-colors"
                                >
                                    <FaThumbsUp />
                                    <span>Helpful ({review.helpful_count || 0})</span>
                                </button>
                            </div>

                            {/* Hotel Response */}
                            {review.response && (
                                <div className="mt-4 bg-gray-50 p-4 rounded-lg ml-6 border-l-4 border-primary-300">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FaReply className="text-primary-500" />
                                        <span className="font-bold text-sm text-gray-800">Response from {hotelName}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{review.response}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            <AddReviewModal
                isOpen={isAddReviewModalOpen}
                onClose={() => setIsAddReviewModalOpen(false)}
                hotelId={hotelId}
                onSuccess={() => {
                    fetchReviews();
                    setIsAddReviewModalOpen(false);
                }}
            />
        </div>
    );
};

export default ReviewsList;
