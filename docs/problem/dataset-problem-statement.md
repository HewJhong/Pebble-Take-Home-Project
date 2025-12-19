## 1. User Management

The system should have basic user management and authentication in place for 2 key roles. Each of them will have different view and functions when logging to the system.

- Admin
    - Basic fields such as Name, Username, Password
    - Able to view and manage users (1.User Management)
    - Able to view and manage campaign (2. Campaign)
    - Able to view and manage order (3. Order)
- Sales Person
    - Basic fields such as Name, Username, Password
    - Commission configuration will be done per sales person with a constraint of ≤ 100%
    - Able to view their commission payout amount by month and by breakdown by campaign (4. Commission Payout)

## 2. Campaign Management

- A Campaign is related to each post, event and live post done by the sales person. Each campaign can only be tied to one sales person when create and is not editable.
- Campaign must consists of the following key fields
    - Title (title of the campaign)
    - Social Media (Facebook and Instagram, select only one)
    - Type (Post, Event and Live Post, select only one)
    - URL (URL point to the post/event/live post)
    - Sales Person (Sales person that handle the campaign)
- All fields are editable except sales person
- Campaign can be deleted and all the commissions recorded for the sales person under this campaign will be deducted.
- Campaign can have zero or many sales orders.

## 3. Order Management

- An order must be created under a campaign. An order consists of the following key fields
    - Products (1 or Many)
        - Name
        - Quantity
        - Base Price
        - Total Price (Calculated from Quantity x Base Price)
    - Campaign (Campaign that close this sales order) (not able to change once assigned)
- Product is key in on demand for each order
- When an order is created, the commission to the sales person should be recorded based on the commission rate set by the time.
    - Eg: When order of RM100 is created, if the sales person has a commission rate of 10%, the commission for the order would be RM10. If the sales person commission increase to 15%, the commission of the order should be unchanged
- Order’s products can be updated to new amount or name, add new products, delete products from the order. Every-time an order is updated, the commission amount will be recalculated for the particular order.
- When an order is being deleted, the commission amount for the order will be deducted from the sales person

## 4. Commission Payout

- Sales person is able to view their sales commission amount by month and year (Eg: 2022 Jan)
- Each year month view should show the total commission of the year month.
- When viewing that particular month, a list of campaign should show up that the user has commission on
    - Eg: If Sales Person 1 is viewing Year 2022 Month Jan, and in this month, the Sales Person has 3 campaign that he/she has commission from, then these 3 campaigns will show up in the view of the month with sum of the commissions of each campaign.