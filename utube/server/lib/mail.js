import nodemailer from "nodemailer";

export async function sendInviteEmail({ to, inviteUrl, channelTitle, role }) {
  const smtpUrl = process.env.SMTP_URL?.trim();
  if (!smtpUrl) return false;

  const transport = nodemailer.createTransport(smtpUrl);
  await transport.sendMail({
    from: process.env.SMTP_FROM || "noreply@utube.local",
    to,
    subject: `You're invited to manage ${channelTitle}`,
    text: [
      `You've been invited as ${role.replace("_", " ")} on "${channelTitle}".`,
      "",
      `Accept the invite: ${inviteUrl}`,
      "",
      "This link expires in 7 days.",
    ].join("\n"),
  });
  return true;
}
