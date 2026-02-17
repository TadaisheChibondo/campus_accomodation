import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Wifi,
  CheckCircle,
  ArrowLeft,
  Star,
  Navigation,
  Send,
  Share2,
  Users,
  User,
  Phone,
  Heart,
  Flag,
  X,
} from "lucide-react";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import BookingModal from "../components/BookingModal";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
const UNI_LAT = -17.784;
const UNI_LNG = 31.053;

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // REPORT STATE
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("fake");
  const [reportDescription, setReportDescription] = useState("");
  const [reportStatus, setReportStatus] = useState("");

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
    return (R * c).toFixed(2);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get(`import.meta.env.VITE_API_URL/api/properties/${id}/`, { headers })
      .then((res) => {
        setProperty(res.data);
        if (res.data.images && res.data.images.length > 0)
          setActiveImage(res.data.images[0].image);
        if (res.data.latitude && res.data.longitude)
          setDistance(
            calculateDistance(
              UNI_LAT,
              UNI_LNG,
              res.data.latitude,
              res.data.longitude,
            ),
          );
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Please login to write a review!");
    try {
      await axios.post(
        `import.meta.env.VITE_API_URL/api/properties/${id}/review/`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReviewStatus("success");
      setComment("");
      const res = await axios.get(
        `import.meta.env.VITE_API_URL/api/properties/${id}/`,
      );
      setProperty(res.data);
    } catch (err) {
      setReviewStatus("error");
    }
  };

  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Please log in to save properties!");
    try {
      const res = await axios.post(
        `import.meta.env.VITE_API_URL/api/properties/${id}/favorite/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProperty((prev) => ({ ...prev, is_favorited: res.data.is_favorited }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      setReportStatus("unauthorized");
      return;
    }
    try {
      await axios.post(
        `import.meta.env.VITE_API_URL/api/properties/${id}/report/`,
        { reason: reportReason, description: reportDescription },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReportStatus("success");
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportStatus("");
        setReportDescription("");
      }, 2500);
    } catch (err) {
      setReportStatus("error");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!property)
    return <div className="text-center py-20">Property not found.</div>;

  const walkingTime = distance ? Math.round(parseFloat(distance) * 12) : null;
  const shareMessage = `Hey, check out this student accommodation: ${property.title} - ${window.location.href}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  // --- NEW: CALCULATE AVERAGE RATING ---
  const averageRating =
    property.reviews && property.reviews.length > 0
      ? (
          property.reviews.reduce((sum, review) => sum + review.rating, 0) /
          property.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gray-900 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to listings
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[500px]">
            <div className="lg:col-span-2 h-full relative rounded-2xl overflow-hidden bg-black">
              {activeImage ? (
                <img
                  src={activeImage}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Images
                </div>
              )}
            </div>
            <div className="hidden lg:flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
              {property.images &&
                property.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(img.image)}
                    className={`relative h-32 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === img.image ? "border-primary ring-2 ring-primary/50" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img
                      src={img.image}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
            </div>
          </div>
          <div className="lg:hidden flex gap-2 overflow-x-auto mt-4 pb-2">
            {property.images &&
              property.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img.image)}
                  className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${activeImage === img.image ? "border-primary" : "border-transparent"}`}
                >
                  <img
                    src={img.image}
                    alt="View"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT COLUMN */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  {/* --- NEW: ADDED THE AVERAGE RATING BADGE NEXT TO TITLE --- */}
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 flex flex-wrap items-center gap-3">
                    {property.title}
                    {averageRating && (
                      <div className="flex items-center gap-1 text-base bg-yellow-50 text-yellow-700 px-3 py-1 rounded-xl border border-yellow-200 shadow-sm">
                        <Star
                          size={18}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        <span className="font-bold">{averageRating}</span>
                        <span className="text-yellow-600 font-medium text-sm">
                          ({property.reviews.length})
                        </span>
                      </div>
                    )}
                  </h1>
                  <div className="flex items-center text-gray-500">
                    <MapPin size={18} className="mr-1 text-primary" />
                    <span>{property.address}</span>
                  </div>
                </div>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-bold ${property.is_available ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}
                >
                  {property.is_available ? "Available Now" : "Taken"}
                </span>
              </div>

              {distance && (
                <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3 text-blue-800">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Navigation size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">Good Location</p>
                    <p className="text-sm">
                      <span className="font-bold">{distance} km</span> from
                      campus{" "}
                      <span className="font-medium text-blue-600 ml-1">
                        (~{walkingTime} mins walk)
                      </span>
                      .
                    </p>
                  </div>
                </div>
              )}

              <hr className="my-6 border-gray-100" />

              <div className="mb-8 bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-20 h-20 rounded-full bg-blue-200 border-4 border-white shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {property.landlord_profile_picture ? (
                    <img
                      src={property.landlord_profile_picture}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={32} className="text-blue-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Hosted by{" "}
                    {property.landlord_company || property.landlord_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {property.landlord_bio ||
                      "This landlord hasn't added a bio yet. They are verified by CampusAcc."}
                  </p>
                  {property.landlord_phone && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
                      <Phone size={14} className="text-primary" />{" "}
                      {property.landlord_phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  About this place
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {property.description || "No description provided."}
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  What this place offers
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600 gap-3 p-3 bg-gray-50 rounded-lg">
                    <Wifi className="text-primary" /> <span>Fast Wi-Fi</span>
                  </div>
                  <div className="flex items-center text-gray-600 gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="text-primary" />{" "}
                    <span>Furnished</span>
                  </div>

                  <div className="flex items-center text-gray-600 gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users
                      className={
                        property.gender_preference === "Ladies"
                          ? "text-pink-500"
                          : property.gender_preference === "Gents"
                            ? "text-blue-500"
                            : "text-primary"
                      }
                    />
                    <span className="font-medium">
                      {property.gender_preference === "Mixed"
                        ? "Gents & Ladies (Mixed)"
                        : `${property.gender_preference} Only`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Location
                </h3>
                <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
                  {property.latitude ? (
                    <MapContainer
                      center={[property.latitude, property.longitude]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[property.latitude, property.longitude]}
                      >
                        <Popup>{property.title}</Popup>
                      </Marker>
                      <Marker position={[UNI_LAT, UNI_LNG]}>
                        <Popup>Campus</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                      Map coordinates not available
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="fill-yellow-400 text-yellow-400" />
                  Reviews ({property.reviews ? property.reviews.length : 0})
                </h3>
                <div className="space-y-4 mb-8">
                  {property.reviews && property.reviews.length > 0 ? (
                    property.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-1 mb-2 text-yellow-500 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating
                                  ? "fill-current"
                                  : "text-gray-300 fill-none"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No reviews yet.</p>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4">
                    Leave a Review
                  </h4>
                  {reviewStatus === "error" && (
                    <p className="text-red-500 text-sm mb-2">
                      Error submitting review. Are you logged in?
                    </p>
                  )}
                  {reviewStatus === "success" && (
                    <p className="text-green-500 text-sm mb-2">
                      Review posted successfully!
                    </p>
                  )}
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`p-1 rounded-full transition-colors ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                          >
                            <Star className="fill-current" size={24} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                        required
                        placeholder="How was your stay?"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Send size={16} /> Post Review
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT ACTION COLUMN */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100">
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-bold text-primary">
                  ${property.price_per_month}
                </span>
                <span className="text-gray-500 font-medium mb-1">/ month</span>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={!property.is_available}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${property.is_available ? "bg-primary hover:bg-blue-700 text-white shadow-blue-500/30" : "bg-gray-300 cursor-not-allowed text-gray-500"}`}
                >
                  {property.is_available ? "Request to Book" : "Not Available"}
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl font-bold text-[#25D366] border-2 border-[#25D366] hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={18} /> Share to WhatsApp
                </a>

                <button
                  onClick={handleFavoriteToggle}
                  className={`w-full py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${property.is_favorited ? "border-red-500 text-red-500 bg-red-50 hover:bg-red-100" : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"}`}
                >
                  <Heart
                    size={18}
                    className={property.is_favorited ? "fill-current" : ""}
                  />
                  {property.is_favorited
                    ? "Saved to Wishlist"
                    : "Save to Wishlist"}
                </button>

                {/* REPORT BUTTON */}
                <div className="pt-6 border-t border-gray-100 mt-6">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Flag size={14} /> Report this listing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
        price={property.price_per_month}
      />

      {/* REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Flag className="text-red-500" /> Report Listing
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Help us keep CampusAcc safe. Let us know what is wrong with this
              listing.
            </p>

            {reportStatus === "success" ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 mb-4 border border-green-200">
                <CheckCircle
                  size={24}
                  className="text-green-500 flex-shrink-0"
                />
                <div>
                  <h4 className="font-bold">Report Submitted</h4>
                  <p className="text-sm">
                    Our admin team will review this shortly. Thank you!
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                {reportStatus === "error" && (
                  <p className="text-red-500 text-sm font-medium">
                    Failed to submit report. Please try again.
                  </p>
                )}
                {reportStatus === "unauthorized" && (
                  <p className="text-red-500 text-sm font-medium">
                    You must be logged in to report a listing.
                  </p>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why are you reporting this?
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
                  >
                    <option value="fake">Fake Listing / Scam</option>
                    <option value="unavailable">
                      Property is already taken
                    </option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="other">Other Issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please provide any extra context..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                >
                  Submit Report
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
