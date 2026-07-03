import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as vehicleService from '../services/vehicle.service';

const vehicleSchema = z.object({
  name: z.string().min(1).max(100),
  brand: z.string().min(1).max(50),
  licensePlate: z.string().max(20).optional().nullable(),
  productionYear: z.number().int().min(1900).max(2100).optional().nullable(),
  currentOdometer: z.number().int().min(0),
  tankCapacity: z.number().min(0).max(999),
  imageUrl: z.string().max(2000).optional().nullable(),
  status: z.enum(['AKTIF', 'TERPARKIR']).optional(),
});

export const getVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const vehicles = await vehicleService.getVehiclesByUser(userId);
    res.json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};

export const getVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const vehicle = await vehicleService.getVehicleById(id, userId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    // We can add condition logic here or in a separate service
    res.json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const addVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const parsed = vehicleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Invalid data', errors: parsed.error.flatten() });
    }
    const newVehicle = await vehicleService.createVehicle(userId, parsed.data);
    res.status(201).json({ success: true, data: newVehicle });
  } catch (error) {
    next(error);
  }
};

const vehicleUpdateSchema = vehicleSchema.partial();

export const updateVehicleData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const parsed = vehicleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Invalid data', errors: parsed.error.flatten() });
    }
    const updatedVehicle = await vehicleService.updateVehicle(id, userId, parsed.data);
    res.json({ success: true, data: updatedVehicle });
  } catch (error) {
    next(error);
  }
};

export const removeVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await vehicleService.deleteVehicle(id, userId);
    res.json({ success: true, message: 'Vehicle removed' });
  } catch (error) {
    next(error);
  }
};
