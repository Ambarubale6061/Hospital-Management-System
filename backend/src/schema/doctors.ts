import { pgTable, text, serial, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  departmentId: integer("department_id"),
  specialization: text("specialization").notNull(),
  subSpecialization: text("sub_specialization"),
  qualifications: text("qualifications"),
  licenseNumber: text("license_number"),
  consultationFee: numeric("consultation_fee", { precision: 10, scale: 2 }).notNull().default("100"),
  videoConsultationFee: numeric("video_consultation_fee", { precision: 10, scale: 2 }),
  emergencyConsultationFee: numeric("emergency_consultation_fee", { precision: 10, scale: 2 }),
  followUpFee: numeric("follow_up_fee", { precision: 10, scale: 2 }),
  yearsOfExperience: integer("years_of_experience"),
  bio: text("bio"),
  services: text("services"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  gender: text("gender"),
  languages: text("languages"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const availabilitySlotsTable = pgTable("availability_slots", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
