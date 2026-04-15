import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.197.193.31:3000",
    "https://lumabankingsystem.vercel.app"
  ],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      accountNumber: {
        type: "string",
        required: true,
      },
      balance: {
        type: "number",
        defaultValue: 0,
      },
      role: {
        type: "string",
        defaultValue: "user",
      },
      isLocked: {
        type: "boolean",
        defaultValue: false,
      },
      lockedReason: {
        type: "string",
        required: false,
      },
    },
  },
});
