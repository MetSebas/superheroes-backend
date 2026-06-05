import { Router } from 'express';
import {getCatalog,addFavorite,getMyFavorites,removeFavorite,createHero,updateHero,deleteHero} from '../controllers/hero.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import path = require('path');
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    // Le damos un nombre único para que no se sobrescriban (ej: 1717500000-batman.png)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const router = Router();

// Rutas Públicas (Lectura)
router.get('/catalog', getCatalog);

// Rutas Protegidas (Requieren Login)
router.get('/favorites', verifyToken, getMyFavorites);
router.post('/favorites', verifyToken, addFavorite);
router.delete('/favorites/:id', verifyToken, removeFavorite);


// Rutas CRUD de Administrador de Superhéroes (Requieren Login)
router.post('/', verifyToken, upload.single('imagen'), createHero); // Agregar nuevo superhéroe
router.put('/:id', verifyToken, updateHero); // Modificar datos del superhéroe
router.delete('/:id', verifyToken, deleteHero); // Eliminar superhéroe

export default router;