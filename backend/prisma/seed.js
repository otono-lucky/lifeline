import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@lifeline.test" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@lifeline.test",
      phone: "0000000000",
      password: passwordHash,
      gender: "Male",
      isVerified: true,
    },
  });

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
