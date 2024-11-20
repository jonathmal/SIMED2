// server/src/index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Import models - Add these lines
require('./models/Servicio');
require('./models/Usuario');
require('./models/Interconsulta');

// Import routes - Fix the servicioRoutes name
const authRoutes = require('./routes/authRoutes');
const interconsultaRoutes = require('./routes/interconsultaRoutes');
const servicioRoutes = require('./routes/servicioRoutes');  // Changed from serviceRoutes
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Root route for API health check
app.get('/', (req, res) => {
  res.json({
    exito: true,
    mensaje: 'API Sistema Interconsultas Running',
    version: '1.0.0'
  });
});

// API Status route
app.get('/api/status', (req, res) => {
  res.json({
    exito: true,
    timestamp: new Date(),
    uptime: process.uptime(),
    service: 'Sistema Interconsultas API',
    environment: process.env.NODE_ENV
  });
});

// Mount routes with /server prefix
app.use('/server/auth', authRoutes);
app.use('/server/interconsultas', interconsultaRoutes);
app.use('/server/servicios', servicioRoutes);
app.use('/server/usuarios', usuarioRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    exito: false,
    error: 'Ruta no encontrada'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;