import axios, {} from "axios";
const getUserDetails = async (username) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}`);
        console.log(response.data);
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.message);
        }
    }
};
getUserDetails("iutkarsh077");
//# sourceMappingURL=axios.js.map