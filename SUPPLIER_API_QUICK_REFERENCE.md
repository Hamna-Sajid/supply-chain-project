# Supplier Backend API - Quick Reference

## Quick Start

### Base URL
```
http://localhost:<PORT>/api/supplier
```

### Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints Quick Reference

### 📊 Dashboard & Metrics

#### Get Dashboard Metrics
```bash
GET /dashboard

# Response
{
  "totalRevenue": 328400,
  "totalExpense": 193200,
  "netProfit": 135200,
  "avgRating": "4.8",
  "totalRatings": 324,
  "pendingOrders": 5
}
```

---

### 📦 Materials Management

#### Get All Materials
```bash
GET /materials

# Response
[
  {
    "material_id": "MAT-001",
    "material_name": "Steel",
    "description": "High-grade steel",
    "quantity_available": 450,
    "unit_price": 125.00
  }
]
```

#### Add Material
```bash
POST /materials

# Request Body
{
  "material_name": "Aluminum Sheet",
  "description": "High-grade aluminum",
  "quantity_available": 500,
  "unit_price": 45.00
}

# Response
{
  "material_id": "MAT-002",
  "material_name": "Aluminum Sheet",
  "supplier_id": "SUP-001",
  ...
}
```

#### Update Material
```bash
PUT /materials/:id

# Request Body
{
  "material_name": "Aluminum Sheet",
  "description": "Updated description",
  "quantity_available": 600,
  "unit_price": 50.00
}

# Response (updated material)
```

#### Delete Material
```bash
DELETE /materials/:id

# Response
{
  "message": "Material deleted successfully"
}
```

#### Get Material Stock Overview (Top 5)
```bash
GET /materials/stock/overview

# Response
[
  { "material_name": "Steel", "quantity_available": 450 },
  { "material_name": "Aluminum", "quantity_available": 380 },
  { "material_name": "Plastic", "quantity_available": 290 },
  { "material_name": "Copper", "quantity_available": 210 },
  { "material_name": "Rubber", "quantity_available": 180 }
]
```

---

### 📋 Orders Management

#### Get All Orders
```bash
GET /orders

# Response
[
  {
    "order_id": "ORD-001",
    "ordered_by_name": "ABC Manufacturing",
    "total_amount": 12500,
    "order_status": "pending",
    "order_date": "2025-01-16T09:00:00Z",
    "product_id": "PRD-001",
    "quantity": 100,
    "unit_price": 125.00
  }
]
```

#### Get Pending Orders Only
```bash
GET /orders/pending

# Response
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

#### Update Order Status
```bash
PUT /orders/:id/status

# Request Body
{
  "status": "processing"  // or "shipped", "delivered"
}

# Response
{
  "order_id": "ORD-001",
  "order_status": "processing",
  "updated_at": "2025-01-16T14:30:00Z"
}
```

---

### ⭐ Ratings & Reviews

#### Get All Ratings for Supplier
```bash
GET /ratings

