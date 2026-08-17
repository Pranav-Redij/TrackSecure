const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware,jwtAuthTempMiddleware } = require('../jwt');
const { tempUser } = require('../models/tempuser_reduser');

router.get("/", jwtAuthMiddleware, async (req, res) => {
  const plate = req.user.plate;
  const user = await tempUser.findOne({ plate });

  if (!user) {
    return res.status(401).json({ error: "Temp user removed" });
  }

  const now = Date.now();
  const end = new Date(user.tilltime).getTime();

  const secondsLeft = Math.max(0, Math.floor((end - now) / 1000));

  res.json({ secondsLeft });
});



router.post("/sharelocation", jwtAuthMiddleware, (req, res) => {
  const { latitude, longitude, accuracy } = req.body;

  console.log({
    user: req.user.id,
    latitude,
    longitude,
    accuracy,
    time: new Date(),
  });

  res.json({ success: true });
});


module.exports = router;