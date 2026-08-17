const jwt = require("jsonwebtoken");
const { tempUser } = require("../models/tempuser_reduser");

function initSecuritySocket(io) {
  const securityIO = io.of("/security");

  // userId -> { userId, plate, type, lat, lng }
  const activeTempUsers = new Map();

  securityIO.on("connection", (socket) => {
    console.log("🛡 Security connected:", socket.id);

    socket.on("tempUserLocation", async ({ token, lat, lng }) => {
      try {
        // 1️⃣ Verify JWT
        console.log("Verifying token:", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 2️⃣ Validate temp user from DB
        const user = await tempUser.findById(decoded.userId);
        if (!user) {
          activeTempUsers.delete(decoded.userId);
          return;
        }

        // 3️⃣ Expiry check (VERY IMPORTANT)
        if (Date.now() > new Date(user.tilltime).getTime()) {
          activeTempUsers.delete(decoded.userId);
          return;
        }

        // 4️⃣ Store/update location WITH TYPE
        activeTempUsers.set(decoded.userId, {
          userId: decoded.userId,
          plate: user.plate,
          type: user.type,          // ✅ car type saved
          lat,
          lng,
        });

        // 5️⃣ Broadcast only valid temp users
        securityIO.emit(
          "tempUsersUpdate",
          Array.from(activeTempUsers.values())
        );

      } catch (err) {
        console.error("Invalid temp socket:", err.message);
      }
    });

    socket.on("disconnect", () => {
      // NOTE:
      // We DON'T delete here because temp users may reconnect
      // Cleanup is handled by expiry / DB validation
    });
  });
}

module.exports = initSecuritySocket;
