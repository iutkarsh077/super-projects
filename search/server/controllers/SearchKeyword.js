import CustomResponse from "../helpers/Error.js";

const SearchKeyword = async (req, res) => {
    try {
        const data = req.body;

        console.log(data);
        const ans = new CustomResponse(error.message, 201);
        return res.status(201).json(ans);
    } catch (error) {
        console.log(error);
        const data = new CustomResponse(error.message, 500);
        console.log(data);
        return res.status(500).json(data)
    }
} 

export default SearchKeyword;