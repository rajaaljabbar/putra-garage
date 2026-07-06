import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";

import userRoutes from "./routes/user.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import serviceRoutes from "./routes/service.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: "Too many attempts" } });
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

app.use("/api/auth", authLimiter);
app.use("/api", generalLimiter);

// CORS - allow local dev & Vercel preview
const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Better Auth handler MUST be mounted BEFORE express.json()
// Mount at root so it handles /api/auth/* paths
app.use(toNodeHandler(auth));

// Body parser with higher limit for image uploads (base64)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/upload", uploadRoutes);

// Base route
app.get("/api", (_req, res) => {
  res.json({ message: "Welcome to Putra Garage API" });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

export default app;
