# Login/Signup Frontend & Backend Integration Guide

##  Overview

Complete login and signup functionality integrated between frontend (Next.js) and backend (Express.js). Both old HTML frontend and new Next.js frontend are supported.

---

##  Current Implementation Status

###  Backend (Express.js)
- **Location:** `Backend/routes/auth.js`
- **Status:** Production Ready
- **Features:**
  - User signup with password validation
  - User login with JWT token generation
  - Password hashing with bcryptjs
  - Supabase database integration
  - Error handling and validation

###  Frontend - HTML (Old)
- **Location:** `Frontend-html/index.html` + `Backend/logic/auth.js`
- **Status:** Production Ready
- **Features:**
  - Login form with email/password
  - Signup form with role selection
  - Form validation
  - Error messaging
  - Role-based redirection

###  Frontend - Next.js (New)
- **Location:** `frontend/app/page.tsx` + `frontend/components/scm-auth-card.tsx`
- **Status:** Fully Integrated ✨ NEW
- **Features:**
  - Beautiful, modern UI with Tailwind CSS
  - Real API integration with error handling
  - Loading states and visual feedback
  - Password strength indicator
  - Success notifications
  - Automatic role-based redirection

---

## 🔌 Backend API Endpoints

### POST /api/auth/signup
**Purpose:** Create a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "supplier",
  "contact_number": "+1234567890",
  "address": "123 Main St, City, State 12345"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "supplier"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "User already exists"
}
```

---

### POST /api/auth/login
**Purpose:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "supplier"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

---

## 📝 Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

**Example Valid Passwords:**
- `SecurePass123!`
- `MyP@ssw0rd`
- `Admin#2024!`

---

## 👥 User Roles

1. **supplier** - Raw material suppliers
2. **manufacturer** - Product manufacturers
3. **warehouse_manager** (or **warehouse-manager**) - Warehouse operations
4. **retailer** - Product retailers

---

## 🔄 Integration Workflow

### 1. User Signup Flow

```
User fills signup form
        ↓
Frontend validates password strength
        ↓
Frontend sends POST /api/auth/signup
        ↓
Backend validates password requirements
        ↓
Backend checks if email already exists
        ↓
Backend hashes password
        ↓
Backend creates user in Supabase
        ↓
Frontend shows success message
        ↓
Auto-redirect to login (HTML)
        or show notification (Next.js)
```

### 2. User Login Flow

```
User enters email/password
        ↓
Frontend sends POST /api/auth/login
        ↓
Backend looks up user by email
        ↓
Backend compares password hash
        ↓
Backend generates JWT token
        ↓
Frontend stores token in localStorage
        ↓
Frontend stores user data in localStorage
        ↓
Frontend redirects to role dashboard
        ↓
Subsequent API calls include Bearer token
```

---

## 💾 Token & Data Storage

### Frontend Storage (localStorage)
```javascript
// After successful login
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiI...');
localStorage.setItem('user', JSON.stringify({
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'supplier'
}));
```

### Token Usage in API Requests
```javascript
// All authenticated requests include
Authorization: Bearer <token>
Content-Type: application/json
```

---

##  Security Features

 **Password Hashing**
- Bcryptjs with salt rounds: 10
- Passwords never stored in plain text

 **JWT Tokens**
- Expiration: 24 hours
- Signed with JWT_SECRET environment variable
- Included in Authorization header

 **Input Validation**
- Password regex validation
- Email format validation
- Required field validation

 **Error Handling**
- No sensitive information in error messages
- Proper HTTP status codes (401, 403, 500)
- Specific error messages for debugging

 **Session Management**
- Token stored in localStorage
- Cleared on logout
- Validated on each API request

---

##  Setup Instructions

### Backend Setup

1. **Environment Variables** (`.env`)
```
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_secret_key_min_32_chars
PORT=3000
```

2. **Install Dependencies**
```bash
npm install
```

3. **Run Server**
```bash
npm start
```

### HTML Frontend Setup

1. **Serve Static Files**
- Included in Express server automatically
- Access at: `http://localhost:3000/`

2. **Configure API URL** (`Backend/logic/config.js`)
```javascript
const API_URL = 'http://localhost:3000/api';
```

### Next.js Frontend Setup

