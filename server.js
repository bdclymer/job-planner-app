const express = require('express');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const session = require('express-session');
const flash = require('connect-flash');
const moment = require('moment');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Job Planner API Configuration
const JOB_PLANNER_API = process.env.JOB_PLANNER_API || 'http://localhost:5000/api';
const API_KEY = process.env.JOB_PLANNER_API_KEY || '';

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"]
    }
  }
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'job-planner-website-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(flash());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global variables for templates
app.use((req, res, next) => {
  res.locals.moment = moment;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.user = req.session.user || null;
  next();
});

// API Client for Job Planner
const jobPlannerAPI = axios.create({
  baseURL: JOB_PLANNER_API,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Job Planner - Project Management Dashboard',
    active: 'dashboard'
  });
});

app.get('/projects', async (req, res) => {
  try {
    const response = await jobPlannerAPI.get('/projects');
    res.render('projects', {
      title: 'Projects',
      active: 'projects',
      projects: response.data.data || []
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    req.flash('error_msg', 'Failed to load projects');
    res.render('projects', {
      title: 'Projects',
      active: 'projects',
      projects: []
    });
  }
});

app.get('/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const response = await jobPlannerAPI.get(`/projects/${projectId}`);
    res.render('project-detail', {
      title: response.data.data.name || 'Project Details',
      active: 'projects',
      project: response.data.data
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    req.flash('error_msg', 'Project not found');
    res.redirect('/projects');
  }
});

app.get('/jobs', async (req, res) => {
  try {
    const response = await jobPlannerAPI.get('/jobs');
    res.render('jobs', {
      title: 'Jobs',
      active: 'jobs',
      jobs: response.data.data || []
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    req.flash('error_msg', 'Failed to load jobs');
    res.render('jobs', {
      title: 'Jobs',
      active: 'jobs',
      jobs: []
    });
  }
});

app.get('/schedule', async (req, res) => {
  try {
    const response = await jobPlannerAPI.get('/schedule');
    res.render('schedule', {
      title: 'Schedule',
      active: 'schedule',
      schedule: response.data.data || []
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    req.flash('error_msg', 'Failed to load schedule');
    res.render('schedule', {
      title: 'Schedule',
      active: 'schedule',
      schedule: []
    });
  }
});

app.get('/resources', async (req, res) => {
  try {
    const response = await jobPlannerAPI.get('/resources');
    res.render('resources', {
      title: 'Resources',
      active: 'resources',
      resources: response.data.data || []
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    req.flash('error_msg', 'Failed to load resources');
    res.render('resources', {
      title: 'Resources',
      active: 'resources',
      resources: []
    });
  }
});

app.get('/reports', (req, res) => {
  res.render('reports', {
    title: 'Reports & Analytics',
    active: 'reports'
  });
});

app.get('/settings', (req, res) => {
  res.render('settings', {
    title: 'Settings',
    active: 'settings'
  });
});

// API Proxy endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const response = await jobPlannerAPI.get('/projects');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const response = await jobPlannerAPI.get('/jobs');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/schedule', async (req, res) => {
  try {
    const response = await jobPlannerAPI.get('/schedule');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
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

// API status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const apiResponse = await jobPlannerAPI.get('/health').catch(() => null);
    
    res.json({
      website: 'operational',
      api: apiResponse ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      website: 'operational',
      api: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found',
    active: null
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', {
    title: '500 - Server Error',
    active: null,
    error: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Job Planner Website running on port ${PORT}`);
  console.log(`📊 API connected to: ${JOB_PLANNER_API}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});

module.exports = app;