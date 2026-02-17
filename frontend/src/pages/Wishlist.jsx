import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MapPin, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Wishlist = () => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    try {
      const res = await axios.get(
        import.meta.env.VITE_API_URL + "/api/properties/favorites/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSavedProperties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (e, propertyId) => {
    e.preventDefault(); // Prevents clicking the heart from triggering the Link wrapper
    const token = localStorage.getItem("access_token");
    try {
      await axios.post(
        `import.meta.env.VITE_API_URL/api/properties/${propertyId}/favorite/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // Remove it from the UI immediately
      setSavedProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="text-red-500 fill-red-500" size={32} /> My Saved
            Homes
          </h1>
          <p className="text-gray-500 mt-2">
            Properties you have bookmarked for later.
          </p>
        </div>

        {savedProperties.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
            <Heart className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No saved homes yet
            </h3>
            <p className="text-gray-500 mb-6">
              Browse listings and tap the heart icon to save your favorites
              here.
            </p>
            <Link
              to="/listings"
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {savedProperties.map((property) => (
              <Link
                to={`/property/${property.id}`}
                key={property.id}
                className="block group"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 relative"
                >
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0].image}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-900">
                      ${property.price_per_month}/mo
                    </div>

                    {/* HEART BUTTON TO REMOVE */}
                    <button
                      onClick={(e) => removeFavorite(e, property.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:scale-110 transition-transform"
                    >
                      <Heart size={18} className="text-red-500 fill-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 truncate">
                      {property.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate mt-1 flex items-center gap-1">
                      <MapPin size={12} /> {property.address}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
