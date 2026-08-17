import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";


import "./style/UserLogin.css";

const UserLogin = () => {
  const navigate = useNavigate();

  // form data
  const [formData, setFormData] = useState({
    rollNo: "",
    password: "",
  });

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/user/login`, {
        rollNoOrPlate: formData.rollNo,
        password: formData.password,
      });

      // save token in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userType", "user");         // 👈 Add this
      localStorage.setItem("rollNoOrPlate", formData.rollNo); // 👈 Add this
      localStorage.setItem("role", "user");  // or "user"

      alert("Login successful!");
      navigate("/home");
    } catch (err) {
      console.error("Login failed:", err.response ? err.response.data : err.message);
      alert("Invalid roll number or password!");
    }
  };

  return (
    <div className="user-login-page">
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <h2 className="nav-left">User Login</h2>
        <div className="nav-right">
          <Link to="/userlogin">
            <button className="nav-btn">Login</button>
          </Link>
          <Link to="/usersignup">
            <button className="nav-btn">Signup</button>
          </Link>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="content">
        <h1 className="title">User Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="rollNo"
            placeholder="Roll Number"
            value={formData.rollNo}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>
      </main>
    </div>
  );
};

export default UserLogin;
