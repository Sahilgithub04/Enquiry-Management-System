import express, { Express } from 'express';
import cors from 'cors';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import enquiryRoutes from './routes/enquiryRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middlewares/errorMiddleware';
import { setupSwagger } from './config/swagger';

const app: Express = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

// API Documentation
setupSwagger(app);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/users', userRoutes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
