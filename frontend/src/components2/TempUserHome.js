import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import BASE_URL from "../config";
import "./style2/TempUserHome.css";

const TempUserHome = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [checking, setChecking] = useState(true);

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

  // 🔹 1. VERIFY TEMP USER + GET SERVER TIME
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    setChecking(false);
    return;
  }

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/tempuserhome`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setChecking(false);
        return;
      }

      const data = await res.json();

      // 🔥 CRASH GUARD
      if (typeof data.secondsLeft !== "number") {
        console.error("Invalid response:", data);
        setChecking(false);
        return;
      }

      setTimeLeft(data.secondsLeft);

      intervalRef.current = setInterval(() => {
        setTimeLeft(t => Math.max(0, t - 1));
      }, 1000);

      setChecking(false);
    } catch (e) {
      console.error(e);
      setChecking(false);
    }
  };

  fetchStatus();

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}, []);




  // 🔹 2. SOCKET + LOCATION SHARING (UNCHANGED)
  useEffect(() => {
    if (checking) return;

    const token = localStorage.getItem("token");
    if (!token || !navigator.geolocation) return;

    socketRef.current = io(`${BASE_URL}/security`);

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to security socket");
    });

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        socketRef.current.emit("tempUserLocation", {
          token,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socketRef.current.disconnect();
    };
  }, [checking]);

  // 🔹 UI WAIT
  if (checking) return null;

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="temp-home-page">
      <nav className="navbar">
        <h2 className="nav-left">Temp User</h2>
      </nav>

      <main className="content">
        <h1 className="title">Temporary Access Active</h1>
        <div className="clock">{formatTime(timeLeft)}</div>
        <p className="subtitle">Live location shared with security</p>
      </main>
    </div>
  );
};

export default TempUserHome;
