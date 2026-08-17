import { useState } from "react";
import { Link,useNavigate } from 'react-router-dom';
import axios from "axios"; /*Axios is a popular JavaScript library 
used in the frontend (and sometimes backend) to make HTTP requests — 
like GET, POST, PUT, or DELETE — to your backend API.*/
import BASE_URL from "../config";

import "./style/DriverSignup.css";

const DriverSignup = () => {
  const navigate = useNavigate();

  // form state
  const [formData, setFormData] = useState({
    carNumber: "",
    password: "",
    confirmPassword: "",
  });

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });/* e.target.name = "carNumber" ,e.target.value = "MH12AB3456"*/
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();//after submit to not to refresh the browser

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/driver/signup`, {
        rollNoOrPlate: formData.carNumber,
        password: formData.password,
      });
      // ✅ Save token in localStorage
      const token = res.data.token;
      localStorage.setItem("token", token);

      console.log("Response:", res.data);
      alert("Signup successful! Token saved.");
      navigate("/driverlogin");
    } 
    catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      alert("Signup failed! Please try again.");
    }
  };
  
  return (
    <div className="signup-page">
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="navbar-title">Driver Signup</h2>
        <div className="navbar-buttons">
          <Link to="/driverlogin"><button className="nav-btn">Login</button></Link>
          <Link to="/driversignup"><button className="nav-btn">Signup</button></Link>
        </div>
      </nav>

      {/* Body */}
      <div className="signup-container">
        <h1 className="signup-heading">Driver Signup</h1>
        <form className="signup-form" onSubmit={handleSubmit}>
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

export default DriverSignup;
