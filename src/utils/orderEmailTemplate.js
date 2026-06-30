module.exports = (order) => `
  <h2>Order Confirmation</h2>

  <p>Thank you for your purchase.</p>

  <p>
    <strong>Order Number:</strong>
    ${order.orderNumber}
  </p>

  <p>
    <strong>Total Amount:</strong>
    ₦${order.totalAmount}
  </p>

  <p>
    <strong>Status:</strong>
    ${order.orderStatus}
  </p>

  <p>
    We are processing your order.
  </p>
`;
