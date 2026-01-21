import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaUserCircle, FaReply, FaTrash } from 'react-icons/fa';
import { reviewAPI, hotelAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ManageReviewsPage = () => {
    const { hotelId } = useParams();
    const [hotel, setHotel] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [hotelId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [hotelRes, reviewsRes] = await Promise.all([
                hotelAPI.getHotelById(hotelId),
                reviewAPI.getHotelReviews(hotelId, { limit: 100 }) // Fetch more for admin
            ]);
            setHotel(hotelRes.data.data);
            setReviews(reviewsRes.data.data?.reviews || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) {
            toast.error('Reply cannot be empty');
            return;
        }

        setSubmitting(true);
        try {
            await reviewAPI.addHotelResponse(reviewId, replyText); // Assuming we'll add this to api.js
            toast.success('Response posted successfully');
            setReplyText('');
            setReplyingTo(null);
            fetchData(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post response');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await reviewAPI.deleteReview(reviewId);
            toast.success('Review deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Reviews</h1>
                    <p className="text-gray-600 mt-2">{hotel?.name}</p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No reviews found for this hotel.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 rounded-full p-2">
                                            <FaUserCircle className="text-gray-400 text-2xl" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{review.user_name || 'Anonymous Guest'}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                                            <span className="font-bold text-yellow-700">{review.rating}</span>
                                            <span className="text-yellow-400">★</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                            title="Delete Review"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-gray-800">{review.comment}</p>
                                </div>

                                {review.response ? (
                                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                        <p className="text-sm font-semibold text-blue-900 mb-1">
                                            Response from Hotel
                                        </p>
                                        <p className="text-blue-800 text-sm whitespace-pre-wrap">{review.response}</p>
                                        <p className="text-xs text-blue-400 mt-2">
                                            Responded on {new Date(review.response_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        {replyingTo === review.id ? (
                                            <div className="mt-4 animate-fade-in">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    rows="4"
                                                    className="input-field mb-3"
                                                    placeholder="Write your response to the guest..."
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setReplyingTo(null);
                                                            setReplyText('');
                                                        }}
                                                        className="btn-secondary text-sm"
                                                        disabled={submitting}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleReply(review.id)}
                                                        className="btn-primary text-sm"
                                                        disabled={submitting}
                                                    >
                                                        {submitting ? 'Posting...' : 'Post Response'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setReplyingTo(review.id)}
                                                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm mt-2"
                                            >
                                                <FaReply /> Reply to Review
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageReviewsPage;
