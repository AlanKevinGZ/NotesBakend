
import { db } from "../config/database.js";

// Método para registrar un nuevo usuario
export const getUser = async (req, res) => {
    try {
        console.log(req.userId);
        
        // Buscar al usuario en la base de datos usando el ID del token
        const result = await db.query("SELECT id, username, email FROM users WHERE id = $1", [req.userId]);
    
        if (result.rows.length === 0) {
          return res.status(404).json({ message: "Usuario no encontrado" });
        }
    
        const user = result.rows[0];
    
        // Devolver la información del usuario
        return res.status(200).json({ id: user.id, username: user.username, email: user.email });
        
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error del servidor" });
      }
}