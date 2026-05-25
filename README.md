# EcoReward Backend

Backend service for the Waste-to-Wealth platform (SDG 11 – Sustainable Cities and Communities).

## Tech Stack

- Node.js
- Express
- Sequelize ORM
- MySQL
- JWT Authentication

---

## Environment Variables

Required:

- PORT
- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_NAME
- DB_DIALECT
- JWT_SECRET

See `.env.example` for template.

---

## Running Locally

1. Install dependencies:
   npm install

2. Run migrations:
   npx sequelize-cli db:migrate

3. Start server:
   npm run dev

Server runs on:
http://localhost:5000

---

## Core Backend Systems

- Authentication & Role-Based Access Control
- Pickup Lifecycle State Machine
- Rewards Ledger System
- REST API for frontend integration

---

## API Contract

See:
`/docs/api-contract.md`


Last updated:2026-02-14# ecoreward-2.0