# Response
{
  "ratings": [
    {
      "rating_id": "RAT-001",
      "rater_name": "John Doe",
      "rating_value": 5,
      "review": "Excellent service and quality",
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "rating_id": "RAT-002",
      "rater_name": "Jane Smith",
      "rating_value": 4,
      "review": "Good products, fast delivery",
      "created_at": "2025-01-14T15:45:00Z"
    }
  ],
  "average": "4.8",
  "total": 324
}
```

---

## Error Handling

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request returned data |
| 201 | Created | Material successfully added |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Not authorized (wrong role) |
| 404 | Not Found | Material/Order not found |
| 500 | Server Error | Database error |

### Error Response Format
```json
{
  "error": "Description of what went wrong"
}
```

---

## Example Workflows

### Complete Order Workflow

1. **View Pending Orders**
```bash
GET /orders/pending
```

2. **Check Order Details**
```bash
GET /orders
# Filter in client to find specific order
```

3. **Update Order Status**
```bash
PUT /orders/ORD-001/status
Body: { "status": "processing" }
```

4. **Monitor Progress**
- Repeat steps 1-3 to track order status changes

---

### Material Inventory Workflow

1. **Add New Material**
```bash
POST /materials
Body: {
  "material_name": "Steel Plate",
  "description": "High-quality steel",
  "quantity_available": 100,
  "unit_price": 50.00
}
```

2. **View All Materials**
```bash
GET /materials
```

3. **Check Stock Overview**
```bash
GET /materials/stock/overview
```

4. **Update Quantity (if needed)**
```bash
PUT /materials/MAT-001
Body: { "quantity_available": 150 }
```

5. **Remove Old Material**
```bash
DELETE /materials/MAT-OLD
```

---

### Dashboard Workflow

1. **Get All Dashboard Metrics**
```bash
GET /dashboard
# Returns: revenue, expenses, profit, rating, pending orders count
```

2. **Get Detailed Ratings**
```bash
GET /ratings
# Returns: all reviews, average rating, total count
```

3. **Get Stock Overview**
```bash
GET /materials/stock/overview
# Returns: top 5 materials for chart display
```

---

## Frontend Implementation Examples

### React/Next.js Hook

```javascript
const [dashboardData, setDashboardData] = useState(null);

useEffect(() => {
  fetch('/api/supplier/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => setDashboardData(data))
    .catch(err => console.error(err));
}, [token]);

return (
  <div>
    <h2>Total Revenue: ${dashboardData?.totalRevenue}</h2>
    <h2>Net Profit: ${dashboardData?.netProfit}</h2>
    <h2>Rating: {dashboardData?.avgRating}⭐</h2>
  </div>
);
```

### Fetch Data

```javascript
async function fetchSupplierRatings() {
  const response = await fetch('/api/supplier/ratings', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) throw new Error('Failed to fetch ratings');
  return response.json();
}

// Usage
fetchSupplierRatings()
  .then(data => {
    console.log(`Average Rating: ${data.average}⭐`);
    console.log(`Total Reviews: ${data.total}`);
    console.log('Reviews:', data.ratings);
  })
  .catch(err => console.error(err));
```

---

## Useful Tips

### Token Management
```javascript
// Store token in localStorage or sessionStorage
localStorage.setItem('token', jwtToken);

// Always include in requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

### Formatting Response Data
```javascript
// Format currency from API response
const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

console.log(formatCurrency(328400)); // Output: $328400.00

// Format date from API response
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
```

### Polling for Updates
```javascript
// Check pending orders every 30 seconds
setInterval(async () => {
  const pending = await fetch('/api/supplier/orders/pending', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  console.log(`Pending orders: ${pending.length}`);
}, 30000);
```

---

## Troubleshooting

### "Unauthorized" (401) Error
- Check if token is included in Authorization header
- Verify token is not expired
- Ensure token format is: `Bearer <token>`

### "Forbidden" (403) Error
- Verify user role is 'supplier'
- Check if user account is active
- Ensure request is from correct user

### "Not Found" (404) Error
- Verify resource ID is correct
- Check if resource belongs to current supplier
- Ensure resource hasn't been deleted

### Empty Response
- Check if data exists in database
- Verify filter criteria (e.g., order status)
- Check database connection

---

## Performance Notes

- Dashboard endpoint returns aggregated data for optimal performance
- Material stock overview limited to top 5 for chart efficiency
- Orders filtered at database level to minimize data transfer
- All queries use indexes for fast retrieval

---

## Related Documentation

- [Full Integration Guide](./SUPPLIER_INTEGRATION_GUIDE.md)
- [Integration Summary](./SUPPLIER_INTEGRATION_SUMMARY.md)
- [Backend Code](./Backend/routes/supplier.js)
- [Frontend Component](./frontend/components/supplier-dashboard.tsx)

---

**Last Updated:** December 8, 2025
**Status:** Production Ready ✅
