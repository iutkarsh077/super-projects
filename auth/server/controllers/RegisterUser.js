import users from "../models/users.js";
import bcrypt from "bcryptjs";

const RegisterUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({ message: "All fields are required", status: false })
        }

        const saveUser = await users.findOne({ email: email });

        if (saveUser) {
            return res.status(409).json({ message: "Invalid email, we cant register it", status: false })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        await users.create({
            name, email, password: hashedPassword
        })
        return res.status(200).json({ message: "User registered successfully", status: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error", status: false });
    }
}

export default RegisterUser