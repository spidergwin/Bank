import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "admin@lumabank.com" },
  });
  console.log("Admin Check:", JSON.stringify(user, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main().finally(() => prisma.$disconnect());
