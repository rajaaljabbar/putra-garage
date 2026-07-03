import { neon } from '@neondatabase/serverless';
import { env } from './src/config/env';

const main = async () => {
  const sql = neon(env.DATABASE_URL);
  
  console.log('Dropping all existing tables...');
  await sql`DROP TABLE IF EXISTS service_items CASCADE`;
  await sql`DROP TABLE IF EXISTS service_records CASCADE`;
  await sql`DROP TABLE IF EXISTS vehicles CASCADE`;
  await sql`DROP TABLE IF EXISTS session CASCADE`;
  await sql`DROP TABLE IF EXISTS account CASCADE`;
  await sql`DROP TABLE IF EXISTS verification CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  // Also drop the drizzle migration journal so it re-runs cleanly
  await sql`DROP TABLE IF EXISTS __drizzle_migrations CASCADE`;
  console.log('All tables dropped.');

  console.log('Creating tables...');
  
  // Users
  await sql`CREATE TABLE "users" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "emailVerified" boolean NOT NULL DEFAULT false,
    "image" text,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now(),
    "phone_number" text,
    "member_type" text NOT NULL DEFAULT 'REGULAR'
  )`;
  
  // Session
  await sql`CREATE TABLE "session" (
    "id" text PRIMARY KEY NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "token" text NOT NULL UNIQUE,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL REFERENCES "users"("id")
  )`;
  
  // Account
  await sql`CREATE TABLE "account" (
    "id" text PRIMARY KEY NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL REFERENCES "users"("id"),
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp,
    "refreshTokenExpiresAt" timestamp,
    "scope" text,
    "password" text,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL
  )`;
  
  // Verification
  await sql`CREATE TABLE "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "createdAt" timestamp,
    "updatedAt" timestamp
  )`;
  
  // Vehicles
  await sql`CREATE TABLE "vehicles" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL REFERENCES "users"("id"),
    "name" text NOT NULL,
    "brand" text NOT NULL,
    "license_plate" text,
    "production_year" integer,
    "current_odometer" integer NOT NULL,
    "tank_capacity" numeric NOT NULL,
    "image_url" text,
    "status" text NOT NULL DEFAULT 'AKTIF',
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
  )`;
  
  // Service Records
  await sql`CREATE TABLE "service_records" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    "vehicle_id" uuid NOT NULL REFERENCES "vehicles"("id"),
    "workshop_name" text NOT NULL,
    "odometer_at_service" integer NOT NULL,
    "total_cost" numeric NOT NULL,
    "receipt_image_url" text,
    "service_date" timestamp NOT NULL DEFAULT now(),
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
  )`;
  
  // Service Items
  await sql`CREATE TABLE "service_items" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    "service_record_id" uuid NOT NULL REFERENCES "service_records"("id"),
    "item_name" text NOT NULL,
    "cost" numeric NOT NULL,
    "category" text
  )`;

  console.log('All tables created successfully!');
  process.exit(0);
};

main();
