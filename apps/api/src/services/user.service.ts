import { db } from '../config/db';
import { users, sessions, accounts, vehicles, serviceRecords, serviceItems } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { cloudinary } from '../config/cloudinary';

// Helper: extract public_id from Cloudinary URL and delete
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
  // Delete profile photo from Cloudinary
  const [u] = await db.select({ image: users.image }).from(users).where(eq(users.id, userId));
  if (u) await deleteCloudinaryImage(u.image);

  // Get vehicles for photo cleanup
  const userVehicles = await db.select({ id: vehicles.id, imageUrl: vehicles.imageUrl }).from(vehicles).where(eq(vehicles.userId, userId));
  for (const v of userVehicles) await deleteCloudinaryImage(v.imageUrl);
  const vids = userVehicles.map((v) => v.id);

  if (vids.length > 0) {
    const records = await db.select({ id: serviceRecords.id, receiptImageUrl: serviceRecords.receiptImageUrl }).from(serviceRecords).where(inArray(serviceRecords.vehicleId, vids));
    for (const r of records) await deleteCloudinaryImage(r.receiptImageUrl);
    const rids = records.map((r) => r.id);
    if (rids.length > 0) await db.delete(serviceItems).where(inArray(serviceItems.serviceRecordId, rids));
    await db.delete(serviceRecords).where(inArray(serviceRecords.vehicleId, vids));
    await db.delete(vehicles).where(inArray(vehicles.id, vids));
  }
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(accounts).where(eq(accounts.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
};
