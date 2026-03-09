import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@infrascope.dev";
const ADMIN_PASSWORD = "admin123";

async function main() {
  console.log("Checking for admin user...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log("✓ Admin user already exists:");
    console.log(`  Email: ${existingAdmin.email}`);
    console.log(`  Role: ${existingAdmin.role}`);
    return;
  }

  console.log("Creating admin user...");

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log("✓ Admin user created successfully:");
  console.log(`  Email: ${admin.email}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });