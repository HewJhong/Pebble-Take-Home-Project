# 🏛️ Project Architecture Master Document

## 📝 Overview
Sales Commission & Campaign Management System for Admin and Sales Persons.

## 💻 High-Level Architecture
- **Type**: Monolithic Web Application
- **Frontend**: React (Vite)
- **Backend**: Node.js (Express)
- **Database**: MongoDB (Mongoose)

## 📂 Core File Structure/Directory Layout
```
/
├── docs/
│   ├── infrastructure/
│   │   ├── plan-project-master-v1.md
│   │   ├── plan-database-schema-v2.md
│   │   └── plan-webapp-architecture-v1.md
│   ├── features/
│   │   └── dataset-problem-statement.md
│   ├── archive/
│   │   └── plan-database-schema-v1.md
│   └── api/
├── src/
│   ├── client/
│   └── server/
```

## 🗂️ Design Decisions Register
| Feature/Area | Current Version | High-Level Design Summary | Detailed Documentation Link |
|--------------|-----------------|---------------------------|-----------------------------|
| Database Schema | v2 | MongoDB Document Schema (Users, Campaigns, Orders). | [plan-database-schema-v2.md](./plan-database-schema-v2.md) |
| WebApp Architecture | v2 | Headless UI + Tailwind, JWT auth, role-based dashboards. | [plan-webapp-architecture-v2.md](./plan-webapp-architecture-v2.md) |
| MongoDB Setup | v1 | Connection config, env variables, Atlas/Local options. | [plan-mongodb-setup-v1.md](./plan-mongodb-setup-v1.md) |
| Todo Items Fix | v1 | Debounce hook, My Campaigns page implementation. | [plan-todo-items-fix-v1.md](../features/plan-todo-items-fix-v1.md) |
| Test Suite | v1 | Jest + Supertest, business logic verification. | [plan-test-suite-v1.md](../features/plan-test-suite-v1.md) |
| Analytics Features | v1 | Campaign comparison, sales person performance, AI insights. | [plan-analytics-features-v1.md](../features/plan-analytics-features-v1.md) |
