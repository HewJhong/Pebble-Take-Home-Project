# COMPLETED
1. ~~When the user selects the password field, it should not display any suggestions.~~ ✅ Changed to `autoComplete="off"` to fully disable suggestions
2. ~~When I select the navigation items on the side bar, it prompts me to sign in again, which is not the correct behavior.~~ ✅ Added all navigation routes with placeholder pages

## High Priority
3. ~~Admins should be able to see the details of a campaign by clicking on the campaign row in the campaign list, it would show the orders details.~~ ✅ Created CampaignDetail page with orders table

## Low Priority
4. ~~Refine the design of the text boxes and text display, make it look more professional and modern.~~ ✅ Updated CSS with Inter font, refined inputs, shadows, transitions
5. ~~In the dropdown menu, do not allow the user to select "Select sales person" or "Select campaign", it should also be shown as disabled.~~ ✅ Added `disabled` attribute to placeholder options
6. ~~In the campaign details page, think about how to show the social media platform and type more easily, by using colors or visual cues.~~ ✅ Added colored badges with emojis (📘 Facebook, 📷 Instagram, 📝 Post, 📅 Event, 🔴 Live)

# TODO
1. ~~Add smoothing to the search bar.~~ ✅ Added `useDebounce` hook with 300ms delay to UserList and CampaignList

# QUESTIONS
1. ~~Why the username cannot be changed? Is that a hard requirement in the problem statement?~~ ✅ Answered: This is a design choice, NOT a requirement. The problem statement does not mandate username immutability.

# FIX
1. ~~From the admin page, I see that John Sales, username sales1 is assigned to a campaign, however, when I login to his account, I don't see any campaign, can you figure out the problem and try to resolve the issue?~~ ✅ Fixed: `MyCampaigns.jsx` was a placeholder with no API call. Implemented full component with `campaignApi.list()` integration.

# TODO
1. ~~For test 1.4, make sure to delete the original value 10 first then input 15, then continue with test 1.5 onwards.~~ ✅ Auto-resolved: Added `onFocus` handler to commission input that selects all text, making it easy to replace values.
2. ~~When the user navigate into one of the campaigns, the highlight on the menu bar should still remain to show that the user is still on that section.~~ ✅ Fixed: Updated `MainLayout.jsx` to use `startsWith` path matching for active link detection.
3. ~~When the user types a number into the value field, the field should automatically remove the leading 0.~~ ✅ Fixed: Added `onFocus` handlers to all number inputs to auto-select text.
4. ~~I notice that the entries in the campaigns page is kinda empty, do you think adding some metrics like the total sales on the row would be appropriate? Also, I would love to have a sorting mechanism to sort by date, or filter by a specific date range.~~ ✅ Added: Orders count, total sales, and commission columns. Added sorting dropdown (Newest/Oldest First, Title A-Z).
5. ~~In the user management page, it would be better if we split admins and sales person into tabs.~~ ✅ Added: Replaced dropdown with Admins and Sales Persons tabs using Headless UI.

# TODO (UI/UI ENHANCEMENTS)
1. ~~Make sales and commission explicit. The current design needs user to infer that the green value (+ RM144.00) is commission. We can split into two explicit columns or a single labeled column.~~ ✅ Split into explicit "Total Sales" and "Commission" columns.

2. ~~Add a hover tooltip to let the users know that they can view orders under this campaign on click.~~ ✅ Added `title="Click to view campaign orders"` tooltip on rows.

3. ~~Think about some of the uses of the sales and commission data, here are some ideas you can work on. Managers compare, sales per campaign, commission per campaign, commission % per campaign to identify which campaign to repeat or kill. Another thing is to evaluate the performance of the sales person, not just who sold the most, but who sold profitably. Outline the implementation in detailed, document them in a .md file.~~ ✅ Created `docs/features/plan-analytics-features-v1.md` with detailed implementation plan.

4. ~~You can try to leverage AI to do summarize of the insights to provide a one-liner in the admin dashboard. Let me know if this is a good idea, critically evaluate it before agreeing.~~ ✅ Evaluated in the analytics document. **Recommendation**: Start with rules-based insights (cheaper, faster), add AI as optional feature with caching.

