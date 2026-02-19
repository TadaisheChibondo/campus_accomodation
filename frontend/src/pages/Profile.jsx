import { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Phone,
  BookOpen,
  GraduationCap,
  Upload,
  Loader2,
  Save,
  Building,
  FileText,
} from "lucide-react";

const Profile = () => {
  // --- FIXED: Standardized API URL variable ---
  const API_URL = import.meta.env.VITE_API_URL;

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
    phone_number: "",
    program: "",
    year_of_study: "",
    bio: "",
    company_name: "", // <-- New fields added to state
    profile_picture: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      try {
        // --- FIXED: Using backticks and template literals ---
        const res = await axios.get(`${API_URL}/api/user/info/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          username: res.data.username || "",
          email: res.data.email || "",
          role: res.data.role || "",
          phone_number: res.data.phone_number || "",
          program: res.data.program || "",
          year_of_study: res.data.year_of_study || "",
          bio: res.data.bio || "",
          company_name: res.data.company_name || "",
          profile_picture: res.data.profile_picture || null,
        });
        setPreview(res.data.profile_picture);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [API_URL]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const token = localStorage.getItem("access_token");

    const formData = new FormData();
    formData.append("phone_number", profile.phone_number);

    // Send data based on role
    if (profile.role === "student") {
      formData.append("program", profile.program);
      formData.append("year_of_study", profile.year_of_study);
    } else if (profile.role === "landlord") {
      formData.append("bio", profile.bio);
      formData.append("company_name", profile.company_name);
    }

    if (imageFile) {
      formData.append("profile_picture", imageFile);
    }

    try {
      // --- FIXED: Using backticks and template literals ---
      const res = await axios.patch(`${API_URL}/api/user/info/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Profile updated successfully!");
      setProfile((prev) => ({
        ...prev,
        profile_picture: res.data.profile_picture,
      }));
    } catch (err) {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gray-900 px-8 py-10 text-center relative">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden mx-auto flex items-center justify-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                <Upload size={16} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold text-white mt-4">
              {profile.username}
            </h2>
            <p className="text-gray-400 capitalize">{profile.role}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {message && (
              <div
                className={`p-4 rounded-xl text-sm font-bold text-center ${message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {message}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Read Only)
                </label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute top-3 left-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="e.g. +263 77..."
                    value={profile.phone_number}
                    onChange={(e) =>
                      setProfile({ ...profile, phone_number: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* --- CONDITIONAL RENDER: STUDENT FIELDS --- */}
              {profile.role === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Program of Study
                    </label>
                    <div className="relative">
                      <BookOpen
                        className="absolute top-3 left-3 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={profile.program}
                        onChange={(e) =>
                          setProfile({ ...profile, program: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year of Study
                    </label>
                    <div className="relative">
                      <GraduationCap
                        className="absolute top-3 left-3 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="e.g. Year 2"
                        value={profile.year_of_study}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            year_of_study: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* --- CONDITIONAL RENDER: LANDLORD FIELDS --- */}
              {profile.role === "landlord" && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company / Agency Name (Optional)
                    </label>
                    <div className="relative">
                      <Building
                        className="absolute top-3 left-3 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="e.g. Student Haven Properties"
                        value={profile.company_name}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            company_name: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      About Me / House Rules
                    </label>
                    <div className="relative">
                      <FileText
                        className="absolute top-3 left-3 text-gray-400"
                        size={20}
                      />
                      <textarea
                        placeholder="Tell students a bit about yourself or your rules..."
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all h-24"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-blue-700 shadow-lg shadow-blue-500/30"}`}
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Profile;