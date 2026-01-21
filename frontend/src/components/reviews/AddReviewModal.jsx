import { useState, useEffect } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { reviewAPI, bookingAPI } from '../../services/api'; // Import bookingAPI
import { useAuthStore } from '../../store'; // Import auth store
import toast from 'react-hot-toast';

const AddReviewModal = ({ isOpen, onClose, hotelId, onSuccess }) => {
    const { user } = useAuthStore();
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookingId, setBookingId] = useState(null);
    const [checkingEligibility, setCheckingEligibility] = useState(true);



    useEffect(() => {
        const findEligibleBooking = async () => {
            setCheckingEligibility(true);
            try {
                // Fetch guest's bookings
                const { data } = await bookingAPI.getGuestBookings(user.id);
                // Filter for this hotel and checked_out status
                const eligibleBookings = data.data.filter(
                    b => b.hotel_id === hotelId && b.status === 'checked_out'
                );

                if (eligibleBookings.length > 0) {
                    // Pick the most recent one (assuming API sort or manual sort)
                    // Sorting by check_out_date descending just to be safe
                    eligibleBookings.sort((a, b) => new Date(b.check_out_date) - new Date(a.check_out_date));
                    setBookingId(eligibleBookings[0].id);
                }
            } catch (error) {
                console.error("Failed to check eligibility", error);
            } finally {
                setCheckingEligibility(false);
            }
        };

        if (isOpen && user) {
            findEligibleBooking();
        }
    }, [isOpen, hotelId, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!bookingId) {
            toast.error('You need a completed stay at this hotel to review it.');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        setLoading(true);
        try {
            await reviewAPI.createReview({
                booking_id: bookingId, // Include valid booking_id
                hotel_id: hotelId,
                rating,
                comment
            });
            toast.success('Review submitted successfully!');
            setComment('');
            setRating(5);
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <FaTimes size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6">Write a Review</h2>

                <form onSubmit={handleSubmit}>
                    {/* Star Rating */}
                    <div className="mb-6 text-center">
                        <label className="block text-sm text-gray-600 mb-2">How would you rate your experience?</label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <FaStar
                                        size={32}
                                        className={`${star <= (hoverRating || rating)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-sm font-semibold text-primary-600 mt-2">
                            {hoverRating || rating} out of 5 stars
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                            className="input-field resize-none"
                            placeholder="Share details of your own experience at this hotel..."
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddReviewModal;
