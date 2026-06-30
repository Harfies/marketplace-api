exports.orderDeliveredTemplate = ({ name, orderNumber }) => `
  <h2>Order Delivered</h2>

  <p>Hello ${name},</p>

  <p>Your order
  <strong>${orderNumber}</strong>
  has been delivered successfully.</p>

  <p>Thank you for shopping with us.</p>
`;
