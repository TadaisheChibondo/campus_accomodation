import Listings from "./pages/Listings";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // Import our new "Shell"
import Home from "./pages/Home";
import PropertyDetail from "./pages/PropertyDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddProperty from "./pages/AddProperty";
import About from "./pages/About";
import MyBookings from "./pages/MyBookings";
import LandlordDashboard from "./pages/LandlordDashboard";
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import TrustSafety from './pages/TrustSafety';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      {/* The Layout wraps all routes. 
        It automatically adds the Navbar and handles the padding/spacing.
      */}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/about" element={<About />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/dashboard" element={<LandlordDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/trust" element={<TrustSafety />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
