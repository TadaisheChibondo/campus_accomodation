// frontend/src/pages/Home.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://campus-acc-backend.onrender.com/api/properties/")
      .then((res) => {
        setProperties(res.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Loading...</h2>;

  // inside Home.jsx return (...)

  return (
    <div>
      {/* 1. HERO SECTION */}
      <div
        style={{
          backgroundColor: "#3498db",
          color: "white",
          padding: "60px 20px",
          textAlign: "center",
          marginBottom: "40px",
          borderRadius: "0 0 20px 20px",
          backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Cool gradient
        }}
      >
        <h1 style={{ fontSize: "3em", margin: "0 0 10px 0" }}>
          Find Your Student Home
        </h1>
        <p style={{ fontSize: "1.2em", opacity: "0.9" }}>
          Safe, affordable, and close to campus.
        </p>
      </div>

      {/* 2. THE GRID */}
      <div className="app-container">
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Latest Listings</h2>

        {loading && (
          <p style={{ textAlign: "center", color: "#666" }}>
            Scanning for houses...
          </p>
        )}

        <div className="property-grid">
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div style={{ position: "relative" }}>
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0].image}
                    alt={property.title}
                    className="property-image"
                  />
                ) : (
                  <div
                    className="no-image"
                    style={{
                      height: "200px",
                      backgroundColor: "#eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#888",
                    }}
                  >
                    No Image
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "15px",
                    fontSize: "0.8em",
                  }}
                >
                  {property.is_available ? "Available" : "Taken"}
                </div>
              </div>

              <div className="property-info">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3 style={{ margin: "0 0 5px 0", fontSize: "1.2em" }}>
                    {property.title}
                  </h3>
                  <span
                    style={{
                      color: "#27ae60",
                      fontWeight: "bold",
                      fontSize: "1.1em",
                    }}
                  >
                    ${property.price_per_month}
                  </span>
                </div>
                <p
                  style={{ color: "#666", fontSize: "0.9em", margin: "5px 0" }}
                >
                  📍 {property.address}
                </p>

                <Link
                  to={`/property/${property.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <button
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "10px",
                      backgroundColor: "#333",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      transition: "background 0.3s",
                    }}
                  >
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
