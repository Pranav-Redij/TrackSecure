const express = require('express');
const app = express();
const  startAutoRedListJob = require('../backend/jobs/cron.js');//keep running after sometime in background

const cors = require("cors");//cross origin resource sharing
//app.use(cors());
// ✅ Allow frontend origin

const allowedOrigins = [
  "http://localhost:3000",                   // for local development
  "https://tracknow-frontend.vercel.app"     // your deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT" , "DELETE"],
    credentials: true,
  })
);
/*app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST","PUT"],
  credentials: true
}));*/
app.use(express.json());//it allows backend to read the json file sent by client

require('dotenv').config();     
const {jwtAuthMiddleware,generateToken} = require('./jwt.js');

const db=require('./db');
const users=require('../backend/models/users');


app.get('/',(req,res)=>{
    res.send("hello !!!, where is my buggy");
});

//routes
const userRoutes = require('./routes/userRoutes.js');
const driverRoutes = require('./routes/driverRoutes.js');
const adduserRoutes = require('./routes/adduserRoutes.js');
const manageuserRoutes = require('./routes/manageuserRoutes.js');
const securityRoutes = require('./routes/securityRoutes.js');
const tempUserRoutes = require('./routes/tempuserRoutes.js')

app.use('/user',userRoutes);
app.use('/driver',driverRoutes);
app.use('/security',securityRoutes);
app.use('/adduser',adduserRoutes);
app.use('/manageuser',manageuserRoutes);
app.use('/tempuserhome',tempUserRoutes);

//update password for person
app.put('/changepassword/:id', jwtAuthMiddleware ,async (req, res) => {
    try {
        const personId = req.params.id.trim(); // Remove whitespace/newlines
        const { password } = req.body;//this is new passwrod
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        // Use the static method to update and hash the password
        const updatedPerson = await users.updatePasswordById(personId, password);

        res.status(200).json(updatedPerson);
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
///////////////////////////////////////////////////////////////////////////////////////////////
//SOCKET.IO Server
const http = require("http");// Create raw HTTP server to attach socket.io
const { Server } = require("socket.io"); //for creating server instance for socket.io
const initTrackingSocket = require("./socketserver/trackingSocket.js");
const initSecuritySocket = require("./socketserver/securitySocket");

//  Express by default can’t handle real-time connections (only HTTP)
//    So we wrap it in a real HTTP server for WebSocket communication
const server = http.createServer(app);



// Create socket.io instance
const io = new Server(server,{
    cors: {
        origin: ["http://localhost:3000","https://tracknow-frontend.vercel.app"], // your React app URL
        methods: ["GET", "POST","PUT","DELETE"],
        credentials: true
    },
})

// initialize your custom socket file
initTrackingSocket(io);
initSecuritySocket(io);   

startAutoRedListJob(io);//corn service to run in background


//Start the combined HTTP + WebSocket server
const PORT = process.env.PORT || 5001;
server.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}........`);
})
/*app.listen(5001,()=>{
    console.log("server is running on PORT 5001........");
});*/

