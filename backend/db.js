const mongoose = require('mongoose');

require('dotenv').config();

const mongoURL = process.env.MONGO_URL;


//set up mongodb connection
mongoose.connect(mongoURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//get the default connection object
const db = mongoose.connection;

db.on('connected',()=>{
    console.log("Connected to mongodb server.....");
})


//define event listeners for database connections
db.on('error',(err)=>{
    console.log('Connection error to MongoDB server:',err);
});

db.on('disconnected',()=>{
    console.log('MongoDB disconnected');
});

//export the database connection
module.exports = db;