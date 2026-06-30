const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Marketplace API",
      version: "1.0.0",
      description:
        "Production-ready Marketplace REST API built with Node.js, Express, MongoDB, Redis and Paystack.",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development",
      },
    ],

    tags: [
      {
        name: "Authentication",
      },
      {
        name: "Products",
      },
      {
        name: "Orders",
      },
      {
        name: "Payments",
      },
      {
        name: "Admin",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        User: {
          type: "object",

          properties: {
            _id: {
              type: "string",
              example: "66a2017bcbb1979d5bddf4f62",
            },

            name: {
              type: "string",
              example: "Afeez Akinsola",
            },

            email: {
              type: "string",
              example: "test1@gmail.com",
            },

            role: {
              type: "string",
              example: "buyer",
            },
          },
        },

        Product: {
          type: "object",

          properties: {
            _id: {
              type: "string",
            },

            name: {
              type: "string",
              example: "Gaming Mouse",
            },

            description: {
              type: "string",
              example: "RGB Gaming Mouse",
            },

            price: {
              type: "number",
              example: 15000,
            },

            category: {
              type: "string",
              example: "Electronics",
            },

            stock: {
              type: "number",
              example: 50,
            },

            images: {
              type: "array",

              items: {
                type: "string",
              },
            },

            seller: {
              $ref: "#/components/schemas/User",
            },
          },
        },

        OrderItem: {
          type: "object",

          properties: {
            product: {
              $ref: "#/components/schemas/Product",
            },

            quantity: {
              type: "number",
              example: 2,
            },

            price: {
              type: "number",
              example: 15000,
            },
          },
        },

        Order: {
          type: "object",

          properties: {
            _id: {
              type: "string",
            },

            orderNumber: {
              type: "string",
              example: "ORD-2026-000001",
            },

            buyer: {
              $ref: "#/components/schemas/User",
            },

            items: {
              type: "array",

              items: {
                $ref: "#/components/schemas/OrderItem",
              },
            },

            totalAmount: {
              type: "number",
              example: 30000,
            },

            paymentStatus: {
              type: "string",
              example: "paid",
            },

            orderStatus: {
              type: "string",
              example: "processing",
            },

            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        Payment: {
          type: "object",

          properties: {
            authorization_url: {
              type: "string",
            },

            access_code: {
              type: "string",
            },

            reference: {
              type: "string",
            },
          },
        },

        SuccessResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Operation successful",
            },
          },
        },

        ErrorResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: false,
            },

            message: {
              type: "string",
              example: "Something went wrong",
            },
          },
        },

        ValidationError: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: false,
            },

            message: {
              type: "string",
              example: "Validation failed",
            },

            errors: {
              type: "array",

              items: {
                type: "string",
              },
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
