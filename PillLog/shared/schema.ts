import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"),
  duration: text("duration"),
  hospitalName: text("hospital_name"),
  doctorName: text("doctor_name"),
  prescribedDate: timestamp("prescribed_date"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  effect: text("effect"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const symptomRecords = pgTable("symptom_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  medicationId: varchar("medication_id").notNull(),
  painLevel: integer("pain_level").notNull(),
  symptoms: jsonb("symptoms").$type<string[]>(),
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const imageUploads = pgTable("image_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  fileName: text("file_name").notNull(),
  originalUrl: text("original_url").notNull(),
  extractedText: text("extracted_text"),
  processingStatus: text("processing_status").notNull().default("pending"),
  medicationId: varchar("medication_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export const insertSymptomRecordSchema = createInsertSchema(symptomRecords).omit({
  id: true,
  recordedAt: true,
});

export const insertImageUploadSchema = createInsertSchema(imageUploads).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type SymptomRecord = typeof symptomRecords.$inferSelect;
export type InsertSymptomRecord = z.infer<typeof insertSymptomRecordSchema>;
export type ImageUpload = typeof imageUploads.$inferSelect;
export type InsertImageUpload = z.infer<typeof insertImageUploadSchema>;
