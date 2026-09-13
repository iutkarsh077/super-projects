import axios from "axios"
const QueryNode = async (req, res) => {
    try {
        const { query } = req.body;

        console.log("Query is: ", query)

        const fastapi = process.env.FASTAPI_ORIGIN
        const response = await axios.post(`${fastapi}/query`, {question: query});


        console.log("Fast api response is: ", response.data, "status is: ", response.status, "headrr is: ", response.headers);
        return res.status(200).json({data: response.data, status: true})
    } catch (error) {
        // console.log(error)
        return res.status(500).json({error: error.message, status: false})
    }
} 

export default QueryNode;