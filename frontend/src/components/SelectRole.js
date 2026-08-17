import { Link } from "react-router-dom";

import "./style/SelectRole.css";

const SelectRole = () => {
  return (
    <div className="select-role-page">
      <nav className="navbar">
        <h2 className="logo">TrackNow</h2>
      </nav>

      <main className="content">
        <h1 className="title">Who are you?</h1>
        <div className="button-group">
          <Link to="/userlogin"><button className="role-btn">User</button></Link>
          <Link to="/driverlogin"><button className="role-btn">Driver</button></Link>
          <Link to="/securitylogin"><button className="role-btn">Security</button></Link>
        </div>
      </main>
    </div>
  );
};

export default SelectRole;
