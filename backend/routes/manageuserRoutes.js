const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { jwtAuthMiddleware,generateToken,generateTempToken,jwtAuthTempMiddleware } = require('../jwt');

const {tempUser,redUser} = require('../models/tempuser_reduser');

router.get('/activeuser',jwtAuthMiddleware,async(req,res)=>{
    try{
        const users = await tempUser.find();

        return res.status(200).send(users);
    }
    catch(error){
        return res.status(500).json({error:"db error"});
    }
});

router.get('/reduser',jwtAuthMiddleware,async(req,res)=>{
    try{
        const users = await tempUser.find({status:"red"});

        return res.status(200).send(users);
    }
    catch(error){
        return res.status(500).json({error:"db error"});
    }
});

router.delete('/removeuser/:id',jwtAuthMiddleware,async(req,res)=>{
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).send({error:"data is missing (no id)"});
    }

    try{
        const deletedUser = await tempUser.findByIdAndDelete(id);

        if(!deletedUser){
            return res.status(404).json({error:"user not found"});
        }

        return res.status(200).json({
            message:"user removed succefully",
            userId:id
        });
    }
    catch(err)
    {
        return res.status(500).json({
            error:"database error...."
        })
    }
});

module.exports = router;