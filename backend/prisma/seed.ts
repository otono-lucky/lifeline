import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../src/config/db";

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
      isEmailVerified: true,
      status: "active"
    },
  });

  await prisma.superAdmin.upsert({
    where: { accountId: adminAccount.id },
    update: {},
    create: {
      accountId: adminAccount.id
    }
  })

  const church = await prisma.church.upsert({
    where: { email: "lifelinechurch@test.org" },
    update: {},
    create: {
      officialName: "Lifeline Community Church",
      aka: "LCC",
      email: "lifelinechurch@test.org",
      phone: "08000000001",
      state: "Lagos",
      city: "Ikeja",
      status: "active",
      createdBy: (await prisma.superAdmin.findUniqueOrThrow({
        where: { accountId: adminAccount.id },
      })).id,
    },
  });

  const counselorAccount = await prisma.account.upsert({
    where: { email: "counselor@lifeline.test" },
    update: {},
    create: {
      firstName: "Grace",
      lastName: "Counselor",
      email: "counselor@lifeline.test",
      phone: "08000000002",
      password: passwordHash,
      role: "Counselor",
      isEmailVerified: true,
      status: "active",
    },
  });

  const counselor = await prisma.counselor.upsert({
    where: { accountId: counselorAccount.id },
    update: { churchId: church.id },
    create: {
      accountId: counselorAccount.id,
      churchId: church.id,
      bio: "Experienced relationship counselor",
    },
  });

  const maleAccount = await prisma.account.upsert({
    where: { email: "male.user@lifeline.test" },
    update: {},
    create: {
      firstName: "Daniel",
      lastName: "Ayo",
      email: "male.user@lifeline.test",
      phone: "08000000003",
      password: passwordHash,
      role: "User",
      isEmailVerified: true,
      status: "active",
    },
  });

  const femaleAccount = await prisma.account.upsert({
    where: { email: "female.user@lifeline.test" },
    update: {},
    create: {
      firstName: "Ruth",
      lastName: "Nneka",
      email: "female.user@lifeline.test",
      phone: "08000000004",
      password: passwordHash,
      role: "User",
      isEmailVerified: true,
      status: "active",
    },
  });

  const maleUser = await prisma.user.upsert({
    where: { accountId: maleAccount.id },
    update: {
      churchId: church.id,
      assignedCounselorId: counselor.id,
      isVerified: true,
      verificationStatus: "verified",
      dateOfBirth: new Date("1995-05-20"),
      profilePictureUrl: "https://example.com/images/daniel.jpg",
      videoIntroUrl: "https://youtu.be/example-daniel",
    },
    create: {
      accountId: maleAccount.id,
      gender: "Male",
      churchId: church.id,
      assignedCounselorId: counselor.id,
      isVerified: true,
      verificationStatus: "verified",
      verifiedAt: new Date(),
      dateOfBirth: new Date("1995-05-20"),
      occupation: "Software Engineer",
      profilePictureUrl: "https://example.com/images/daniel.jpg",
      videoIntroUrl: "https://youtu.be/example-daniel",
      matchPreference: "my_church",
    },
  });

  const femaleUser = await prisma.user.upsert({
    where: { accountId: femaleAccount.id },
    update: {
      churchId: church.id,
      assignedCounselorId: counselor.id,
      isVerified: true,
      verificationStatus: "verified",
      dateOfBirth: new Date("1997-09-12"),
      profilePictureUrl: "https://example.com/images/ruth.jpg",
      videoIntroUrl: "https://youtu.be/example-ruth",
    },
    create: {
      accountId: femaleAccount.id,
      gender: "Female",
      churchId: church.id,
      assignedCounselorId: counselor.id,
      isVerified: true,
      verificationStatus: "verified",
      verifiedAt: new Date(),
      dateOfBirth: new Date("1997-09-12"),
      occupation: "Product Designer",
      profilePictureUrl: "https://example.com/images/ruth.jpg",
      videoIntroUrl: "https://youtu.be/example-ruth",
      matchPreference: "my_church",
    },
  });

  await prisma.userSocialMedia.deleteMany({
    where: {
      userId: { in: [maleUser.id, femaleUser.id] },
    },
  });

  await prisma.userSocialMedia.createMany({
    data: [
      { userId: maleUser.id, platform: "Instagram", handleOrUrl: "@danielayo" },
      { userId: maleUser.id, platform: "LinkedIn", handleOrUrl: "linkedin.com/in/danielayo" },
      { userId: femaleUser.id, platform: "Instagram", handleOrUrl: "@ruthnneka" },
      { userId: femaleUser.id, platform: "LinkedIn", handleOrUrl: "linkedin.com/in/ruthnneka" },
    ],
  });

  const existingSampleMatch = await prisma.match.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: maleUser.id } } },
        { participants: { some: { userId: femaleUser.id } } },
      ],
    },
    select: { id: true },
  });

  if (!existingSampleMatch) {
    const match = await prisma.match.create({
      data: {
        status: "AWAITING_DECISIONS",
        counselorId: counselor.id,
      },
    });

    await prisma.matchParticipant.createMany({
      data: [
        {
          matchId: match.id,
          userId: maleUser.id,
          decision: "PENDING",
        },
        {
          matchId: match.id,
          userId: femaleUser.id,
          decision: "PENDING",
        },
      ],
    });
  }

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
