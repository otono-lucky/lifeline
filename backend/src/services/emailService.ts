import nodemailer from "nodemailer";
import env from "../config/env";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<void> => {
  if (!to || !subject || (!html && !text)) {
    throw new Error("Missing email fields (to, subject, html/text)");
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
    text,
  });
};
