import { Request, Response, NextFunction } from 'express';
import * as vehicleService from '../services/vehicle.service';

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
    const data = req.body;
    const newVehicle = await vehicleService.createVehicle(userId, data);
    res.status(201).json({ success: true, data: newVehicle });
  } catch (error) {
    next(error);
  }
};

export const updateVehicleData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const data = req.body;
    const updatedVehicle = await vehicleService.updateVehicle(id, userId, data);
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
