import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Home,
  MapPin,
  DollarSign,
  FileText,
  Upload,
  Navigation,
  Loader2,
  Plus,
  Trash2,
  BedDouble,
  Image as ImageIcon,
  Wifi,
  Sun,
  Droplets,
  Clock,
  Users,
  Shield,
} from "lucide-react";

function AddProperty() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // 1. GENERAL PROPERTY STATE
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price_per_month: "",
    address: "",
    latitude: "",
    longitude: "",
    gender_preference: "Mixed",
    // --- NEW AMENITIES ---
    has_wifi: false,
    has_solar: false,
    has_borehole: false,
    curfew: "",
    visitors_allowed: true,
    deposit_amount: "",
  });

  const [houseImages, setHouseImages] = useState([]);
  const [housePreviews, setHousePreviews] = useState([]);

  // 2. DYNAMIC ROOMS STATE
  const [rooms, setRooms] = useState([
    { tempId: Date.now(), label: "", capacity: 1, images: [], previews: [] },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- HANDLERS: GENERAL INFO ---
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => alert("Could not get location. Please allow permissions."),
      );
    } else alert("Geolocation is not supported by this browser.");
  };

  const handleHouseImageChange = (e) => {
    const files = Array.from(e.target.files);
    setHouseImages(files);
    setHousePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  // --- HANDLERS: DYNAMIC ROOMS ---
  const handleAddRoom = () => {
    setRooms([
      ...rooms,
      { tempId: Date.now(), label: "", capacity: 1, images: [], previews: [] },
    ]);
  };

  const handleRemoveRoom = (idToRemove) => {
    setRooms(rooms.filter((r) => r.tempId !== idToRemove));
  };

  const handleRoomChange = (tempId, field, value) => {
    setRooms(
      rooms.map((room) =>
        room.tempId === tempId ? { ...room, [field]: value } : room,
      ),
    );
  };

  const handleRoomImageChange = (tempId, e) => {
    const files = Array.from(e.target.files);
    setRooms(
      rooms.map((room) => {
        if (room.tempId === tempId) {
          return {
            ...room,
            images: files,
            previews: files.map((file) => URL.createObjectURL(file)),
          };
        }
        return room;
      }),
    );
  };

  // Cleanup Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      housePreviews.forEach((url) => URL.revokeObjectURL(url));
      rooms.forEach((room) =>
        room.previews.forEach((url) => URL.revokeObjectURL(url)),
      );
    };
  }, [housePreviews, rooms]);

  // --- THE MEGA SUBMIT FUNCTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("You must be logged in to list a property.");
      setLoading(false);
      return;
    }

    try {
      // STEP 1: Create the Main Property
      const propertyRes = await axios.post(
        `${API_URL}/api/properties/`,
        {
          ...formData,
          latitude: formData.latitude || null,
          longitude: formData.longitude || null,
          deposit_amount: formData.deposit_amount || 0, // Handle empty string
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const propertyId = propertyRes.data.id;

      // STEP 2: Upload General House Images
      if (houseImages.length > 0) {
        for (let img of houseImages) {
          const imgData = new FormData();
          imgData.append("property", propertyId);
          imgData.append("image", img);
          await axios.post(`${API_URL}/api/upload-image/`, imgData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
        }
      }

      // STEP 3: Create Rooms & Upload Room-Specific Images
      for (let room of rooms) {
        if (!room.label.trim()) continue; // Skip empty rooms

        // A. Create the Room
        const roomRes = await axios.post(
          `${API_URL}/api/rooms/`,
          {
            property: propertyId,
            label: room.label,
            capacity: room.capacity,
            is_available: true,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const createdRoomId = roomRes.data.id;

        // B. Upload Images for this specific Room
        if (room.images.length > 0) {
          for (let img of room.images) {
            const roomImgData = new FormData();
            roomImgData.append("property", propertyId);
            roomImgData.append("room", createdRoomId); // Link to the room!
            roomImgData.append("image", img);
            await axios.post(`${API_URL}/api/upload-image/`, roomImgData, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            });
          }
        }
      }

      navigate("/");
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to publish listing. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            List Your Property
          </h1>
          <p className="text-gray-500 mt-2">
            Add your house details and dynamically set up your rooms.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* SECTION 1: GENERAL INFO */}
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
                <Home className="text-primary" /> General Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunny Cottage near Main Campus"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Vibe, nearby shops, etc.)
                </label>
                <textarea
                  required
                  placeholder="Tell students about the property..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none h-32"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rent ($)
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute top-3 left-3 text-gray-400"
                      size={20}
                    />
                    <input
                      type="number"
                      required
                      placeholder="300"
                      value={formData.price_per_month}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price_per_month: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute top-3 left-3 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      required
                      placeholder="123 Student Way"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tenant Preference
                  </label>
                  <select
                    value={formData.gender_preference}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender_preference: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
                  >
                    <option value="Mixed">Mixed (Gents & Ladies)</option>
                    <option value="Gents">Gents Only</option>
                    <option value="Ladies">Ladies Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPS Coordinates
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Lat"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      className="w-1/3 px-2 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Long"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      className="w-1/3 px-2 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="flex-1 bg-blue-50 text-primary rounded-xl font-bold hover:bg-blue-100 transition-colors flex justify-center items-center"
                      title="Auto-Detect Location"
                    >
                      <Navigation size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* --- NEW: AMENITIES & RULES SECTION --- */}
            <div className="space-y-5 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-blue-200 pb-3">
                <Wifi className="text-primary" /> Amenities & House Rules
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CHECKBOXES */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.has_wifi}
                      onChange={(e) =>
                        setFormData({ ...formData, has_wifi: e.target.checked })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <Wifi size={18} className="text-blue-500" /> Free Wi-Fi
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.has_solar}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          has_solar: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <Sun size={18} className="text-orange-500" /> Solar /
                      Inverter
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.has_borehole}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          has_borehole: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <Droplets size={18} className="text-blue-400" /> Borehole
                      / Tank
                    </span>
                  </label>
                </div>

                {/* RULES INPUTS */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Curfew Time (Optional)
                    </label>
                    <div className="relative">
                      <Clock
                        className="absolute top-3 left-3 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="e.g. 10:00 PM (Leave empty if none)"
                        value={formData.curfew}
                        onChange={(e) =>
                          setFormData({ ...formData, curfew: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Deposit Amount ($)
                    </label>
                    <div className="relative">
                      <Shield
                        className="absolute top-3 left-3 text-gray-400"
                        size={18}
                      />
                      <input
                        type="number"
                        placeholder="0"
                        value={formData.deposit_amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deposit_amount: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
                      />
                    </div>
                  </div>

                  <label className="flex items-center space-x-3 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.visitors_allowed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visitors_allowed: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <Users size={16} className="text-gray-500" /> Visitors
                      Allowed?
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 2: GENERAL PHOTOS */}
            <div className="space-y-5 bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="text-primary" /> General House Photos
              </h3>
              <p className="text-sm text-gray-500 -mt-3">
                Upload exterior shots, kitchen, living room, etc.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-white transition-colors relative bg-gray-50">
                <input
                  type="file"
                  multiple
                  onChange={handleHouseImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-2">
                    <Upload size={20} />
                  </div>
                  <p className="text-gray-900 font-medium text-sm">
                    Click to upload general images
                  </p>
                </div>
              </div>

              {housePreviews.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {housePreviews.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      className="w-full aspect-square object-cover rounded-lg border shadow-sm"
                      alt="Preview"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 3: DYNAMIC ROOMS BUILDER */}
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BedDouble className="text-primary" /> Room Management
                </h3>
                <button
                  type="button"
                  onClick={handleAddRoom}
                  className="bg-blue-50 text-primary px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-100 flex items-center gap-1"
                >
                  <Plus size={16} /> Add Room
                </button>
              </div>

              {rooms.map((room, index) => (
                <div
                  key={room.tempId}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-6 relative shadow-sm hover:border-primary/30 transition-colors"
                >
                  {/* Remove Button (Hide if only 1 room) */}
                  {rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(room.tempId)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <h4 className="font-bold text-gray-700 mb-4">
                    Room #{index + 1}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Room Name / Label
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Master Bedroom"
                        value={room.label}
                        onChange={(e) =>
                          handleRoomChange(room.tempId, "label", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Capacity
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={room.capacity}
                        onChange={(e) =>
                          handleRoomChange(
                            room.tempId,
                            "capacity",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Room Specific Photos */}
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                      Photos of this room
                    </label>
                    <div className="flex gap-4 items-start">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl w-24 h-24 flex-shrink-0 flex items-center justify-center relative hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                        <input
                          type="file"
                          multiple
                          onChange={(e) =>
                            handleRoomImageChange(room.tempId, e)
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="text-gray-400" size={24} />
                      </div>

                      <div className="flex flex-wrap gap-2 flex-1">
                        {room.previews.length > 0 ? (
                          room.previews.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
                              alt="Room preview"
                            />
                          ))
                        ) : (
                          <div className="w-full h-24 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium italic">
                            No photos added for this room yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-blue-700 shadow-blue-500/30"}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Publishing...
                  </>
                ) : (
                  "Publish Property & Rooms"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProperty;
