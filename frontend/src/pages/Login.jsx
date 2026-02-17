import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, ArrowRight, Loader2 } from "lucide-react";

// Image for the right side
const LOGIN_IMAGE =
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2062&auto=format&fit=crop";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Get Token
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/token/",
        {
          username,
          password,
        },
      );

      const accessToken = res.data.access;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("username", username);

      // 2. Fetch User Role (FIXED: Dash changed to slash to match backend)
      let role = "student";
      try {
        const userRes = await axios.get(
          import.meta.env.VITE_API_URL + "/api/user/info/",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        role = userRes.data.role;
        localStorage.setItem("role", role);
      } catch (roleErr) {
        console.error("Failed to fetch role, defaulting to student.", roleErr);
        localStorage.setItem("role", "student");
      }

      // 3. Smart Redirect
      if (role === "landlord") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-3.5 text-gray-400"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  placeholder="••••••••"
                  required
                />
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
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
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
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

      {/* RIGHT SIDE: Image */}
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
