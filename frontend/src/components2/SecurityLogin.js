import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";

import "./style2/SecurityLogin.css";

const SecurityLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    securityId: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/security/login`,
        {
          rollNoOrPlate: formData.securityId,
          password: formData.password,
        },
        {
          withCredentials: true,
          headers: { "X-Requested-With": "XMLHttpRequest" },
        }
      );

      const { token , user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      
      navigate("/manageuser");
    } catch {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-login-page">
      <nav className="navbar">
        <h2 className="nav-left">Security Login</h2>
        <div className="nav-right">
          <Link to="/securitylogin">
            <button className="nav-btn">Login</button>
          </Link>
          <Link to="/securitysignup">
            <button className="nav-btn">Signup</button>
          </Link>
        </div>
      </nav>

      <main className="content">
        <h1 className="title">Security Login</h1>
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
          <button className="submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default SecurityLogin;
