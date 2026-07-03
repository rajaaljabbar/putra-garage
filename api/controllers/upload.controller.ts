import { Request, Response, NextFunction } from 'express';
import { cloudinary } from '../config/cloudinary';

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.body?.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    // Upload to Cloudinary (base64 or URL)
    const result = await cloudinary.uploader.upload(file, {
      folder: 'putra-garage',
      resource_type: 'auto',
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    next(error);
  }
};
