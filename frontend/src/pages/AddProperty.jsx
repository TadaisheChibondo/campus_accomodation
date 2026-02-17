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
  X,
} from "lucide-react";

function AddProperty() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price_per_month: "",
    address: "",
    latitude: "",
    longitude: "",
    gender_preference: "Mixed", // <--- NEW STATE ADDED
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          alert("Could not get location. Please allow permissions.");
        },
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

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

    const dataToSend = {
      ...formData,
      latitude: formData.latitude ? formData.latitude : null,
      longitude: formData.longitude ? formData.longitude : null,
    };

    try {
      const propertyRes = await axios.post(
        import.meta.env.VITE_API_URL + "/api/properties/",
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const propertyId = propertyRes.data.id;

      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imageData = new FormData();
          imageData.append("property", propertyId);
          imageData.append("image", images[i]);

          await axios.post(
            import.meta.env.VITE_API_URL + "/api/upload-image/",
            imageData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            },
          );
        }
      }

      navigate("/");
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            List Your Property
          </h1>
          <p className="text-gray-500 mt-2">
            Fill in the details below to reach thousands of students.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Home size={20} className="text-primary" /> Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunny Cottage near Main Campus"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="relative">
                  <FileText
                    className="absolute top-3 left-3 text-gray-400"
                    size={20}
                  />
                  <textarea
                    placeholder="Tell students about the amenities, rules, and vibe..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all h-32"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Price ($)
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute top-3 left-3 text-gray-400"
                      size={20}
                    />
                    <input
                      type="number"
                      placeholder="300"
                      value={formData.price_per_month}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price_per_month: e.target.value,
                        })
                      }
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
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
                      placeholder="123 Student Way"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* --- NEW GENDER DROPDOWN --- */}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="Mixed">Mixed (Gents & Ladies)</option>
                  <option value="Gents">Gents Only</option>
                  <option value="Ladies">Ladies Only</option>
                </select>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Navigation size={20} className="text-primary" /> Location
                </h3>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-sm bg-blue-50 text-primary px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Navigation size={14} /> Get GPS
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Latitude"
                  value={formData.latitude}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={formData.longitude}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload size={20} className="text-primary" /> Photos
              </h3>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors relative">
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-3">
                    <Upload size={24} />
                  </div>
                  <p className="text-gray-900 font-medium">
                    Click to upload images
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>

              {previews.length > 0 && (
                <div className="mt-6 grid grid-cols-3 md:grid-cols-4 gap-4">
                  {previews.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                    >
                      <img
                        src={url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-blue-700 shadow-blue-500/30"
              }`}
            >
              {loading ? (
                <>
                  {" "}
                  <Loader2 className="animate-spin" /> Publishing...{" "}
                </>
              ) : (
                "Publish Listing"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProperty;
