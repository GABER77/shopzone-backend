# **ShopZone Backend**

## **Introduction**

This is the back-end application for **ShopZone**, an e-commerce application for selling shoes. This repository contains the Node.js-based API that handles all core functionalities, including authentication, product and user management, order processing, payments, and more.

This is one part of the full ShopZone system. You can check out the frontend part here: [ShopZone Frontend](https://github.com/GABER77/shopzone-frontend)

## **Technologies Used**

- Node.js – JavaScript runtime for building scalable server-side applications
- Express.js – Fast and minimalist web framework for building RESTful APIs
- MongoDB – NoSQL database used for persisting users, products, and orders data
- Mongoose – ODM for MongoDB that provides schema validation and easy data modeling

## **Features**

- RESTful API – Supports product search, filtering, sorting, and pagination for optimal data retrieval
- CRUD Operations – Manage products, users, and cart items with powerful Mongoose schemas
- Authentication & Authorization – Secure user sign-up, login, and role-based access control
- Stripe Integration – Process payments with Stripe Checkout and verify transactions through webhook events
- Cloudinary – Cloud-based media management service to store user and product images
- Image Upload & Processing – Supports multi-image uploads via Multer; images are resized, optimized, and linked to specific Cloudinary folders
- Security Best Practices – Implements encryption, data sanitization, and rate limiting to protect against threats
- Global Error Handling – Centralized error management using a custom error class and environment-based strategies for both development and production environments

## **Authentication & Security**

- JWT Authentication – Secure, stateless login system using JSON Web Tokens, including expiration checks and token invalidation on password change
- Role-Based Access Control – Restricts endpoint access based on user roles (user, seller, admin)
- Secure Password Handling – Passwords are hashed with Bcrypt and never stored in plain text
- Session Integrity – Token lifecycle management ensures users are logged out when tokens expire
- Request Sanitization & Validation – Incoming requests are validated and cleaned to prevent injection attacks, malformed data, and schema abuse
- Rate Limiting – Defends against brute-force and DoS attacks by limiting repeated requests from a single IP

## **Roles & Permissions**

### **User**

- Browse, search, filter, and sort available products
- Add products to cart and complete purchases via Stripe Checkout

### **Seller**

- Upload products with multiple images, sizes, category, price, and description
- Manage and control only their own products, enforced by strict ownership validation

### **Admin**

- Full access to all seller capabilities, plus:
- Manage all products across the platform, regardless of ownership
- View and manage all registered users
- Change user roles, deactivate or ban users when necessary

### **Environment Variables**

To run this project, you’ll need to configure the following environment variables. Create a `config.env` file in the root directory with the following keys:

```
# General Configuration
NODE_ENV=production
PORT=3000

# MongoDB Configuration
DATABASE=your_mongo_atlas_connection_string
DATABASE_PASSWORD=your_database_password

# Cloudinary Configuration
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d
JWT_COOKIE_EXPIRES_IN=30

# Stripe Payment Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### **Deployment Notes**

- Run `npm install` to install all necessary dependencies before starting the server
- Ensure NODE_ENV is set to 'production' to enable secure cookies
- Be sure to keep `config.env` private and never commit it to version control
- CORS Configuration: In the `app.js` file, update the `origin` field in the `cors()` middleware to match your frontend domain
- Run the project in production mode using: `npm run start:prod`
