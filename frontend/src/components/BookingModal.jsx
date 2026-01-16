import { useState } from "react";
import axios from "axios";
import { X, Calendar, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BookingModal = ({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  price,
}) => {
  const [formData, setFormData] = useState({
    move_in_date: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, success, error

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("You must be logged in to book!");
      setLoading(false);
      return;
    }

    try {
      // Adjust this URL to match your actual Django backend endpoint
      await axios.post(
        "https://campus-acc-backend.onrender.com/api/bookings/",
        {
          property: propertyId,
          move_in_date: formData.move_in_date,
          message: formData.message,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus("success");
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setFormData({ move_in_date: "", message: "" });
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop (Dark Overlay) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Request to Book
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {propertyTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {status === "success" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Request Sent!
                </h3>
                <p className="text-gray-500">The landlord has been notified.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Move-in Date
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <input
                      type="date"
                      required
                      value={formData.move_in_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          move_in_date: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message to Landlord
                  </label>
                  <div className="relative">
                    <MessageSquare
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <textarea
                      required
                      placeholder="Hi, I am interested in this room..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                    />
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center text-blue-900 text-sm">
                  <span className="font-medium">Total Rent</span>
                  <span className="font-bold text-lg">${price}/mo</span>
                </div>

                {status === "error" && (
                  <p className="text-red-500 text-sm text-center">
                    Failed to send request. Try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Send Request"
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
