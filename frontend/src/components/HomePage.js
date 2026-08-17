import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MapComponent from "./MapComponent";
import "./style/HomePage.css";

const HomePage = () => {
  const [role, setRole] = useState(null);
  const [sharing, setSharing] = useState(localStorage.getItem("sharing") === "true"); // 🆕 remember if user was already sharing before refresh
  const navigate = useNavigate();

  // ✅ Check who is logged in (driver or user)
  useEffect(() => {
    const storedRole = localStorage.getItem("role"); // "driver" or "user"
    setRole(storedRole);
  }, []);

  const handleLogout = () => {
  if (window.socket) {
    window.socket.emit("stopUserLocation");  // 🟢 safe: only tells server to remove user marker
    window.socket.disconnect();
    window.socket = null;
  }

  localStorage.clear();   // 🟢 clears all keys (token, role, etc.)
  setRole(null);          // 🟢 resets UI role state
  setSharing(false);      // 🟢 ensures "Here" button resets to default
  setTimeout(() => navigate("/"), 100); // 🟢 allows smooth redirect after cleanup
};

  // ✅ Logout handler
/*  const handleLogout = () => {
    // Remove all stored user data
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("rollNoOrPlate");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
    
    // 🆕 Reset sharing state in React (so button resets to "Here")
    setSharing(false);

    // Disconnect socket if active
    if (window.socket) {
      window.socket.disconnect();
      window.socket = null;
    }

    // Redirect to login page
    navigate("/");
  };*/

  // 🆕 Toggle location sharing for users
  const toggleShare = () => {
    const newState = !sharing; // flips between true and false
    localStorage.setItem("sharing", newState ? "true" : "false"); // 🆕 store state in localStorage
    setSharing(newState); // 🆕 update React state so button text changes

    // 🆕 Notify MapComponent that user started or stopped sharing
    window.dispatchEvent(new Event("shareToggle"));
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <h2 className="logo">TrackNow</h2>
        <div className="nav-buttons">
          <Link to="/changepassword">
            <button className="change-btn">Change Password</button>
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* ✅ Map component handles tracking */}
      <MapComponent userType={role} />

      {/* 🆕 Only USERS can see and use this "Here" button */}
      {role === "user" && (
        <button className="share-btn" onClick={toggleShare}>
          {sharing ? "Stop Sharing" : "I'm Here"} {/* 🆕 dynamically changes text */}
        </button>
      )}

    </div>
  );
};

export default HomePage;
