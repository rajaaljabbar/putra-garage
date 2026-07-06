import { db } from '../config/db';
import { vehicles } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';

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
  return await db.delete(vehicles).where(
    and(
      eq(vehicles.id, id),
      eq(vehicles.userId, userId)
    )
  );
};
