# WebApp: Architecture (v2)

## 📅 Date & Time of Generation
2025-12-16 00:34

## 🎯 Actionable Goal
Design a comprehensive frontend and backend architecture for the Sales Commission Management System with role-based dashboards, JWT authentication, and detailed commission tracking.

---

## 💡 Proposed Design/Flow/Architecture

### Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | React (Vite) |
| UI Framework | Headless UI + TailwindCSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT in HttpOnly Cookie |
| Theme | Light, clean, professional |

---

## 🗂️ Frontend Architecture

### Directory Structure
```
src/client/src/
├── components/           # Reusable UI components
│   ├── ui/               # Base components (Button, Input, Modal, etc.)
│   ├── layout/           # Layout components
│   └── charts/           # Chart components
├── pages/                # Route pages
│   ├── auth/             # Login page
│   ├── admin/            # Admin pages
│   └── sales/            # Sales person pages
├── hooks/                # Custom React hooks
├── services/             # API call functions
├── context/              # React context (Auth, Theme)
├── utils/                # Helper functions
└── App.jsx               # Main app with routing
```

### Layouts

#### 1. AuthLayout
- Centered login card
- Clean background
- Used for: Login page

#### 2. MainLayout
- **Sidebar**: Navigation links (role-based)
- **Header**: User info, logout button
- **Content Area**: Page content
- Used for: All authenticated pages

---

### Pages & Routes

#### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | Authentication entry |

#### Admin Routes (Protected)
| Route | Page | Description |
|-------|------|-------------|
| `/admin` | AdminDashboard | Overview with metrics |
| `/admin/users` | UserList | Manage users (CRUD) |
| `/admin/users/:id` | UserDetail | Edit user |
| `/admin/campaigns` | CampaignList | Manage campaigns |
| `/admin/campaigns/:id` | CampaignDetail | Edit campaign |
| `/admin/orders` | OrderList | Manage orders |
| `/admin/orders/:id` | OrderDetail | Edit order |

#### Sales Person Routes (Protected)
| Route | Page | Description |
|-------|------|-------------|
| `/sales` | SalesDashboard | Personal overview |
| `/sales/commissions` | CommissionView | Monthly breakdown |
| `/sales/commissions/:yearMonth` | CommissionDetail | Daily/weekly view |
| `/sales/campaigns` | MyCampaigns | View assigned campaigns |

---

### UI Components

#### Base Components (src/components/ui/)
| Component | Purpose |
|-----------|---------|
| `Button` | Primary, secondary, danger variants |
| `Input` | Text, password, number inputs |
| `Select` | Dropdown with Headless UI |
| `Modal` | Dialog for forms/confirmation |
| `Table` | Data table with sorting |
| `Pagination` | Page navigation |
| `Card` | Content container |
| `Badge` | Status indicators |
| `Alert` | Success/error messages |
| `Spinner` | Loading indicator |

#### Layout Components (src/components/layout/)
| Component | Purpose |
|-----------|---------|
| `Sidebar` | Navigation menu |
| `Header` | Top bar with user info |
| `PageHeader` | Page title + actions |

#### Chart Components (src/components/charts/)
| Component | Purpose |
|-----------|---------|
| `LineChart` | Sales trend |
| `BarChart` | Campaign types |
| `PieChart` | Platform distribution |
| `StatCard` | Single metric display |

---

### Dashboard Metrics

#### Admin Dashboard
| Metric | Type | Description |
|--------|------|-------------|
| Total Sales (MTD) | StatCard | Sum of all order totals this month |
| Total Commission (MTD) | StatCard | Sum of commissions paid |
| Total Orders (MTD) | StatCard | Count of orders |
| Average Order Value | StatCard | Total / Orders count |
| Top 5 Sales Persons | Table | Ranked by commission earned |
| Recent Campaigns | Table | Last 5 created |
| Sales Trend (6mo) | LineChart | Monthly revenue trend |
| Campaigns by Platform | PieChart | Facebook vs Instagram |

#### Sales Person Dashboard
| Metric | Type | Description |
|--------|------|-------------|
| My Commission (MTD) | StatCard | Personal total |
| My Campaigns | StatCard | Active campaign count |
| My Orders (MTD) | StatCard | Orders under my campaigns |
| Weekly Progress | BarChart | Last 4 weeks |
| Recent Orders | Table | Last 5 orders |

