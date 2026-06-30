exports.orderProcessingTemplate = ({ name, orderNumber }) => `
  <h2>Order Processing</h2>

  <p>Hello ${name},</p>

  <p>Your order
  <strong>${orderNumber}</strong>
  is currently being processed.</p>

  <p>Our team is preparing it for shipment.</p>
`;
