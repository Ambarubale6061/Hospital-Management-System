/**
 * Demo account seeder.
 *
 * Creates (or fixes the password of) the standard demo accounts used for
 * testing/demoing Hospital-Hub. Safe to run multiple times — existing users
 * are updated in place rather than duplicated.
 *
 * Usage:
 *   npm run seed
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable, doctorsTable, patientsTable } from "./db.js";

const DEMO_PASSWORD = "password123";

interface DemoUser {
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "doctor" | "patient" | "receptionist";
  phone?: string;
}

const DEMO_USERS: DemoUser[] = [
  { email: "admin@hospital.com", firstName: "Alex", lastName: "Admin", role: "admin", phone: "555-0100" },
  { email: "dr.carter@hospital.com", firstName: "Sarah", lastName: "Carter", role: "doctor", phone: "555-0101" },
  { email: "john.doe@email.com", firstName: "John", lastName: "Doe", role: "patient", phone: "555-0102" },
  { email: "reception@hospital.com", firstName: "Riley", lastName: "Front", role: "receptionist", phone: "555-0103" },
];

async function upsertUser(demo: DemoUser) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, demo.email));

  if (existing) {
    const [updated] = await db
      .update(usersTable)
      .set({ passwordHash, isActive: true })
      .where(eq(usersTable.id, existing.id))
      .returning();
    console.log(`Updated password for existing user: ${demo.email}`);
    return updated;
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      email: demo.email,
      passwordHash,
      firstName: demo.firstName,
      lastName: demo.lastName,
      role: demo.role,
      phone: demo.phone || null,
      isActive: true,
    })
    .returning();
  console.log(`Created user: ${demo.email}`);
  return created;
}

async function ensureDoctorProfile(userId: number) {
  const [existing] = await db.select().from(doctorsTable).where(eq(doctorsTable.userId, userId));
  if (existing) return existing;

  const [created] = await db
    .insert(doctorsTable)
    .values({
      userId,
      specialization: "General Medicine",
      qualifications: "MBBS, MD",
      consultationFee: "100",
      yearsOfExperience: 8,
      isAvailable: true,
    })
    .returning();
  console.log(`Created doctor profile for user #${userId}`);
  return created;
}

async function ensurePatientProfile(userId: number) {
  const [existing] = await db.select().from(patientsTable).where(eq(patientsTable.userId, userId));
  if (existing) return existing;

  const [created] = await db
    .insert(patientsTable)
    .values({
      userId,
      gender: "Male",
      bloodGroup: "O+",
    })
    .returning();
  console.log(`Created patient profile for user #${userId}`);
  return created;
}

async function main() {
  console.log("Seeding demo accounts...");

  for (const demo of DEMO_USERS) {
    const user = await upsertUser(demo);
    if (!user) continue;

    if (demo.role === "doctor") {
      await ensureDoctorProfile(user.id);
    } else if (demo.role === "patient") {
      await ensurePatientProfile(user.id);
    }
  }

  console.log("\nDemo accounts ready. All use password: " + DEMO_PASSWORD);
  console.log("  admin@hospital.com       (admin)");
  console.log("  dr.carter@hospital.com   (doctor)");
  console.log("  john.doe@email.com       (patient)");
  console.log("  reception@hospital.com   (receptionist)");

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
