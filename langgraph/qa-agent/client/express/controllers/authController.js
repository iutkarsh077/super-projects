import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });

const passwordMatches = async (password, storedPassword) => {
  const [salt, savedHash] = storedPassword.split(":");
  if (!salt || !savedHash) return false;
  const generated = await hashPassword(password, salt);
  const generatedHash = generated.split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(savedHash, "hex"), Buffer.from(generatedHash, "hex"));
};

export const authenticate = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (user) {
      if (!(await passwordMatches(password, user.password))) {
        return res.status(401).json({ message: "Incorrect email or password." });
      }
    } else {
      user = await User.create({ email, password: await hashPassword(password) });
      isNewUser = true;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userDetails = { id: user._id.toString(), email: user.email };

    res.cookie("authUser", JSON.stringify(userDetails), {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(isNewUser ? 201 : 200).json({
      message: isNewUser ? "Account created." : "Logged in.",
      token,
      user: userDetails,
    });
  } catch (error) {
    console.error("Authentication error", error);
    return res.status(500).json({ message: "Could not authenticate user." });
  }
};
