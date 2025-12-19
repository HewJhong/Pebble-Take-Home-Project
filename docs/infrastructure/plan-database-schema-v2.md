# DatabaseSchema: Design (v2)

## 📅 Date & Time of Generation
2025-12-15 21:26

## 🎯 Actionable Goal
Redesign the database schema for MongoDB (NoSQL) to support flexible order structures and scalability, replacing the SQL design.

## 💡 Proposed Design/Flow/Architecture
We will use MongoDB with Mongoose ODM. 

### Collections
1.  **Users**
    *   `_id`: ObjectId
    *   `username`: String (Unique)
    *   `password`: String (Hashed, Required)
    *   `name`: String (Required)
    *   `role`: Enum ('admin', 'sales_person')
    *   `commissionRate`: Number (0-100, Sales Person only)
2.  **Campaigns**
    *   `_id`: ObjectId
    *   `salesPerson`: ObjectId (Ref: User)
    *   `title`: String
    *   `social_media`: Enum ('facebook', 'instagram')
    *   `type`: Enum ('post', 'event', 'live_post')
    *   `url`: String
    *   `status`: Enum ('active', 'deleted') (Soft Delete)
3.  **Orders**
    *   `_id`: ObjectId
    *   `campaign`: ObjectId (Ref: Campaign)
    *   `items`: Array of Embedded Documents:
        *   `name`: String
        *   `quantity`: Number
        *   `basePrice`: Number
        *   `totalPrice`: Number
    *   `commission`: Embedded Document:
        *   `amount`: Number
        *   `rateSnapshot`: Number
    *   `deletedAt`: Date (Nullable)

## 🔧 Implementation Details/Key Components
- **Mongoose Schemas**: Use `Schema.Types.ObjectId` for references.
- **Indexes**: Index `campaign` in Order, `salesPerson` in Campaign.

## ⚖️ Rationale for New Major Version
**Major Change**: Switch from SQL (Relational) to MongoDB (Document) as requested by the user.
