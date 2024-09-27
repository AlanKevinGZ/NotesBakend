import { db } from "../config/database.js";

export const getNotes = async (req, res) => {
  try {
    const existUser = await db.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [req.userId]
    );
    if (existUser.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const query = `SELECT notes.id, notes.title, notes.content, notes.created_at, "users".username, "users".email
                   FROM notes
                   INNER JOIN "users" ON notes.user_id = "users".id
                   WHERE notes.user_id = $1;`;

    const result = await db.query(query, [req.userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

export const getNoteById = async (req, res) => {
    try {
      const noteId = req.params.id; // Obtener el ID de la nota de los parámetros de la ruta
  
      // Consulta para obtener solo la nota con el id proporcionado
      const result = await db.query(
        "SELECT * FROM notes WHERE id = $1",
        [noteId]
      );
  
      // Verificar si no existe la nota
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Nota no encontrada" });
      }
  
      // Devolver la nota encontrada
      res.status(200).json(result.rows[0]);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener la nota" });
    }
  };
  
export const createNote = async (req, res) => {
  const { title, content } = req.body;

  try {
    // Obtener el ID del usuario autenticado desde req.userId
    const userId = req.userId;

    // Verificar que el usuario existe en la base de datos
    const existUser = await db.query(
      "SELECT id, username, email FROM users WHERE id = $1",
      [userId]
    );

    if (existUser.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si ya existe una nota con el mismo título para este usuario
    const checkTitle = await db.query(
      "SELECT id FROM notes WHERE user_id = $1 AND title = $2",
      [userId, title]
    );

    if (checkTitle.rows.length > 0) {
      return res.status(400).json({ message: "El título ya está en uso" });
    }

    // Insertar la nueva nota en la tabla 'notes'
    const insertData = await db.query(
      `INSERT INTO notes (title, content, created_at, updated_at, user_id)
         VALUES ($1, $2, NOW(), NOW(), $3)
         RETURNING *;`,
      [title, content, userId]
    );

    // Retornar la nota creada como respuesta
    res.status(201).json({ note: insertData.rows[0] });
  } catch (error) {
    console.error("Error al crear la nota:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

export const editNote = async (req, res) => {
  const { title, content } = req.body;
  const noteId = req.params.id; // Obtiene el ID de la nota desde los parámetros de la ruta

  try {
    // Verificar que la nota existe y pertenece al usuario autenticado
    const noteQuery = await db.query(
      "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, req.userId]
    );

    if (noteQuery.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Nota no encontrada o no autorizada" });
    }

    // Verificar si el nuevo título ya está en uso por otra nota del mismo usuario
    if (title) {
      // Solo verificar si se está intentando cambiar el título
      const checkTitle = await db.query(
        "SELECT id FROM notes WHERE user_id = $1 AND title = $2 AND id != $3",
        [req.userId, title, noteId]
      );

      if (checkTitle.rows.length > 0) {
        return res.status(400).json({ message: "El título ya está en uso" });
      }
    }

    // Actualizar la nota con los nuevos datos
    const updatedNote = await db.query(
      `UPDATE notes 
         SET title = COALESCE($1, title), 
             content = COALESCE($2, content), 
             updated_at = NOW() 
         WHERE id = $3 
         RETURNING *;`,
      [title, content, noteId]
    );

    res.status(200).json({ note: updatedNote.rows[0] });
  } catch (error) {
    console.error("Error al editar la nota:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

export const deleteNote = async (req, res) => {
  const noteId = req.params.id; // Obtiene el ID de la nota desde los parámetros de la ruta

  try {
    // Verificar que la nota existe y pertenece al usuario autenticado
    const noteQuery = await db.query(
      "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
      [noteId, req.userId]
    );

    if (noteQuery.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Nota no encontrada o no autorizada" });
    }

    // Eliminar la nota
    await db.query("DELETE FROM notes WHERE id = $1", [noteId]);

    res.status(200).json({ message: "Nota eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la nota:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
};
