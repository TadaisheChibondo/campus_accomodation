import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, Loader2, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const { uid, token } = useParams(); // Gets the special codes from the URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `import.meta.env.VITE_API_URL/api/password-reset-confirm/${uid}/${token}/`,
        {
          new_password: newPassword,
        },
      );
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000); // Send them to login after 3 seconds
    } catch (err) {
      setError(
        "This link is invalid or has expired. Please request a new one.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Create New Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          {success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Password Reset!
              </h3>
              <p className="text-gray-500 mb-6">
                Your password has been successfully updated. Redirecting to
                login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg text-center">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute top-3 left-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    placeholder="••••••••"
                    minLength="8"
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
                  "Save New Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default ResetPassword;
