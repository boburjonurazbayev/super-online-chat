import { Router } from "express";
import controller from "../controllers/user.js";
import validation from "../middlewares/validation.js";


const router = Router();

router.post("/login", validation, controller.LOGIN);
router.post("/register", validation, controller.REGISTER)
router.post("/messages", controller.POST)
router.get("/messages", controller.GET)
router.get("/users", controller.GET)
router.get("/view/:fileName", controller.GET)
router.get("/download/:fileName", controller.GET)

export default router;
