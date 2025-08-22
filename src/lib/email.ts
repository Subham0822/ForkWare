import nodemailer from "nodemailer";

// Gmail SMTP using App Password. Ensure the following env vars are set on the server:
// GMAIL_USER, GMAIL_APP_PASSWORD. Optionally, EMAIL_FROM and EMAIL_FROM_NAME.

const smtpUser = process.env.GMAIL_USER as string;
const smtpPass = process.env.GMAIL_APP_PASSWORD as string;
const fromAddress = process.env.EMAIL_FROM || smtpUser;
const fromName = process.env.EMAIL_FROM_NAME || "ForkWare";

if (!smtpUser || !smtpPass) {
  // Avoid throwing during import in build environments; we validate on first send
  console.warn("Gmail SMTP env vars missing: GMAIL_USER/GMAIL_APP_PASSWORD");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  if (!smtpUser || !smtpPass) {
    throw new Error("Missing Gmail SMTP credentials");
  }

  await transporter.sendMail({
    from: `${fromName} <${fromAddress}>`,
    to,
    subject,
    text,
    html,
  });
}


