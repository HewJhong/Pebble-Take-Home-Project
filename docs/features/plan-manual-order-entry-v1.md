# Manual Order Entry Planning Document (v1)

## 📅 Date & Time of Generation
2025-12-19

## 🎯 Actionable Goal
Allow administrators to manually create orders for a campaign directly from the Campaign Detail page. This handles cases where orders are placed offline or need subsequent entry.

## 💡 Proposed Design / Flow / Architecture
-   **UI Location**: "Add Order" button in the "Orders" section header on the Campaign Detail page (`/admin/campaigns/:id`).
-   **Interaction**: Button opens a modal ("Add New Order").
-   **Form Data**:
    -   Dynamic list of items (Name, Quantity, Base Price).
    -   Auto-calculation of item totals and order total.
    -   "Add Item" / "Remove Item" controls.
-   **API Integration**: Uses existing `POST /api/orders` endpoint.
    -   Payload: `{ campaign: campaignId, items: [{ name, quantity, basePrice, totalPrice }] }`.
    -   Backend calculates commission automatically based on campaign sales person.

## 🔧 Implementation Details / Key Components
-   `src/client/src/pages/admin/CampaignDetail.jsx`:
    -   State: `isAddOrderModalOpen`, `newOrderItems`.
    -   Handlers: `handleAddOrderClick`, `handleItemChange`, `handleAddItem`, `handleRemoveItem`, `handleSubmitOrder`.
    -   Components: `Modal` (reused), `PlusIcon` (imported).
-   `src/client/src/services/api.js`: Validated `orderApi.create` availability.

## ⚖️ Rationale for New Major Version
N/A (v1)
