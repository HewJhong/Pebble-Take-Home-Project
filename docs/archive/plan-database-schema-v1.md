# DatabaseSchema: Design (v1)

## 📅 Date & Time of Generation
2025-12-15 21:18

## 🎯 Actionable Goal
Design a relational database schema for User Management, Campaigns, Orders, and Commissions.

## 💡 Proposed Design/Flow/Architecture
Relational Database (SQL).
Entities:
1. **Users**: Admin/Sales Person roles. `commission_rate` for Sales.
2. **Campaigns**: Linked to Sales Person. Immutable after creation. Soft Delete support.
3. **Orders**: Linked to Campaign. Stores `commission_amount` snapshot at creation.
4. **OrderItems**: Product details per order.

## 🔧 Implementation Details/Key Components
**Tables**: `users`, `campaigns`, `orders`, `order_items`.

## ⚖️ Rationale for New Major Version
Initial design based on `problem_statement.md`.
