import { Router } from "express";
import RegisterUser from "./controllers/RegisterUser.js";
import LoginUser from "./controllers/loginUser.js";
import GetUsers from "./controllers/getuser.js";
import LogoutUser from "./controllers/logoutuser.js";

const route = Router();

route.post("/register", RegisterUser);
route.post("/login", LoginUser);
route.get("/getusers", GetUsers);
route.get("/logout", LogoutUser);

export default route;