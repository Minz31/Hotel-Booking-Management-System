import { useState } from 'react';
import { FaCreditCard, FaLock, FaTimes } from 'react-icons/fa';
import { paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, booking, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });

    if (!isOpen || !booking) return null;

    const handleChange = (e) => {
        let value = e.target.value;
        // Simple formatting
        if (e.target.name === 'cardNumber') {
            value = value.replace(/\D/g, '').substring(0, 16);
        } else if (e.target.name === 'cvc') {
            value = value.replace(/\D/g, '').substring(0, 3);
        }
        setPaymentData({ ...paymentData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call backend API
            await paymentAPI.createPayment({
                booking_id: booking.id,
                amount: booking.final_amount,
                payment_method: 'credit_card',
                transaction_id: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}` // Mock transaction ID
            });

            toast.success('Payment successful! Booking confirmed.');
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fade-in shadow-2xl">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <FaTimes size={24} />
                </button>

                <div className="text-center mb-6">
                    <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaLock className="text-primary-600 text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold">Secure Payment</h2>
                    <p className="text-gray-600 mt-2">
                        Total Amount: <span className="text-black font-bold text-lg">${booking.final_amount}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                Name on Card
                            </label>
                            <input
                                type="text"
                                name="cardName"
                                value={paymentData.cardName}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                Card Number
                            </label>
                            <div className="relative">
                                <FaCreditCard className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={paymentData.cardNumber}
                                    onChange={handleChange}
                                    className="input-field pl-10 tracking-widest"
                                    placeholder="0000 0000 0000 0000"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    Expiry
                                </label>
                                <input
                                    type="text"
                                    name="expiry"
                                    value={paymentData.expiry}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="MM/YY"
                                    maxLength="5"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                    CVC
                                </label>
                                <input
                                    type="text"
                                    name="cvc"
                                    value={paymentData.cvc}
                                    onChange={handleChange}
                                    className="input-field text-center tracking-widest"
                                    placeholder="123"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3"
                    >
                        {loading ? (
                            <>Processing...</>
                        ) : (
                            <>Pay ${booking.final_amount}</>
                        )}
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                        <FaLock size={10} /> Encrypted & Secure
                    </p>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
