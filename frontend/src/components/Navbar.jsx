import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in
  const isAuthenticated = !!localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    alert("You have been logged out.");
    navigate("/login");
  };

  return (
    <nav style={{ backgroundColor: "white", borderBottom: "1px solid #eee" }}>
      {/* Inner container limits width to match the rest of the app */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* ... Keep your existing Logo and Links code here ... */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#333",
            fontWeight: "bold",
            fontSize: "1.5em",
          }}
        >
          🎓 Campus Accommodation
        </Link>

        <div
          className="nav-links"
          style={{ display: "flex", gap: "15px", alignItems: "center" }}
        >
          {/* ... (Your existing isAuthenticated logic) ... */}
          {isAuthenticated ? (
            <>
              <Link to="/add-property">
                <button
                  style={{
                    backgroundColor: "transparent",
                    color: "#3498db",
                    border: "2px solid #3498db",
                    padding: "8px 15px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  + List Your Home
                </button>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  color: "#555",
                  fontWeight: "500",
                }}
              >
                Login
              </Link>
              <Link
                to="/about"
                style={{
                  textDecoration: "none",
                  color: "#555",
                  fontWeight: "500",
                  marginRight: "15px",
                }}
              >
                About Us
              </Link>

              <Link to="/register">
                <button
                  style={{
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    padding: "10px 15px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
