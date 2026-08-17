const cron = require("node-cron");
const { tempUser, redUser } = require("../models/tempuser_reduser");

module.exports = function startAutoRedListJob(io) {

    //every minute it will runs
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const expiredUsers = await tempUser.find({
        status: "temp",
        tilltime: { $lt: now }
      });

      for (const user of expiredUsers) {

        await tempUser.updateOne(
          { _id: user._id },
          { status: "red" }
        );

        await redUser.updateOne(
          { plate: user.plate },
          {
            $inc: { count: 1 },
            $setOnInsert: { type: user.type }
          },
          { upsert: true }
        );

        // Optional: real-time update
        /*if (io) {
          io.emit("USER_STATUS_CHANGED", {
            plate: user.plate,
            status: "red",
            reason: "Time expired"
          });
        }*/
      }

    } catch (err) {
      console.error("Auto red-list cron error:", err);
    }
  });
};
