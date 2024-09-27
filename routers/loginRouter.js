import express from "express";
import { loginUser } from "../controllers/loginController.js";
const router = express.Router();


router.post("/login-user", loginUser);  // Ruta para el login

export default router;