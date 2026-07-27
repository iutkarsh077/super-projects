import { Router} from "express"
import GithubLogin from "../controllers/GithubLogin.js";
import GithubCallback from "../controllers/GithubCallback.js";

const router = Router();


router.get("/auth/github", GithubLogin);
router.get("/auth/github/callback", GithubCallback)

export default router;