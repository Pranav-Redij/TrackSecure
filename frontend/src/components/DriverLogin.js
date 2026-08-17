import "./style/DriverLogin.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import axios from "axios";
import BASE_URL from "../config";


const DriverLogin = () => {
  const navigate = useNavigate();

  // form state
  const [formData, setFormData] = useState({
    carNumber: "",
    password: "",
  });

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/driver/login`,{
        rollNoOrPlate: formData.carNumber,
        password: formData.password,
      });

      // ✅ Save token and info in localStorage
      const token = res.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userType", "driver");         // 👈 Add this
      localStorage.setItem("rollNoOrPlate", formData.carNumber); // 👈 Add this
      localStorage.setItem("role", "driver");               // 👈 Add this

      console.log("Login successful. Token:", token);
      alert("Login successful!");
      navigate("/home");
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      alert("Invalid car number or password!");
    }
  };

  return (
    <div className="driver-login-page">
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <h2 className="nav-left">Driver Login</h2>
        <div className="nav-right">
          <Link to="/driverlogin"><button className="nav-btn">Login</button></Link>
          <Link to="/driversignup"><button className="nav-btn">Signup</button></Link>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="content">
        <h1 className="title">Driver Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="carNumber"
            placeholder="Car Number"
            required
            value={formData.carNumber}
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
          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>
      </main>
    </div>
  );
};

export default DriverLogin;
