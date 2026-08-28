import users from "../models/users.js";

const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(402).json({
                message: "Refresh token missing",
                status: false,
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.SECRET_CODE
        );

        const user = await users.findById(decoded.id);

        if (!user || user.refreshToken !== token) {
            return res.status(402).json({
                message: "Invalid refresh token",
                status: false,
            });
        }

        const newAccessToken = jwt.sign(
            { id: user._id },
            process.env.SECRET_CODE,
            {
                algorithm: "HS256",
                expiresIn: "1h",
            }
        );

        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Access token refreshed",
            status: true,
        });

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired refresh token",
            status: false,
        });
    }
};


export default refreshToken;