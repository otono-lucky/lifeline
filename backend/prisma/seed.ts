import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../src/config/db.js";

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const adminAccount = await prisma.account.upsert({
    where: { email: "admin@lifeline.test" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@lifeline.test",
      phone: "0000000000",
      password: passwordHash,
      role: "SuperAdmin",
    },
  });

  await prisma.superAdmin.upsert({
    where: { accountId: adminAccount.id },
    update: {},
    create: {
      accountId: adminAccount.id
    }
  })

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
