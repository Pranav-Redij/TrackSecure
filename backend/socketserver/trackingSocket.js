function initTrackingSocket(io) {
  const trackingIO = io.of("/tracking");

  let activeDrivers = {};
  let activeUsers = {};

  trackingIO.on("connection", (socket) => {
    console.log("🚗 Tracking connected:", socket.id);

    socket.on("driverLocation", (data) => {
      if (!data?.plate) return;

      activeDrivers[data.plate] = {
        lat: data.lat,
        lng: data.lng,
        socketId: socket.id,
      };

      trackingIO.emit("driversUpdate", activeDrivers);
    });

    socket.on("userLocation", (data) => {
      activeUsers[socket.id] = { lat: data.lat, lng: data.lng };
      trackingIO.emit("usersUpdate", activeUsers);
    });

    socket.on("stopUserLocation", () => {
      delete activeUsers[socket.id];
      trackingIO.emit("usersUpdate", activeUsers);
    });

    socket.on("disconnect", () => {
      for (let plate in activeDrivers) {
        if (activeDrivers[plate].socketId === socket.id) {
          delete activeDrivers[plate];
          break;
        }
      }
      delete activeUsers[socket.id];

      trackingIO.emit("driversUpdate", activeDrivers);
      trackingIO.emit("usersUpdate", activeUsers);
    });
  });
}

module.exports = initTrackingSocket;
