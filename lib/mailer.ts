import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM ?? "DentalBillingCompany.us <noreply@dentalbillingcompany.us>",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text ?? opts.html.replace(/<[^>]+>/g, ""),
  });
}

export const emailTemplates = {
  welcomeUser: (name: string) => ({
    subject: "Welcome to DentalBillingCompany.us",
    html: `<h2>Welcome, ${name}!</h2><p>Your account has been created successfully. Start exploring dental billing companies near you.</p>`,
  }),
  leadNotification: (companyName: string, fromName: string, fromEmail: string, message: string) => ({
    subject: `New Lead: ${fromName} is interested in your services`,
    html: `<h2>New Lead for ${companyName}</h2><p><strong>From:</strong> ${fromName} (${fromEmail})</p><p><strong>Message:</strong> ${message}</p>`,
  }),
  reviewApproved: (companyName: string) => ({
    subject: "Your review has been approved",
    html: `<p>Your review for <strong>${companyName}</strong> has been approved and is now live.</p>`,
  }),
  paymentConfirmation: (planName: string, amount: string) => ({
    subject: "Payment Confirmed — Your listing has been upgraded",
    html: `<h2>Payment Confirmed!</h2><p>Your <strong>${planName}</strong> plan has been activated. Amount charged: <strong>${amount}</strong>.</p>`,
  }),
  claimApproved: (companyName: string) => ({
    subject: `Ownership claim approved: ${companyName}`,
    html: `<p>Your ownership claim for <strong>${companyName}</strong> has been approved. You can now manage your listing.</p>`,
  }),
};
