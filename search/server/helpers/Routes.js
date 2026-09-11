import { Router } from "express";
import SearchKeyword from "../controllers/SearchKeyword.js";

const route = Router();

route.get("/search", SearchKeyword);

export default route