import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getNotes, getNoteById, createNote, editNote, deleteNote } from "../controllers/NoteController.js";
const router = express.Router();


router.get("/get-notes",verifyToken, getNotes); 

router.get("/get-note-id/:id",verifyToken, getNoteById);
router.post("/create-note",verifyToken, createNote); 


router.put('/notes-edit/:id', verifyToken, editNote);

// Ruta para eliminar una nota existente
router.delete('/notes-delete/:id', verifyToken, deleteNote);

export default router;