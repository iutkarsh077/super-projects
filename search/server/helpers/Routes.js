import { Router } from "express";
import SearchKeyword, { Pagination } from "../controllers/SearchKeyword.js";

const route = Router();

route.get("/search", SearchKeyword);

route.get("/paginate", Pagination)

export default route