import { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Home,
  Calendar,
  User,
  Clock,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

const LandlordDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        // 1. Get Booking Requests for MY properties
        const reqRes = await axios.get(
          "https://campus-acc-backend.onrender.com/api/bookings/manage/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRequests(reqRes.data);

        // 2. Get MY Properties
        const propRes = await axios.get(
          "https://campus-acc-backend.onrender.com/api/properties/my_listings/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMyProperties(propRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // HANDLE ACCEPT/REJECT
  const handleStatusUpdate = async (bookingId, newStatus) => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.patch(
        `https://campus-acc-backend.onrender.com/api/bookings/${bookingId}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI instantly
      setRequests((prev) =>
        prev.map((req) =>
          req.id === bookingId ? { ...req, status: newStatus } : req
        )
      );
    } catch (err) {
      alert("Failed to update status. Check your connection.");
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Landlord Dashboard
            </h1>
            <p className="text-gray-500">
              Manage your listings and incoming students.
            </p>
          </div>
          <Link
            to="/add-property"
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            <Home size={18} /> Add New Property
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: INCOMING REQUESTS */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <User size={20} className="text-primary" /> Incoming Requests
            </h2>

            {requests.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} />
                </div>
                <h3 className="font-bold text-gray-900">No pending requests</h3>
                <p className="text-gray-500 text-sm">
                  When students book your rooms, they will appear here.
                </p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {req.student_name || "Student"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        wants to book{" "}
                        <span className="text-primary font-medium">
                          {req.property_title}
                        </span>
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status}
                    </div>
                  </div>

                  {req.message && (
                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 mb-4 italic border border-gray-100">
                      "{req.message}"
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> Move-in: {req.move_in_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />{" "}
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* ACTION BUTTONS (Only show if Pending) */}
                    {req.status === "pending" && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleStatusUpdate(req.id, "rejected")}
                          className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-bold transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req.id, "accepted")}
                          className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold transition-colors shadow-lg shadow-green-200"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT COLUMN: MY PROPERTIES */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Home size={20} className="text-primary" /> My Properties
            </h2>
            <div className="space-y-4">
              {myProperties.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-8 bg-white rounded-xl border border-gray-100">
                  You haven't listed any properties yet.
                </div>
              ) : (
                myProperties.map((prop) => (
                  <Link
                    to={`/property/${prop.id}`}
                    key={prop.id}
                    className="block group"
                  >
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 group-hover:border-primary transition-colors">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {prop.images && prop.images.length > 0 ? (
                          <img
                            src={prop.images[0].image}
                            className="w-full h-full object-cover"
                            alt="Property"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden flex flex-col justify-center">
                        <h4 className="font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                          {prop.title}
                        </h4>
                        <p className="text-sm text-gray-500 mb-1">
                          ${prop.price_per_month}/mo
                        </p>
                        <div
                          className={`text-xs font-bold ${
                            prop.is_available
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {prop.is_available
                            ? "Active & Listed"
                            : "Marked as Taken"}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
