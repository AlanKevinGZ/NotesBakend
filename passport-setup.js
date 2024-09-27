import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { db } from "./config/database.js";

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback', // Cambiado
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
}, async (accessToken, refreshToken, profile, done) => {
    const googleId = profile.id;
    const username = profile.displayName;
    const email = profile.emails[0].value; // Extrae el correo electrónico de Google

    try {
        // Busca el usuario existente
        const existingUser = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);

        if (existingUser.rows.length) {
            // Usuario ya existe, actualiza el last_login
            await db.query('UPDATE users SET last_login = NOW() WHERE google_id = $1', [googleId]);
            done(null, existingUser.rows[0]);
        } else {
            // Crea un nuevo usuario
            const newUser = await db.query('INSERT INTO users (username, email,password_hash, last_login,google_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                 [username, email, 'google',null, googleId]);
            done(null, newUser.rows[0]);
        }
    } catch (error) {
        done(error, null); // Manejo de errores
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id); // Serializa el ID del usuario en la sesión
});

passport.deserializeUser((id, done) => {
    db.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
        done(err, result.rows[0]); // Deserializa el usuario a partir del ID
    });
});