---

## 🔧 Backend Architecture

### Directory Structure
```
src/server/
├── config/               # Configuration (db, env)
├── controllers/          # Request handlers
├── middleware/           # Auth, validation, error handling
├── models/               # Mongoose schemas
├── routes/               # API routes
├── services/             # Business logic
├── utils/                # Helper functions
└── index.js              # Entry point
```

### API Routes

#### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Authenticate user |
| POST | `/logout` | Clear session |
| GET | `/me` | Get current user |

#### User Routes (`/api/users`) [Admin Only]
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List users (paginated) |
| GET | `/:id` | Get user by ID |
| POST | `/` | Create user |
| PUT | `/:id` | Update user |
| DELETE | `/:id` | Delete user |
| POST | `/:id/reset-password` | Reset password (nice-to-have) |

#### Campaign Routes (`/api/campaigns`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List campaigns (filtered by role) |
| GET | `/:id` | Get campaign by ID |
| POST | `/` | Create campaign [Admin] |
| PUT | `/:id` | Update campaign [Admin] |
| DELETE | `/:id` | Soft delete campaign [Admin] |

#### Order Routes (`/api/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List orders (filtered by role) |
| GET | `/:id` | Get order by ID |
| POST | `/` | Create order [Admin] |
| PUT | `/:id` | Update order [Admin] |
| DELETE | `/:id` | Soft delete order [Admin] |

#### Dashboard Routes (`/api/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Admin dashboard metrics |
| GET | `/sales/stats` | Sales person metrics |
| GET | `/sales/commissions` | Monthly commission list |
| GET | `/sales/commissions/:yearMonth` | Detailed breakdown |

### Middleware Stack
```
Request → cors → cookieParser → auth → validateRole → controller → Response
```

| Middleware | Purpose |
|------------|---------|
| `auth` | Verify JWT from cookie |
| `validateRole` | Check user role for route access |
| `errorHandler` | Centralized error responses |

---

## 🔐 Authentication Flow

```
1. User submits login form
   ↓
2. POST /api/auth/login (username, password)
   ↓
3. Server validates credentials
   ↓
4. Server generates JWT, sets HttpOnly cookie
   ↓
5. Response: { user: { id, name, role } }
   ↓
6. Frontend stores user in React Context
   ↓
7. Protected routes check context
   ↓
8. API calls include cookie automatically
```

---

## 📊 Commission Calculation Logic

### On Order Create
```javascript
const commissionRate = salesPerson.commissionRate;
const orderTotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
const commissionAmount = orderTotal * (commissionRate / 100);
// Store both amount AND rateSnapshot for audit
```

### On Order Update
```javascript
// Recalculate with NEW rate (as per requirement)
const newOrderTotal = updatedItems.reduce(...);
const newCommission = newOrderTotal * (salesPerson.commissionRate / 100);
```

### On Order Delete
```javascript
// Soft delete (set deletedAt)
// Commission excluded from totals via query filter
```

---

## 🎨 Design Tokens (Tailwind Config)

```javascript
// tailwind.config.js
colors: {
  primary: '#4F46E5',    // Indigo
  secondary: '#6B7280',  // Gray
  success: '#10B981',    // Green
  warning: '#F59E0B',    // Amber
  danger: '#EF4444',     // Red
  background: '#F9FAFB', // Light gray
}
```

---

## ⚖️ Rationale for New Major Version

**Major Changes from v1:**
1. Added detailed component hierarchy
2. Specified all routes and API endpoints
3. Included dashboard metrics specifications
4. Added authentication flow details
5. Expanded directory structure
6. Added commission calculation logic
7. Specified UI components list

---

## 🔄 Open Items (TBD)

- [ ] Can Sales Persons create their own campaigns?
- [ ] Password reset implementation details
- [ ] Email notifications (if any)

---

## 📋 Implementation Priority

### Phase 1: Core Infrastructure
1. Authentication (login/logout)
2. Route protection
3. Base UI components

### Phase 2: Admin Features
1. User CRUD
2. Campaign CRUD
3. Order CRUD
4. Admin Dashboard

### Phase 3: Sales Person Features
1. Commission view (monthly)
2. Commission breakdown (daily/weekly)
3. Sales Dashboard

### Phase 4: Polish
1. Charts and visualizations
2. Pagination
3. Error handling
4. Loading states
