import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "checked_in",
  "waiting",
  "in_consultation",
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  appointmentDate: text("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status", { enum: APPOINTMENT_STATUSES }).notNull().default("pending"),
  reason: text("reason"),
  notes: text("notes"),
  tokenNumber: integer("token_number"),
  chiefComplaint: text("chief_complaint"),
  consultationNotes: text("consultation_notes"),
  diagnosis: text("diagnosis"),
  followUpDate: text("follow_up_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
