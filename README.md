# FreelanceFlow

FreelanceFlow is a comprehensive full-stack web application tailored for freelancers to effortlessly manage their clients, generate and track invoices, and record payments. It provides a robust, intuitive interface and a powerful backend to streamline freelance business operations.

## ✨ Features

- **Authentication System:** Secure user registration and login using JWT (JSON Web Tokens) and bcrypt for password hashing.
- **Client Management:** Maintain a detailed repository of your clients, including contact information and business details.
- **Invoice Generation & Tracking:** Create detailed invoices with multiple line items, calculate taxes, and track their statuses (`DRAFT`, `SENT`, `PAID`, `OVERDUE`, `CANCELLED`).
- **Payment Recording:** Log payments against specific invoices, supporting various payment methods (Bank Transfer, Credit Card, PayPal, Cash, etc.).
- **Interactive Dashboard:** Visualize your business metrics, outstanding balances, and recent activities via dynamic charts.
- **Responsive UI:** A modern, accessible, and fast user interface built with React and Tailwind CSS.
- **Dockerized Environment:** Easy setup for both development and production environments using Docker and Docker Compose.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS & PostCSS
- **State Management:** Zustand
- **Data Fetching:** React Query (@tanstack/react-query)
- **Routing:** React Router DOM
- **Forms & Validation:** React Hook Form + Zod
- **Icons & Charts:** Lucide React & Recharts

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js (with TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT & bcrypt
- **Validation:** Zod
- **Security:** Helmet & Express Rate Limit
- **Testing:** Jest & Supertest

### DevOps & Infrastructure
- **Containerization:** Docker & Docker Compose
- **Task Automation:** Makefile

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [Docker](https://www.docker.com/products/docker-desktop) and Docker Compose
- Make (usually pre-installed on Linux/macOS; for Windows, you can use WSL or Git Bash)

## 🚀 Getting Started

The project comes with a handy `Makefile` to simplify setup and management.

### 1. Clone & Configure
First, set up your environment variables by copying the example file:
```bash
cp .env.example .env
```
*Make sure to update `.env` with your secure credentials if needed.*

### 2. Development Environment
Start the development environment which spins up the PostgreSQL database via Docker and runs both frontend and backend locally.

```bash
make dev
```
This command will:
- Start the PostgreSQL database container.
- Run Prisma database migrations.
- Prompt you to start the backend (`cd backend && npm run dev`).
- Prompt you to start the frontend (`cd frontend && npm run dev`).

The frontend will typically be available at `http://localhost:5173` and the backend API at `http://localhost:4000`.

### 3. Production Environment
To build and run the full production stack entirely inside Docker containers (Frontend, Backend, and Database):

```bash
make prod
```
The application will be accessible at `http://localhost`.

### 4. Database Seeding
To populate your database with dummy data for testing purposes:
```bash
make seed
```

## 📂 Project Structure

```text
freelanceflow/
├── backend/                  # Express/Node.js API
│   ├── prisma/               # Prisma schema and migrations
│   ├── src/
│   │   ├── controllers/      # Route logic handlers
│   │   ├── middleware/       # Express middlewares (auth, validation, etc.)
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic
│   │   └── validators/       # Zod validation schemas
│   └── tests/                # Jest integration/unit tests
│
├── frontend/                 # React UI
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page-level components (Auth, Dashboard, etc.)
│   │   ├── services/         # API integration layer (Axios)
│   │   └── store/            # Zustand state stores
│
├── docker-compose.yml        # Production Docker configuration
├── docker-compose.dev.yml    # Development Docker configuration (DB only)
└── Makefile                  # Command runner for ease of use
```

## 🗄️ Database Schema Overview

The database relies on four primary entities:
- **User:** The freelancer managing the account.
- **Client:** The customers the freelancer works for.
- **Invoice:** Billing documents linked to a Client and containing `LineItems`.
- **Payment:** Records of transactions made against specific Invoices.

## 🛠️ Available Commands (Makefile)

| Command      | Description |
| ----------- | ----------- |
| `make dev`  | Starts development mode (Docker DB + local dev servers). |
| `make prod` | Builds and starts the full production stack via Docker. |
| `make stop` | Stops all running containers. |
| `make logs` | Tails the logs from all active Docker containers. |
| `make seed` | Seeds the database with demo/test data. |
| `make test` | Runs the backend Jest test suite. |
| `make clean`| **WARNING:** Removes all containers and volumes (destroys database data). |

## 🛡️ API Endpoints Summary

- `POST /api/auth/*` - User registration, login, and profile management.
- `GET/POST/PUT/DELETE /api/clients/*` - Client CRUD operations.
- `GET/POST/PUT/DELETE /api/invoices/*` - Invoice management.
- `GET/POST/PUT/DELETE /api/payments/*` - Payment logging and retrieval.
- `GET /api/dashboard/*` - Aggregated data for frontend metrics.
