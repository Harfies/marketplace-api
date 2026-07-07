# 🛒 Marketplace API

A production-ready e-commerce Marketplace REST API demonstrating modern backend engineering practices including JWT authentication, Redis caching, Paystack payment integration, MongoDB aggregation pipelines, transaction support, idempotent endpoints, email notifications, and interactive Swagger documentation.

## The project also includes **interactive Swagger/OpenAPI documentation**, allowing developers to explore and test every endpoint directly from the browser.

# 🚀 Features

# 📚 API Documentation

This project includes interactive **Swagger/OpenAPI** documentation.

After starting the server, visit:

````text
http://localhost:3000/api-docs

```md
## 📖 API Documentation

- Swagger UI
- OpenAPI 3.0
- Interactive API Explorer
- JWT Authorization Support
- Request & Response Schemas

## 👤 Authentication

- User Registration
- User Login
- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Role-based Authorization
- Buyer & Seller Accounts

---

## 📦 Product Management

- Create Product
- Upload Multiple Images (Multer)
- Update Product
- Delete Product
- Get Single Product
- Get All Products

### Advanced Query Features

- Search
- Category Filtering
- Price Filtering
- Stock Filtering
- Pagination
- Sorting

Example:

````

GET /api/products

?page=1
&limit=10
&search=iphone
&category=Phones
&minPrice=50000
&maxPrice=300000
&inStock=true
&sort=price_asc

```

---

## 🛍 Order Management

- Create Order
- View User Orders
- Update Order Status
- Automatic Order Number Generation
- Transaction Support (MongoDB Session)

Example Order Number

```

ORD-2026-000001

```

---

## 💳 Paystack Payment Integration

Features include:

- Initialize Payment
- Verify Payment
- Webhook Support
- Automatic Payment Confirmation
- Automatic Order Status Update

Payment Flow

```

Create Order

↓

Initialize Payment

↓

Customer Pays

↓

Paystack Webhook

↓

Payment Verified

↓

Order Updated

↓

Email Sent

```

---

## 📧 Email Notifications

Automatic emails are sent when:

- ✅ Order Created
- ✅ Payment Successful
- 🚚 Order Processing
- 🚛 Order Shipped
- ✅ Order Delivered

Email Templates are fully customizable.

---

## 👨‍💼 Admin Features

Admin endpoints include:

- Dashboard Statistics
- Total Orders
- Total Revenue
- Total Users
- Total Products

Revenue endpoint.

---

# ⚡ Redis Caching

Redis Cloud is used for caching product data.

Cached endpoints include:

- Get Products
- Get Product By ID

Cache is automatically cleared whenever:

- Product Created
- Product Updated
- Product Deleted

Benefits

- Faster API responses
- Reduced MongoDB queries
- Better scalability

---

# 🔒 Security

Implemented security best practices.

### Helmet

Protects against common HTTP attacks.

### JWT Authentication

Secures private routes.

### Rate Limiting

Protects against abuse.

Example

```

100 requests / 15 minutes

```

### MongoDB Sanitization

Prevents NoSQL Injection.

### HTTP Parameter Pollution (HPP)

Blocks duplicate parameter attacks.

### Password Hashing

Uses bcrypt.

---

# 🔁 Idempotency

Critical endpoints support idempotency.

Example

```

POST /api/orders

```

Headers

```

Idempotency-Key:
order-001

```

Retrying the same request returns the same response instead of creating duplicate orders.

---

# 📄 API Endpoints

## Authentication

| Method | Endpoint         |
| ------ | ---------------- |
| POST   | /api/auth/signup |
| POST   | /api/auth/login  |

---

## Products

| Method | Endpoint          |
| ------ | ----------------- |
| POST   | /api/products     |
| GET    | /api/products     |
| GET    | /api/products/:id |
| PATCH  | /api/products/:id |
| DELETE | /api/products/:id |

---

## Orders

