import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clubRoutes from './modules/club/club.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando' });
});

app.use('/api/clubs', clubRoutes);

app.use(errorHandler);

export default app;