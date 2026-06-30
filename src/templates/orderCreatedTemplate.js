exports.orderCreatedTemplate = ({ name, orderNumber, amount }) => `
  <h2>Order Received</h2>

  <p>Hello ${name},</p>

  <p>Your order <strong>${orderNumber}</strong> has been created successfully.</p>

  <p>Total Amount: ₦${amount}</p>

  <p>Status: Pending Payment</p>

  <p>Thank you for shopping with us.</p>
`;
