import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("import.meta.env.VITE_API_URL/api/password-reset/", {
        email,
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          {success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Check your email
              </h3>
              <p className="text-gray-500 mb-6">
                If an account exists for {email}, we have sent a password reset
                link.
              </p>
              <Link
                to="/login"
                className="text-primary font-bold hover:underline"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute top-3 left-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-primary hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
              <div className="text-center">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary font-medium"
                >
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
