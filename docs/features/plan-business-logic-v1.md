# Business Logic Implementation Plan

> **Reference**: [Problem Statement](file:///c:/Users/User/Documents/PebbleTech/Take%20Home%20Project/docs/problem/dataset-problem-statement.md)

---

## 1. User Management

| Action | Logic | Status |
|--------|-------|--------|
| Create User | Hash password, validate commission rate ≤ 100% for sales_person | ✅ Done |
| Update User | Allow name, role, commission rate changes. Cannot change username | ✅ Done |
| Delete User | Hard delete (consider: block if has campaigns?) | ✅ Done |

---

## 2. Campaign Management

| Action | Logic | Status |
|--------|-------|--------|
| Create | Assign to one sales person (immutable) | ✅ Done |
| Update | Title, Platform, Type, URL editable. **Sales person NOT editable** | ✅ Done |
| Delete | **Soft delete** + cascade delete all orders → deduct commissions | ⚠️ Partial |

### 🔴 Required Fix: Campaign Delete
**Current**: Sets campaign `status: 'deleted'` and soft-deletes orders.
**Required**: When deleting a campaign, all commission amounts from its orders must be deducted from totals.

```javascript
// On Campaign Delete:
1. Set campaign.status = 'deleted'
2. Find all orders under this campaign
3. Set order.deletedAt = new Date() for each
4. Commission totals automatically excluded (query filters deletedAt)
```

---

## 3. Order Management

| Action | Logic | Status |
|--------|-------|--------|
| Create | Calculate commission at CURRENT rate, store rateSnapshot | ✅ Done |
| Update | **Recalculate commission at CURRENT rate** (not snapshot) | ⚠️ Check |
| Delete | Soft delete → commission excluded from totals | ✅ Done |

### Commission Calculation Rules

#### On Order CREATE:
```
commission = orderTotal × (salesPerson.commissionRate / 100)
Store: { amount, rateSnapshot }
```
- **Snapshot is for AUDIT only** - records rate at creation time

#### On Order UPDATE:
```
newTotal = sum(items.totalPrice)
newCommission = newTotal × (order.commission.rateSnapshot / 100)
```
> ✅ **Confirmed**: Updates use SNAPSHOT rate (locked at creation), not current rate!

#### On Order DELETE:
- Soft delete with `deletedAt` timestamp
- Queries filter out deleted orders
- Commission automatically excluded from totals

### 🔴 Required Fix: Verify Order Update Logic
**Check**: Is the update using `salesPerson.commissionRate` (current) or `order.commission.rateSnapshot` (old)?

---

## 4. Commission Payout (Sales Person View)

| Feature | Logic | Status |
|---------|-------|--------|
| Monthly List | Aggregate orders by year-month, sum commissions | ❌ Not Done |
| Month Detail | Group by campaign, show per-campaign totals | ❌ Not Done |

### API Endpoints Needed:
```
GET /api/dashboard/sales/commissions?year=2024
→ Returns: [{ yearMonth: "2024-01", totalCommission, orderCount, campaignCount }]

GET /api/dashboard/sales/commissions/2024-01
→ Returns: { 
    total: 1500,
    campaigns: [
      { campaignId, title, orderCount, commissionTotal },
      ...
    ]
  }
```

### Query Logic:
```javascript
// Monthly aggregation for sales person
Order.aggregate([
  { $match: { 
      deletedAt: null,
      campaign: { $in: salesPerson's campaigns }
  }},
  { $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" }},
      total: { $sum: "$commission.amount" },
      count: { $sum: 1 }
  }}
])
```

---

## Implementation Priority

| Priority | Item | Complexity |
|----------|------|------------|
| **1** | Verify order update uses CURRENT rate | Low |
| **2** | Add commission aggregation API | Medium |
| **3** | Create Sales Commission View pages | Medium |
| **4** | Test campaign delete cascades correctly | Low |

---

## Files to Modify/Create

### Backend
- `src/server/routes/orderRoutes.js` - Verify update logic
- `src/server/routes/dashboardRoutes.js` - **NEW** - Commission APIs

### Frontend
- `src/client/src/pages/sales/CommissionView.jsx` - Monthly list
- `src/client/src/pages/sales/CommissionDetail.jsx` - **NEW** - Per-month breakdown
