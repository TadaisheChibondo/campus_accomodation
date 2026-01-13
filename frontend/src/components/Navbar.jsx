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
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🎓 Campus Accommodation
        </Link>

        {/* kept your existing logic, just cleaner tags */}
        <div className="nav-links">
          <Link to="/about" className="nav-link">
            About Us
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/add-property">
                <button className="btn-outline">+ List Your Home</button>
              </Link>
              <button onClick={handleLogout} className="btn-danger">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register">
                <button className="btn-primary">Register</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
