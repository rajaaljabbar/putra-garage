import { db } from '../config/db';
import { users } from '../db/schema';
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
