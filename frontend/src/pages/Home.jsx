import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Home as HomeIcon,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- HERO IMAGES ---
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2062&auto=format&fit=crop",
];

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Slideshow Logic: Change image every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${searchQuery}`);
    } else {
      navigate("/listings");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* --- 1. HERO SLIDESHOW SECTION --- */}
      {/* Changed height from fixed 600px to dynamic 'min-h-[500px]' or '80vh' for mobile */}
      <div className="relative h-[85vh] md:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Images */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={HERO_IMAGES[currentImage]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover object-center"
            alt="Hero Background"
          />
        </AnimatePresence>

        {/* Darker Overlay (bg-black/50) for better text contrast */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg leading-tight"
          >
            Find your Home <br className="md:hidden" />
            {/* Using text-sky-400 (lighter blue) for better readability on dark bg */}
            <span className="text-sky-400 block md:inline mt-2 md:mt-0">
              Away from Home.
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
          >
            Safe, verified, and affordable student accommodations near your
            campus.
          </motion.p>

          {/* Search Bar - Responsive Design */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            onSubmit={handleSearch}
            // Mobile: Rounded-2xl, Column Layout. Desktop: Rounded-full, Row Layout.
            className="bg-white p-3 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center w-full max-w-2xl mx-auto gap-3 md:gap-0"
          >
            {/* Input Section */}
            <div className="flex items-center w-full px-2 md:pl-6">
              <MapPin className="text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Where to? (e.g. Selbourne)"
                className="flex-1 outline-none text-gray-700 placeholder-gray-400 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Button Section - Full width on mobile */}
            <button
              type="submit"
              className="w-full md:w-auto bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-xl md:rounded-full font-bold transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Search size={18} /> Search
            </button>
          </motion.form>
        </div>
      </div>

      {/* --- 2. FEATURES / TRUST SECTION --- */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Students Choose CampusAcc
            </h2>
            <p className="text-gray-500 mt-2">
              We make finding housing safe and simple.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-blue-100 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Landlords</h3>
              <p className="text-gray-500">
                Every property is checked to ensure it meets our safety
                standards before being listed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Booking</h3>
              <p className="text-gray-500">
                Connect directly with landlords and secure your room in minutes,
                not days.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Close to Campus</h3>
              <p className="text-gray-500">
                Our smart map filters allow you to find homes within walking
                distance of your classes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. HOW IT WORKS --- */}
      <div className="py-20 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
              alt="Students collaborating"
              className="rounded-2xl shadow-2xl w-full"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              The Easiest Way to Rent
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-lg">Search & Filter</h4>
                  <p className="text-gray-500">
                    Browse hundreds of listings. Filter by price, Wi-Fi, and
                    distance.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-lg">Send a Request</h4>
                  <p className="text-gray-500">
                    Found a place? Send a booking request directly to the
                    landlord.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-lg">Move In</h4>
                  <p className="text-gray-500">
                    Once accepted, get your keys and start your semester
                    worry-free.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/listings"
              className="inline-flex items-center gap-2 mt-8 text-primary font-bold hover:underline text-lg"
            >
              Start Browsing Now <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* --- 4. LANDLORD CTA BANNER --- */}
      <div className="bg-gray-900 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Have an empty room?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join hundreds of landlords using CampusAcc to fill their properties
            with reliable students. It's free to list.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/add-property"
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <HomeIcon size={20} /> List Your Property
            </Link>
            <Link
              to="/register"
              className="bg-transparent border border-gray-600 text-white px-8 py-4 rounded-xl font-bold hover:border-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck size={20} /> Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
