import jwt from "jsonwebtoken"
import users from "../models/users.js";

const GetUsers = async (req, res) => {
    try {
        const token = req.cookies.token;

        const verifyToken = jwt.verify(token, process.env.SECRET_CODE);

        if(!verifyToken){
            return res.status(402).json({message: "Failed to user details", status: false});
        }

        console.log("token details is: ", verifyToken);

        const findUser = await users.findById({_id: verifyToken.id}).select("name email");


        if(!findUser){
            return res.status(402).json({message: "Unauthorized access denied", status: false});
        }

        console.log("user is: ", findUser)

        return res.status(200).json({ message: "Successfully got the user details", userDetails: findUser, status: true })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server error", status: false })
    }
} 

export default GetUsers;