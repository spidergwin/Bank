import { db } from "@/lib/db";
import { User } from "@prisma/client";
import UserManagementClient from "@/components/admin/user-management-client";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Prisma Dates and BigInt need to be serialized for client components
  const serializedUsers = users.map((user: User) => ({
    ...user,
    balance: Number(user.balance),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  return <UserManagementClient users={serializedUsers} />;
}
