// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const citizenRoutes = require('./src/routes/citizenRoutes');
const letterRoutes = require('./src/routes/letterRoutes');
const templateRoutes = require('./src/routes/templateRoutes');
const villageRoutes = require('./src/routes/villageRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure upload directories exist
const mkdirSync = require('fs').mkdirSync;
[
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../uploads/temp'),
    path.join(__dirname, '../uploads/logos'),
    path.join(__dirname, '../uploads/signatures')
].forEach(dir => {
    try {
        mkdirSync(dir, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error(`Error creating directory ${dir}:`, error);
        }
    }
});

// CORS configuration for general routes
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Special CORS configuration for PDF generation
const pdfCorsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition', 'Content-Type'],
    credentials: true
};

// Apply general CORS for all routes
app.use(cors(corsOptions));

// Apply special CORS for PDF generation route
app.use('/api/letters/generate', cors(pdfCorsOptions));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/citizens', citizenRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/letter-templates', templateRoutes);
app.use('/api/village', villageRoutes);
app.use('/api/admin', adminRoutes);

// Multer error handling
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File terlalu besar. Maksimal ukuran file adalah 2MB'
            });
        }
        return res.status(400).json({
            message: 'Error pada upload file'
        });
    }
    next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route tidak ditemukan' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});