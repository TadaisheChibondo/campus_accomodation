import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Home,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/bookings/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [API_URL]);

  const handleDeleteBooking = async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this request? This cannot be undone.",
      )
    ) {
      return;
    }

    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`${API_URL}/api/bookings/${bookingId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete the request. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status ? status.toLowerCase() : "pending";

    switch (normalizedStatus) {
      case "accepted":
        return (
          <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            <CheckCircle size={14} /> Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            <XCircle size={14} /> Rejected
          </span>
        );
      default: // pending
        return (
          <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            <Clock size={14} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-500 mt-1">
            Track the status of your housing applications.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Home size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't sent any requests to landlords yet.
            </p>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Browse Homes <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {booking.property_title}
                    </h3>

                    {booking.room_label && (
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                        {booking.room_label}
                      </span>
                    )}

                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} className="text-gray-400" />
                      <span>Move-in: {booking.move_in_date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} className="text-gray-400" />
                      <span>
                        Applied on:{" "}
                        {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {booking.message && (
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                      "{booking.message}"
                    </p>
                  )}

                  {/* --- NEW: WhatsApp "Chat with Landlord" Button --- */}
                  {booking.status === "accepted" && booking.landlord_phone && (
                    <div className="mt-4">
                      <a
                        href={`https://wa.me/${booking.landlord_phone.replace("+", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        Chat with Landlord
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 mt-4 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  <Link
                    to={`/property/${booking.property}`}
                    className="text-primary font-semibold text-sm hover:underline whitespace-nowrap"
                  >
                    View Property &rarr;
                  </Link>
                  <button
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} /> Cancel Request
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
