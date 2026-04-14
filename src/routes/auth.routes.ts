import { Router } from 'express';
import { register, login, updateUser } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register); // Alta de usuario
router.post('/login', login);      
router.put('/update', verifyToken, updateUser); // Modificar alta de usuario (Protegida)

export default router;