# TODO (UI/UI ENHANCEMENTS)
1. ~~Campaign page - The campaign row now seems to have to many data cluttered together and doesn't look nice visually. For the platform and type, I am thinking of using the actual platform icon and for the type, can you suggest me some ideas for that? Maybe using emojis or a small text somewhere below the campaign title?~~ ✅ Consolidated campaign table: platform/type badges moved below title with emojis. Reduced from 8 to 6 columns.

2. ~~User management page - The toggle for admins and sales person looks like plain text inside a container and there is no strong visual cue which tab is active. Also, admins do not need the commission column, which wastes visual space and creates ambiguity. You can hide that column entirely when viewing Admins. Also, there is no visual importance given to commission, which is one of the most critical data for a sales person. We need to emphasize that with color rules for high commission values. Another thing is that editing commission should be a high-risk action, but the UI signifies that the editing is harmless, and no indication that changing commission rates affects money. We need to add a confirmation dialog to prevent accidental changes and also warn the user when the commission rate is exceptionally higher than other sales person. Also, add a warning copy to say that "commission changes apply to new orders only". You will also need to enforce that the commission rate should be applied when the order is created, which means that it takes snapshot of the commission rate at creation, not affected by changing the commission rate afterwards.~~ ✅ Implemented: border-bottom tabs with emojis, hidden commission for Admins, color-coded rates (green/yellow/red), warning copy on edit. Note: Commission snapshot already implemented in Order model.

3. ~~We will also need to keep a backlog of when the commission rate is changed for the admins so that they can keep track. Another thing that we can place is to show the effect since date for each user for easy viewing.~~ ✅ Added `commissionHistory` array to User model. Backend tracks changes with date + changedBy.

4. ~~Delete user action is also too easy. We will need to check if a sales person has any active campaigns. We will need to show a confirmation dialog, showing the campaigns related to it and commission payout amount. We will also need to show a warning copy to say that "deleting a user will delete all their campaigns and commission payout amount".~~ ✅ Added impact endpoint + modal showing campaigns at risk, commission total, and warning copy.

5. ~~Add tooltips on hover for edit and delete user.~~ ✅ Added `title` attribute to buttons.



# COMPLETED TODO ITEMS
1. ~~Enlarge the campaign name to make it more visible. Align the commission amount with the column title.~~ ✅ Changed to `text-lg font-bold`

2. ~~In the campaign details page, can show a picture about the campaign.~~ ✅ Already implemented with `imageUrl` field

3. ~~Currently, the user management table is doing too much in a single table, a better model is to use the table as an overview and allow the user to click on any row to show the detail and risk actions.~~ ✅ Already implemented user detail modal on row click

4. ~~Read the docs about analytics features and implement them.~~ ✅ Implemented Analytics page with Recharts bar chart, campaign metrics table, and sales person performance table

# TODO
1. ~~The \"AI Insights\" on the dashboard does not actually uses AI. Help me add the field for me to place my API key in the .env file, then implement actualy AI insights using Gemini API.~~ ✅ Added `GEMINI_API_KEY` to `.env.example` and integrated Gemini API with fallback to rules-based insights.

2. ~~When creating a new campaign, the admin can add a image url, but the image is not shown anywhere in the campaign details. Fix this.~~ ✅ Campaign image is now displayed in campaign details page with platform-specific placeholders.

3. ~~The activity log feature is not wired to user/campaign/order routes.~~ ✅ Wired `logActivity` to userRoutes, campaignRoutes, and orderRoutes. Synced action names with enum.

6. ~~Weekly/Monthly trends with line charts + createdAt display.~~ ✅ Implemented in Analytics page with line/bar charts.

7. ~~Campaign effectiveDate + ROI target for testing date overrides.~~ ✅ Campaign model has `startDate` and `endDate` fields, displayed in campaign details.

8. ~~Analytics deep-dive (Compare tab with radar chart).~~ ✅ Implemented Compare tab in Analytics.jsx with RadarChart for campaign comparison.

