import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth';
import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}));

// Better Auth handler MUST be mounted BEFORE express.json()
// because it needs to parse its own request body.
// Mount at root so Better Auth receives the full /api/auth/* path.
app.use(toNodeHandler(auth));

// Increase JSON body limit for base64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

import userRoutes from './routes/user.routes';
import vehicleRoutes from './routes/vehicle.routes';
import serviceRoutes from './routes/service.routes';
import uploadRoutes from './routes/upload.routes';

app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/upload', uploadRoutes);

// Base route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Putra Garage API' });
});

// Setup error handler
app.use(errorHandler);

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
