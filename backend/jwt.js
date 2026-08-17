const jwt = require('jsonwebtoken');
const crypto = require('crypto');//for unique number for jti (temp adduser)

const usedTempJti = new Set();

//function to generate jwt token

const generateToken = (userData) =>{
    const token = jwt.sign(userData,process.env.JWT_SECRET,{expiresIn : '7d' });//{} is option object
    return token;
};

const generateTempToken = (userData) =>{
    const jti = crypto.randomUUID();

    const token = jwt.sign({...userData,jti, purpose: "TEMP_LOGIN"},
                            process.env.JWT_SECRET,
                            {expiresIn : '2h' });//{} is option object
    
    return token;
};

const jwtAuthTempMiddleware = (req,res,next) =>{
    const authHeader = req.headers.authorization;

    if(!authHeader)return res.status(401).json({error:"temp token is missing !!!"});

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        if(decoded.purpose!="TEMP_LOGIN"){
            return res.status(403).json({error:"not correct token, not a temp jwt"});
        }
        
        if(usedTempJti.has(decoded.jti))
        {
            return res.status(403).json({error:"already used....."}); 
        }

        usedTempJti.add(decoded.jti);
        req.user = decoded;
        next();
    }
    catch(err){
        console.error(err);  
        return res.status(403).json({ error: err });
    }
}

const jwtAuthMiddleware = (req,res,next) =>{
    console.log("JWT Middleware called"); // Log to indicate middleware is invoked
    
    //
    const autherizationHeader = req.headers.authorization; // Get the Authorization header from the request
    if(!autherizationHeader) return res.status(401).json({ error: " token is not passed" }); // Return 401 Unauthorized if header is missing 

    const token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header
    console.log("Token received:", token); // Log the token for debugging
    if(!token) return res.status(401).json({ error: "Unauthorized access, token is missing" });


    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;

        next();
    }
    catch(error){
        console.error("Token verification failed:",error.message);
        return res.status(403).json({ error: "Forbidden, invalid token" }); // Return 403 Forbidden if token is invalid
    }
}

module.exports = {jwtAuthMiddleware,generateToken,generateTempToken,jwtAuthTempMiddleware};