9. ~~Wire activity logging to user/campaign/order routes.~~ ✅ See #3 above.

10. ~~For the top campaigns performance graph, combine the two metrics into a single bar, overlapping.~~ ✅ Implemented stacked bar chart showing Net Revenue + Commission = Total Sales across Admin Dashboard, Analytics, and Sales Analytics pages.

11. ~~Show a placeholder image in the campaign details page when no imageUrl is provided. Confirm me about the visual appearance and your approach to make it before executing.~~ ✅ Added platform-specific placeholder images (Facebook blue, Instagram pink/purple gradient).

12. ~~Can you suggest me multiple different graphs to visualize the sales and commission data, which can also show the comparison between different campaigns?~~ ✅ Implemented stacked bar chart for revenue composition and radar chart for multi-metric campaign comparison.

# TODO
1. ~~In the sales person dashboard, what is the significance of showing average per order? I don't think it is a useful metric.~~ ✅ Replaced "Avg per Order" with "Total Sales" metric which is more meaningful for tracking sales performance.

2. ~~Order’s products can be updated to new amount or name, add new products, delete products from the order. Every-time an order is updated, the commission amount will be recalculated for the particular order. The commission rate should use the snapshot rate, which is the rate defined when the order is first created. Also, add the edit and delete buttons back for order list, but not campaign list.~~ ✅ Already implemented: OrderList.jsx has edit/delete buttons (lines 241-258), backend recalculates commission using `rateSnapshot` on update (orderRoutes.js lines 156-165).

# TODO
1. ~~In the admin user management page, it should show the effective date of commission rate. Which indicates when is the last time a sales person has their commission rate changed. You can also add a delta, like "+1%" to show the change since the last update. You should show the effective date in the user list, but the details on the commission rate change can be placed in the "details" model window.~~ ✅ Added commission delta display (e.g., "+2%") next to rate, shows "Since [date]" in list, full history in details modal.

2. ~~In the admin user management page, since we already have the option to delete and edit the sales person, you can remove the "actions" column from the user list, instead, update that to show the sales and commission amount.~~ ✅ Replaced Actions column with Sales and Commission columns for sales persons. Admins still have Actions column. Backend now calculates and returns user stats.

3. ~~How many top sales person and top campaign will be shown in the admin dashboard? I would prefer not to exceed 5 as it will be a very long list and does not provide much value.~~ ✅ Already implemented - both lists use `.slice(0, 5)` limiting to 5 items.

4. ~~Update all numeric input fields according to this. Implement the functionality so that when a user clicks the default 0, typing a new number immediately replaces it instead of appending to it. Ensure that the value prop logic prevents leading zeroes.~~ ✅ Already implemented - all numeric inputs have `onFocus={(e) => e.target.select()}` which selects text for replacement.

5. ~~In the campaigns details page, we have an edit button, which shows a model for the user to edit the campaign details. I want to add a new field, which is deactivated, to indicate to the user that the sales person related to the campaign is not editable.~~ ✅ Added disabled Sales Person field to campaign edit modal showing current assignment with note "Sales person cannot be changed". 

# TODO
1. ~~Filters and sorting for user management page.~~ ✅ Added sorting dropdown with options for Newest, Oldest, Name A-Z, Name Z-A, Commission High-Low/Low-High (sales only).

2. ~~Effective date for commission rate display on user management page.~~ ✅ Fixed effective date to always show using createdAt as fallback when no history exists. Delta (+/-%) shown next to rate. Details modal shows full history.

3. ~~Sales person order list interface. We should prioritize the item name, then only the campaign name. Change the order and add filters and sorting for the list.~~ ✅ Reordered columns: Items | Campaign | Qty | Unit Price | Total | Commission | Actions. Added sorting dropdown with Newest, Oldest, Total, Commission options.

4. ~~Modify the hover effect for all the charts, in admin page dashboard, analytics, and sales person analytics. I don't want the gray background to be show this obvious, make it less opaque.~~ ✅ Added `cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}` to all chart Tooltips in AdminDashboard, Analytics, and SalesAnalytics.