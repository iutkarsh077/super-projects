const GithubLogin = async (req, res) =>{
    try {
        const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`

        res.redirect(url);
    } catch (error) {
        return res.status(500).json({message: "Internal Server error", status: false})
    }
}

export default GithubLogin