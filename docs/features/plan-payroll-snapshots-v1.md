# Payroll Snapshots Feature Plan

## 📅 Date & Time of Generation
2025-12-17T15:19:00+08:00

## 🎯 Feature Goal
Enable financial accountability by allowing admins/finance to:
- Generate payroll snapshots
- Mark payouts as paid
- Log payment details (paid amount, date, reference/payroll ID)

---

## 💡 Proposed Design

### Data Model: Payout

```javascript
const payoutSchema = new mongoose.Schema({
    salesPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: String, // Format: YYYY-MM
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    paidAt: Date,
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reference: String // Payroll ID or transaction reference
}, { timestamps: true });
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payouts` | List all payouts (with filters) |
| GET | `/api/payouts/:id` | Get single payout |
| POST | `/api/payouts/generate` | Generate payout for a month |
| PUT | `/api/payouts/:id/pay` | Mark payout as paid |

### Frontend Components

- `PayoutManagement.jsx` - Main page
- Month selector for generating snapshots
- Table with: Sales Person, Month, Amount, Status, Actions
- "Mark as Paid" modal with reference input

### Navigation

Add "Payroll" to admin sidebar navigation.

---

## 🔧 Implementation Details

### Generate Payout Logic

```javascript
// For each sales person:
// 1. Calculate total commission for the month
// 2. Check if payout already exists
// 3. Create payout record with 'pending' status
```

### Mark as Paid

```javascript
// Update payout:
// - status: 'paid'
// - paidAt: new Date()
// - paidBy: req.user._id
// - reference: req.body.reference
```

---

## ⏳ Status

**Deferred** - To be implemented after core UI/UX enhancements (Items 1-6) are complete.
