const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'notices/uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('✅ Connected to MongoDB');
        console.log('Database:', process.env.MONGODB_URI);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Routes
app.use('/api/notices', require('./routes/notices'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/employees', require('./routes/employees'));

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'NebsIT Assessment API',
        version: '1.0.0',
        endpoints: {
            notices: '/api/notices',
            departments: '/api/departments',
            employees: '/api/employees'
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`📁 Uploads: ${path.join(__dirname, 'notices/uploads')}`);
});

module.exports = app;
