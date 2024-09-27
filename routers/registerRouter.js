// routes/UserRouter.js

import express from "express";
import { registerUser } from "../controllers/registerController.js";

const router = express.Router();

router.post("/user", registerUser);  // Ruta para crear un nuevo usuario


export default router;
