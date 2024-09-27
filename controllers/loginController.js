import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/database.js";  

// Controlador para el login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario en la base de datos por email
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        // Verificar si el usuario existe
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const user = result.rows[0];

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // Crear el token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,  // Debes tener una variable de entorno JWT_SECRET
            { expiresIn: "1h" }  // Expira en 1 hora
        );

        // Devolver el token y los detalles del usuario
        return res.status(200).json({ token, user: { id: user.id, username: user.username } });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error del servidor" });
    }
};
