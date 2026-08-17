const express = require('express');
const router = express.Router();
const {jwtAuthMiddleware,generateToken} = require('../jwt.js');

const users = require('../models/users');

router.post('/signup',async(req,res)=>{
    const data = req.body;
    data.role = 'driver'; 

    const newuser = new users(data);

    const saveduser = await newuser.save();
    console.log("user is saved successfully");

    const payload = {
        id:saveduser.id,
        rollNoOrPlate:saveduser.rollNoOrPlate,
        role:saveduser.role
    }

    const token = generateToken(payload);
    console.log("Token is:",token);

    res.status(201).json({saveduser:saveduser, token: token});
})
//actual no need of 2 login but have to see how to handle 2 frontend
router.post('/login',async(req,res)=>{
  try{
        const { rollNoOrPlate,password } =req.body;

        const fetcheduser = await users.findOne({rollNoOrPlate : rollNoOrPlate,role: 'driver'});
        console.log(fetcheduser);
        if(!(fetcheduser) || !(await fetcheduser.comparePassword(password)))
        {
            res.status(401).json({ error: "Invalid username or password" });
        }

        const payload = {
            id:fetcheduser.id,
            rollNoOrPlate:fetcheduser.rollNoOrPlate,
            role:fetcheduser.role
        }

        const token=generateToken(payload);
        // ✅ send both token and user info
        return res.status(200).json({
        token,
        user: {
            id: fetcheduser._id,
            rollNoOrPlate: fetcheduser.rollNoOrPlate,
            role: fetcheduser.role
        }
        });
    }
    catch(error){
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal server error" });
    }
})

module.exports = router;