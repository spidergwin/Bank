import { db as prisma } from "../lib/db";
import { hashPassword } from "better-auth/crypto";

async function main() {
  const adminEmail = "admin@lumabank.com";
  const adminPassword = "Password@123";
  const adminName = "Luma Admin";
  const adminAccountNumber = "0000000001";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    
    const user = await prisma.user.create({
      data: {
        name: adminName,
        firstName: "Luma",
        lastName: "Admin",
        email: adminEmail,
        accountNumber: adminAccountNumber,
        balance: 1000000, // $10,000 for admin testing
        role: "admin",
        emailVerified: true,
      },
    });

    await prisma.account.create({
        data: {
            accountId: adminEmail,
            providerId: "credential",
            userId: user.id,
            password: hashedPassword,
        }
    });

    console.log("Admin user created: ", adminEmail);
    console.log("Admin password: ", adminPassword);
  } else {
    console.log("Admin user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
