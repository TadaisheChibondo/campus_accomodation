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
} from "lucide-react";
import { motion } from "framer-motion";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await axios.get(
          "https://campus-acc-backend.onrender.com/api/bookings/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Helper for Status Badges
  const getStatusBadge = (status) => {
    switch (status) {
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
          // --- EMPTY STATE ---
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
          // --- BOOKING LIST ---
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {booking.property_title}
                    </h3>
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
                </div>

                <Link
                  to={`/property/${booking.property}`}
                  className="text-primary font-semibold text-sm hover:underline whitespace-nowrap self-start md:self-center"
                >
                  View Property &rarr;
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
