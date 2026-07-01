import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const hospitalSettingsTable = pgTable("hospital_settings", {
  id: serial("id").primaryKey(),
  hospitalName: text("hospital_name").notNull().default("MediCore Hospital"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  logoUrl: text("logo_url"),
  workingHoursStart: text("working_hours_start").default("08:00"),
  workingHoursEnd: text("working_hours_end").default("18:00"),
  emergencyPhone: text("emergency_phone"),
  taxRate: text("tax_rate").default("0"),
  currency: text("currency").default("USD"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
