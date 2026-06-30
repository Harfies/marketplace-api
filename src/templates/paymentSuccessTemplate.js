exports.paymentSuccessTemplate = ({ name, orderNumber, amount }) => `
  <h2>Payment Successful</h2>

  <p>Hello ${name},</p>

  <p>We have received payment for your order.</p>

  <p>Order Number:
  <strong>${orderNumber}</strong></p>

  <p>Amount Paid:
  <strong>₦${amount}</strong></p>

  <p>Your order is now being prepared.</p>
`;
