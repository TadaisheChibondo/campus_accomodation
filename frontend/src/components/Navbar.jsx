import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, User, LogOut, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation(); // This makes the navbar re-render when route changes

  // Check login state whenever the route changes
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");

    if (token) {
      setCurrentUser({ name: username || "Student" });
    } else {
      setCurrentUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    setCurrentUser(null);
    setIsOpen(false); // Close mobile menu if open
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 backdrop-blur-md bg-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              CA
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Campus<span className="text-primary">Acc</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" icon={<Home size={18} />} text="Home" />
            <NavLink
              to="/listings"
              icon={<User size={18} />}
              text="Find a Room"
            />

            {/* CONDITIONAL RENDERING: LOGGED IN vs LOGGED OUT */}
            {currentUser ? (
              <div className="flex items-center gap-6">
                <span className="text-gray-900 font-medium">
                  Hi, {currentUser.name}
                </span>
                <Link
                  to="/my-bookings"
                  className="text-gray-600 hover:text-primary font-medium transition-colors"
                >
                  My Requests
                </Link>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-primary font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/about"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition-colors"
                >
                  <PlusCircle size={18} />
                  About
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-500/30"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl"
          >
            <div className="flex flex-col space-y-4 p-6">
              <MobileLink to="/" text="Home" onClick={() => setIsOpen(false)} />
              <MobileLink
                to="/listings"
                text="Find a Room"
                onClick={() => setIsOpen(false)}
              />

              {/* MOBILE CONDITIONAL RENDERING */}
              {currentUser ? (
                <>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">
                      Signed in as {currentUser.name}
                    </p>
                    <MobileLink
                      to="/add-property"
                      text="+ List a Property"
                      onClick={() => setIsOpen(false)}
                    />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-lg font-medium text-red-500 hover:text-red-700 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <MobileLink
                  to="/login"
                  text="Sign In"
                  onClick={() => setIsOpen(false)}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Helper Components
const NavLink = ({ to, text, icon }) => (
  <Link
    to={to}
    className="flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition-colors"
  >
    {icon}
    {text}
  </Link>
);

const MobileLink = ({ to, text, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="text-lg font-medium text-gray-700 hover:text-primary"
  >
    {text}
  </Link>
);

export default Navbar;
