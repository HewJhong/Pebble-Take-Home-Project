# Todo Items Fix Planning Document (v1)

## 📅 Date & Time of Generation
2025-12-16T16:30:00+08:00

## 🎯 Actionable Goal
Complete remaining items from `docs/my_todo.md`:
1. Add search bar debounce for smoother UX
2. Answer question about username immutability
3. Fix critical bug: sales persons cannot see their assigned campaigns

## 💡 Proposed Design / Flow / Architecture

### 1. Search Bar Debounce
- Create a reusable `useDebounce` hook in `/src/client/src/hooks/`
- Apply 300ms debounce to search inputs in `UserList`, `CampaignList`, `OrderList`
- Triggers API call only after user stops typing

### 2. Username Immutability
- **Finding**: Problem statement does NOT require usernames to be immutable
- Current implementation at `UserList.jsx:L97` excludes username from updates
- **Decision**: This is a deliberate design choice (common pattern for login identifiers)
- No code changes required

### 3. My Campaigns Bug Fix
- **Root Cause**: `MyCampaigns.jsx` is empty placeholder with no API call
- **Backend Status**: Already correctly filters by `req.user._id`
- **Solution**: Implement full component with API integration and campaign table

## 🔧 Implementation Details / Key Components

### Files to Create
- `src/client/src/hooks/useDebounce.js` - Reusable debounce hook

### Files to Modify
- `src/client/src/pages/admin/UserList.jsx` - Apply debounce to search
- `src/client/src/pages/admin/CampaignList.jsx` - Apply debounce to search  
- `src/client/src/pages/admin/OrderList.jsx` - Apply debounce if applicable
- `src/client/src/pages/sales/MyCampaigns.jsx` - Complete rewrite with API integration
- `src/client/src/App.jsx` - Add sales campaign detail route

### Dependencies
- No new dependencies required

## 🔄 Verification Plan
1. Test debounce by checking Network tab - should see single API call after typing stops
2. Test My Campaigns by logging in as sales1 and verifying campaigns appear
3. Test click-through to campaign detail page
