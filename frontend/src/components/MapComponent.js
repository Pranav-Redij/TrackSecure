import React, { useEffect } from "react";
import L from "leaflet";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import "./style/MapComponent.css";
import BASE_URL from "../config";//socket server url

const MapComponent = ({ userType }) => {
  useEffect(() => {
    // Prevent duplicate map initialization
    const existingMap = L.DomUtil.get("map");
    if (existingMap) existingMap._leaflet_id = null;

//////////////////////////////////////////////////
    // ✅ Initialize socket connection
    const socket = io(`${BASE_URL}/tracking`, {
      transports: ["websocket"],
      withCredentials: false,
    });
/////////////////////////////////////////////////
    // ✅ Initialize map (your same setup)
    const map = L.map("map", {
      center: [19.1334, 72.9133],
      zoom: 15,
      minZoom: 15,
      maxZoom: 18,  // 🆕 allow smooth zooming in
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      tap: false,
    });

    // ✅ Define IIT Bombay bounding box (slightly larger for comfort)
    const iitbBounds = L.latLngBounds(
      [19.1200, 72.9000], // Southwest corner (made larger)
      [19.1450, 72.9250]  // Northeast corner (made larger)
    );

    // ✅ Fit map to IITB bounds initially (good centered view)
    map.fitBounds(iitbBounds);

    // ✅ Restrict dragging smoothly inside IITB
    map.on("moveend", function () {
      // 🆕 only recenter if map drags completely outside
      if (!iitbBounds.contains(map.getCenter())) {
        map.panInsideBounds(iitbBounds, { animate: true });
      }
    });

    // ✅ Prevent zooming out so far that IITB leaves visible area
    map.on("zoomend", function () {
      const currentBounds = map.getBounds();
      if (!iitbBounds.intersects(currentBounds)) {
        map.fitBounds(iitbBounds);
      }
    });

    // ✅ Add base layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // ✅ Ensure map interaction works everywhere
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();

    // ✅ Custom car icon
    const carIcon = L.icon({
      iconUrl: "/img/gps_pointer2.png",
      iconSize: [30, 45],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28],
    });

    // 🆕 NEW: added custom icon for USERS
    const userIcon = L.icon({
      iconUrl: "/img/user_pointer.png", // 🧍 user icon (different from driver)
      iconSize: [28, 42],
      iconAnchor: [14, 28],
      popupAnchor: [0, -26],
    });
    map.on("zoomend", () => {
      const zoom = map.getZoom();
      const scale = zoom > 16 ? 1.2 : 1;
      carIcon.options.iconSize = [30 * scale, 45 * scale];
    });

////////////////////////////////////////////////////

    const driverMarkers = {};
    const userMarkers = {};

    // ✅ Listen for driver updates
    socket.on("driversUpdate", (activeDrivers) => {
      for (const plate in activeDrivers) {
        const { lat, lng } = activeDrivers[plate];
        if (driverMarkers[plate]) {
          driverMarkers[plate].setLatLng([lat, lng]);
        } else {
          driverMarkers[plate] = L.marker([lat, lng], { icon: carIcon })
            .addTo(map)
            .bindPopup(`🚗 Driver: ${plate}`);
        }
      }
      // remove disconnected drivers
      for (const plate in driverMarkers) {
        if (!activeDrivers[plate]) {
          map.removeLayer(driverMarkers[plate]);
          delete driverMarkers[plate];
        }
      }
    });

    // 🆕 NEW: listen for users sharing location
    socket.on("usersUpdate", (activeUsers) => {
      for (const id in activeUsers) {
        const { lat, lng } = activeUsers[id];
        if (userMarkers[id]) {
          userMarkers[id].setLatLng([lat, lng]);
        } else {
          // 🆕 marker uses userIcon instead of driverIcon
          userMarkers[id] = L.marker([lat, lng], { icon: userIcon })
            .addTo(map)
            .bindPopup(`🧍 User`);
        }
      }

      // remove users who stopped sharing
      for (const id in userMarkers) {
        if (!activeUsers[id]) {
          map.removeLayer(userMarkers[id]);
          delete userMarkers[id];
        }
      }
    });

    // ✅ Driver sends GPS
    let interval;
    if (userType === "driver" && navigator.geolocation) {
      const plate = localStorage.getItem("rollNoOrPlate");

      const sendLocation = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
          socket.emit("driverLocation", {
            plate,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        });
      };

      sendLocation();
      interval = setInterval(sendLocation, 5000);
    }

     // 🆕 NEW: user sharing system -----------------------------
    let watchId = null;

    // 🆕 startUserSharing — emits continuous userLocation updates
    const startUserSharing = () => {
      if (!navigator.geolocation) return;
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          socket.emit("userLocation", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    };

    // 🆕 stopUserSharing — stops watching location
    const stopUserSharing = () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      socket.emit("stopUserLocation");
    };

     // 🆕 listen for custom event from HomePage (“Here” button click)
    window.addEventListener("shareToggle", () => {
      const sharing = localStorage.getItem("sharing") === "true";
      if (sharing) startUserSharing();
      else stopUserSharing();
    });

    // 🆕 if user had sharing enabled before refresh, auto start
    if (userType === "user" && localStorage.getItem("sharing") === "true") {
      startUserSharing();
    }
    // ✅ Cleanup when the mapcomponent is unmounted it will get called
    return () => {
      if (interval) clearInterval(interval);//it will stop driver location updates  

      stopUserSharing(); // 🆕 also stop user tracking when leaving
      socket.disconnect();
      map.remove();
    };
  }, [userType]);

  return <div id="map"></div>;
};

export default MapComponent;
