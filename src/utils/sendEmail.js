const resend = require("../config/resend");
const logger = require("../logger/logger");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });

    logger.info("Email sent:", response);

    return response;
  } catch (error) {
    logger.error("Resend Error:", error);

    throw error;
  }
};

module.exports = sendEmail;
