import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { resend } from "./resend";
import VerificationEmail from "@/components/emails/verification-email";
import ResetPasswordEmail from "@/components/emails/reset-password-email";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.197.193.31:3000",
    "https://lumabankingsystem.vercel.app",
    "https://lumabank.vercel.app"
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Reset your Luma Bank password",
        react: ResetPasswordEmail({ resetUrl: url }),
      });
      if (error) {
        console.error("Resend Reset Password Error:", error);
      } else {
        console.log("Resend Reset Password Success:", data);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Verify your email address - Luma Bank",
        react: VerificationEmail({ verificationUrl: url }),
      });
      if (error) {
        console.error("Resend Verification Email Error:", error);
      } else {
        console.log("Resend Verification Email Success:", data);
      }
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
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
