import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddProperty() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price_per_month: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper to get current GPS location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        alert("Location grabbed!");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");

    try {
      // STEP 1: Create the Property
      const propertyRes = await axios.post(
        "https://campus-acc-backend.onrender.com/api/properties/",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const propertyId = propertyRes.data.id;
      console.log("Property Created:", propertyId);

      // STEP 2: Upload Images (if any)
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imageData = new FormData();
          imageData.append("property", propertyId);
          imageData.append("image", images[i]);

          await axios.post(
            "https://campus-acc-backend.onrender.com/api/upload-image/",
            imageData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        }
      }

      alert("Property and Images Uploaded Successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Failed to upload. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#333" }}>
        🏠 List Your Property
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="text"
          placeholder="Title (e.g. Sunny Cottage)"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          style={inputStyle}
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          style={{ ...inputStyle, height: "100px" }}
        />
        <input
          type="number"
          placeholder="Price per month ($)"
          value={formData.price_per_month}
          onChange={(e) =>
            setFormData({ ...formData, price_per_month: e.target.value })
          }
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          required
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Latitude"
            value={formData.latitude}
            readOnly
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Longitude"
            value={formData.longitude}
            readOnly
            style={inputStyle}
          />
          <button
            type="button"
            onClick={handleGetLocation}
            style={btnSecondary}
          >
            📍 Get My Location
          </button>
        </div>

        <label>Upload Images:</label>
        <input
          type="file"
          multiple
          onChange={(e) => setImages(e.target.files)}
        />

        <button type="submit" disabled={loading} style={btnPrimary}>
          {loading ? "Uploading..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}

// Simple Styles for this page
const inputStyle = {
  padding: "12px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "16px",
};
const btnPrimary = {
  padding: "12px",
  backgroundColor: "#2ecc71",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};
const btnSecondary = {
  padding: "12px",
  backgroundColor: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default AddProperty;
