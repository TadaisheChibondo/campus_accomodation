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
  Phone,
  BookOpen,
  FileText,
} from "lucide-react";

const Register = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student", // Default
    phone_number: "",
    program: "",
    year_of_study: "",
    company_name: "",
    bio: "",
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. T&C Validation
    if (!formData.termsAccepted) {
      setError("You must accept the Terms and Conditions to continue.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // STEP 1: SEND ALL DATA IN ONE SINGLE PAYLOAD
      const registerPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone_number: formData.phone_number,
        // Send role-specific data safely
        program: formData.role === "student" ? formData.program : "",
        year_of_study:
          formData.role === "student" ? formData.year_of_study : "",
        company_name: formData.role === "landlord" ? formData.company_name : "",
        bio: formData.role === "landlord" ? formData.bio : "",
      };

      await axios.post(`${API_URL}/api/register/`, registerPayload);

      // STEP 2: AUTO-LOGIN (Get Token)
      const loginRes = await axios.post(`${API_URL}/api/token/`, {
        username: formData.username,
        password: formData.password,
      });

      const accessToken = loginRes.data.access;
      const refreshToken = loginRes.data.refresh;

      // STEP 3: SAVE TO STORAGE & REDIRECT
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("username", formData.username);
      localStorage.setItem("role", formData.role);

      // REDIRECT BASED ON ROLE
      if (formData.role === "landlord") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.username) {
        setError("That username is already taken.");
      } else {
        setError(
          "Registration failed. Please check your connection or details.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 my-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Join CampusAcc today</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: ACCOUNT DETAILS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
              Account Login
            </h3>
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
          </div>

          {/* SECTION 2: ROLE SELECTOR */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">
              I am a...
            </h3>
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

          {/* SECTION 3: DYNAMIC PROFILE DETAILS */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
              Profile Details
            </h3>

            <div className="relative">
              <Phone
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Phone Number (e.g. +263 77...)"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
            </div>

            {formData.role === "student" ? (
              <>
                <div className="relative">
                  <BookOpen
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Program of Study (e.g. Computer Science)"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.program}
                    onChange={(e) =>
                      setFormData({ ...formData, program: e.target.value })
                    }
                  />
                </div>
                <div className="relative">
                  <GraduationCap
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Year of Study (e.g. Year 2)"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.year_of_study}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year_of_study: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <Building
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Company/Agency Name (Optional)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                  />
                </div>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <textarea
                    placeholder="Tell students about your rules or agency..."
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none h-20 resize-none"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </div>

          {/* SECTION 4: TERMS AND CONDITIONS */}
          <div className="pt-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.termsAccepted}
                onChange={(e) =>
                  setFormData({ ...formData, termsAccepted: e.target.checked })
                }
                className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
              />
              <span className="text-gray-600 text-sm leading-relaxed">
                I agree to the{" "}
                <Link
                  to="#"
                  className="text-primary hover:underline font-medium"
                >
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  to="#"
                  className="text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                . I understand that providing false information may result in an
                account ban.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30"
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
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
