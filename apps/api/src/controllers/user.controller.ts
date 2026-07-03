import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

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
    const { name, phoneNumber, image } = req.body;
    
    const updatedUser = await userService.updateUserProfile(userId, { name, phoneNumber, image });
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
