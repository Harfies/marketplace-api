const resend = require("../config/resend");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log("Email sent:", response);

    return response;
  } catch (error) {
    console.error("Resend Error:", error);

    throw error;
  }
};

module.exports = sendEmail;
