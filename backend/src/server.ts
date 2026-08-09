import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";
import { seedDefaultAdmin } from "./utils/seed";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`[Server] CloudBlitz Backend running on port ${PORT}`);
  console.log(`[Swagger] OpenAPI Docs available at /api/docs`);

  // Connect to DB and seed after server starts listening
  await connectDB();
  await seedDefaultAdmin();
});
