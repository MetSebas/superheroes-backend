import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import heroRoutes from './routes/hero.routes';

const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite que tu frontend acceda al backend
app.use(express.json());

// Rutas
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/api/auth', authRoutes);
app.use('/api/heroes', heroRoutes);
app.get('/', (req, res) =>{
  res.send("<h1>Bienvenido a mi API con Express y TypeScript</h1>");
});

app.get('/mult/:num1/:num2', (req, res) =>{
  const num1 = parseInt(req.params.num1);
  const num2 = parseInt(req.params.num2);
  const resultado = num1*num2;

  res.send(`<h1>El resultado es: ${resultado}</h1>`);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
