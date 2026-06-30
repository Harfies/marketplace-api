exports.orderShippedTemplate = ({ name, orderNumber }) => `
  <h2>Order Shipped</h2>

  <p>Hello ${name},</p>

  <p>Your order
  <strong>${orderNumber}</strong>
  has been shipped.</p>

  <p>It is currently on the way.</p>
`;
