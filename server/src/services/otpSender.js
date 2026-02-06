const { sendOtpEmail } = require("./mailer");

async function sendOtp({ channel, identifier, code }) {
  if (channel === "email") {
    await sendOtpEmail({ to: identifier, code });
    return;
  }

  // Phone OTP (SMS) not configured: log for dev
  console.log(`[DEV OTP SMS] ${identifier}: ${code}`);
}

module.exports = { sendOtp };
