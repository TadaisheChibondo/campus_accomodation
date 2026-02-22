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
  Trash2,
  Power,
  BookOpen,
  GraduationCap,
  Phone,
  BedDouble, // New icon for rooms
} from "lucide-react";
import { Link } from "react-router-dom";

const LandlordDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const reqRes = await axios.get(`${API_URL}/api/bookings/manage/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(reqRes.data);

        const propRes = await axios.get(
          `${API_URL}/api/properties/my_listings/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setMyProperties(propRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  // --- HANDLERS ---

  const handleStatusUpdate = async (bookingId, newStatus) => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.patch(
        `${API_URL}/api/bookings/${bookingId}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setRequests((prev) =>
        prev.map((req) =>
          req.id === bookingId ? { ...req, status: newStatus } : req,
        ),
      );
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this property? This will delete all rooms inside it too.",
      )
    )
      return;
    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`${API_URL}/api/properties/${propertyId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (err) {
      alert("Failed to delete property.");
    }
  };

  const handleToggleProperty = async (propertyId, currentStatus) => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.patch(
        `${API_URL}/api/properties/${propertyId}/`,
        { is_available: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMyProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, is_available: !currentStatus } : p,
        ),
      );
    } catch (err) {
      alert("Failed to update property status.");
    }
  };

  // --- NEW: TOGGLE SPECIFIC ROOM ---
  const handleToggleRoom = async (propertyId, roomId, currentStatus) => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.patch(
        `${API_URL}/api/rooms/${roomId}/`,
        { is_available: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Deep update the nested state
      setMyProperties((prev) =>
        prev.map((p) => {
          if (p.id === propertyId) {
            return {
              ...p,
              rooms: p.rooms.map((r) =>
                r.id === roomId ? { ...r, is_available: !currentStatus } : r,
              ),
            };
          }
          return p;
        }),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update room status.");
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
        {/* HEADER */}
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
          {/* LEFT COL: BOOKING REQUESTS */}
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
                      <p className="text-sm text-gray-500 flex items-center flex-wrap gap-2 mt-1">
                        wants to book{" "}
                        <span className="text-primary font-bold">
                          {req.property_title}
                        </span>
                        {req.room_label && (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                            {req.room_label}
                          </span>
                        )}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${req.status === "pending" ? "bg-yellow-100 text-yellow-700" : req.status === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {req.status}
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center gap-2">
                      <BookOpen size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-900 truncate">
                        {req.student_program || "No program"}
                      </span>
                    </div>
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center gap-2">
                      <GraduationCap size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-900 truncate">
                        {req.student_year || "No year"}
                      </span>
                    </div>
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center gap-2">
                      <Phone size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-900 truncate">
                        {req.student_phone || "No phone"}
                      </span>
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

                    {/* Action Buttons: Pending state */}
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

                    {/* --- NEW: WhatsApp "Chat with Student" Button (Accepted State) --- */}
                    {req.status === "accepted" && req.student_phone && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <a
                          href={`https://wa.me/${req.student_phone.replace("+", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                          </svg>
                          Chat with Student
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT COL: MY PROPERTIES */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Home size={20} className="text-primary" /> My Properties
            </h2>
            <div className="space-y-6">
              {myProperties.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-8 bg-white rounded-xl border border-gray-100">
                  You haven't listed any properties yet.
                </div>
              ) : (
                myProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* PROPERTY MAIN CARD */}
                    <div className="p-3 flex flex-col gap-3">
                      <Link to={`/property/${prop.id}`} className="flex gap-3">
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
                          <h4 className="font-bold text-gray-900 truncate hover:text-primary transition-colors">
                            {prop.title}
                          </h4>
                          <p className="text-sm text-gray-500 mb-1">
                            ${prop.price_per_month}/mo
                          </p>
                          <div
                            className={`text-xs font-bold ${prop.is_available ? "text-green-600" : "text-red-500"}`}
                          >
                            {prop.is_available
                              ? "House Active"
                              : "House Paused"}
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* --- NEW: ROOM MANAGEMENT SECTION --- */}
                    {prop.rooms && prop.rooms.length > 0 && (
                      <div className="bg-gray-50 border-t border-gray-100 p-3">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <BedDouble size={12} /> Manage Rooms
                        </h5>
                        <div className="space-y-2">
                          {prop.rooms.map((room) => (
                            <div
                              key={room.id}
                              className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-700">
                                  {room.label}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {room.capacity} Person(s)
                                </span>
                              </div>

                              <button
                                onClick={() =>
                                  handleToggleRoom(
                                    prop.id,
                                    room.id,
                                    room.is_available,
                                  )
                                }
                                className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors ${room.is_available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                              >
                                <Power size={10} />
                                {room.is_available ? "Open" : "Taken"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PROPERTY ACTIONS */}
                    <div className="flex border-t border-gray-100 bg-gray-50/50">
                      <button
                        onClick={() =>
                          handleToggleProperty(prop.id, prop.is_available)
                        }
                        className={`flex-1 flex justify-center items-center gap-1 py-2 text-xs font-bold transition-colors ${prop.is_available ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}
                      >
                        <Power size={14} />{" "}
                        {prop.is_available ? "Pause House" : "Relist House"}
                      </button>

                      <div className="w-px bg-gray-200 my-1"></div>

                      <button
                        onClick={() => handleDeleteProperty(prop.id)}
                        className="flex-1 flex justify-center items-center gap-1 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
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
