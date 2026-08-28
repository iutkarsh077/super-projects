const LogoutUser = async (req, res) => {
    try {
        res.clearCookie("token");

        return res.status(200).json({message: "Successfully logged out", status: true});
    } catch (error) {
        return res.status(500).json({ message: "Internal Server error", status: false });
    }
} 

export default LogoutUser;