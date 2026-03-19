import { MailtrapClient } from "mailtrap";
import nodemailer from "nodemailer"
import env from "../config/env";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

const mailtrapToken = env.mailtrap.apiKey;
const isSandbox = env.mailtrap.useSandbox;
const mailtrapInboxId = isSandbox ? Number(env.mailtrap.inboxId) : undefined; // required only for sandbox
const mailtrapFromEmail = env.mailtrap.fromEmail;

const client = mailtrapToken
  ? new MailtrapClient({
      token: mailtrapToken,
      sandbox: isSandbox,
      testInboxId: mailtrapInboxId,
      accountId: Number(env.mailtrap.accountId)
    })
  : null;

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure ?? env.smtp.port === 465,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

let hasVerifiedTransporter = false;

const verifyTransporter = async () => {
  if (hasVerifiedTransporter) return;
  hasVerifiedTransporter = true;
  try {
    await transporter.verify();
    console.log(
      `[email] SMTP verified host=${env.smtp.host} port=${env.smtp.port} secure=${env.smtp.secure}`,
    );
  } catch (error: any) {
    console.error(
      `[email] SMTP verify failed host=${env.smtp.host} port=${env.smtp.port} secure=${env.smtp.secure}:`,
      error?.message || error,
    );
  }
};

export const sendEmail = async ({
  to,
  subject, 
  html,
  text,
}: SendEmailOptions): Promise<void> => {
  if (!to || !subject || (!html && !text)) {
    throw new Error("Missing email fields (to, subject, html/text)");
  }

  const startedAt = Date.now();
  await verifyTransporter();
  console.log(
    `[email] Sending to=${to} subject="${subject}" host=${env.smtp.host} port=${env.smtp.port}`,
  );
  try {
    await transporter.sendMail({
      from: `Lifeline <${env.smtp.from || env.smtp.user}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`[email] Sent to=${to} in ${Date.now() - startedAt}ms`);
  } catch (error: any) {
    console.error(
      `[email] Failed to=${to} after ${Date.now() - startedAt}ms:`,
      error?.message || error,
    );
    throw error;
  }
};


export const sendTestEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<string> => {
  if (!to || !subject || (!html && !text)) {
    throw new Error("Missing email fields (to, subject, html/text)");
  }

  if (!client) {
    throw new Error("Missing Mailtrap configuration (MAILTRAP_API_KEY).");
  }
  if (isSandbox && !mailtrapInboxId) {
    throw new Error(
      "Missing Mailtrap configuration (MAILTRAP_INBOX_ID) for sandbox.",
    );
  }

  const fromEmail = mailtrapFromEmail || "sandbox@example.com";
  const startedAt = Date.now();

  console.log(
    `[email] Sending via Mailtrap to=${to} subject="${subject}" from=${fromEmail}`,
  );

  try {
    const result = await client.send({
      to: [{ email: to }],
      from: {
        name: "Lifeline",
        email: fromEmail,
      },
      subject: isSandbox ? `[SANDBOX] ${subject}` : subject,
      text: text || "Testing",
      html,
    });
    console.log("Email result:", result)
    
    const messageId = Number(result?.message_ids[0])

    console.log("Getting message with ID:", messageId)
    const emailMessage = await client.testing.messages.getHtmlMessage(mailtrapInboxId, messageId);

    console.log(`[email] Sent to=${to} in ${Date.now() - startedAt}ms`);
    console.log("Email message:", emailMessage)
    
    return emailMessage;
  } catch (error: any) {
    console.error(
      `[email] Failed to=${to} after ${Date.now() - startedAt}ms:`,
      error?.message || error,
    );
    throw error;
  }
};
