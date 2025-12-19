# WebApp: ComponentDesign (v1)

## 📅 Date & Time of Generation
2025-12-15 21:26

## 🎯 Actionable Goal
Outline the React Frontend component hierarchy and Node.js Backend structure.

## 💡 Proposed Design/Flow/Architecture
### Stack
- **Frontend**: React (Vite), TailwindCSS.
- **Backend**: Node.js + Express.
- **Database**: MongoDB.

### Frontend Components (src/client)
- **Layouts**: 
  - `MainLayout`: Contains Sidebar and Header.
  - `AuthLayout`: For Login.
- **Pages**:
  - `Login`: Auth entry point.
  - `AdminDashboard`: Overview.
  - `SalesDashboard`: Personal Overview.
  - `CampaignList`: Manage Campaigns.
  - `OrderList`: Manage Orders (with Modal for Create/Edit).
  - `CommissionView`: Commission history.
- **Components**: `Card`, `Table`, `Modal`, `FormInput`.

### Backend Structure (src/server)
- `models/`: Mongoose Schemas (`User`, `Campaign`, `Order`).
- `controllers/`: Logic for API endpoints.
- `routes/`: Express Routes.
- `middleware/`: Auth (JWT), Validation.

## 🔧 Implementation Details/Key Components
- **Auth**: JWT stored in HttpOnly Cookie or LocalStorage.
- **API**: `/api/v1/` prefix.

## ⚖️ Rationale for New Major Version
Initial WebApp Architecture design.
