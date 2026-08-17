const mongoose = require('mongoose');

const tempuserSchema = new mongoose.Schema({
    plate : {
        type:String,
        unique:true,
        required: true,
        trim: true,
        match: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/ /*mh00ab1234*/
    },
    type:{
        type:String,
        required:true,
        enum:['private','auto','cab','bus','delivary','construction','other']
    },
    time:{
        type:Date,
        required:true
    },
    tilltime:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        enum:['temp','red'],    //will be sent by front end at the time of login
        required:true
    }
});

const reduserSchema = new mongoose.Schema({
    plate : {
        type:String,
        unique:true,
        required: true,
        trim: true,
        match: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/ /*mh00ab1234*/
    },
    count:{
        type:Number,  
        default:1,
        required:true
    },
    type:{
        type:String,
        required:true,
        enum:['private','auto','cab','bus','delivary','construction','other']
    },
});

const tempUser = mongoose.model("tempUser",tempuserSchema);
const redUser = mongoose.model("redUser",reduserSchema);

module.exports = {tempUser,redUser};