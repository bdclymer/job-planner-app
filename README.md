# Job Planner Website

Modern project management website for construction job planning and resource management. Built for The Alleato Group to provide a comprehensive project management interface integrated with the Job Planner API.

## 🚀 Features

### Core Functionality
- **Dashboard Overview** - Real-time project statistics and metrics
- **Project Management** - Create, view, edit, and track construction projects
- **Job Tracking** - Manage individual jobs within projects
- **Schedule Management** - Calendar view and task scheduling
- **Resource Management** - Track crew, equipment, and materials
- **Reporting & Analytics** - Generate project reports and insights

### Technical Features
- **Modern UI/UX** - Responsive design with intuitive navigation
- **Real-time Updates** - Live data from Job Planner API
- **Interactive Charts** - Visual data representation with Chart.js
- **Form Validation** - Client-side and server-side validation
- **Security** - Helmet.js security headers, CORS, input sanitization
- **Performance** - Compression, caching, optimized assets

## 🏗️ Architecture

```
job-planner-website/
├── server.js              # Main Express server
├── package.json          # Dependencies and scripts
├── .env.example          # Environment configuration
├── public/               # Static assets
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   └── images/          # Images and icons
├── views/               # EJS templates
│   ├── layout.ejs       # Main layout template
│   ├── index.ejs        # Dashboard view
│   ├── projects.ejs     # Projects management
│   ├── jobs.ejs         # Jobs management
│   └── ...              # Other views
└── controllers/         # Business logic (optional)
```

## 🛠️ Installation

### Prerequisites
- Node.js 16+ and npm
- Job Planner API running (default: http://localhost:5000)
- Git for version control

### Quick Start

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd job-planner-website
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open in browser:**
```
http://localhost:3000
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Job Planner API Configuration
JOB_PLANNER_API=http://localhost:5000/api
JOB_PLANNER_API_KEY=your-api-key-here

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Security
CORS_ORIGIN=http://localhost:3000
```

## 📦 Deployment

### Production Deployment

1. **Build for production:**
```bash
npm run build
```

2. **Set production environment:**
```bash
export NODE_ENV=production
```

3. **Start production server:**
```bash
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t job-planner-website .

# Run container
docker run -p 3000:3000 \
  -e JOB_PLANNER_API=http://api-server:5000/api \
  -e JOB_PLANNER_API_KEY=your-key \
  job-planner-website
```

### PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name "job-planner-website"

# Save process list
pm2 save

# Set up startup script
pm2 startup
```

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production server
npm start

# Build CSS and JS assets
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Project Structure

- **`server.js`** - Main Express application with routes and middleware
- **`public/`** - Static files served directly to clients
- **`views/`** - EJS templates for server-side rendering
- **`controllers/`** - Business logic controllers (optional expansion)
- **`middleware/`** - Custom middleware functions
- **`routes/`** - Route definitions (optional expansion)

### Adding New Features

1. **New Page:**
   - Create EJS template in `views/`
   - Add route in `server.js`
   - Update navigation in `layout.ejs`

2. **API Integration:**
   - Add API call in `server.js`
   - Update frontend JavaScript in `public/js/`
   - Add data processing in controllers

3. **Styling:**
   - Add CSS in `public/css/styles.css`
   - Use CSS variables from `:root` for consistency

## 🔌 API Integration

The website integrates with the Job Planner API for all data operations:

### Available Endpoints
- `GET /api/projects` - List all projects
- `GET /api/jobs` - List all jobs
- `GET /api/schedule` - Get schedule data
- `GET /api/resources` - Get resource data

### API Configuration
Update the API endpoint in `.env`:
```env
JOB_PLANNER_API=http://your-api-server:5000/api
JOB_PLANNER_API_KEY=your-authentication-token
```

## 📊 Monitoring & Maintenance

### Health Checks
- Visit `/health` for server status
- Check API connectivity on dashboard
- Monitor error logs

### Logging
- Console logging in development
- File logging in production
- Error tracking with middleware

### Performance
- Enable compression for faster loads
- Cache static assets
- Optimize images and assets

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `JOB_PLANNER_API` URL in `.env`
   - Verify API server is running
   - Check network connectivity

2. **Port Already in Use**
   ```bash
   # Find and kill process
   lsof -ti:3000 | xargs kill -9
   ```

3. **Missing Dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Template Errors**
   - Check EJS syntax in views
   - Verify data passed to templates
   - Check for missing variables

### Debug Mode
Enable debug logging:
```bash
DEBUG=job-planner-website:* npm run dev
```

## 📈 Scaling

### Horizontal Scaling
- Use load balancer with multiple instances
- Session storage in Redis
- Database connection pooling

### Caching Strategy
- Implement Redis for session storage
- Cache API responses
- CDN for static assets

### Database Optimization
- Connection pooling
- Query optimization
- Indexing for frequent queries

## 🔒 Security

### Best Practices
1. **Environment Variables** - Never commit secrets
2. **Input Validation** - Sanitize all user inputs
3. **HTTPS** - Always use in production
4. **Security Headers** - Helmet.js middleware
5. **Rate Limiting** - Prevent abuse
6. **CORS** - Configure allowed origins

### Security Headers
Helmet.js provides:
- Content Security Policy
- XSS Protection
- No Sniff MIME type
- Frameguard protection
- Hide powered-by header

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

### Code Style
- Use ESLint configuration
- Follow JavaScript best practices
- Write meaningful commit messages
- Add tests for new features

## 📄 License

Proprietary - Built for The Alleato Group

## 📞 Support

For issues and questions:
- Email: support@alleato.com
- Documentation: `/docs` endpoint
- API Reference: `/api-docs`

---

**Built with ❤️ for The Alleato Group**