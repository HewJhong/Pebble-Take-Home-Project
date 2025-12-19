# Sales Commission & Campaign Management System
## User Manual & Developer Guide

---

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation Guide](#installation-guide)
4. [Running the Application](#running-the-application)
5. [User Guide](#user-guide)
6. [Testing Guide](#testing-guide)
7. [Feature Review Checklist](#feature-review-checklist)
8. [Technical Architecture](#technical-architecture)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Sales Commission & Campaign Management System is a full-stack web application designed to manage sales campaigns, orders, and commission payouts for sales teams. The system supports two user roles with distinct capabilities:

- **Admin**: Full system access to manage users, campaigns, and orders
- **Sales Person**: View personal campaigns and commission breakdowns

### Key Features

✅ **User Management** - Role-based access control with commission rate configuration
✅ **Campaign Management** - Track social media campaigns across Facebook and Instagram
✅ **Order Management** - Manual order entry with commission auto-calculation
✅ **Commission Tracking** - Monthly breakdowns with rate snapshots
✅ **Analytics Dashboard** - Performance metrics and AI-powered insights
✅ **Activity Logging** - Comprehensive audit trail for all operations

### Technology Stack

- **Frontend**: React 19.2.0 + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express 4.18.2
- **Database**: MongoDB + Mongoose 8.0.0
- **Authentication**: JWT tokens in HttpOnly cookies

---

## System Requirements

### Prerequisites

Before installing the application, ensure you have the following installed:

| Requirement | Version | Download |
|-------------|---------|----------|
| **Node.js** | 20.19+ or 22.12+ | [nodejs.org](https://nodejs.org) |
| **npm** | Included with Node.js | - |
| **MongoDB** | 6.0+ | [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community) |

### Optional Tools

- **MongoDB Atlas**: Cloud MongoDB for production (free tier available)
- **Gemini API Key**: For AI-powered analytics insights

### Supported Platforms

- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+, Debian, etc.)

---

## Installation Guide

### Step 1: Clone or Download the Repository

Navigate to the project directory:

```bash
cd "C:\Users\User\Documents\PebbleTech\Take Home Project"
```

### Step 2: Install Backend Dependencies

```bash
cd src\server
npm install
```

This installs the following key packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin support

### Step 3: Install Frontend Dependencies

```bash
cd ..\client
npm install
```

This installs:
- `react` & `react-dom` - UI library
- `react-router-dom` - Client-side routing
- `recharts` - Data visualization
- `@headlessui/react` - Accessible UI components
- `tailwindcss` - Utility-first CSS

### Step 4: Configure Environment Variables

Create a `.env` file in the `src/server` directory:

```bash
cd ..\server
copy .env.example .env
```

Edit `src/server/.env` with your configuration:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/pebbletech

# JWT Secret (change this to a random string in production!)
JWT_SECRET=your_secure_random_secret_key_here

# Optional: Gemini API for AI insights
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important Security Notes:**
- **Never commit `.env` files to version control**
- Use a strong random string for `JWT_SECRET` in production
- For production deployments, use MongoDB Atlas or a secure MongoDB instance

### Step 5: Start MongoDB

#### Option A: Local MongoDB

Start the MongoDB service:

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
# or
mongod --dbpath /path/to/data/directory
```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in `.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pebbletech?retryWrites=true&w=majority
```

### Step 6: Seed Test Data (Optional)

Populate the database with test users:

```bash
cd src\server
node seed.js
```

**Output:**
```
Connected to MongoDB
Database cleared
Admin user created
Sales person created
Seeding completed successfully!
```

**Test Credentials Created:**

| Role | Username | Password | Commission Rate |
|------|----------|----------|-----------------|
| Admin | `admin` | `admin123` | 0% |
| Sales Person | `sales1` | `sales123` | 10% |

---

## Running the Application

### Development Mode

You need **two terminal windows** running simultaneously.

#### Terminal 1 - Start Backend Server

```bash
cd src\server
npm run dev
```

**Expected Output:**
```
[nodemon] starting `node index.js`
Connected to MongoDB
Server running on port 5000
```

The backend API will be available at: **http://localhost:5000**

#### Terminal 2 - Start Frontend Development Server

```bash
cd src\client
npm run dev
```

**Expected Output:**
```
VITE v5.2.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

The frontend will be available at: **http://localhost:5173**

### Production Build

#### Build Frontend for Production

```bash
cd src\client
npm run build
```

This creates an optimized production build in `src/client/dist/`.

#### Preview Production Build

```bash
npm run preview
```

#### Run Backend in Production

```bash
cd src\server
npm start
```

**Note**: In production, you'll typically serve the frontend build files through a web server (Nginx, Apache) or deploy to platforms like Vercel, Netlify, or Render.

---

## User Guide

### Accessing the Application

1. Open your web browser
2. Navigate to: **http://localhost:5173**
3. You'll see the login page

### Login

Enter your credentials and click "Sign In".

**Test Accounts** (if you ran the seed script):
- Admin: `admin` / `admin123`
- Sales Person: `sales1` / `sales123`

### Admin User Guide

#### Dashboard

After logging in as admin, you'll see:

- **Total Users** - Count of all users in the system
- **Total Campaigns** - All campaigns created
- **Total Orders** - All orders recorded
- **Total Commission Paid** - Sum of all commissions
- **Recent Activity** - Latest 5 activities

#### User Management

Navigate to: **Users** (in the navigation menu)

##### View Users

The User List page has two tabs:
- **Admins** - Filtered view of admin users
- **Sales Persons** - Filtered view of sales team members

**Features:**
- Search by username or name
- Filter by role (Admin, Sales Person, All)
- Pagination (10 users per page)
- Color-coded commission rates (green: ≥15%, yellow: 10-14%, gray: <10%)

##### Create New User

1. Click **"Add User"** button
2. Fill in the form:
   - **Username** - Unique identifier (required)
   - **Password** - Must be at least 6 characters (required)
   - **Name** - Full name (required)
   - **Role** - Select Admin or Sales Person (required)
   - **Commission Rate** - Percentage (0-100, sales persons only)
3. Click **"Create User"**

**Validation Rules:**
- Username must be unique
- Commission rate must be ≤ 100%

##### Edit User

1. Click the **edit icon** (pencil) next to a user
2. Update the desired fields
3. Click **"Update User"**

**Important:**
- When changing commission rate, the system tracks the change in history
- Old commission rates don't affect existing orders (they use snapshots)

##### Delete User

1. Click the **delete icon** (trash) next to a user
2. Review the **Deletion Impact** dialog showing:
   - Number of campaigns affected
   - Total commission that will be removed
3. Type **DELETE** to confirm
4. Click **"Delete User"**

**Warning:** Deleting a user will:
- Remove all their campaigns
- Remove all orders under those campaigns
- Deduct all related commissions

#### Campaign Management

Navigate to: **Campaigns** (in the navigation menu)

##### View Campaigns

**Features:**
- Search by title
- Filter by social media platform (All, Facebook, Instagram)
- Filter by type (All, Post, Event, Live Post)
- Filter by sales person (Admin only)
- Pagination (10 campaigns per page)
- Sort by newest/oldest

##### Create Campaign

1. Click **"Create Campaign"** button
2. Fill in the form:
   - **Title** - Campaign name (required)
   - **Sales Person** - Assign to a sales person (required, immutable after creation)
   - **Social Media** - Select Facebook or Instagram (required)
   - **Type** - Select Post, Event, or Live Post (required)
   - **URL** - Link to the social media post (optional)
   - **Image URL** - Campaign image (optional)
   - **Start Date** - Campaign start (optional)
   - **End Date** - Campaign end (optional)
   - **Target ROI** - Expected return on investment % (optional)
3. Click **"Create Campaign"**

**Platform Badges:**
- 📘 Facebook (blue badge)
- 📸 Instagram (pink badge)

##### Edit Campaign

1. Click on a campaign title or the **edit icon**
2. Update any field **except Sales Person** (immutable)
3. Click **"Update Campaign"**

##### View Campaign Details

Click on a campaign title to see:
- Campaign information and status
- **Performance metrics** (total orders, revenue, commission paid)
- **Orders table** with all related orders
- **Add Order** button (see Order Management below)

**Campaign Status:**
- 🟢 **Active** - Currently running (between start and end date)
- ⏰ **Scheduled** - Start date in the future
- ⏹️ **Ended** - End date has passed

##### Delete Campaign

1. Click the **delete icon** on the campaign list or detail page
2. Review the **Deletion Impact** showing:
   - Number of orders affected
   - Total commission that will be removed
4. Click **"Delete Campaign"**

**Warning:** This is a **soft delete**:
- Campaign status changes to "deleted"
- All related orders are soft-deleted
- Commission is deducted from the sales person

#### Order Management

##### View All Orders

Navigate to: **Orders** (in the navigation menu)

**Features:**
- View all orders across all campaigns
- Sort by commission (high to low / low to high)
- Sort by order total
- Search and filter capabilities
- Pagination

##### Create Order (Manual Entry)

There are two ways to create an order:

**Method 1: From Campaign Detail Page**
1. Navigate to a campaign's detail page
2. Click **"Add Order"** button
3. The campaign is pre-selected

**Method 2: From Orders Page**
1. Navigate to Orders page
2. Click **"Create Order"** button
3. Select a campaign from the dropdown

**Order Form:**
1. Select the **Campaign** (if not pre-selected)
2. Add **Products/Items**:
   - Click **"Add Item"** to add rows
   - Enter **Product Name**
   - Enter **Quantity** (number)
   - Enter **Base Price** (price per unit)
   - **Total Price** is calculated automatically (Quantity × Base Price)
   - Click **"Remove"** to delete an item row
3. Review the **Order Total** (sum of all item totals)
4. Review the **Commission** calculation:
   - Shows: `Sales Person Commission Rate × Order Total`
   - Example: 10% × RM100 = RM10
5. Click **"Create Order"**

**Commission Snapshot:**
- The commission rate at the time of creation is **locked** in the order
- Future changes to the sales person's rate won't affect this order
- Example: Order created when rate was 10%, rate later changes to 15%, order commission stays at 10%

##### Edit Order

1. Click the **edit icon** on an order
2. Modify items:
   - Add new items
   - Remove existing items
   - Change quantities or prices
3. Click **"Update Order"**

**Important:**
- Commission is **recalculated** using the **original snapshot rate**
- Example: Order was created at 10% rate
  - Original total: RM100 → Commission: RM10
  - Updated total: RM150 → Commission recalculated: RM15 (still using 10%)
  - If rate is now 15%, commission is still RM15 (not RM22.50)

##### Delete Order

1. Click the **delete icon** on an order
2. Confirm deletion
3. The order is **soft-deleted**
4. Commission is deducted from the sales person

#### Analytics

Navigate to: **Analytics** (in the navigation menu)

**Campaign Comparison:**
- Bar chart comparing campaigns by total orders, revenue, and commission
- Filter by sales person
- Identify top-performing campaigns

**Sales Person Performance:**
- Compare all sales persons by:
  - Total orders closed
  - Total revenue generated
  - Total commission earned
- Identify top performers

**AI-Powered Insights** (requires Gemini API key):
- Automated analysis of trends, patterns, and recommendations are displayed automatically on the admin dashboard

**Key Metrics Summary:**
- Total revenue across all campaigns
- Total commission paid
- Average commission rate
- Number of active campaigns

#### Activity Log

Navigate to: **Activity Log** (in the navigation menu)

View a comprehensive audit trail of all system actions:

**Tracked Actions:**
- User creation, updates, deletions
- Campaign creation, updates, deletions
- Order creation, updates, deletions
- Login events

**Information Displayed:**
- User who performed the action
- Action type (Created, Updated, Deleted, Logged In)
- Target entity (User, Campaign, Order)
- Timestamp
- Detailed changes (before/after values for updates)

**Features:**
- Filter by action type
- Search by user or target name
- Pagination (20 activities per page)

### Sales Person User Guide

#### Dashboard

After logging in as a sales person, you'll see:

- **My Campaigns** - Count of campaigns assigned to you
- **Total Orders** - Orders under your campaigns
- **Total Revenue** - Sum of all order totals
- **Total Commission** - Your total earnings
- **Monthly Commission Chart** - Visual breakdown by month

**Performance Charts:**
- Monthly commission trend (line chart)
- Campaign performance breakdown (bar chart)

#### View My Campaigns

Navigate to: **Campaigns** (in the navigation menu)

**Features:**
- View only campaigns assigned to you
- Search by campaign title
- Filter by platform and type
- View campaign details and orders

**Restrictions:**
- Cannot create, edit, or delete campaigns
- Read-only access

#### Commission Breakdown

Navigate to: **Commission** (in the navigation menu)

**Monthly View:**

1. See a list of all months where you earned commission
2. Each month card shows:
   - **Month/Year** (e.g., January 2024)
   - **Total Commission** for that month
   - **Number of Campaigns** contributing to that month's commission
3. Click **"View Details"** to see the breakdown

**Campaign Breakdown (per month):**

After clicking "View Details":
- See all campaigns that had orders in that month
- For each campaign:
  - Campaign title and platform badge
  - Number of orders in that month
  - Total commission from that campaign in that month
- **Total** for the selected month at the bottom

**Example:**
```
December 2024 - Total Commission: RM250.00

Campaign A (Facebook Post)
  Orders: 5 | Commission: RM150.00

Campaign B (Instagram Live)
  Orders: 3 | Commission: RM100.00

Total: RM250.00
```

#### View Orders

Sales persons can view orders under their campaigns but cannot create, edit, or delete them.