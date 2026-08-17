import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style/UserSignup.css";
import BASE_URL from "../config";

const UserSignup = () => {
  const navigate = useNavigate();

  // form state
  const [formData, setFormData] = useState({
    rollNumber: "",
    password: "",
    confirmPassword: "",
  });

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/user/signup`, {
        rollNoOrPlate: formData.rollNumber,
        password: formData.password,
      });

      // ✅ Save token in localStorage
      const token = res.data.token;
      localStorage.setItem("token", token);

      console.log("Response:", res.data);
      alert("Signup successful! Token saved.");
      navigate("/userlogin");
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      alert("Signup failed! Please try again.");
    }
  };

  return (
    <div className="signup-page">
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="navbar-title">User</h2>
        <div className="navbar-buttons">
          <Link to="/userlogin"><button className="nav-btn">Login</button></Link>
          <Link to="/usersignup"><button className="nav-btn">Signup</button></Link>
        </div>
      </nav>

      {/* Body */}
      <div className="signup-container">
        <h1 className="signup-heading">User Signup</h1>
        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="rollNumber"
            placeholder="Roll Number"
            required
            value={formData.rollNumber}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button type="submit" className="submit-btn">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSignup;
