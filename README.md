# Coupon Management API Documentation

## Overview

This API provides endpoints for managing coupons, including single creation and batch uploads. All endpoints require authentication and admin privileges.

## Base URL

## Authentication

Most endpoints require a valid JWT token in the Authorization header:

## Endpoints

### 1. Create Single Coupon

Create a single coupon in the system.

- **URL**: `/coupons`
- **Method**: `POST`
- **Auth Required**: Yes (Admin only)
- **Request Body**:

```json:
{
"coupon": "SUMMER2024",
"hostel": "hostel_id",
"paidfor": "service_name",
"duration": 30,
"amount":4000
}
```

- **Success Response**:
  - **Code**: 200
  - **Content**:

```json:README.md
{
"message": "Coupon created successfully",
"coupon": {
"id": "coupon_id",
"coupon": "SUMMER2024",
"hostel": "hostel_id",
"paidfor": "service_name",
"duration": 30,
"amount": 4000
"createdAt": "2024-03-20T10:00:00.000Z"
}
}
```

- **Error Response**:
  - **Code**: 400
  - **Content**: `{ "message": "Coupon already exists" }`

### 2. Batch Upload Coupons

Upload multiple coupons in a single request.

- **URL**: `/coupons/batch`
- **Method**: `POST`
- **Auth Required**: Yes (Admin only)
- **Request Body**:

```json:README.md
{
    "coupons": [
        {
            "coupon": "CODE1",
            "hostel": "hostel1",
            "paidfor": "service1",
            "duration": 30,
            "amount": 4000
        },
        {
            "coupon": "CODE2",
            "hostel": "hostel2",
            "paidfor": "service2",
            "duration": 60,
            "amount": 4000
        }
    ]
}
```

- **Success Response**:
  - **Code**: 200
  - **Content**:

```json
{
  "message": "Coupons created successfully",
  "count": 2
}
```

- **Error Response**:
  - **Code**: 400
  - **Content**:

```json
{
  "message": "Some coupons already exist",
  "duplicates": ["CODE1"]
}
```

### 3. Get All Coupons

Retrieve all coupons from the system.

- **URL**: `/coupons`
- **Method**: `GET`
- **Auth Required**: Yes (Admin only)
- **Success Response**:
  - **Code**: 200
  - **Content**: Array of coupon objects

### 4. Get Single Coupon

Retrieve a specific coupon by its code.

- **URL**: `/coupons/:code`
- **Method**: `GET`
- **Auth Required**: Yes (Admin only)
- **Success Response**:
  - **Code**: 200
  - **Content**: Coupon object
- **Error Response**:
  - **Code**: 404
  - **Content**: `{ "message": "Coupon not found" }`

# Payment API Documentation

## Overview

This API provides endpoints for managing payments, including creating payments and retrieving payment information. Some endpoints require authentication and admin privileges.

## Base URL

https://your-api-domain.com/api

## Authentication

Most endpoints require a valid JWT token in the Authorization header:
Authorization: Bearer <your-jwt-token>

## Endpoints

### 1. Create Payment

Create a new payment record in the system.

- **URL**: `/payments`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:

```json:README.md
{
    "userId": "user_id",
    "amount": 1000,
    "transactionId": "trans_123456"
}
```

- **Success Response**:
  - **Code**: 200
  - **Content**:

```json
{
  "payment": {
    "_id": "payment_id",
    "user": {
      "_id": "user_id"
    },
    "amount": 1000,
    "transactionId": "trans_123456",
    "status": "successful"
  }
}
```

- **Error Response**:
  - **Code**: 400
  - **Content**: `"User does not exist"`
  - **Code**: 500
  - **Content**: `"Internal Server Error"`

### 2. Get Total Payments (Admin Only)

Retrieve the sum of all payments in the system.

- **URL**: `/payments`
- **Method**: `GET`
- **Auth Required**: Yes (Admin only)
- **Success Response**:
  - **Code**: 200
  - **Content**:

```json
{
  "totalAmount": 5000
}
```

- **Error Response**:
  - **Code**: 400
  - **Content**: `"No payments yet"`
  - **Code**: 500
  - **Content**: `"Internal Server Error"`

### 3. Get User's Total Payments

Retrieve the sum of all payments for a specific user.

- **URL**: `/payments/getpayment`
- **Method**: `GET`
- **Query Parameters**: `userId`
- **Auth Required**: No
- **Example**: `/payments/getpayment?userId=123456`
- **Success Response**:
  - **Code**: 200
  - **Content**:

```json
{
  "totalAmount": 2000
}
```

- **Error Response**:
  - **Code**: 400
  - **Content**: `"UserId not found"` or `"No payment yet"`
  - **Code**: 500
  - **Content**: `"Internal Server Error"`

# User and Authentication API Documentation

## Overview

This API provides endpoints for user management and authentication. It includes user registration, authentication, and user management features.

## Base URL

https://your-api-domain.com/api

## Authentication

Protected endpoints require a valid JWT token in the Authorization header:

## Endpoints

### User Management

#### 1. Create User (Register)

Create a new user account in the system.

- **URL**: `/users`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json:README.md
{
"email": "user@example.com",
"username": "johndoe",
"password": "password123",
"currentclass": "class1",
"currentroom": "room1",
"isAdmin": false
}
```

```json:README.md
{
    "email": "user@example.com",
    "username": "johndoe",
    "currentroom": "room1"
}
```

- **Error Response**:
  - **Code**: 400
  - **Content**: `"Please this email already exist"`

### Authentication

#### 1. Login

Authenticate a user and receive a JWT token.

- **URL**: `/auth`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **Success Response**:
  - **Code**: 200
  - **Content**:

```json
{
  "username": "johndoe",
  "token": "jwt_token_here"
}
```

- **Error Response**:
  - **Code**: 400
  - **Content**:
    - `"User does not exist"`
    - `"Invalid User and Password"`
