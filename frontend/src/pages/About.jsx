import React from "react";
// 1. IMPORT THE IMAGE HERE
// (Make sure the file name matches exactly, including .jpg or .png)
import profilePic from "../assets/profile.jpg";

function About() {
  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
      {/* ... (Mission Section stays the same) ... */}
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          marginBottom: "40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              color: "#2c3e50",
              fontSize: "2.5em",
              margin: "0 0 10px 0",
            }}
          >
            About Campus Accommodation
          </h1>
          <div
            style={{
              width: "60px",
              height: "4px",
              backgroundColor: "#3498db",
              margin: "0 auto",
            }}
          ></div>
        </div>

        <div
          style={{
            marginBottom: "30px",
            lineHeight: "1.8",
            color: "#555",
            fontSize: "1.1em",
          }}
        >
          <p>
            Finding accommodation shouldn't be the hardest part of university.
            We built this platform to bridge the gap between students looking
            for a safe home and landlords offering quality spaces.
          </p>
          <p style={{ marginTop: "15px" }}>
            Our goal is to bring transparency, trust, and ease to the student
            housing market in Zimbabwe.
          </p>
        </div>

        {/* ... (Features Grid can stay here) ... */}
      </div>

      {/* 2. MEET THE DEVELOPER */}
      <div
        style={{
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "40px",
          borderRadius: "15px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "2em", marginBottom: "30px" }}>
          Meet the Developer
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "40px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Profile Image */}
          <div style={{ flexShrink: 0 }}>
            <img
              // 3. USE THE IMPORTED VARIABLE HERE
              src={profilePic}
              alt="Tadaishe Chibondo"
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                border: "4px solid #3498db",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Bio Text */}
          <div style={{ maxWidth: "500px", textAlign: "left" }}>
            <h3 style={{ fontSize: "1.8em", margin: "0", color: "#3498db" }}>
              Tadaishe Chibondo
            </h3>
            <p
              style={{
                fontStyle: "italic",
                color: "#bdc3c7",
                marginTop: "5px",
              }}
            >
              Full Stack Developer & CS Student
            </p>

            <p style={{ lineHeight: "1.6", marginBottom: "20px" }}>
              Hi, I'm Tadaishe. I am a 21-year-old Computer Science student
              passionate about building software that solves real-world
              problems.
            </p>
            <p style={{ lineHeight: "1.6", marginBottom: "20px" }}>
              I built this entire platform from scratch using{" "}
              <strong>React, Django, and PostgreSQL</strong>. Beyond web
              development, I specialize in{" "}
              <strong>Algorithmic Trading (Python/Forex)</strong> and have a
              strong interest in <strong>Cybersecurity</strong> and network
              defense.
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <span style={pillStyle}>⚛️ React.js</span>
              <span style={pillStyle}>🐍 Python (Django)</span>
              <span style={pillStyle}>🐘 PostgreSQL</span>
              <span style={pillStyle}>☁️ Cloud Architecture</span>
            </div>
            <h3>Connect with Me</h3>
            <div style={{ display: "flex", gap: "20px" }}>
              <a
                href="https://www.linkedin.com/in/tadaishe-chibondo-915247349?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/TadaisheChibondo"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                GitHub
              </a>
              <a
                href="https://tadaishe-chibondo.vercel.app/"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const featureCardStyle = {
  padding: "20px",
  backgroundColor: "#f8f9fa",
  borderRadius: "10px",
  textAlign: "center",
  color: "#555",
  border: "1px solid #eee",
};

const pillStyle = {
  backgroundColor: "rgba(255,255,255,0.1)",
  padding: "5px 15px",
  borderRadius: "20px",
  fontSize: "0.9em",
  border: "1px solid rgba(255,255,255,0.2)",
};

export default About;
