import { Router } from "express";
import userRoutes from "./user.routes";
import vehicleRoutes from "./vehicle.routes";
import serviceRoutes from "./service.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/vehicles/:vehicleId/services", serviceRoutes);

export default router;
