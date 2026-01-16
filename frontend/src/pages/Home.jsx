import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Home as HomeIcon } from "lucide-react";

// You can change this image URL later to one of your own!
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop";

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- YOUR EXISTING DATA LOGIC ---
  useEffect(() => {
    axios
      .get("https://campus-acc-backend.onrender.com/api/properties/")
      .then((res) => {
        setProperties(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching properties:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- 1. NEW HERO SECTION --- */}
      <div className="relative h-[550px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Student Accommodation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        </div>

        {/* Hero Text & Search */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Find your student home <br />
            <span className="text-secondary">without the stress.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-200 mb-10 max-w-2xl mx-auto"
          >
            Safe, affordable, and close to campus. Browse the best student
            accommodations available now.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center max-w-2xl mx-auto"
          >
            <div className="flex items-center px-4 py-3 w-full md:border-r border-gray-200">
              <MapPin className="text-gray-400 mr-3" size={20} />
              <input
                type="text"
                placeholder="Where do you want to live?"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="p-2 w-full md:w-auto">
              <button className="w-full md:w-auto bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2">
                <Search size={18} />
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- 2. LISTINGS GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Latest Listings
            </h2>
            <p className="text-gray-600 mt-2">
              Freshly added student accommodations
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-xl text-gray-500 animate-pulse">
              Scanning for houses...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                {/* Card Image */}
                <div className="relative h-56 bg-gray-200">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0].image}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <HomeIcon size={40} />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-md ${
                      property.is_available
                        ? "bg-green-500/90"
                        : "bg-red-500/90"
                    }`}
                  >
                    {property.is_available ? "Available" : "Taken"}
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                    <span className="text-primary font-bold">
                      ${property.price_per_month}
                    </span>
                    <span className="text-xs text-gray-600">/month</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-gray-500 mb-4 text-sm">
                    <MapPin size={16} className="mr-1" />
                    <span className="truncate">{property.address}</span>
                  </div>

                  <Link to={`/property/${property.id}`}>
                    <button className="w-full py-3 rounded-xl bg-gray-50 text-gray-900 font-semibold hover:bg-primary hover:text-white transition-colors duration-200 border border-gray-200">
                      View Details
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
