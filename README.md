# Supply Chain Management System

A comprehensive supply chain management system built with Next.js and Node.js, featuring role-based access control for Suppliers, Manufacturers, Warehouse Managers, and Retailers.

## Project Overview

This system manages the complete supply chain workflow from raw material procurement to retail sales, including:
- Material sourcing and supplier management
- Manufacturing and production tracking
- Warehouse inventory and shipment management
- Retail point-of-sale and order management
- Financial tracking (revenue, expenses, payments)
- Rating and review system
- Real-time analytics and reporting

## Tech Stack

### Frontend
- **Framework:** Next.js 16.0.7 (with Turbopack)
- **Language:** TypeScript
- **UI Library:** React 18+
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs

### Database
- **Provider:** Supabase
- **Type:** PostgreSQL with Row Level Security
- **Tables:** 14 core tables (users, orders, inventory, payments, etc.)

## Prerequisites

Before running this project, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or pnpm
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Hamna-Sajid/supply-chain-project.git
cd supply-chain-project
```

2. Install root dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Configure environment variables:
Create a `.env` file in the root directory with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Running the Application

### Option 1: Run Backend and Frontend Separately

#### Start the Backend Server (Port 5000):
```bash
node server.js
```
The backend API will be available at `http://localhost:5000`

#### Start the Frontend (Port 3000):
Open a new terminal window:

```bash
cd frontend
npm run dev
```
The frontend application will be available at `http://localhost:3000`

### Option 2: Run with Package Manager Scripts

If you have scripts configured in your root package.json:
```bash
npm run dev          # Start frontend
npm run server       # Start backend
```

## User Roles and Access

The system supports four user roles, each with dedicated dashboards and features:

### 1. Supplier
- Dashboard: `/supplier/dashboard`
- Features: Material catalog, order management, payments, financials, ratings
- Manages raw materials and fulfills manufacturer orders

### 2. Manufacturer
- Dashboard: `/manufacturer/dashboard`
- Features: Material sourcing, product management, inventory, shipments, payments
- Purchases materials, produces goods, ships to warehouses

### 3. Warehouse Manager
- Dashboard: `/warehouse/dashboard`
- Features: Incoming shipments, inventory management, retailer orders
- Accepts shipments, manages stock, fulfills retailer orders

### 4. Retailer
- Dashboard: `/retailer/dashboard`
- Features: Point of Sale, inventory, orders, returns
- Sells products to end customers, manages retail operations

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (returns JWT token)

### Supplier APIs
- `GET /api/supplier/dashboard` - Dashboard KPIs
- `GET /api/supplier/materials` - Material catalog
- `GET /api/supplier/orders` - Incoming orders
- `GET /api/supplier/payments` - Payment tracking
- `GET /api/supplier/revenue` - Revenue records
- `GET /api/supplier/expenses` - Expense records

### Manufacturer APIs
- `GET /api/manufacturer/dashboard` - Dashboard metrics
- `GET /api/manufacturer/raw-materials` - Available materials
- `POST /api/manufacturer/orders` - Create purchase order
- `GET /api/manufacturer/products` - Product list
- `GET /api/manufacturer/inventory` - Finished goods inventory
- `GET /api/manufacturer/shipments` - Warehouse shipments

### Warehouse APIs
- `GET /api/warehouse/dashboard` - Dashboard overview
- `GET /api/warehouse/shipments` - Incoming shipments
- `PUT /api/warehouse/shipments/:id/accept` - Accept shipment
- `GET /api/warehouse/inventory` - Warehouse stock
- `GET /api/warehouse/orders` - Retailer orders

### Retailer APIs
- `GET /api/retailer/dashboard` - Dashboard summary
- `GET /api/retailer/products` - Available products
- `POST /api/retailer/sales` - Record sale
- `GET /api/retailer/orders` - Order history
- `POST /api/retailer/returns` - Process return

### Analytics APIs
- `GET /api/analytics/dashboard` - System-wide analytics
- `GET /api/analytics/revenue` - Revenue analysis
- `GET /api/analytics/expense` - Expense analysis

## Project Structure

```
supply-chain-project/
├── Backend/
│   ├── logic/           # Business logic modules
│   └── routes/          # API route handlers
├── config/
│   ├── database.js      # Database configuration
│   └── supabasehelper.js
├── frontend/
│   ├── app/             # Next.js app directory
│   │   ├── supplier/    # Supplier pages
│   │   ├── manufacturer/# Manufacturer pages
│   │   ├── warehouse/   # Warehouse pages
│   │   └── retailer/    # Retailer pages
│   ├── components/      # React components
│   └── lib/             # Utility functions
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── docs/                # Documentation files
├── server.js            # Express backend entry point
└── package.json         # Root dependencies
```

## Database Schema

The system uses 14 core tables:
- `users` - All system users with role-based access
- `raw_materials` - Supplier materials catalog
- `products` - Manufactured products
- `inventory` - Stock management
- `orders` - Purchase orders across supply chain
- `order_items` - Order line items
- `shipments` - Manufacturer to warehouse shipments
- `payment` - Payment records
- `revenue` - Revenue tracking
- `expense` - Expense tracking
- `ratings` - User reviews
- `notifications` - System notifications
- `returns` - Product returns
- `sales` - Retail transactions

## Features

### Authentication & Authorization
- Secure JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Protected API routes with middleware

### Order Management
- Forward-only status progression (Pending → Processing → Shipped → Delivered)
- Automatic supplier notifications on new orders
- Order tracking with detailed item information

### Inventory Management
- Multi-level inventory (supplier, manufacturer, warehouse, retailer)
- Low stock alerts with reorder levels
- Real-time quantity updates

### Financial Tracking
- Revenue and expense recording
- Payment status management (Pending → Paid)
- Financial analytics and reporting

### Analytics & Reporting
- Dashboard KPIs for each role
- Time-series revenue vs expense charts
- Order statistics and trends

## Documentation

Detailed documentation is available in the `/docs` directory:
- `final_report.md` - Complete system documentation with SQL queries
- `IMPLEMENTATION_COMPLETE.md` - Implementation details
- `LOGIN_SIGNUP_INTEGRATION_GUIDE.md` - Authentication setup
- `SUPPLIER_API_QUICK_REFERENCE.md` - API reference
- Additional module-specific guides

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is developed as part of a university DBMS course project.

## Authors

- Hamna Sajid
- Shiza Farooq

## Support

For issues and questions, please open an issue on the GitHub repository.

