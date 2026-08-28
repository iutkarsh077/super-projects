import users from "../models/users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const LoginUser = async (req, res) => {
    try {
        const { email, password } = await req.body;

        if (!email, !password) {
            return res.status(402).json({ message: "Invalid Credentials", status: false })
        }

        const finduser = await users.findOne({ email: email });

        if (!finduser) {
            return res.status(402).json({ message: "Invalid Credentials", status: false })
        }

        const comparePassword = await bcrypt.compare(password, finduser.password);

        if (!comparePassword) {
            return res.status(402).json({ message: "Invalid Credentials", status: false })
        }

        const accessToken = jwt.sign({ id: finduser._id }, process.env.SECRET_CODE, { algorithm: "HS256", expiresIn: "1h" });
        const refreshToken = jwt.sign({ id: finduser._id }, process.env.SECRET_CODE, { algorithm: "HS256", expiresIn: "7d" });

        await users.findOneAndUpdate({ _id: finduser._id }, { $set: { refreshToken: refreshToken } });

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 1000,
            sameSite: "lax",
        })

        return res.status(200).json({ message: "Successfully logged in", status: true })

    } catch (error) {
        return res.status(500).json({ message: "Internal Server error", status: false })
    }
}


export default LoginUser;