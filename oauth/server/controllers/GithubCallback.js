import axios from "axios";

const GithubCallback = async (req, res) => {
    try {
        const code = req.query.code;

        console.log("The code is: ", code);

        const response = await axios.post("https://github.com/login/oauth/access_token", {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, {
            headers: {
                Accept: "application/json"
            }
        })

        console.log(response.data)

        const token = response.data.access_token;

        const user = await axios.get(
            "https://api.github.com/user",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log("user is: ", user)

        return res.redirect('http://localhost:5173')
    } catch (error) {
        return res.status(500).json({ message: "Internal Server error", status: false })
    }
}

export default GithubCallback;