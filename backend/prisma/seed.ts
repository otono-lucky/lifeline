import bcrypt from "bcryptjs";
import { prisma } from "../src/config/db";

async function main() {
  console.log("Seeding admin account...");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // const adminAccount = await prisma.account.upsert({
  //   where: { email: "admin@lifeline.test" },
  //   update: {},
  //   create: {
  //     firstName: "Admin",
  //     lastName: "User",
  //     email: "admin@lifeline.test",
  //     phone: "0000000000",
  //     password: passwordHash,
  //     role: "SuperAdmin",
  //     isEmailVerified: true,
  //     status: "active",
  //   },
  // });

  // await prisma.superAdmin.upsert({
  //   where: { accountId: adminAccount.id },
  //   update: {},
  //   create: {
  //     accountId: adminAccount.id,
  //   },
  // });

  console.log("Fetching churches...");
  const churches = await prisma.church.findMany({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  console.log("Fetching counsellors...");
  const counselors = await prisma.counselor.findMany({
    select: { id: true },
    orderBy: { account: { createdAt: "asc" } },
  });

  if (churches.length === 0 || counselors.length === 0) {
    throw new Error("No churches or counselors found. Seed them before users.");
  }

  const churchId = churches[0].id;

  console.log("Seeding sample users...");
  const sampleUsers = [
    {
      firstName: "Daniel",
      lastName: "Ayo",
      email: "daniel.ayo@lifeline.test",
      phone: "08000000003",
      gender: "Male",
      dateOfBirth: new Date("1994-05-20"),
      occupation: "Software Engineer",
      residenceCountry: "Nigeria",
      residenceState: "Lagos",
      residenceCity: "Ikeja",
      matchPreference: "my_church",
    },
    {
      firstName: "Samuel",
      lastName: "Ojo",
      email: "samuel.ojo@lifeline.test",
      phone: "08000000004",
      gender: "Male",
      dateOfBirth: new Date("1992-11-08"),
      occupation: "Civil Engineer",
      residenceCountry: "Nigeria",
      residenceState: "Oyo",
      residenceCity: "Ibadan",
      matchPreference: "my_church",
    },
    {
      firstName: "Ruth",
      lastName: "Nneka",
      email: "ruth.nneka@lifeline.test",
      phone: "08000000005",
      gender: "Female",
      dateOfBirth: new Date("1996-09-12"),
      occupation: "Product Designer",
      residenceCountry: "Nigeria",
      residenceState: "Lagos",
      residenceCity: "Lekki",
      matchPreference: "my_church",
    },
    {
      firstName: "Grace",
      lastName: "Okoro",
      email: "grace.okoro@lifeline.test",
      phone: "08000000006",
      gender: "Female",
      dateOfBirth: new Date("1995-03-02"),
      occupation: "Nutritionist",
      residenceCountry: "Nigeria",
      residenceState: "Rivers",
      residenceCity: "Port Harcourt",
      matchPreference: "my_church",
    },
  ];

  for (const user of sampleUsers) {
    const assignedCounselorId =
      counselors[Math.floor(Math.random() * counselors.length)].id;

    const account = await prisma.account.upsert({
      where: { email: user.email },
      update: {},
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        password: passwordHash,
        role: "User",
        isEmailVerified: true,
        status: "active",
      },
    });

    await prisma.user.upsert({
      where: { accountId: account.id },
      update: {
        churchId,
        assignedCounselorId,
        gender: user.gender as any,
        dateOfBirth: user.dateOfBirth,
        occupation: user.occupation,
        residenceCountry: user.residenceCountry,
        residenceState: user.residenceState,
        residenceCity: user.residenceCity,
        matchPreference: user.matchPreference as any,
      },
      create: {
        accountId: account.id,
        churchId,
        assignedCounselorId,
        gender: user.gender as any,
        dateOfBirth: user.dateOfBirth,
        occupation: user.occupation,
        residenceCountry: user.residenceCountry,
        residenceState: user.residenceState,
        residenceCity: user.residenceCity,
        matchPreference: user.matchPreference as any,
      },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
