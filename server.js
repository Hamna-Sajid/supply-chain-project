const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./Backend/routes/auth');
const supplierRoutes = require('./Backend/routes/supplier');
const manufacturerRoutes = require('./Backend/routes/manufacturer');
const warehouseRoutes = require('./Backend/routes/warehouse');
const retailerRoutes = require('./Backend/routes/retailer');
const ratingRoutes = require('./Backend/routes/rating');
const analyticsRoutes = require('./Backend/routes/analytics');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from Frontend-html directory
app.use(express.static(path.join(__dirname, 'Frontend-html')));

// Serve Backend/logic files as static
app.use('/logic', express.static(path.join(__dirname, 'Backend/logic')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/manufacturer', manufacturerRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/retailer', retailerRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Supply Chain Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend-html', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Supply Chain Management System');
  console.log('='.repeat(50));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
});

module.exports = app;