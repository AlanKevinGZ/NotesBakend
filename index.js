import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import loginRouter from './routers/loginRouter.js';
import registerRouter from './routers/registerRouter.js';
import userRouter from './routers/userRouters.js';
import notesRouter from './routers/notesRouter.js';

import './passport-setup.js'; // Asegúrate de importar tu configuración de Passport

import { db } from "./config/database.js";

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET, // Asegúrate de establecer esta variable en tu .env
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

db.connect((err) => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to database');
    }
});

// Rutas de autenticación con Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    // Redirige al frontend con el token
    res.redirect(`http://localhost:5173?token=${token}`);
  }
);

app.use("/api-login", loginRouter);
app.use('/api-register', registerRouter);
app.use('/api-user', userRouter);
app.use('/api-notes', notesRouter);


//private


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
