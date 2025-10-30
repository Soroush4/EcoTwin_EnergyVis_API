const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());
// Optionally serve static frontend if available
const frontendDir = path.join(__dirname, './frontend');
if (fs.existsSync(frontendDir)) {
    app.use(express.static(frontendDir));
}

// API Routes
app.get('/api/mapbox-config', (req, res) => {
    try {
        const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
        
        if (!mapboxToken) {
            return res.status(500).json({
                error: 'Mapbox access token not configured',
                message: 'Please set MAPBOX_ACCESS_TOKEN in environment variables'
            });
        }

        res.json({
            accessToken: mapboxToken,
            style: 'mapbox://styles/mapbox/standard',
            center: [-74.5, 40],
            zoom: 9,
            pitch: 60,
            antialias: true,
            config: {
                basemap: {
                    show3dObjects: false
                }
            }
        });
    } catch (error) {
        console.error('Error getting Mapbox config:', error);
        res.status(500).json({
            error: 'Failed to get Mapbox configuration',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve the main application if frontend exists; otherwise show API status
app.get('/', (req, res) => {
    if (fs.existsSync(path.join(frontendDir, 'index.html'))) {
        return res.sendFile(path.join(frontendDir, 'index.html'));
    }
    return res.json({
        name: 'EcoTwinAI API',
        status: 'OK',
        message: 'Frontend not bundled in this service. Use /api/* endpoints or deploy frontend separately.'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested resource was not found'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 EcoTwinAI Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
    console.log(`🗺️  Mapbox token configured: ${process.env.MAPBOX_ACCESS_TOKEN ? 'Yes' : 'No'}`);
});

module.exports = app;
