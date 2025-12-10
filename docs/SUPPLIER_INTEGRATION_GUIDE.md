# Supplier Backend & Frontend Integration Guide

## Overview
This document details all the missing features identified in the Supplier frontend and the backend implementations added to support them.

## Summary of Changes

### Frontend Features Identified
The Supplier Dashboard frontend (`supplier-dashboard.tsx`) displays the following features:

1. **KPI Cards (Dashboard Metrics)**
   - Total Revenue
   - Total Expenses  
   - Net Profit
   - Average Rating (with review count)

2. **Charts & Analytics**
   - Top 5 Raw Materials by Quantity (Bar Chart)
   - Revenue vs Expense Trend (Line Chart)

3. **Pending Orders Management**
   - Order ID
   - Manufacturer Name
   - Order Amount
   - Process/Action Button

4. **Recent Notifications Feed**
   - Notification messages with timestamps

5. **Sidebar Navigation**
   - Dashboard
   - Materials Catalog
   - Manufacturer Orders
   - Financials
   - Ratings & Reviews
   - Notifications

---

## Backend Implementations Added

### 1. Dashboard Endpoint
**Route:** `GET /api/supplier/dashboard`
**Authentication:** Required (Supplier Role)

**Functionality:**
- Calculates total revenue from delivered orders
- Calculates total expenses from expense records
- Computes net profit (revenue - expenses)
- Retrieves average rating and total rating count
- Counts pending orders

**Response Example:**
```json
{
  "totalRevenue": 328400,
  "totalExpense": 193200,
  "netProfit": 135200,
  "avgRating": "4.8",
  "totalRatings": 324,
  "pendingOrders": 5
}
```

### 2. Supplier Ratings Endpoint
**Route:** `GET /api/supplier/ratings`
**Authentication:** Required (Supplier Role)

**Functionality:**
- Retrieves all ratings given to the supplier
- Includes rater name and review details
- Calculates average rating and total count
- Ordered by most recent first

**Response Example:**
```json
{
  "ratings": [
    {
      "rating_id": "RAT-001",
      "rater_name": "John Doe",
      "rating_value": 5,
      "review": "Excellent service",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "average": "4.8",
  "total": 324
}
```

### 3. Material Stock Overview Endpoint
**Route:** `GET /api/supplier/materials/stock/overview`
**Authentication:** Required (Supplier Role)

**Functionality:**
- Retrieves top 5 materials by quantity
- Provides material names and current quantities
- Used for stock visualization chart

**Response Example:**
```json
[
  { "material_name": "Steel", "quantity_available": 450 },
  { "material_name": "Aluminum", "quantity_available": 380 },
  { "material_name": "Plastic", "quantity_available": 290 },
  { "material_name": "Copper", "quantity_available": 210 },
  { "material_name": "Rubber", "quantity_available": 180 }
]
```

### 4. Pending Orders Endpoint
**Route:** `GET /api/supplier/orders/pending`
**Authentication:** Required (Supplier Role)

**Functionality:**
- Retrieves pending and processing orders only
- Includes manufacturer information
- Shows order amount and date
- Orders by most recent first

**Response Example:**
```json
[
  {
    "order_id": "ORD-001",
    "total_amount": 12500,
    "manufacturer_name": "ABC Manufacturing",
    "order_status": "pending",
    "order_date": "2025-01-16T09:00:00Z"
  }
]
```

### 5. Delete Material Endpoint
**Route:** `DELETE /api/supplier/materials/:id`
**Authentication:** Required (Supplier Role)

**Functionality:**
- Removes a raw material from supplier's catalog
- Ensures supplier can only delete their own materials
- Returns confirmation message

---

## Database Queries Used

### Revenue Calculation
```sql
SELECT COALESCE(SUM(o.total_amount), 0) as total_revenue
FROM orders o
WHERE o.delivered_by = $1 AND o.order_status = 'delivered'
```

### Expense Calculation
```sql
SELECT COALESCE(SUM(amount), 0) as total_expense
FROM expense WHERE user_id = $1
```

### Rating Information
```sql
SELECT AVG(rating_value) as avg_rating, COUNT(*) as total_ratings
FROM ratings WHERE given_to = $1
```

### Pending Orders
```sql
SELECT o.order_id, o.total_amount, u.name as manufacturer_name, 
       o.order_status, o.order_date
FROM orders o
JOIN users u ON o.ordered_by = u.user_id
WHERE o.delivered_by = $1 AND o.order_status IN ('pending', 'processing')
ORDER BY o.order_date DESC
```

---

## Frontend Integration Points

### Supplier Dashboard Component (`supplier-dashboard.tsx`)

#### KPI Cards Update
The dashboard now calls `/api/supplier/dashboard` to populate:
- Total Revenue Card
- Total Expenses Card
- Net Profit Card
- Average Rating Card

#### Charts Integration
1. **Material Stock Chart** - Calls `/api/supplier/materials/stock/overview`
2. **Revenue vs Expense Chart** - Calls `/api/analytics/revenue` and `/api/analytics/expense`

