import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  MapPin,
  Filter,
  Search,
  List,
  Map as MapIcon,
  Heart,
  Star, // <-- Added Star
} from "lucide-react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- FIXED: NUST COORDINATES ---
const NUST_LAT = -20.165;
const NUST_LNG = 28.642;

const Listings = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  const [filters, setFilters] = useState({
    maxPrice: 500,
    search: "",
    onlyAvailable: false,
    gender: "All",
  });

  // --- NEW: DISTANCE CALCULATOR ---
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat2 || !lon2) return null; // Prevents the 14,000km glitch!
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get(import.meta.env.VITE_API_URL + "/api/properties/", { headers })
      .then((res) => {
        // PROCESS DISTANCE AND RATINGS IMMEDIATELY
        const processedProperties = res.data.map((p) => {
          const avgRating =
            p.reviews && p.reviews.length > 0
              ? (
                  p.reviews.reduce((sum, r) => sum + r.rating, 0) /
                  p.reviews.length
                ).toFixed(1)
              : null;

          return {
            ...p,
            calculatedDistance: calculateDistance(
              NUST_LAT,
              NUST_LNG,
              p.latitude,
              p.longitude,
            ),
            averageRating: avgRating,
          };
        });

        setProperties(processedProperties);
        setFilteredProperties(processedProperties);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let result = properties;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.address.toLowerCase().includes(term),
      );
    }
    result = result.filter(
      (p) => parseFloat(p.price_per_month) <= filters.maxPrice,
    );
    if (filters.onlyAvailable) result = result.filter((p) => p.is_available);
    if (filters.gender !== "All")
      result = result.filter((p) => p.gender_preference === filters.gender);

    setFilteredProperties(result);
  }, [filters, properties]);

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleFavoriteToggle = async (e, propertyId) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    if (!token) return alert("Please log in to save properties!");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/properties/${propertyId}/favorite/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const updatedProps = properties.map((p) =>
        p.id === propertyId ? { ...p, is_favorited: res.data.is_favorited } : p,
      );
      setProperties(updatedProps);
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Your Room</h1>
            <p className="text-gray-500 mt-1">
              Showing {filteredProperties.length} properties
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg border border-gray-200 flex items-center shadow-sm">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === "list" ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <List size={18} /> List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === "map" ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <MapIcon size={18} /> Map
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-gray-200 font-medium text-gray-700"
            >
              <Filter size={18} /> Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div
            className={`md:w-1/4 space-y-6 ${showFilters ? "block" : "hidden md:block"}`}
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Filter size={20} /> Filters
                </h3>
                <button
                  onClick={() =>
                    setFilters({
                      maxPrice: 500,
                      search: "",
                      onlyAvailable: false,
                      gender: "All",
                    })
                  }
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Reset
                </button>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Location
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="e.g. Selbourne"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Max Price
                  </label>
                  <span className="text-sm font-bold text-primary">
                    ${filters.maxPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg accent-primary"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Tenant Preference
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-primary"
                >
                  <option value="All">Show All</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Gents">Gents Only</option>
                  <option value="Ladies">Ladies Only</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onlyAvailable}
                    onChange={(e) =>
                      handleFilterChange("onlyAvailable", e.target.checked)
                    }
                    className="w-5 h-5 text-primary border-gray-300 rounded"
                  />
                  <span className="text-gray-700 text-sm">
                    Only show available
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="md:w-3/4">
            {loading ? (
              <div className="flex justify-center py-20">Loading...</div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-20">No homes found.</div>
            ) : (
              <>
                {viewMode === "list" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProperties.map((property) => (
                      <Link to={`/property/${property.id}`} key={property.id}>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 group relative flex flex-col h-full"
                        >
                          <div className="relative h-48 bg-gray-200 overflow-hidden flex-shrink-0">
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

                            {/* TOP BADGES */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                              {property.averageRating && (
                                <div className="bg-white/90 px-2 py-1 rounded shadow-sm text-xs font-bold text-yellow-600 flex items-center gap-1">
                                  <Star
                                    size={12}
                                    className="fill-yellow-400 text-yellow-400"
                                  />
                                  {property.averageRating}
                                </div>
                              )}
                            </div>

                            {/* PRICE TAG */}
                            <div className="absolute bottom-2 left-2 bg-white/95 px-2 py-1 rounded shadow-sm text-sm font-bold text-gray-900">
                              ${property.price_per_month}/mo
                            </div>

                            {/* HEART BUTTON */}
                            <button
                              onClick={(e) =>
                                handleFavoriteToggle(e, property.id)
                              }
                              className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:scale-110 transition-transform"
                            >
                              <Heart
                                size={18}
                                className={
                                  property.is_favorited
                                    ? "text-red-500 fill-red-500"
                                    : "text-gray-400"
                                }
                              />
                            </button>
                          </div>

                          <div className="p-4 flex flex-col flex-grow">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 truncate flex-1">
                                {property.title}
                              </h3>
                              {property.gender_preference &&
                                property.gender_preference !== "Mixed" && (
                                  <span
                                    className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded uppercase ml-2 ${property.gender_preference === "Ladies" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"}`}
                                  >
                                    {property.gender_preference}
                                  </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-500 truncate mb-3">
                              {property.address}
                            </p>

                            <div className="mt-auto flex justify-between items-center">
                              {property.calculatedDistance ? (
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1">
                                  <MapPin size={12} />{" "}
                                  {property.calculatedDistance} km to NUST
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">
                                  Location unknown
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* --- RESTORED MAP VIEW --- */}
                {viewMode === "map" && (
                  <div className="h-[600px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative z-0">
                    <MapContainer
                      center={[NUST_LAT, NUST_LNG]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[NUST_LAT, NUST_LNG]}>
                        <Popup>
                          <b>NUST Campus</b>
                        </Popup>
                      </Marker>
                      {filteredProperties.map((property) =>
                        property.latitude && property.longitude ? (
                          <Marker
                            key={property.id}
                            position={[property.latitude, property.longitude]}
                          >
                            <Popup>
                              <Link
                                to={`/property/${property.id}`}
                                className="font-bold text-primary hover:underline"
                              >
                                {property.title}
                              </Link>
                              <br />${property.price_per_month}/mo
                            </Popup>
                          </Marker>
                        ) : null,
                      )}
                    </MapContainer>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Listings;
// fatal error at previous commit due to network issues trying to recommit now
