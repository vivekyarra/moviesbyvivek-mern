const nodemailer = require("nodemailer");

function isConfigured() {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendOtpEmail({ to, code }) {
  if (!isConfigured()) {
    console.log(`[DEV OTP] ${to}: ${code}`);
    return;
  }

  const transporter = createTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Your Movie Booking OTP",
    text: `Your OTP is ${code}. It expires in 10 minutes.`,
    html: `<p>Your OTP is <b>${code}</b>. It expires in 10 minutes.</p>`,
  });
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  if (!isConfigured()) {
    console.log(`[DEV RESET LINK] ${resetUrl}`);
    return;
  }

  const transporter = createTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your Movie Booking password",
    text: `Reset your password using this link: ${resetUrl}`,
    html: `<p>Reset your password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}

module.exports = { sendOtpEmail, sendPasswordResetEmail };
