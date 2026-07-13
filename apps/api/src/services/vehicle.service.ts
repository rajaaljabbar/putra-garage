import { db } from '../config/db';
import { vehicles, serviceRecords, serviceItems } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { cloudinary } from '../config/cloudinary';

async function deleteCloudinaryImage(url: string | null) {
  if (!url) return;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return;
    const afterUpload = parts[1].split('/').slice(1).join('/');
    const publicId = afterUpload.split('.')[0];
    if (publicId) await cloudinary.uploader.destroy(publicId);
  } catch {}
}

export const getVehiclesByUser = async (userId: string) => {
  return await db.select().from(vehicles).where(eq(vehicles.userId, userId)).orderBy(asc(vehicles.createdAt));
};

export const getVehicleById = async (id: string, userId: string) => {
  const result = await db.select().from(vehicles).where(
    and(
      eq(vehicles.id, id),
      eq(vehicles.userId, userId)
    )
  );
  return result[0];
};

export const createVehicle = async (userId: string, data: any) => {
  const result = await db.insert(vehicles).values({
    userId,
    name: data.name,
    brand: data.brand,
    licensePlate: data.licensePlate,
    productionYear: data.productionYear ? parseInt(data.productionYear) : null,
    currentOdometer: parseInt(data.currentOdometer),
    tankCapacity: data.tankCapacity ? data.tankCapacity.toString() : '0',
    imageUrl: data.imageUrl,
    status: data.status || 'AKTIF',
  }).returning();
  return result[0];
};

export const updateVehicle = async (id: string, userId: string, data: any) => {
  const result = await db.update(vehicles).set({
    ...data,
    updatedAt: new Date(),
  }).where(
    and(
      eq(vehicles.id, id),
      eq(vehicles.userId, userId)
    )
  ).returning();
  return result[0];
};

export const deleteVehicle = async (id: string, userId: string) => {
  // Delete vehicle photo from Cloudinary
  const [veh] = await db.select({ imageUrl: vehicles.imageUrl }).from(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.userId, userId)));
  if (veh) await deleteCloudinaryImage(veh.imageUrl);
  // Delete receipt photos from Cloudinary
  const records = await db.select({ id: serviceRecords.id, receiptImageUrl: serviceRecords.receiptImageUrl }).from(serviceRecords).where(eq(serviceRecords.vehicleId, id));
  for (const r of records) await deleteCloudinaryImage(r.receiptImageUrl);
  // Delete service items & records
  for (const r of records) await db.delete(serviceItems).where(eq(serviceItems.serviceRecordId, r.id));
  await db.delete(serviceRecords).where(eq(serviceRecords.vehicleId, id));
  // Delete vehicle
  return await db.delete(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.userId, userId)));
};
