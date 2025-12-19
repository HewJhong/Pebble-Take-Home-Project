# Business Logic Test Suite Planning Document (v1)

## 📅 Date & Time of Generation
2025-12-16T16:50:00+08:00

## 🎯 Actionable Goal
Create comprehensive API tests to verify all business logic rules from the problem statement.

## 💡 Proposed Design / Flow / Architecture

### Test Framework
- **Jest** - Test runner
- **Supertest** - HTTP assertions
- **MongoDB Memory Server** - Isolated test database

### Test Categories
1. **Authentication** - Login/logout, role verification
2. **User Management** - CRUD, commission rate constraints
3. **Campaign Management** - Sales person immutability, field editability
4. **Order Management** - Commission snapshot, rate locking, recalculation
5. **Commission Payout** - Monthly breakdown (requires dashboard routes)

### Critical Business Rules Tested

| Area | Rule | Test Type |
|------|------|-----------|
| User | Commission ≤ 100% | Validation |
| Campaign | Sales person immutable | Immutability |
| Order | Commission uses rate at creation | Snapshot |
| Order | Update uses original rate | Snapshot |
| Commission | Monthly breakdown | Aggregation |

## 🔧 Implementation Details / Key Components

### Files to Create
- `src/server/jest.config.js`
- `src/server/tests/setup.js`
- `src/server/tests/helpers.js`
- `src/server/tests/__tests__/auth.test.js`
- `src/server/tests/__tests__/users.test.js`
- `src/server/tests/__tests__/campaigns.test.js`
- `src/server/tests/__tests__/orders.test.js`
- `src/server/tests/__tests__/commission.test.js`

### Dependencies
- jest
- supertest
- mongodb-memory-server

## 🔄 Verification Plan
Run `npm test` and verify all tests pass.
