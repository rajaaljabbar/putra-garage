import { pgTable, text, timestamp, boolean, uuid, integer, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  // Extended fields for putra-garage
  phoneNumber: text('phone_number'),
  memberType: text('member_type').default('REGULAR').notNull(),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => users.id)
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull()
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt")
});

export const vehicles = pgTable('vehicles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  licensePlate: text('license_plate'),
  productionYear: integer('production_year'),
  currentOdometer: integer('current_odometer').notNull(),
  tankCapacity: decimal('tank_capacity').notNull(),
  imageUrl: text('image_url'),
  status: text('status').notNull().default('AKTIF'), // 'AKTIF' or 'TERPARKIR'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const serviceRecords = pgTable('service_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id),
  workshopName: text('workshop_name').notNull(),
  odometerAtService: integer('odometer_at_service').notNull(),
  totalCost: decimal('total_cost').notNull(),
  receiptImageUrl: text('receipt_image_url'),
  serviceDate: timestamp('service_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const serviceItems = pgTable('service_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  serviceRecordId: uuid('service_record_id').notNull().references(() => serviceRecords.id),
  itemName: text('item_name').notNull(),
  cost: decimal('cost').notNull(),
  category: text('category'),
});
