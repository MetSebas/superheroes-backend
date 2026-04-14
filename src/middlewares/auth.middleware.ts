import { Request, Response, NextFunction } from 'express';
import jwt,{Secret} from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  //const token = req.headers['authorization'];
const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    const secretEnv = process.env.JWT_SECRET;
    if (!secretEnv) {
        console.error('JWT_SECRET not defined in environment');
        return res.status(500).json({ message: 'Server misconfiguration' });
    }
    const secret: Secret = secretEnv;

    try {
        const decoded = jwt.verify(token, secret) as { id?: number | string } | string;
        if (typeof decoded === 'object' && decoded && 'id' in decoded) {
            // Ajusta según cómo uses el id (number o string) y dónde lo guardas en req
            console.log('Decoded token payload:', decoded);
            (req as any).userId = decoded.id;
            return next();
        }
        return res.status(401).json({ message: 'Invalid token payload' });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

