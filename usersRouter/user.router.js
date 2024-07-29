import { UserModel } from "../Shema/userSchema.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (user) {
    return res.status(401).json({ message: "User already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new UserModel({ name, email, password: hashedPassword });
  await newUser.save();
  return res.status(201).json({ message: "User created successfully." });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "User not found." });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });

  return res
    .status(201)
    .json({ message: "Logged in successfully.", token: token });
});

router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a secure token
    const token = Math.floor(Math.random() * 1e6).toString();

    // Save token and expiration to the user record (for example purposes, assuming UserModel has these fields)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset",
      text: `Your Token is: ${token}`,
      html: `
            <p>Click the link below to reset your password:</p>
            <p>Your Code is: ${token}</p>
            <p>If you didn't request this password reset, you can ignore this email.</p>
          `,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({
        message:
          "An email has been sent to " + email + " with further instructions.",
      });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while trying to send the reset email.",
      });
  }
});

router.post("/reset", async (req, res) => {
  const { email, code, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (code === user.resetPasswordToken) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    return res.status(200).json({ message: "Password reset successful." });
  }
  else {
    return res.status(401).json({ message: "Invalid reset code." });
  }
});

export default router;
