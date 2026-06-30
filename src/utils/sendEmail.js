const transporter = require("../config/mail");

const sendMail = async ({ to, subject, html }) => {
  console.log("Sending email to:", to);

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });

  console.log("Email sent:", info.messageId);

  return info;
};

module.exports = sendMail;
