const express = require("express");
const router = express.Router();

const { tempUser,redUser } = require('../models/tempuser_reduser');
const { jwtAuthMiddleware,generateToken,generateTempToken,jwtAuthTempMiddleware } = require('../jwt');

router.get('/checkredlist',jwtAuthMiddleware,async(req,res)=>{
    const plate = req.query.plate; 
    //checkredlist?plate=MH12AB1234
    //method 2:router.get('/checkredlist/:plate', async (req, res) => {
    //const { plate } = req.params;
    if(!plate){
        return res.status(400).send({error: "data is required"});
    }

    try{
        const reduser = await redUser.findOne({plate:plate});

        if(!reduser)
        {
            return res.status(200).send({isRed: false});
        }

        return res.status(200).send({isRed: true});
    }
    catch(err)
    {
        return res.status(400).send({error: err});
    }
});

router.post('/tempadd',jwtAuthMiddleware,async (req, res) => {
  const { plate, type, time, tilltime } = req.body;

  if (!plate || !type || !time || !tilltime) {
    return res.status(400).json({ error: "data is missing" });
  }

  // NO DATABASE OPERATION HERE
  const payload = {
    plate,
    type,
    time,
    tilltime,
    status: "temp"
  };

  const token = generateTempToken(payload);

  console.log("temp Token:"+token);

  return res.status(200).json({ token });
});



router.post('/templogin', jwtAuthTempMiddleware, async (req, res) => {
  const data = req.user;

  if (!data) {
    return res.status(400).json({ error: "invalid token" });
  }

  try {
    // Check if already exists
    let tempuser = await tempUser.findOne({ plate: data.plate });

    // Create ONLY if first login
    if (!tempuser) {
      tempuser = await tempUser.create({
        plate: data.plate,
        type: data.type,
        time: data.time,
        tilltime: data.tilltime,
        status: "temp"
      });
    }else{
       return res.status(409).json({
        error: "QR already used. Access denied."
      }); 
    }

    const payload = {
      userId: tempuser._id,
      plate: tempuser.plate,
      type: tempuser.type,
      time: data.time,
      tilltime: data.tilltime,
      status: tempuser.status,
      info: "from templogin"
    };

    const token = generateToken(payload);
    console.log("New Token:"+token);
    return res.status(200).json({ token ,payload });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});



module.exports = router;