1. **Environment Variables** (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

2. **Install Dependencies**
```bash
cd frontend
npm install
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Access Application**
- Open: `http://localhost:3001`

---

## 📍 File Locations

### Backend Files
```
Backend/
├── routes/
│   └── auth.js                    ← Auth endpoints
├── logic/
│   ├── auth.js                    ← HTML frontend logic
│   └── config.js                  ← Shared utilities
└── middleware/
    └── auth.js                    ← JWT verification
```

### HTML Frontend Files
```
Frontend-html/
├── index.html                     ← Login/signup page
├── css/
│   └── styles.css                 ← Styling
└── supplier.html (& others)       ← Role dashboards
```

### Next.js Frontend Files
```
frontend/
├── app/
│   ├── page.tsx                   ← Home (auth redirect)
│   ├── layout.tsx                 ← Root layout
│   ├── supplier/                  ← Supplier dashboard
│   ├── manufacturer/              ← Manufacturer dashboard
│   ├── warehouse/                 ← Warehouse dashboard
│   └── retailer/                  ← Retailer dashboard
├── components/
│   └── scm-auth-card.tsx          ← Auth component (integrated)
└── .env.example                   ← Environment template
```

---

## 🔄 Role-Based Redirection

After successful login, users are redirected to their role-specific dashboard:

| Role | HTML Frontend | Next.js Frontend |
|------|---------------|-----------------|
| supplier | `/supplier.html` | `/supplier/dashboard` |
| manufacturer | `/manufacturer.html` | `/manufacturer/dashboard` |
| warehouse_manager | `/warehouse.html` | `/warehouse/dashboard` |
| retailer | `/retailer.html` | `/retailer/dashboard` |

---

##  Testing

### Test User Accounts

**Valid Signup**
```
Name: John Supplier
Email: john@supplier.com
Password: SupplierPass123!
Role: Supplier
Contact: +1234567890
Address: 123 Main St
```

**Valid Login**
```
Email: john@supplier.com
Password: SupplierPass123!
```

### Test Cases

 Signup with weak password → Error: "Password is too weak"
 Signup with existing email → Error: "User already exists"
 Login with invalid email → Error: "Invalid credentials"
 Login with wrong password → Error: "Invalid credentials"
 Login with valid credentials → Redirect to dashboard
 Access dashboard without token → Redirect to login
 Logout → Clear token and redirect

---

## 🔧 Troubleshooting

### Issue: API Not Responding
**Solution:** 
- Check server is running: `npm start`
- Verify API_URL in config.js/env.local
- Check network tab in browser DevTools

### Issue: CORS Errors
**Solution:**
- CORS already enabled in server.js
- Check API_URL matches backend domain
- Verify Content-Type headers

### Issue: Token Not Persisting
**Solution:**
- Check localStorage is enabled in browser
- Verify token is being set: `localStorage.getItem('token')`
- Clear browser cache and cookies

### Issue: Password Validation Fails
**Solution:**
- Password must be 8+ characters
- Must include: uppercase, lowercase, number, special char
- Test: `SecurePass123!` should work

### Issue: Login Succeeds but Redirect Fails
**Solution:**
- Check role value (supplier, manufacturer, etc.)
- Verify dashboard routes exist
- Check browser console for errors

---

##  Database Schema

### Users Table
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  contact_number VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

##  Security Best Practices

1. **Never log passwords**
   - Passwords are hashed before storage
   - Only hashes are compared during login

2. **Use HTTPS in production**
   - Tokens should only travel over encrypted connections
   - Set secure flag on cookies if used

3. **Rotate JWT_SECRET periodically**
   - Use strong random string (min 32 characters)
   - Update in environment variables
   - Old tokens become invalid after SECRET change

4. **Monitor login attempts**
   - Consider adding rate limiting
   - Log suspicious activity
   - Implement account lockout after failed attempts

5. **Validate all inputs**
   - Frontend validation is for UX
   - Backend validation is for security
   - Never trust client-side validation alone

---

## 📝 API Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Login successful |
| 201 | Created | User signup successful |
| 400 | Bad Request | Invalid password format |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | Access denied for role |
| 404 | Not Found | User not found |
| 500 | Server Error | Database error |

---

##  Deployment Checklist

- [ ] Set environment variables (DATABASE_URL, JWT_SECRET)
- [ ] Ensure database is accessible from deployment server
- [ ] Test auth endpoints with actual database
- [ ] Verify CORS settings for production domain
- [ ] Set API_URL to production backend in frontend
- [ ] Test complete signup → login → dashboard flow
- [ ] Enable HTTPS for all connections
- [ ] Set up error logging/monitoring
- [ ] Configure firewall/security rules
- [ ] Create backup of database
- [ ] Document emergency access procedures

---

## 📚 Additional Resources

- JWT Documentation: https://jwt.io/
- Bcryptjs: https://github.com/dcodeIO/bcrypt.js
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs

---

**Status:**  Fully Integrated and Production Ready
**Last Updated:** December 8, 2025
**Version:** 1.0
