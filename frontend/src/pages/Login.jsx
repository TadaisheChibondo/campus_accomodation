import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
// Note: We don't need inline styles anymore because we added App.css!

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post("http://127.0.0.1:8000/api/token/", { username, password })
      .then((res) => {
        localStorage.setItem("access_token", res.data.access);
        navigate("/");
      })
      .catch((err) => alert("Login failed!"));
  };

  return (
    // This wrapper centers everything
    <div className="auth-container">
      <div className="auth-box">
        <h2
          style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}
        >
          Welcome Back
        </h2>

        <form onSubmit={handleLogin}>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />

          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#666" }}>
          New here?{" "}
          <Link to="/register" style={{ color: "#3498db" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
