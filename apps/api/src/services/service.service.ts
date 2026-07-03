import { db } from '../config/db';
import { serviceRecords, serviceItems, vehicles } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

export const getServicesByVehicleId = async (vehicleId: string) => {
  const records = await db.select().from(serviceRecords)
    .where(eq(serviceRecords.vehicleId, vehicleId))
    .orderBy(desc(serviceRecords.serviceDate));
    
  return records;
};

export const getServiceItemsWithOwnership = async (recordId: string, userId: string) => {
  // Join service_records -> vehicles to verify ownership
  const result = await db
    .select({ items: serviceItems })
    .from(serviceItems)
    .innerJoin(serviceRecords, eq(serviceItems.serviceRecordId, serviceRecords.id))
    .innerJoin(vehicles, eq(serviceRecords.vehicleId, vehicles.id))
    .where(and(
      eq(serviceItems.serviceRecordId, recordId),
      eq(vehicles.userId, userId)
    ));
  
  if (result.length === 0) return null;
  return result.map(r => r.items);
};

export const createServiceRecord = async (vehicleId: string, data: any, items: any[]) => {
  return await db.transaction(async (tx) => {
    // Insert the service record
    const [record] = await tx.insert(serviceRecords).values({
      vehicleId,
      workshopName: data.workshopName,
      odometerAtService: parseInt(data.odometerAtService),
      totalCost: data.totalCost.toString(),
      receiptImageUrl: data.receiptImageUrl,
    }).returning();

    // Insert the items if any
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        serviceRecordId: record.id,
        itemName: item.itemName,
        cost: item.cost.toString(),
        category: item.category,
      }));
      await tx.insert(serviceItems).values(itemsToInsert);
    }

    // Update vehicle's currentOdometer if the service odometer is higher
    const [vehicle] = await tx.select().from(vehicles).where(eq(vehicles.id, vehicleId));
    if (vehicle && parseInt(data.odometerAtService) > vehicle.currentOdometer) {
      await tx.update(vehicles).set({
        currentOdometer: parseInt(data.odometerAtService),
        updatedAt: new Date()
      }).where(eq(vehicles.id, vehicleId));
    }

    return record;
  });
};

export const getServiceItems = async (recordId: string) => {
  return await db.select().from(serviceItems).where(eq(serviceItems.serviceRecordId, recordId));
};
