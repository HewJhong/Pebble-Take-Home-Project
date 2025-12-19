# Quickstart Guide

## Prerequisites
- Node.js 20.19+ or 22.12+
- MongoDB (local or Atlas connection string)

## Setup

### 1. Install Dependencies

```bash
# Backend
cd src/server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

Create `src/server/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 3. Seed Test Users (Optional)

```bash
cd src/server
node seed.js
```

This creates:
- Admin: `admin` / `admin123`
- Sales: `sales1` / `sales123`

---

## Running the Application

### Start Backend (Terminal 1)
```bash
cd src/server
npm run dev
```
Backend runs at: http://localhost:5000

### Start Frontend (Terminal 2)
```bash
cd src/client
npm run dev
```
Frontend runs at: http://localhost:5173

---

## Quick Reference

| Service | Directory | Command | URL |
|---------|-----------|---------|-----|
| Backend | `src/server` | `npm run dev` | http://localhost:5000 |
| Frontend | `src/client` | `npm run dev` | http://localhost:5173 |
