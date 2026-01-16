import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, ArrowRight } from "lucide-react";

// Image for the right side
const LOGIN_IMAGE =
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2062&auto=format&fit=crop";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    axios
      .post("https://campus-acc-backend.onrender.com/api/token/", {
        username,
        password,
      })
      .then((res) => {
        // 1. Save Token
        localStorage.setItem("access_token", res.data.access);

        // 2. Save Username (So Navbar can display it)
        localStorage.setItem("username", username);

        // 3. Redirect
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
        setError("Invalid username or password. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE: Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500">
              Please enter your details to sign in.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-primary hover:bg-blue-700 shadow-blue-500/30"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            New here?{" "}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Image (Hidden on Mobile) */}
      <div className="hidden md:block w-1/2 relative overflow-hidden">
        <img
          src={LOGIN_IMAGE}
          alt="Student Life"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>

        <div className="absolute bottom-10 left-10 right-10 text-white p-8 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20">
          <p className="text-xl font-medium mb-4">
            "The best way to predict the future is to create it."
          </p>
          <p className="font-bold opacity-80">- Peter Drucker</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
