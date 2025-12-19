# Campaign & Sales Analytics Planning Document

## 📅 Date & Time of Generation
2025-12-17T12:27:00+08:00

## 🎯 Actionable Goal
Design and implement analytics features that enable managers to:
1. Compare campaign performance to identify campaigns worth repeating or killing
2. Evaluate sales person performance based on profitability, not just volume

---

## 📊 Proposed Analytics Features

### 1. Campaign Performance Dashboard

**Purpose**: Help managers decide which campaigns to repeat or discontinue.

#### Key Metrics per Campaign

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| **Total Sales** | Sum of all order totals | Revenue generated |
| **Order Count** | Number of orders | Volume indicator |
| **Avg Order Value** | Total Sales / Order Count | Customer spending pattern |
| **Total Commission** | Sum of commission amounts | Cost to company |
| **Commission Rate** | (Total Commission / Total Sales) × 100 | Profitability indicator |
| **Net Revenue** | Total Sales - Total Commission | Actual company revenue |

#### Visualization Ideas
- **Bar chart**: Sales vs Commission per campaign (stacked)
- **Scatter plot**: Sales volume vs Commission % (identify high-volume + low-cost campaigns)
- **Ranking table**: Sort by Net Revenue or Commission %

#### Implementation Files
- `src/client/src/pages/admin/CampaignAnalytics.jsx` - New page
- `src/server/routes/analyticsRoutes.js` - New API routes
- `src/client/src/components/charts/BarChart.jsx` - Reusable chart component

---

### 2. Sales Person Performance Dashboard

**Purpose**: Evaluate sales persons not just on volume, but on profitable selling.

#### Key Metrics per Sales Person

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| **Total Sales** | Sum of all their order totals | Volume sold |
| **Campaign Count** | Number of campaigns assigned | Workload indicator |
| **Total Commission Earned** | Sum of their commissions | Sales person earnings |
| **Commission Rate** | Their assigned rate | Current rate |
| **Avg Sale per Campaign** | Total Sales / Campaign Count | Productivity |
| **Revenue per Commission RM** | Total Sales / Total Commission | Efficiency ratio |

#### Performance Classification
```
High Performer: High Sales + Low Commission % (efficient)
Steady Performer: Moderate Sales + Average Commission %
Needs Review: Low Sales OR High Commission % (costly)
```

#### Implementation Files
- `src/client/src/pages/admin/SalesPersonAnalytics.jsx` - New page
- Add `/api/analytics/sales-persons` endpoint

---

### 3. Comparative Analysis View

**Purpose**: Side-by-side comparison of multiple campaigns or sales persons.

#### Features
- Select 2-4 campaigns/sales persons to compare
- Radar chart showing multiple metrics
- Highlight strengths/weaknesses

---

## 🔧 Implementation Details

### Backend API Endpoints

```javascript
// Campaign Analytics
GET /api/analytics/campaigns
GET /api/analytics/campaigns/:id/breakdown

// Sales Person Analytics  
GET /api/analytics/sales-persons
GET /api/analytics/sales-persons/:id/breakdown

// Summary endpoints
GET /api/analytics/summary (top performers, trends)
```

### Frontend Components

```
src/client/src/
├── pages/admin/
│   ├── CampaignAnalytics.jsx
│   └── SalesPersonAnalytics.jsx
├── components/charts/
│   ├── BarChart.jsx
│   ├── LineChart.jsx
│   └── RadarChart.jsx
└── services/
    └── analyticsApi.js
```

### Chart Library Options
1. **Recharts** - React-specific, easy to use
2. **Chart.js + react-chartjs-2** - Full-featured, flexible
3. **Lightweight option**: CSS-based bars for simple charts

---

## 📈 Priority Implementation Order

1. **Phase 1 (MVP)**: Campaign metrics table with sorting
   - Already partially implemented ✅
   - Add Commission % column
   - Add sorting by any column

2. **Phase 2**: Campaign Analytics Page
   - Summary cards (Total Sales, Avg Commission %, Top Campaign)
   - Bar chart comparing campaigns

3. **Phase 3**: Sales Person Analytics
   - Performance ranking table
   - Comparison view

4. **Phase 4**: Advanced Features
   - Time-based trends
   - Predictive insights

---

## ⚖️ AI Insights Evaluation (Item 4)

### Proposal
> Use AI to summarize insights and provide a one-liner in the admin dashboard.

### Critical Evaluation

#### ✅ Pros
1. **Time-saving**: Executives don't need to analyze charts
2. **Contextual**: AI can explain "why" behind numbers
3. **Proactive**: Can highlight anomalies automatically

#### ⚠️ Concerns
1. **Accuracy**: LLMs can hallucinate numbers or misinterpret trends
2. **Cost**: API calls per refresh add up (≈$0.01-0.05 per request)
3. **Latency**: 1-3 second delay for AI response
4. **Value**: For small datasets, simple rules-based insights may suffice

#### 🎯 Recommendation
**Yes, but with caveats:**

1. **Use rules-based insights first** (no AI needed):
   ```
   "Top campaign: Christmas Sales (RM 5,000)"
   "John Sales has the highest efficiency ratio (RM 8.50 sales per RM 1 commission)"
   ```

2. **Add AI insights as optional premium feature**:
   - Cache AI insights for 24 hours
   - User-triggered "Get AI Analysis" button (not auto)
   - Display clear "AI-generated" label

3. **Start simple, scale if needed**:
   - Template-based insights are 90% as good, 100x cheaper
   - Reserve AI for complex trend analysis or anomaly detection

---

## ⏳ Next Steps

1. [ ] Add Commission % column to campaign list
2. [ ] Create `CampaignAnalytics.jsx` page
3. [ ] Implement backend analytics endpoints
4. [ ] Add charts (Recharts recommended)
5. [ ] Implement rules-based insight generator
6. [ ] (Optional) Add AI insights with caching

