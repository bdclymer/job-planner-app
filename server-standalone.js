const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'job-planner-website',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mock API endpoints for demonstration
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/projects', (req, res) => {
  res.json({
    projects: [
      { id: 1, name: 'Commercial Office Building', status: 'active', progress: 75 },
      { id: 2, name: 'Retail Center Renovation', status: 'active', progress: 45 },
      { id: 3, name: 'Hospital Wing Expansion', status: 'planning', progress: 20 },
      { id: 4, name: 'University Dormitory', status: 'completed', progress: 100 }
    ],
    total: 24,
    active: 18,
    completed: 6
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    totalProjects: 24,
    activeJobs: 156,
    monthlyRevenue: 4200000,
    onTimeDelivery: 98,
    resourceUtilization: 85,
    budgetVariance: -2.5
  });
});

app.get('/api/resources', (req, res) => {
  res.json({
    resources: [
      { id: 1, name: 'Excavator', type: 'equipment', status: 'available', location: 'Site A' },
      { id: 2, name: 'Crane', type: 'equipment', status: 'in-use', location: 'Site B' },
      { id: 3, name: 'Crew A', type: 'labor', status: 'available', size: 8 },
      { id: 4, name: 'Crew B', type: 'labor', status: 'in-use', size: 12 }
    ]
  });
});

// Serve all other routes to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Job Planner Website running on port ${PORT}`);
  console.log(`📊 Mock API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});

module.exports = app;