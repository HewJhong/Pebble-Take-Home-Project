# Sample Test Data & Validation Plan

## 📅 Date: 2025-12-18

## 🎯 Purpose
Provide sample data to insert into the system for testing all features and business logic.

---

## Sample Users

### Admins
| Username | Password | Name |
|----------|----------|------|
| admin | admin123 | System Admin |
| manager1 | manager123 | Jane Manager |

### Sales Persons
| Username | Password | Name | Commission Rate |
|----------|----------|------|-----------------|
| sales1 | sales123 | John Sales | 10% |
| sales2 | sales123 | Alice Wong | 15% |
| sales3 | sales123 | Bob Tan | 20% |
| sales4 | sales123 | Carol Lee | 25% |

---

## Sample Campaigns

| Title | Sales Person | Platform | Type |
|-------|--------------|----------|------|
| Christmas Sale 2024 | John Sales | Facebook | Post |
| New Year Promo | John Sales | Instagram | Event |
| Chinese New Year | Alice Wong | Facebook | Live |
| Valentine Special | Alice Wong | Instagram | Post |
| Hari Raya Deals | Bob Tan | Facebook | Event |
| Deepavali Fest | Carol Lee | Instagram | Live |

---

## Sample Orders (Per Campaign)

### Christmas Sale 2024 (John @ 10%)
| Customer | Items | Unit Price | Qty | Total | Expected Commission |
|----------|-------|------------|-----|-------|---------------------|
| Customer A | Widget | RM 100 | 2 | RM 200 | RM 20 |
| Customer B | Gadget | RM 250 | 1 | RM 250 | RM 25 |
| Customer C | Widget + Gadget | RM 350 | 1 | RM 350 | RM 35 |
| **Subtotal** | | | | **RM 800** | **RM 80** |

### New Year Promo (John @ 10%)
| Customer | Items | Unit Price | Qty | Total | Expected Commission |
|----------|-------|------------|-----|-------|---------------------|
| Customer D | Premium Box | RM 500 | 1 | RM 500 | RM 50 |
| **Subtotal** | | | | **RM 500** | **RM 50** |

### Chinese New Year (Alice @ 15%)
| Customer | Items | Unit Price | Qty | Total | Expected Commission |
|----------|-------|------------|-----|-------|---------------------|
| Customer E | CNY Bundle | RM 300 | 3 | RM 900 | RM 135 |
| Customer F | Red Packet Set | RM 50 | 10 | RM 500 | RM 75 |
| **Subtotal** | | | | **RM 1,400** | **RM 210** |

### Valentine Special (Alice @ 15%)
| Customer | Items | Unit Price | Qty | Total | Expected Commission |
|----------|-------|------------|-----|-------|---------------------|
| Customer G | Love Box | RM 200 | 2 | RM 400 | RM 60 |
| **Subtotal** | | | | **RM 400** | **RM 60** |

### Hari Raya Deals (Bob @ 20%)
| Customer | Items | Unit Price | Qty | Total | Expected Commission |
|----------|-------|------------|-----|-------|---------------------|
| Customer H | Raya Set | RM 150 | 5 | RM 750 | RM 150 |
| Customer I | Premium Raya | RM 400 | 1 | RM 400 | RM 80 |
| **Subtotal** | | | | **RM 1,150** | **RM 230** |

### Deepavali Fest (Carol @ 25%)
| Customer | Items | Unit Price | Qty | Total | Expected Commission |
|----------|-------|------------|-----|-------|---------------------|
| Customer J | Diwali Gift | RM 180 | 3 | RM 540 | RM 135 |
| **Subtotal** | | | | **RM 540** | **RM 135** |

---

## Expected Analytics Summary

### By Sales Person
| Sales Person | Rate | Campaigns | Total Sales | Commission | Efficiency |
|--------------|------|-----------|-------------|------------|------------|
| John Sales | 10% | 2 | RM 1,300 | RM 130 | 10.0x |
| Alice Wong | 15% | 2 | RM 1,800 | RM 270 | 6.67x |
| Bob Tan | 20% | 1 | RM 1,150 | RM 230 | 5.0x |
| Carol Lee | 25% | 1 | RM 540 | RM 135 | 4.0x |
| **TOTAL** | | **6** | **RM 4,790** | **RM 765** | |

### By Campaign (Ranked by Net Revenue)
| Campaign | Sales | Commission | Comm % | Net Revenue |
|----------|-------|------------|--------|-------------|
| Chinese New Year | RM 1,400 | RM 210 | 15% | RM 1,190 |
| Hari Raya Deals | RM 1,150 | RM 230 | 20% | RM 920 |
| Christmas Sale 2024 | RM 800 | RM 80 | 10% | RM 720 |
| New Year Promo | RM 500 | RM 50 | 10% | RM 450 |
| Deepavali Fest | RM 540 | RM 135 | 25% | RM 405 |
| Valentine Special | RM 400 | RM 60 | 15% | RM 340 |

---

## Validation Checklist

### 1. User Management
- [ ] Create all sample users via UI
- [ ] Verify commission rates display correctly with color coding
- [ ] Test user detail modal on row click
- [ ] Test commission history tracking after rate change

### 2. Campaign Management
- [ ] Create all sample campaigns
- [ ] Verify platform/type badges display correctly
- [ ] Test campaign detail page shows correct orders

### 3. Order Management
- [ ] Create orders with multiple items
- [ ] Verify commission snapshot captures rate at creation time
- [ ] Change a user's commission rate → new orders use new rate

### 4. Analytics
- [ ] Dashboard shows correct totals
- [ ] Bar chart displays top campaigns
- [ ] Analytics page shows Commission % per campaign
- [ ] Sales person efficiency ratio calculated correctly

### 5. Delete Safeguards
- [ ] Delete sales person → shows campaigns at risk
- [ ] Delete admin → shows simpler warning

---

## Quick Insert Script (MongoDB Shell)

```javascript
// Run in MongoDB shell after connecting to database

// Clear existing data (CAUTION!)
db.users.deleteMany({ username: { $nin: ['admin'] } });
db.campaigns.deleteMany({});
db.orders.deleteMany({});

// Users will be created via UI to test validation
// This script is for reference only
```

---

## Test Scenarios

### Scenario 1: Commission Rate Change
1. Create order for John (10% rate)
2. Change John's rate to 12%
3. Create new order for John
4. Verify: First order = 10%, Second order = 12%

### Scenario 2: High Commission Warning
1. Try to set Bob's rate to 30%
2. Verify: Yellow/red warning appears
3. Save anyway
4. Verify: Rate saved in history

### Scenario 3: Delete User Impact
1. Try to delete Alice Wong
2. Verify: Shows 2 campaigns at risk
3. Verify: Shows RM 270 commission at risk
4. Cancel deletion

### Scenario 4: Analytics Accuracy
1. After inserting all data
2. Dashboard Total Sales = RM 4,790
3. Dashboard Total Commission = RM 765
4. Dashboard Net Revenue = RM 4,025
