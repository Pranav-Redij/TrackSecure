import { useEffect, useState } from "react";
import "./style2/ManageUser.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";

const ManageUser = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tempUsers, setTempUsers] = useState([]);
  const [redListUsers, setRedListUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");

  // ===== FETCH USERS =====
const fetchUsers = async () => {
  try {
    const [activeRes, redRes] = await Promise.all([
      axios.get(`${BASE_URL}/manageuser/activeuser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      axios.get(`${BASE_URL}/manageuser/reduser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    setTempUsers(activeRes.data.map(u => ({ ...u, car: u.plate })));
    setRedListUsers(redRes.data.map(u => ({ ...u, car: u.plate })));

  } catch (err) {
    console.error(err);
  }
};


  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  // ===== SEARCH =====
  const filteredUsers = tempUsers.filter((u) =>
  u.plate?.includes(search)
  );


  // ===== REMOVE USER =====
  const handleGone = async (id) => {
    try {
      await axios.delete(
        `${BASE_URL}/manageuser/removeuser/${id}`,
        { headers:{
          Authorization:`Bearer ${token}`,
        },withCredentials: true }
      );

      setTempUsers((prev) => prev.filter((u) => u._id !== id));
      setSelectedUser(null);
    } catch (err) {
      alert("Failed to remove user");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/securitylogin");
  };

  return (
    <div className="manage-page">
      {/* ===== NAVBAR ===== */}
      <nav className="navbar">
        <h2 className="nav-left">Temp User</h2>

        <div className="nav-center">
          <Link to="/adduser"><span className="nav-text">Add</span></Link>
          <Link to="/manageuser"><span className="nav-text active">Manage</span></Link>
          <Link to="/securitymap"><span className="nav-text">Map</span></Link>
        </div>

        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      {/* ===== SEARCH ===== */}
      <div className="search-bar">
        <input
          placeholder="Search by car number"
          value={search}
          onChange={(e) => setSearch(e.target.value.toUpperCase())}
        />
      </div>

      {/* ===== BODY ===== */}
      <div className="body">
        {/* LEFT: ACTIVE USERS */}
        <div className="left-panel">
          <h3>Active Temp Users</h3>

          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="user-card"
              onClick={() => setSelectedUser(u)}
            >
              <span>{u.car}</span>

              <button
                className="gone-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGone(u._id);
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* CENTER: DETAILS (CLEAN) */}
        <div className="center-panel">
          {selectedUser ? (
            <>
              <h3>User Details</h3>
              <p><strong>Car:</strong> {selectedUser.car}</p>
              <p><strong>Type:</strong> {selectedUser.type}</p>
              <p><strong>Exit Time:</strong> {new Date(selectedUser.tilltime).toLocaleTimeString()}</p>
            </>
          ) : (
            <p>Select a user</p>
          )}
        </div>

        {/* RIGHT: RED LIST */}
        <div className="right-panel">
          <h4>Red Listed Users</h4>

          {redListUsers.map((u) => (
            <div key={u._id} className="red-user">
              {u.car}
              <span className="tooltip">{u.reason || "Overstay"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
