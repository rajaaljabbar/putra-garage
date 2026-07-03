import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as userService from '../services/user.service';

const updateMeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().max(20).regex(/^[0-9+\-\s()]*$/, 'Invalid phone number').optional().nullable(),
  image: z.string().max(2000).optional().nullable(),
});

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const parsed = updateMeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Invalid data', errors: parsed.error.flatten() });
    }
    
    const updatedUser = await userService.updateUserProfile(userId, parsed.data);
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const deleteMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    await userService.deleteUserAccount(userId);
    res.json({ success: true, message: 'Account and all data deleted' });
  } catch (error) {
    next(error);
  }
};
