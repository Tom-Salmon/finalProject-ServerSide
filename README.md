# Cost Management System

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![Express.js](https://img.shields.io/badge/Express.js-5.0-blue?style=flat-square&logo=express)](https://expressjs.com/)
[![Jest](https://img.shields.io/badge/Jest-Testing-red?style=flat-square&logo=jest)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Microservices](#microservices)
- [Technology Stack](#technology-stack)
- [API Documentation](#api-documentation)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Database Management](#database-management)
- [Contributing](#contributing)

---

## Overview

The **Cost Management System** is a production-ready, distributed application designed to track, analyze, and report user expenses. Built with a modern **Microservices Architecture**, the system decomposes complex business logic into independently deployable services that communicate through a shared data layer.

This architecture ensures **horizontal scalability**, **fault isolation**, and **independent deployment cycles** while maintaining data consistency through MongoDB's transactional guarantees.

---

## System Architecture

The system consists of **4 decoupled microservices** that operate independently yet collaborate through a centralized MongoDB cluster:

```
┌─────────────────────────────────────────────────────┐
│           Client / External API Consumers           │
└─────────────────────────────────────────────────────┘
                      │      │      │      │
          ┌───────────┴──────┼──────┼──────┴──────────┐
          │                  │      │                  │
    ┌─────▼──────┐    ┌─────▼──────┬────┬─────┐  ┌──▼───────┐
    │   Users    │    │    Costs   │    │Admin│  │   Logs   │
    │  Service   │    │  Service   │    │Srvc │  │ Service  │
    │ :3001      │    │  :3002     │    │:3003│  │  :3000   │
    └─────┬──────┘    └─────┬──────┴────┴──┬──┘  └──┬────────┘
          │                 │              │       │
          └─────────────────┼──────────────┼───────┘
                            │              │
                    ┌───────▼──────────────▼────────┐
                    │   MongoDB Atlas Cluster       │
                    │  (Shared Data Layer)          │
                    │  Collections:                 │
                    │  - users                      │
                    │  - costs                      │
                    │  - reports (cached)           │
                    │  - logs                       │
                    └───────────────────────────────┘
```

### Inter-Service Communication Pattern

Services communicate **asynchronously** through MongoDB:
- **Costs Service** queries the **users** collection to validate user existence before creating expense records.
- **Users Service** aggregates data from the **costs** collection to calculate total expenditures per user.
- **Logs Service** provides centralized access to system-wide transaction records.
- All services write transaction logs to the **logs** collection for audit trails.

---

## Features

### 1. **Microservices Architecture**
   - Four independently deployable services with clear separation of concerns
   - Each service owns its domain logic and business rules
   - Reduces complexity and improves team scalability

### 2. **Computed Design Pattern (Smart Caching)**
   - Monthly reports for completed months are calculated once and cached in the database
   - Provides O(1) retrieval performance for historical data
   - Current month reports are generated in real-time using complex MongoDB aggregations
   - Automatic cache invalidation prevents stale data

### 3. **Cross-Service Data Consistency**
   - All services access a shared MongoDB Atlas cluster
   - Maintains referential integrity through validation logic
   - Supports eventual consistency patterns for high throughput

### 4. **Centralized Logging System**
   - Every HTTP request is logged automatically via middleware
   - Logs include service origin, timestamp, method, URL, and payload metadata
   - Enables post-incident analysis and system monitoring
   - Flexible schema design for future extensibility

### 5. **Robust Error Handling & Validation**
   - Comprehensive input validation on all endpoints
   - Structured error responses with descriptive messages
   - HTTP status codes follow REST conventions
   - Try-catch blocks prevent unhandled exceptions

### 6. **MongoDB Aggregation Pipeline**
   - Advanced data transformations for report generation
   - Grouping by category with detailed expense breakdowns
   - Day-level extraction and filtering capabilities
   - Optimized performance through server-side computation

---

## Microservices

### **Users Service** (Port 3001)
Manages the user lifecycle and provides cost aggregation.

**Responsibilities:**
- User profile management (CRUD operations)
- Total cost calculation per user (aggregated from costs collection)
- User validation for cost entry authorization

**Key Endpoints:**
- `POST /api/add` - Create a new user
- `GET /api/users` - Retrieve all users
- `GET /api/users/:id` - Get user details with total costs

---

### **Costs Service** (Port 3002)
The financial transaction engine—handles expense tracking and reporting.

**Responsibilities:**
- Expense entry creation with validation
- Monthly report generation using MongoDB aggregations
- Report caching for completed months (Computed Pattern)
- User authorization checks before expense creation

**Key Endpoints:**
- `POST /api/add` - Record a new expense
- `GET /api/report` - Generate or retrieve cached monthly report

---

### **Admin Service** (Port 3003)
Provides system-level metadata and administrative information.

**Responsibilities:**
- Team member information retrieval
- System metadata exposure
- Environment-based configuration management

**Key Endpoints:**
- `GET /api/about` - Retrieve team member information

---

### **Logs Service** (Port 3000)
Centralized audit and transaction logging.

**Responsibilities:**
- Persistent storage of all system transactions
- Query interface for log retrieval
- Flexible schema support for dynamic logging

**Key Endpoints:**
- `GET /api/logs` - Retrieve system-wide logs

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Framework** | Express.js | 5.0+ |
| **Database** | MongoDB Atlas | Latest |
| **ODM** | Mongoose | 9.0+ |
| **Testing** | Jest | Latest |
| **HTTP Testing** | Supertest | Latest |
| **Logging** | Pino | 10.0+ |
| **Environment** | dotenv | Latest |
| **Process Manager** | Nodemon | 3.0+ (Dev) |

---

## API Documentation

### **Users Service**

#### `POST /api/add` - Create a New User
Create a new user profile in the system.

**Request:**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "birthday": "1990-01-15"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "birthday": "1990-01-15T00:00:00.000Z"
}
```

---

#### `GET /api/users` - Retrieve All Users
Fetch a complete list of all users in the system.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "birthday": "1990-01-15T00:00:00.000Z"
  },
  ...
]
```

---

#### `GET /api/users/:id` - Get User with Total Costs
Retrieve a specific user's profile and their aggregated total expenses.

**Query Parameters:**
- `id` (required): User ID (numeric)

**Response (200):**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "id": 1,
  "total": 2150.75
}
```

**Response (404):**
```json
{
  "message": "User not found"
}
```

---

### **Costs Service**

#### `POST /api/add` - Create a New Expense
Record a new expense entry for a user. Validates user existence before creation.

**Request:**
```json
{
  "description": "Office Lunch",
  "category": "food",
  "userid": 1,
  "sum": 45.50,
  "date": "2024-01-15"
}
```

**Valid Categories:** `food`, `health`, `housing`, `sports`, `education`

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "description": "Office Lunch",
  "category": "food",
  "userid": 1,
  "sum": 45.50,
  "created_at": "2024-01-15T12:00:00.000Z"
}
```

**Response (400):**
```json
{
  "message": "User does not exist"
}
```

---

#### `GET /api/report` - Generate Monthly Report
Fetch or generate a monthly expense report grouped by category. Implements the Computed Design Pattern for performance optimization.

**Query Parameters:**
- `id` (required): User ID (numeric)
- `year` (required): Year (numeric, e.g., 2024)
- `month` (required): Month (1-12, numeric)

**Response (200):**
```json
{
  "userid": 1,
  "year": 2024,
  "month": 1,
  "costs": [
    {
      "food": [
        {
          "sum": 45.50,
          "description": "Office Lunch",
          "day": 15
        }
      ]
    },
    {
      "health": [
        {
          "sum": 120.00,
          "description": "Gym Membership",
          "day": 10
        }
      ]
    },
    {
      "housing": []
    },
    {
      "sports": []
    },
    {
      "education": []
    }
  ]
}
```

**Caching Behavior:**
- **Past months** (fully completed): Results are cached in the `reports` collection after the first query
- **Current month**: Reports are generated in real-time without caching
- **Performance:** Cached reports return in ~100ms; generated reports in ~500-1000ms

**Response (404):**
```json
{
  "message": "User not found",
  "error": "The specified user ID does not exist"
}
```

---

### **Admin Service**

#### `GET /api/about` - Retrieve Team Information
Fetch development team member details loaded from environment variables.

**Response (200):**
```json
[
  {
    "first_name": "Mosh",
    "last_name": "Israeli"
  },
  {
    "first_name": "Israel",
    "last_name": "Israeli"
  }
]
```

---

### **Logs Service**

#### `GET /api/logs` - Retrieve System Logs
Fetch all system transaction logs with complete audit trail information.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "level": "info",
    "service": "users-service",
    "time": "2024-01-15T12:00:00.000Z",
    "method": "POST",
    "url": "/api/add",
    "msg": "Request received: POST /api/add"
  },
  ...
]
```

---

## Installation & Setup

### Prerequisites

Ensure the following are installed on your system:

- **Node.js** v18.0 or higher ([Download](https://nodejs.org/))
- **npm** v9.0 or higher (included with Node.js)
- **Git** for version control
- **MongoDB Atlas** account with a database cluster ([Sign Up](https://www.mongodb.com/cloud/atlas))

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/cost-management-system.git
cd cost-management-system
```

### Step 2: Install Dependencies

Install dependencies for all four services:

```bash
# Users Service
cd users-service && npm install && cd ..

# Costs Service
cd costs-service && npm install && cd ..

# Admin Service
cd admin-service && npm install && cd ..

# Logs Service
cd logs-service && npm install && cd ..
```

### Step 3: Configure Environment Variables

Each service requires a `.env` file in its root directory. Use the following template:

**`.env` Template (Same for all services):**

```env
PORT=3001
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/costManagerDB?appName=finalProjectDB
```

Replace the placeholders:
- `<username>`: Your MongoDB Atlas username
- `<password>`: Your MongoDB Atlas password
- `<cluster>`: Your MongoDB Atlas cluster name

**Example for users-service/.env:**

```env
PORT=3001
MONGO_URI=mongodb+srv://user123:secure_password@finalprojectdb.abc123.mongodb.net/costManagerDB?appName=finalProjectDB
```

### Step 4: Verify MongoDB Connection

Test that your services can connect to MongoDB:

```bash
# From project root
cd users-service
npm start
# Watch for: "Connected to MongoDB" in console
```

---

## Running the Project

### Option 1: Start Services Individually (Development)

Open separate terminal windows for each service:

**Terminal 1 - Users Service:**
```bash
cd users-service
npm start
# Server running on port 3001
```

**Terminal 2 - Costs Service:**
```bash
cd costs-service
npm start
# Server running on port 3002
```

**Terminal 3 - Admin Service:**
```bash
cd admin-service
npm start
# Server running on port 3003
```

**Terminal 4 - Logs Service:**
```bash
cd logs-service
npm start
# Server running on port 3000
```

### Option 2: Start All Services Concurrently

From the project root, using `concurrently` (requires installation):

```bash
# Install concurrently (one-time setup)
npm install -D concurrently

# Run all services simultaneously
npx concurrently "npm start --prefix users-service" "npm start --prefix costs-service" "npm start --prefix admin-service" "npm start --prefix logs-service"
```

All services will log output with color-coded prefixes for easy distinction.

### Health Check

Verify all services are running:

```bash
curl http://localhost:3001
curl http://localhost:3002
curl http://localhost:3003
curl http://localhost:3000

# Expected response from each:
# "Service is running on port XXXX"
```

---

## Testing

### Run Unit & Integration Tests

```bash
# All services
npm test --prefix users-service
npm test --prefix costs-service
npm test --prefix admin-service
npm test --prefix logs-service
```

### Run Specific Service Tests

```bash
# Users Service Tests
cd users-service
npm test

# Costs Service Tests
cd costs-service
npm test
```

### Test Coverage

Tests validate:
- ✅ Endpoint availability and correct HTTP status codes
- ✅ Request/response payload structures
- ✅ Cross-service data validation
- ✅ Error handling and edge cases
- ✅ Database aggregation pipeline accuracy
- ✅ Environment variable integration

---

## Database Management

### Seed Demo Data

Populate the database with realistic demo data for testing and demonstration:

```bash
# From project root
node seed.js
```

**Data Seeded:**
- 2 users with complete profiles
- 4 expense entries spanning multiple months
- Sample logs for audit trails

### Wipe Database

Clear all data from the database (caution: irreversible):

```bash
# From project root
npm run clean-db --prefix users-service
```

**Collections Cleared:**
- users
- costs
- reports
- logs

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Commit** your changes with clear messages
4. **Push** to the branch (`git push origin feature/your-feature`)
5. **Open** a Pull Request with a detailed description

### Code Style

- Use consistent indentation (2 spaces)
- Follow ESLint recommendations
- Write descriptive commit messages
- Add tests for new features

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Support

For issues, questions, or feature requests, please [open an issue](https://github.com/yourusername/cost-management-system/issues) on GitHub.

---

**Last Updated:** January 2026  
**Maintainers:** [Your Team Name]
