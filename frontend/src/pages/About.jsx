import React from "react";
import {
  Github,
  Linkedin,
  Globe,
  Code2,
  Shield,
  TrendingUp,
  Terminal,
} from "lucide-react";
import profilePic from "../assets/profile.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* --- SECTION 1: MISSION STATEMENT --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            About Campus Accommodation
          </h1>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full mb-8"></div>

          <div className="max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed space-y-6">
            <p>
              Finding accommodation shouldn't be the hardest part of university.
              We built this platform to bridge the gap between students looking
              for a safe home and landlords offering quality spaces.
            </p>
            <p>
              Our goal is to bring transparency, trust, and ease to the student
              housing market in Zimbabwe.
            </p>
          </div>
        </div>

        {/* --- SECTION 2: MEET THE DEVELOPER --- */}
        <div className="bg-[#0f172a] rounded-3xl shadow-xl overflow-hidden border border-slate-800">
          <div className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center md:text-left">
              Meet the Developer
            </h2>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary blur-lg opacity-50 rounded-full"></div>
                  <img
                    src={profilePic}
                    alt="Tadaishe Chibondo"
                    className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-slate-800 object-cover shadow-2xl"
                  />
                </div>
              </div>

              {/* Bio Text */}
              <div className="flex-1 text-center md:text-left text-slate-300">
                <h3 className="text-2xl font-bold text-white mb-1">
                  Tadaishe Chibondo
                </h3>
                <p className="text-primary font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                  <Terminal size={18} /> Full Stack Developer & CS Student
                </p>

                <div className="space-y-4 leading-relaxed text-slate-400 mb-8">
                  <p>
                    Hi, I'm Tadaishe. I am a 21-year-old Computer Science
                    student passionate about building software that solves
                    real-world problems.
                  </p>
                  <p>
                    I built this entire platform from scratch using{" "}
                    <span className="text-white font-semibold">
                      React, Django, and PostgreSQL
                    </span>
                    . Beyond web development, I specialize in{" "}
                    <span className="text-white font-semibold">
                      Algorithmic Trading (Python/Forex)
                    </span>{" "}
                    and have a strong interest in{" "}
                    <span className="text-white font-semibold">
                      Cybersecurity
                    </span>{" "}
                    and network defense.
                  </p>
                </div>

                {/* Skill Badges */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-slate-200">
                    <Code2 size={14} className="text-blue-400" /> React & Django
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-slate-200">
                    <TrendingUp size={14} className="text-green-400" />{" "}
                    Algorithmic Trading
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-slate-200">
                    <Shield size={14} className="text-purple-400" />{" "}
                    Cybersecurity
                  </span>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <a
                    href="https://www.linkedin.com/in/tadaishe-chibondo-915247349"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-sm font-bold transition-colors"
                  >
                    <Linkedin size={18} /> LinkedIn
                  </a>
                  <a
                    href="https://github.com/TadaisheChibondo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-sm font-bold transition-colors"
                  >
                    <Github size={18} /> GitHub
                  </a>
                  <a
                    href="https://tadaishechibondo.co.zw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <Globe size={18} /> Portfolio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
