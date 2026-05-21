import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clubRoutes from './modules/club/club.routes'; // ← línea nueva

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando' });
});

app.use('/api/clubs', clubRoutes); // ← línea nueva

export default app;