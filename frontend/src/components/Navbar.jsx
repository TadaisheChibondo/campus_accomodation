import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  User,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  List,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

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
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 backdrop-blur-md bg-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              CA
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Campus<span className="text-primary">Acc</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" icon={<Home size={18} />} text="Home" />
            <NavLink
              to="/listings"
              icon={<List size={18} />}
              text="Find a Room"
            />
            <NavLink to="/about" icon={<Info size={18} />} text="About" />{" "}
            {/* <--- ADDED THIS */}
            {/* LOGGED IN STATE */}
            {currentUser ? (
              <div className="flex items-center gap-6 pl-6 border-l border-gray-200">
                <span className="text-gray-900 font-medium cursor-default">
                  Hi, {currentUser.name}
                </span>

                <Link
                  to="/my-bookings"
                  className="text-gray-600 hover:text-primary font-medium transition-colors text-sm"
                >
                  My Requests
                </Link>

                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-primary font-medium transition-colors text-sm"
                >
                  Dashboard
                </Link>

                <Link
                  to="/add-property"
                  className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold hover:bg-primary hover:text-white transition-all"
                >
                  <PlusCircle size={18} />
                  List Property
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              /* LOGGED OUT STATE */
              <Link
                to="/login"
                className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-500/30"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary transition-colors p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              <MobileLink
                to="/"
                text="Home"
                onClick={() => setIsOpen(false)}
                icon={<Home size={20} />}
              />
              <MobileLink
                to="/listings"
                text="Find a Room"
                onClick={() => setIsOpen(false)}
                icon={<List size={20} />}
              />
              <MobileLink
                to="/about"
                text="About"
                onClick={() => setIsOpen(false)}
                icon={<Info size={20} />}
              />{" "}
              {/* <--- ADDED THIS */}
              {currentUser ? (
                <div className="pt-4 mt-2 border-t border-gray-100 space-y-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <User size={16} />
                    <span className="text-sm font-medium">
                      Signed in as {currentUser.name}
                    </span>
                  </div>

                  <MobileLink
                    to="/my-bookings"
                    text="My Requests"
                    onClick={() => setIsOpen(false)}
                    highlight
                  />
                  <MobileLink
                    to="/dashboard"
                    text="Landlord Dashboard"
                    onClick={() => setIsOpen(false)}
                    highlight
                  />

                  <Link
                    to="/add-property"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold"
                  >
                    <PlusCircle size={20} /> List a Property
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500 font-medium py-2"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full bg-primary text-white py-3 rounded-xl font-bold"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- HELPER COMPONENTS ---
const NavLink = ({ to, text, icon }) => (
  <Link
    to={to}
    className="flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition-colors"
  >
    {icon}
    {text}
  </Link>
);

const MobileLink = ({ to, text, onClick, icon, highlight }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 text-lg font-medium ${
      highlight ? "text-primary" : "text-gray-700 hover:text-primary"
    }`}
  >
    {icon}
    {text}
  </Link>
);

export default Navbar;
