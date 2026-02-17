import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Building,
  GraduationCap,
  Loader2,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student", // Default
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // For displaying errors inline
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. REGISTER THE USER
      await axios.post(
        import.meta.env.VITE_API_URL + "/api/register/",
        formData,
      );

      // 2. AUTO-LOGIN (Get Token)
      const loginRes = await axios.post(
        import.meta.env.VITE_API_URL + "/api/token/",
        {
          username: formData.username,
          password: formData.password,
        },
      );

      const accessToken = loginRes.data.access;
      const refreshToken = loginRes.data.refresh;

      // 3. SAVE TO STORAGE
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("username", formData.username);
      localStorage.setItem("role", formData.role); // We already know the role from the form!

      // 4. REDIRECT BASED ON ROLE
      if (formData.role === "landlord") {
        navigate("/dashboard");
      } else {
        navigate("/"); // Students go to Home
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.username) {
        setError("That username is already taken.");
      } else {
        setError("Registration failed. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Join CampusAcc today</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Username"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          {/* ROLE SELECTOR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "student" })}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  formData.role === "student"
                    ? "border-primary bg-blue-50 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-500"
                }`}
              >
                <GraduationCap size={24} className="mb-2" />
                <span className="font-bold text-sm">Student</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "landlord" })}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  formData.role === "landlord"
                    ? "border-primary bg-blue-50 text-primary"
                    : "border-gray-200 hover:border-gray-300 text-gray-500"
                }`}
              >
                <Building size={24} className="mb-2" />
                <span className="font-bold text-sm">Landlord</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
