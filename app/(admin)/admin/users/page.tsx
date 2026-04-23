import { db } from "@/lib/db";
import { User } from "@prisma/client";
import UserManagementClient from "@/components/admin/user-management-client";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Prisma Dates and other fields are already serialized correctly for client components
  const serializedUsers = users.map((user: User) => ({
    ...user,
  }));

  return <UserManagementClient users={serializedUsers} />;
}
