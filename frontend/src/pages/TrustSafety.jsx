import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, UserCheck, AlertTriangle, CheckCircle, Eye, Home } from "lucide-react";

const TrustSafety = () => {
  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-primary rounded-full mb-4 shadow-inner">
            <Shield size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Trust & Safety</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            At CampusAcc, your security and privacy are our top priorities. Here is how we ensure a safe and transparent marketplace for our university community.
          </p>
        </div>

        {/* SECTION 1: FOR STUDENTS */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <UserCheck className="text-primary" /> Protecting Our Students
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" /> Verified Landlords
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We review landlord profiles to ensure they are legitimate. Look for landlords with complete profiles and positive student reviews.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" /> Transparent Reviews
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Only logged-in students can leave reviews. We never delete honest, constructive reviews, ensuring you get the real picture before moving in.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: FOR LANDLORDS */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Home className="text-primary" /> Protecting Our Landlords
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" /> Real Student Profiles
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                When a student requests to book, you get access to their academic profile, program of study, and verified contact information.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" /> Total Control
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                You have the final say. You can accept or reject any booking request based on your own screening process.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: PRIVACY & DATA */}
        <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-10 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lock className="text-blue-400" /> Your Data Privacy
          </h2>
          <div className="space-y-6">
            <p className="text-gray-300 text-sm leading-relaxed">
              We collect only the information strictly necessary to facilitate safe housing connections. 
              We will <strong>never</strong> sell your personal data, phone number, or academic details to third-party advertisers.
            </p>
            <div className="flex items-start gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
              <Eye className="text-blue-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-bold text-sm mb-1">Who sees your data?</h4>
                <p className="text-xs text-gray-400">
                  Landlords only see your phone number and academic details <em>after</em> you request to book their property. 
                  General visitors can only see landlord public profiles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* REPORTING SECTION */}
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-red-900 mb-2">See something suspicious?</h3>
          <p className="text-red-700 text-sm mb-6 max-w-xl mx-auto">
            If you encounter a listing that seems fake, a landlord requesting money off-platform before viewing, or inappropriate behavior, please report it immediately.
          </p>
          <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-red-700 transition-colors">
            Contact Support
          </button>
        </div>

      </div>
    </div>
  );
};

export default TrustSafety;