import { Router } from "express";
import RegisterUser from "./controllers/RegisterUser.js";
import LoginUser from "./controllers/loginUser.js";
import GetUsers from "./controllers/getuser.js";
import LogoutUser from "./controllers/logoutuser.js";
import multer from "multer";
import UploadedFile from "./controllers/UploadedFile.js";

const route = Router();

const upload = multer({
    dest: "uploads/"
})

route.post("/register", RegisterUser);
route.post("/login", LoginUser);
route.get("/getusers", GetUsers);
route.get("/logout", LogoutUser);
route.post("/upload-file", upload.array("photo", 10), UploadedFile);

export default route;