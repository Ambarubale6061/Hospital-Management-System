import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const prescriptionsTable = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  appointmentId: integer("appointment_id"),
  medications: text("medications").notNull(),
  dosageInstructions: text("dosage_instructions"),
  diagnosis: text("diagnosis"),
  validUntil: text("valid_until"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
