import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();

const authRoutes= require("./routes/auth");

app.use(express.json());
app.use(cors());
app.use("/api/auth" , authRoutes);

app.listen(3000, () => {
    console.log("Server running on port 3000")
})

app.get("/api/health" , (req , res) => {
    res.status(200).json({status: "ok"});
})