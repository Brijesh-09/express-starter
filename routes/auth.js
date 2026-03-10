import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const router = express.Router();

router.post("/Register" , async (req,res) => {
    const {email , password , name } = req.body;
    if (!email || !password || !name){
        return res.status(400).json({error: "Missing required fields"});
    }
    try{
        const user = await Users.find({email});
        if (user){
            return res.status(409).json({error: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password , 10);
        const newUser = await Users.Create({email , hashedPassword , name});
        const jwt_data = jwt.sign({id: newUser._id , email: newUser.email} , process.env.JWT_SECRET , {expiresIn: "1h"});
        res.status(201).json( {token: jwt_data , user: {id: newUser._id , email: newUser.email , name: newUser.name}});

    }catch(error){
        res.status(500).json({error: "Server error"});
    }
})

router.post("/signin" , async (req , res) =>{
    const {email , password } = req.body;

    if (!email || !password){
        return res.status(400).json({error: "Missing required fields"});
    }
    try {
        const users  = await Users.find({email});
        if (!users || users.length === 0){
            return res.status(401).json({error: "User not found"});
        }
        const isPasswordValid = bcrypt.compare(password ,users.Password);
        if (!isPasswordValid){
            return res.status(401).json({error: "Invalid password"});
        }
        const jwt_data = jwt.sign({id: users._id , email: users.email} , process.env.JWT_SECRET , {expiresIn: "1h"});       
        res.status(200).json({token: jwt_data , user: {id: users._id , email: users.email , name: users.name}});
    }catch(error){
                res.status(500).json({error: "Server error"});
    }
});

//auth middleware
const authMiddleware = (req , res ,next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader){
        return res.status(401).json({error: "No token provided"});
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        res.status(401).json({error: "Invalid token"});
    }
}