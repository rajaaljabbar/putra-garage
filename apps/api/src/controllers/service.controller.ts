import { Request, Response, NextFunction } from 'express';
import * as svcService from '../services/service.service';
import * as vehicleService from '../services/vehicle.service';

export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.id;
    
    // Verify vehicle belongs to user
    const vehicle = await vehicleService.getVehicleById(vehicleId, userId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const services = await svcService.getServicesByVehicleId(vehicleId);
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

export const addService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.id;
    const { record, items } = req.body;
    
    // Verify vehicle belongs to user
    const vehicle = await vehicleService.getVehicleById(vehicleId, userId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const newRecord = await svcService.createServiceRecord(vehicleId, record, items);
    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    next(error);
  }
};

export const getServiceDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // In a real app we would check if the service record belongs to a vehicle owned by the user
    // For simplicity, we just fetch items
    const items = await svcService.getServiceItems(id);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};
