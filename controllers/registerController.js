import bcrypt from "bcryptjs";
import { db } from "../config/database.js";

// Método para registrar un nuevo usuario
export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await db.query(
            "INSERT INTO users (username, email, password_hash,last_login,google_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [username, email, passwordHash,null,null]
        );

        return res.status(201).json({ user: { id: newUser.rows[0].id, username: newUser.rows[0].username } });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};

