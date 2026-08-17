import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style2/SecurityMap.css";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import BASE_URL from "../config";


const SecurityMap = () => {
  const mapRef = useRef(null);
  const markersRef = useRef({}); // userId -> marker

  useEffect(() => {
    // prevent duplicate init

    const socket = io(`${BASE_URL}/security`);

    const existing = L.DomUtil.get("map");
    if (existing) existing._leaflet_id = null;

    // init map
    const iitbBounds = L.latLngBounds(
      [19.1200, 72.9000],
      [19.1450, 72.9250]
    );

    const map = L.map("map", {
      center: [19.1334, 72.9133],
      zoom: 16,
      minZoom: 15,
      maxZoom: 18,
      maxBounds: iitbBounds,
      maxBoundsViscosity: 0.6,
      inertia: true,
      inertiaDeceleration: 1800,
      inertiaMaxSpeed: 1200,
    });

    map.fitBounds(iitbBounds);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // 🚗 ICONS (same pattern, easy to extend)
    const icons = {
      private: L.icon({
        iconUrl: "/img/private.png",
        iconSize: [38, 48],
        iconAnchor: [19, 48],
        popupAnchor: [0, -38],
      }),
      auto: L.icon({
        iconUrl: "/img/auto.png",
        iconSize: [38, 48],
        iconAnchor: [19, 48],
        popupAnchor: [0, -38],
      }),
      cab: L.icon({
        iconUrl: "/img/cab.png",
        iconSize: [38, 48],
        iconAnchor: [19, 48],
        popupAnchor: [0, -38],
      }),
      bus: L.icon({
        iconUrl: "/img/bus.png",
        iconSize: [38, 48],
        iconAnchor: [19, 48],
        popupAnchor: [0, -38],
      }),
      delivery: L.icon({
        iconUrl: "/img/delivery.png",
        iconSize: [38, 48],
        iconAnchor: [19, 48],
        popupAnchor: [0, -38],
      }),
      construction: L.icon({
        iconUrl: "/img/construction.png",
        iconSize: [38, 48],
        iconAnchor: [19, 48],
        popupAnchor: [0, -38],  
      }),
      other: L.icon({
        iconUrl: "/img/other.png",
        iconSize: [38, 48],
        iconAnchor: [19, 48],
        popupAnchor: [0, -38],
      }),
    };

    // 📡 SOCKET LISTENER
    socket.on("tempUsersUpdate", (users) => {
      const activeIds = new Set();
      console.log("🟢 tempUsersUpdate received:", users);

      users.forEach((u) => {
        activeIds.add(u.userId);

        const icon = icons[u.type] || icons.other;

        if (markersRef.current[u.userId]) {
          markersRef.current[u.userId].setLatLng([u.lat, u.lng]);
        } else {
          markersRef.current[u.userId] = L.marker(
            [u.lat, u.lng],
            { icon }
          )
            .addTo(map)
            .bindPopup(`🚗 ${u.plate}<br/>Type: ${u.type}`);
        }
      });

      // ❌ remove inactive users
      Object.keys(markersRef.current).forEach((id) => {
        if (!activeIds.has(id)) {
          map.removeLayer(markersRef.current[id]);
          delete markersRef.current[id];
        }
      });
    });

    return () => {
      socket.off("tempUsersUpdate");
      socket.disconnect();
      map.remove();
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
  };

  return (
    <div className="temp-map-page">
      <nav className="navbar">
        <h2 className="nav-left">Security</h2>

        <div className="nav-center">
          <Link to="/adduser"><span className="nav-text">Add</span></Link>
          <Link to="/manageuser"><span className="nav-text">Manage</span></Link>
          <Link to="/securitymap">
            <span className="nav-text active">Map</span>
          </Link>
        </div>

        <Link to="/securitylogin">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </Link>
      </nav>

      <div id="map"></div>
    </div>
  );
};

export default SecurityMap;
