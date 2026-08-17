import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/ChangePassword.css";
import BASE_URL from "../config";


const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check match
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized! Please login again.");
      navigate("/userlogin");
      return;
    }

    // Get user id from token (you stored it when logging in)
    const userId = localStorage.getItem("userId");

    try {
      const res = await fetch(`${BASE_URL}/changepassword/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // JWT token
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully!");
        navigate("/home");
      } else {
        alert(data.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="change-container">
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo">Change Password</h2>
      </nav>

      {/* Form Section */}
      <div className="form-container">
        <h2>Update Your Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
