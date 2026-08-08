import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
import { seedDefaultAdmin } from './utils/seed';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`[Server] CloudBlitz Backend running on http://localhost:${PORT}`);
    console.log(`[Swagger] OpenAPI Docs available at http://localhost:${PORT}/api/docs`);
  });
};

startServer();
