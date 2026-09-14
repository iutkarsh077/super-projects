import Conversation from "../models/Conversation.js";

const GetChatUsingSession = async (req,res) =>{
    try {
        const {  id } = req.params;
        console.log("id is: ", id);

        const allChats = await Conversation.find({ chatSession: id }).sort({ createdAt: 1 });;

        console.log("All chats are: ", allChats)


        return res.status(200).json({message: "Successfully got the data", data: allChats, status: true})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: error.message, status: false})
    }
} 

export default GetChatUsingSession;