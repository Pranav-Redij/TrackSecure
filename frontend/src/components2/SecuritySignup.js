import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";

import "./style2/SecuritySignup.css"; 

const SecuritySignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    securityId: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.trim() !== formData.confirmPassword.trim()) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${BASE_URL}/security/signup`,
        {
          rollNoOrPlate: formData.securityId,
          password: formData.password,
        },
        {
          withCredentials: true,
          headers: { "X-Requested-With": "XMLHttpRequest" },
        }
      );

      alert("Signup successful. Please login.");
      navigate("/securitylogin");
    } catch {
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-login-page">
      <nav className="navbar">
        <h2 className="nav-left">Security Signup</h2>
        <div className="nav-right">
          <Link to="/securitylogin">
            <button type="button" className="nav-btn">Login</button>
          </Link>
          <Link to="/securitysignup">
            <button type="button" className="nav-btn">Signup</button>
          </Link>
        </div>
      </nav>

      <main className="content">
        <h1 className="title">Security Signup</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="securityId"
            placeholder="Security ID"
            required
            autoComplete="off"
            value={formData.securityId}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type='submit' className="submit-btn" disabled={loading}>
            {loading ? "Signing up..." : "Signup"}
          </button>

        </form>
      </main>
    </div>
  );
};

export default SecuritySignup;
