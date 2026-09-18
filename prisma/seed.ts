import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@company.com",
    },
    update: {
      name: "Administrator",
      password,
      role: "ADMIN",
    },
    create: {
      name: "Administrator",
      email: "admin@company.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("Admin berhasil dibuat:", {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });