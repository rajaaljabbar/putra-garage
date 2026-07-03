import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { auth } from "./config/auth";
import { toNodeHandler } from "better-auth/node";

import apiRoutes from "./routes";

const app = express();

// Middlewares
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Better Auth endpoint
app.use("/api/auth", toNodeHandler(auth) as any);

// API Routes
app.use("/api", apiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

export default app;
