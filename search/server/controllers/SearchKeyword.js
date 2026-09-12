import CustomResponse from "../helpers/Error.js";
import User from "../models/User.js";

const SearchKeyword = async (req, res) => {
    try {
        const { query } = req.query;

        const getUsers = await User.find({
            $or: [
                { email: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } },
                { role: { $regex: query, $options: 'i' } },
                { password: { $regex: query, $options: 'i' } }
            ]
        })

        const ans = new CustomResponse(getUsers, 201);
        return res.status(201).json(ans);
    } catch (error) {
        console.log(error);
        const data = new CustomResponse(error.message, 500);
        return res.status(500).json(data)
    }
}

export const Pagination = async (req, res) => {
    try {
        const { page } = req.query;

        const limit = 10;
        const skip = (page - 1) * limit;

        const totalDocs = (await User.find()).length;
        const totalPages = totalDocs / limit;
        console.log("total pages is: ", totalPages)

        const findUsers = await User.find().skip(skip).limit(limit);

        console.log("Paginate users are: ", findUsers);

        const lala = {
            findUsers,
            totalPages
        }

        const ans = new CustomResponse(lala, 201);
        return res.status(201).json(ans);
    } catch (error) {
        console.log(error);
        const data = new CustomResponse(error.message, 500);
        return res.status(500).json(data)
    }
}

export default SearchKeyword;