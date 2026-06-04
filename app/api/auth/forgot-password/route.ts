import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : null;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    // Always return 200 to not leak user existence
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate token and expiry (1 hour)
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Upsert VerificationToken (remove existing if any)
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL ?? "https://dentalbillingcompany.us"}/auth/reset-password?token=${token}`;

    await sendMail({
      to: email,
      subject: "Reset your DentalBillingCompany.us password",
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0F1F3D; margin-bottom: 8px;">Reset your password</h2>
          <p style="color: #64748b; margin-bottom: 24px;">
            Hi ${user.name ?? "there"},<br/>
            We received a request to reset the password for your account.
            Click the button below to choose a new password.
          </p>
          <a href="${resetUrl}"
             style="display: inline-block; padding: 12px 28px; background: #06B6D4; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Reset Password
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
            This link will expire in 1 hour. If you didn't request a password reset,
            you can safely ignore this email.
          </p>
          <p style="color: #cbd5e1; font-size: 12px; margin-top: 16px;">
            Or copy and paste this link: <br/>
            <a href="${resetUrl}" style="color: #06B6D4;">${resetUrl}</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/auth/forgot-password]", error);
    // Return 200 to not leak information
    return NextResponse.json({ success: true });
  }
}
