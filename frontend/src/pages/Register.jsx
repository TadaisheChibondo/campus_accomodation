import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    // 1. First, try to register the user
    axios
      .post("https://campus-acc-backend.onrender.com/api/register/", {
        username,
        password,
        email,
      })
      .then((res) => {
        console.log("Registration successful, logging in now...");

        // 2. IF registration works, immediately try to log in
        // We use the same 'username' and 'password' variables from the form state
        return axios.post(
          "https://campus-acc-backend.onrender.com/api/token/",
          {
            username: username,
            password: password,
          }
        );
      })
      .then((res) => {
        // 3. IF login works, save the token just like we do in the Login page
        console.log("Auto-login successful!");
        localStorage.setItem("access_token", res.data.access);

        // 4. Redirect straight to the Home page
        alert("Welcome! You are now registered and logged in.");
        navigate("/");
      })
      .catch((err) => {
        // This catches errors from EITHER the register OR the login step
        console.error(err);
        alert("Something went wrong. Username might be taken.");
      });
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>Student Registration</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
          }}
        >
          Register & Login
        </button>
      </form>
    </div>
  );
}

export default Register;
