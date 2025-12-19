# MongoDB Setup: Configuration (v1)

## 📅 Date & Time of Generation
2025-12-15 23:29

## 🎯 Actionable Goal
Configure MongoDB as the persistence layer for the Sales Commission System, including connection management and environment variable setup.

## 💡 Proposed Design/Flow/Architecture

### Step 1: Choose MongoDB Deployment
You have two options:

| Option | Best For | Setup Time |
|--------|----------|------------|
| **MongoDB Atlas (Cloud)** | Quick start, no local install | 5 min |
| **Local MongoDB** | Offline dev, full control | 15 min |

**Recommendation**: Use **MongoDB Atlas** (free tier) for easier setup.

---

### Step 2: Get Connection String

#### Option A: MongoDB Atlas (Recommended)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account.
2. Create a new **Cluster** (Free M0 tier).
3. Go to **Database Access** → Add a database user (username/password).
4. Go to **Network Access** → Add your IP (or `0.0.0.0/0` for development).
5. Go to **Clusters** → **Connect** → **Drivers** → Copy the connection string.

The string will look like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```

#### Option B: Local MongoDB
1. Install MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2. Start the MongoDB service.
3. Connection string: `mongodb://localhost:27017/pebbletech`

---

### Step 3: Configure Environment Variables

#### File: `src/server/.env`
Create this file (do NOT commit to git):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pebbletech?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
```

#### File: `src/server/.env.example` (Already exists)
This is the template that **IS** committed to git:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pebbletech
JWT_SECRET=changeme_dev_secret
```

---

### Step 4: Implement Database Connection

#### File: `src/server/config/db.js` [NEW]
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

#### File: `src/server/index.js` [MODIFY]
```javascript
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to database
connectDB();

// ... rest of the app
```

---

### Step 5: Add `.gitignore`

#### File: `src/server/.gitignore` [NEW]
```
node_modules/
.env
```

---

## 🔧 Implementation Details/Key Components

| File | Purpose |
|------|---------|
| `.env` | Stores secrets (NOT in git) |
| `.env.example` | Template for team (IN git) |
| `config/db.js` | Database connection logic |
| `.gitignore` | Prevents secrets from being committed |

## ⚖️ Rationale for New Major Version
Initial MongoDB configuration plan.

---

## 🔄 Quick Start Checklist
- [ ] Choose deployment (Atlas or Local)
- [ ] Get connection string
- [ ] Create `src/server/.env` with your real credentials
- [ ] Create `src/server/config/db.js`
- [ ] Update `src/server/index.js` to call `connectDB()`
- [ ] Create `src/server/.gitignore`
- [ ] Test connection with `npm run dev`
