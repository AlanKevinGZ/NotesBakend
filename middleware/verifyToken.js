import jwt from 'jsonwebtoken';

// Middleware para verificar el token JWT
export const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];
  if (!tokenHeader) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  try {
    let token=tokenHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Decodifica el token
    req.userId = decoded.id;  // Guarda el ID del usuario en el request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token no válido" });
  }
};