#### Orders Table Update
- **Pending Orders Table** - Calls `/api/supplier/orders/pending`
- Displays manufacturer name, amount, and status

#### Ratings Integration
- **Ratings & Reviews Section** - Calls `/api/supplier/ratings`
- Displays supplier's average rating with review count

---

## API Endpoint Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/supplier/dashboard` | Dashboard metrics | Supplier |
| GET | `/api/supplier/materials` | List all materials | Supplier |
| POST | `/api/supplier/materials` | Add new material | Supplier |
| PUT | `/api/supplier/materials/:id` | Update material | Supplier |
| DELETE | `/api/supplier/materials/:id` | Delete material | Supplier |
| GET | `/api/supplier/materials/stock/overview` | Top 5 materials | Supplier |
| GET | `/api/supplier/orders` | All orders | Supplier |
| GET | `/api/supplier/orders/pending` | Pending orders only | Supplier |
| PUT | `/api/supplier/orders/:id/status` | Update order status | Supplier |
| GET | `/api/supplier/ratings` | Supplier ratings | Supplier |

---

## Backend Logic Updates (`Backend/logic/supplier.js`)

### New Functions Added

1. **loadDashboardData()**
   - Fetches dashboard metrics
   - Updates all KPI cards

2. **loadPendingOrders()**
   - Fetches pending orders
   - Renders orders table

3. **loadRatings()**
   - Updated to use new `/api/supplier/ratings` endpoint
   - Displays all ratings with average calculation

4. **loadAnalytics()**
   - Fetches analytics data
   - Calculates and displays financial metrics

5. **loadNotifications()**
   - Loads and displays recent notifications

6. **generateFinancialChart()**
   - Generates revenue vs expense trend data
   - Groups data by month for visualization

7. **generateMaterialStockChart()**
   - Fetches material stock overview
   - Prepares data for chart rendering

### Helper Functions

- `groupDataByMonth()` - Groups financial data by month
- `renderFinancialChart()` - Renders financial trend chart
- `showOrderDetails()` - Shows detailed order information

---

## Testing Checklist

### Backend Testing
- [ ] GET `/api/supplier/dashboard` returns correct metrics
- [ ] GET `/api/supplier/materials/stock/overview` returns top 5 materials
- [ ] GET `/api/supplier/orders/pending` filters pending orders correctly
- [ ] GET `/api/supplier/ratings` returns supplier ratings with average
- [ ] DELETE `/api/supplier/materials/:id` removes material
- [ ] All endpoints require proper authentication
- [ ] All endpoints verify supplier ownership of resources

### Frontend Testing
- [ ] Dashboard loads all KPI values correctly
- [ ] Material stock chart displays top 5 materials
- [ ] Revenue vs Expense chart shows financial trends
- [ ] Pending orders table displays correctly
- [ ] Ratings section shows supplier rating and reviews
- [ ] Sidebar navigation works properly
- [ ] All API calls use proper error handling

### Integration Testing
- [ ] Complete supplier workflow from login to dashboard
- [ ] Material creation and deletion
- [ ] Order status updates
- [ ] Rating retrieval and display
- [ ] Financial data accuracy

---

## Code Locations

### Backend Files Modified
- `Backend/routes/supplier.js` - Added 6 new endpoints
- `Backend/logic/supplier.js` - Added helper functions and UI logic

### Frontend Files Used
- `frontend/components/supplier-dashboard.tsx` - Main dashboard component
- `frontend/components/supplier-sidebar.tsx` - Navigation sidebar
- `frontend/app/supplier/dashboard/page.tsx` - Dashboard page

### Configuration
- `server.js` - Already configured with supplier routes
- `Backend/routes/analytics.js` - Analytics data support
- `Backend/routes/rating.js` - Rating system support

---

## Dependencies

### Required Backend Packages
- express
- pg (PostgreSQL client)
- middleware/auth (custom authentication)

### Required Database Tables
- `orders` - Order information
- `users` - User details for manufacturer names
- `ratings` - Rating and review data
- `expense` - Expense records
- `raw_materials` - Material inventory
- `revenue` - Revenue records (optional, for detailed analytics)

---

## Future Enhancements

1. **Notification System**
   - Create dedicated notifications table
   - Implement real-time notification delivery (WebSocket)
   - Add notification preferences

2. **Advanced Analytics**
   - Monthly revenue/expense trends
   - Material turnover rate
   - Order fulfillment metrics

3. **Supplier Metrics**
   - On-time delivery rate
   - Quality scores
   - Customer satisfaction trends

4. **Export Features**
   - Export orders to CSV/PDF
   - Financial reports export
   - Material inventory reports

5. **Forecasting**
   - Demand forecasting
   - Revenue projections
   - Inventory optimization

---

## Notes

- All API endpoints follow RESTful conventions
- Error handling returns appropriate HTTP status codes
- All timestamps are in ISO 8601 format
- Currency values are in numeric format (to be formatted on frontend)
- Supplier authorization is enforced at middleware level
- Database queries use parameterized statements for security