| Method | Endpoint               |
| ------ | ---------------------- |
| POST   | /api/orders            |
| GET    | /api/orders            |
| PATCH  | /api/orders/:id/status |

---

## Payments

| Method | Endpoint                        |
| ------ | ------------------------------- |
| POST   | /api/payments/initialize        |
| GET    | /api/payments/verify/:reference |
| POST   | /api/payments/webhook           |

---

## Admin

| Method | Endpoint             |
| ------ | -------------------- |
| GET    | /api/admin/dashboard |
| GET    | /api/admin/revenue   |

---

# 🛠 Tech Stack

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Cache

- Redis Cloud

## Authentication

- JWT
- bcrypt

## Payments

- Paystack

## Email

- Nodemailer

## Uploads

- Multer

## Security

- Helmet
- HPP
- express-rate-limit
- express-mongo-sanitize

## Logging

- Morgan

## Documentation

- Swagger UI Express
- swagger-jsdoc
- OpenAPI 3.0
---

# 📂 Project Structure

```

src
│
├── config
│ ├── db.js
│ ├── env.js
│ ├── mail.js
│
├── controllers
│
├── middleware
│
├── models
│
├── routes
│
├── templates
│
├── utils
│
├── uploads
│
├── app.js
│
└── server.js

```

---

# ⚙ Environment Variables

Create a `.env` file.

```

PORT=3000

MONGO_URI=

JWT_SECRET=

EMAIL_USER=

EMAIL_PASS=

PAYSTACK_SECRET_KEY=

PAYSTACK_PUBLIC_KEY=

PAYSTACK_WEBHOOK_SECRET=

REDIS_URL=

````

---

# 📥 Installation

Clone repository

```bash
git clone https://github.com/Harfies/marketplace-api.git
````

Move into project

```bash
cd marketplace-api
```

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

Production

```bash
npm start
```

---

# 🧪 Testing

The API can be tested using

- Swagger UI
- Postman
- Thunder Client
- Insomnia

Swagger provides an interactive interface for exploring and testing all API endpoints directly from the browser.

---

## Live Demo

API:
https://marketplace-api-xxad.onrender.com

Swagger Documentation:
https://marketplace-api-xxad.onrender.com/api-docs

## 📖 Swagger Documentation

Interactive API documentation.

### Swagger Register

![Swagger Register](docs/images/register.png)

### Login

![Login](docs/images/login.png)

### Products

![Products](docs/images/get-product.png)

### Orders

![Orders](docs/images/order-created.png)

### Payments

![Payments](docs/images/initialize-payment.png)

### update order status

![Admin](docs/images/update-order-status.png)

### idempotency

![idempotency](docs/images/xli.png)

# 📈 Performance Optimizations

Implemented

- Redis Cache
- Pagination
- Filtering
- Sorting
- MongoDB Indexes
- Lean Queries (where applicable)

---

# 🔐 Production Features

✔ JWT Authentication

✔ Role Authorization

✔ Email Notifications

✔ Redis Caching

✔ Paystack Payments

✔ Payment Webhooks

✔ Helmet

✔ Rate Limiting

✔ Mongo Sanitization

✔ HPP Protection

✔ Transaction Support

✔ Idempotency

✔ Logging

✔ Error Handling

✔ Swagger Documentation

## ✔ OpenAPI 3.0 Specification

# 🚀 Future Improvements

- Docker Support
- Background Jobs (BullMQ)
- CI/CD Pipeline
- Unit Tests (Jest)
- Integration Tests
- API Versioning
- Refresh Tokens
- Refresh Token Rotation
- OAuth Login
- Kubernetes Deployment
- Monitoring (Prometheus + Grafana)

---

## Author

**Afeez Akinsola**

Backend Developer specializing in Node.js, Express.js, MongoDB, Redis, and REST API development.

- GitHub: https://github.com/Harfies
- Email: akinsolaafeez82@gmail.com
