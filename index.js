import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import router from "./usersRouter/user.router.js";

dotenv.config();
const port = 8080;

const app = express();

app.use(express.json());
app.use(cors());
app.use("/users", router)


mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.error("Could not connect to MongoDB...", err));

app.get("/", (req, res) => {
    res.send("Welcome to the Server side Login Page...");
})




app.listen(port, () => {
    console.log(`Server is running...${port}`);
})