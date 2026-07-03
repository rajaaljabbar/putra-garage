import { db } from '../config/db';
import { users, sessions, accounts, vehicles, serviceRecords, serviceItems } from '../db/schema';
import { eq } from 'drizzle-orm';

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
  return await db.transaction(async (tx) => {
    const userVehicles = await tx.select().from(vehicles).where(eq(vehicles.userId, userId));
    for (const v of userVehicles) {
      const records = await tx.select().from(serviceRecords).where(eq(serviceRecords.vehicleId, v.id));
      for (const r of records) {
        await tx.delete(serviceItems).where(eq(serviceItems.serviceRecordId, r.id));
      }
      await tx.delete(serviceRecords).where(eq(serviceRecords.vehicleId, v.id));
      await tx.delete(vehicles).where(eq(vehicles.id, v.id));
    }
    await tx.delete(sessions).where(eq(sessions.userId, userId));
    await tx.delete(accounts).where(eq(accounts.userId, userId));
    await tx.delete(users).where(eq(users.id, userId));
  });
};
