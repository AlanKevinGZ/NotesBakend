import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/info-user", verifyToken,getUser);  // Ruta para crear un nuevo usuario


export default router;
