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
