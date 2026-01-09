import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// REPLACE WITH YOUR CAMPUS COORDS
const UNI_LAT = -17.784;
const UNI_LNG = 31.053;

function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [distance, setDistance] = useState(null);

  // New State for the Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState(""); // "success" or "error"

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

  const fetchProperty = () => {
    axios
      .get(`https://campus-acc-backend.onrender.com/api/properties/${id}/`)
      .then((res) => {
        setProperty(res.data);
        if (res.data.latitude && res.data.longitude) {
          setDistance(
            calculateDistance(
              UNI_LAT,
              UNI_LNG,
              res.data.latitude,
              res.data.longitude
            )
          );
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const handleSubmitReview = (e) => {
    e.preventDefault();

    // 1. Get the token from storage
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login to write a review!");
      return;
    }

    axios
      .post(
        `https://campus-acc-backend.onrender.com/api/properties/${id}/review/`,
        {
          rating: rating,
          comment: comment,
        },
        {
          // 2. Attach the token to the "Authorization" header
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setReviewStatus("success");
        setComment("");
        fetchProperty();
      })
      .catch((err) => {
        console.error(err);
        setReviewStatus("error");
      });
  };

  if (!property) return <h2>Loading details...</h2>;

  return (
    <div
      className="detail-container"
      style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}
    >
      <h1>{property.title}</h1>

      {distance && (
        <div
          style={{
            backgroundColor: "#e0f7fa",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
            color: "#006064",
          }}
        >
          <strong>🚶 Distance to Campus:</strong> {distance} km
        </div>
      )}

      <div className="main-image" style={{ marginBottom: "20px" }}>
        {property.images.length > 0 && (
          <img
            src={property.images[0].image}
            alt={property.title}
            style={{
              width: "100%",
              borderRadius: "8px",
              maxHeight: "400px",
              objectFit: "cover",
            }}
          />
        )}
      </div>

      <div
        className="info-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <div className="info-text">
          <h2>${property.price_per_month} / month</h2>
          <p>{property.description}</p>
          <p>📍 {property.address}</p>

          {/* --- NEW: REVIEWS SECTION --- */}
          <hr style={{ margin: "20px 0" }} />
          <h3>Reviews ({property.reviews ? property.reviews.length : 0})</h3>

          {property.reviews &&
            property.reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  backgroundColor: "#f9f9f9",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                }}
              >
                <strong>{"⭐".repeat(review.rating)}</strong>
                <p style={{ margin: "5px 0" }}>{review.comment}</p>
                <small style={{ color: "#666" }}>- User</small>
              </div>
            ))}

          {/* --- NEW: ADD REVIEW FORM --- */}
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h4>Write a Review</h4>
            {reviewStatus === "error" && (
              <p style={{ color: "red" }}>You must be logged in to review!</p>
            )}
            {reviewStatus === "success" && (
              <p style={{ color: "green" }}>Review posted!</p>
            )}

            <form onSubmit={handleSubmitReview}>
              <label>Rating: </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                style={{ marginBottom: "10px" }}
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <br />
              <textarea
                placeholder="How is the landlord? Is it noisy?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ width: "100%", height: "80px", marginBottom: "10px" }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "8px 15px",
                  borderRadius: "4px",
                }}
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>

        <div
          className="map-container"
          style={{ height: "400px", borderRadius: "8px", overflow: "hidden" }}
        >
          {property.latitude ? (
            <MapContainer
              center={[property.latitude, property.longitude]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[property.latitude, property.longitude]}>
                <Popup>{property.title}</Popup>
              </Marker>
              <Marker position={[UNI_LAT, UNI_LNG]}>
                <Popup>Campus</Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p>No Map Data</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyDetail;
