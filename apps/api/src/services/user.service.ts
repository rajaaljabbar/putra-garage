import { db } from '../config/db';
import { users, sessions, accounts, vehicles, serviceRecords, serviceItems } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';

export const getUserById = async (id: string) => {
  const result = await db.select().from(users).where(eq(users.id, id));
  return result[0];
};

export const updateUserProfile = async (id: string, data: { name?: string; phoneNumber?: string; image?: string }) => {
  const result = await db.update(users).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(users.id, id)).returning();
  return result[0];
};

export const deleteUserAccount = async (userId: string) => {
  // Batch-optimized: use inArray for fewer queries
  const userVehicles = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.userId, userId));
  const vids = userVehicles.map((v) => v.id);
  if (vids.length > 0) {
    const records = await db.select({ id: serviceRecords.id }).from(serviceRecords).where(inArray(serviceRecords.vehicleId, vids));
    const rids = records.map((r) => r.id);
    if (rids.length > 0) await db.delete(serviceItems).where(inArray(serviceItems.serviceRecordId, rids));
    await db.delete(serviceRecords).where(inArray(serviceRecords.vehicleId, vids));
    await db.delete(vehicles).where(inArray(vehicles.id, vids));
  }
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(accounts).where(eq(accounts.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
};
