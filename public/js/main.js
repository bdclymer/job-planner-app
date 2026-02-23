// Job Planner Website - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize components
  initDashboard();
  initCharts();
  initDataTables();
  initForms();
  initNotifications();
});

// Dashboard Functions
function initDashboard() {
  // Update dashboard stats
  updateDashboardStats();
  
  // Set up auto-refresh for dashboard data
  setInterval(updateDashboardStats, 30000); // Refresh every 30 seconds
  
  // Initialize tooltips
  initTooltips();
}

async function updateDashboardStats() {
  try {
    const [projectsRes, jobsRes, scheduleRes, resourcesRes] = await Promise.all([
      fetch('/api/projects'),
      fetch('/api/jobs'),
      fetch('/api/schedule'),
      fetch('/api/resources')
    ]);
    
    const projects = await projectsRes.json();
    const jobs = await jobsRes.json();
    const schedule = await scheduleRes.json();
    const resources = await resourcesRes.json();
    
    // Update stats cards
    updateStatCard('total-projects', projects.data?.length || 0);
    updateStatCard('active-jobs', jobs.data?.length || 0);
    updateStatCard('upcoming-tasks', schedule.data?.length || 0);
    updateStatCard('total-resources', resources.data?.length || 0);
    
    // Update recent projects table
    updateRecentProjects(projects.data || []);
    
    // Update upcoming schedule
    updateUpcomingSchedule(schedule.data || []);
    
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
    showNotification('Failed to update dashboard data', 'error');
  }
}

function updateStatCard(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    // Animate number change
    const currentValue = parseInt(element.textContent) || 0;
    animateNumberChange(element, currentValue, value);
  }
}

function animateNumberChange(element, start, end, duration = 500) {
  const startTime = performance.now();
  const difference = end - start;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.floor(start + difference * easeOutQuart);
    
    element.textContent = currentValue.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

function updateRecentProjects(projects) {
  const tableBody = document.getElementById('recent-projects-body');
  if (!tableBody) return;
  
  // Sort by creation date (newest first)
  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  tableBody.innerHTML = recentProjects.map(project => `
    <tr>
      <td>
        <div class="project-name">
          <strong>${escapeHtml(project.name)}</strong>
          <small class="text-muted">${escapeHtml(project.code || '')}</small>
        </div>
      </td>
      <td>
        <span class="status-badge ${getStatusClass(project.status)}">
          ${escapeHtml(project.status || 'Unknown')}
        </span>
      </td>
      <td>${formatDate(project.startDate)}</td>
      <td>${formatDate(project.endDate)}</td>
      <td>
        <a href="/projects/${project.id}" class="btn btn-sm btn-outline">View</a>
      </td>
    </tr>
  `).join('');
}

function updateUpcomingSchedule(schedule) {
  const container = document.getElementById('upcoming-schedule');
  if (!container) return;
  
  // Filter upcoming items (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const upcoming = schedule
    .filter(item => {
      const itemDate = new Date(item.date || item.startDate);
      return itemDate >= today && itemDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.date || a.startDate) - new Date(b.date || b.startDate))
    .slice(0, 5);
  
  if (upcoming.length === 0) {
    container.innerHTML = '<div class="text-center text-muted p-3">No upcoming schedule items</div>';
    return;
  }
  
  container.innerHTML = upcoming.map(item => `
    <div class="schedule-item">
      <div class="schedule-date">
        <div class="schedule-day">${formatDate(item.date || item.startDate, 'DD')}</div>
        <div class="schedule-month">${formatDate(item.date || item.startDate, 'MMM')}</div>
      </div>
      <div class="schedule-details">
        <div class="schedule-title">${escapeHtml(item.title || item.name)}</div>
        <div class="schedule-description">${escapeHtml(item.description || '')}</div>
        <div class="schedule-meta">
          <span class="schedule-time">${formatTime(item.startTime)}</span>
          ${item.location ? `<span class="schedule-location">${escapeHtml(item.location)}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// Chart Functions
function initCharts() {
  // Project Status Chart
  const projectStatusCtx = document.getElementById('project-status-chart');
  if (projectStatusCtx) {
    new Chart(projectStatusCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Completed', 'On Hold', 'Planning'],
        datasets: [{
          data: [12, 8, 3, 5],
          backgroundColor: [
            '#10b981', // Green
            '#3b82f6', // Blue
            '#f59e0b', // Yellow
            '#8b5cf6'  // Purple
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.raw} projects`;
              }
            }
          }
        }
      }
    });
  }
  
  // Resource Utilization Chart
  const resourceUtilCtx = document.getElementById('resource-utilization-chart');
  if (resourceUtilCtx) {
    new Chart(resourceUtilCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Crew A', 'Crew B', 'Equipment', 'Materials', 'Subcontractors'],
        datasets: [{
          label: 'Utilization (%)',
          data: [85, 92, 78, 65, 88],
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw}%`;
              }
            }
          }
        }
      }
    });
  }
}

// Data Table Functions
function initDataTables() {
  // Initialize any data tables with sorting and filtering
  const tables = document.querySelectorAll('.data-table');
  tables.forEach(table => {
    // Add sorting functionality
    const headers = table.querySelectorAll('th[data-sortable]');
    headers.forEach(header => {
      header.style.cursor = 'pointer';
      header.addEventListener('click', () => {
        sortTable(table, header.cellIndex);
      });
    });
  });
}

function sortTable(table, columnIndex) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const isAscending = !table.dataset.sortAsc || table.dataset.sortAsc === 'false';
  
  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent.trim();
    const bValue = b.cells[columnIndex].textContent.trim();
    
    // Try to parse as numbers
    const aNum = parseFloat(aValue.replace(/[^0-9.-]+/g, ''));
    const bNum = parseFloat(bValue.replace(/[^0-9.-]+/g, ''));
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return isAscending ? aNum - bNum : bNum - aNum;
    }
    
    // Otherwise sort as strings
    return isAscending 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });
  
  // Update table
  rows.forEach(row => tbody.appendChild(row));
  table.dataset.sortAsc = isAscending;
  
  // Update sort indicators
  const headers = table.querySelectorAll('th');
  headers.forEach((header, index) => {
    header.classList.remove('sort-asc', 'sort-desc');
    if (index === columnIndex) {
      header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
    }
  });
}

// Form Functions
function initForms() {
  // Form validation
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      if (!validateForm(this)) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
    
    // Real-time validation
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearFieldError(input));
    });
  });
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  
  inputs.forEach(input => {
    if (!validateField(input)) {
      isValid = false;
    }
  });
  
  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  // Check required fields
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = 'This field is required';
  }
  
  // Check email format
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }
  
  // Check number range
  if (field.type === 'number' && value) {
    const min = parseFloat(field.min);
    const max = parseFloat(field.max);
    const numValue = parseFloat(value);
    
    if (!isNaN(min) && numValue < min) {
      isValid = false;
      errorMessage = `Value must be at least ${min}`;
    }
    
    if (!isNaN(max) && numValue > max) {
      isValid = false;
      errorMessage = `Value must be at most ${max}`;
    }
  }
  
  // Update field state
  if (!isValid) {
    showFieldError(field, errorMessage);
  } else {
    clearFieldError(field);
  }
  
  return isValid;
}

function showFieldError(field, message) {
  clearFieldError(field);
  
  field.classList.add('is-invalid');
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  
  field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
  field.classList.remove('is-invalid');
  
  const existingError = field.parentNode.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
}

// Notification Functions
function initNotifications() {
  // Check for flash messages
  const flashMessages = document.querySelectorAll('.alert');
  flashMessages.forEach(message => {
    setTimeout(() => {
      message.style.opacity = '0';
      message.style.transform = 'translateY(-10px)';
      setTimeout(() => message.remove(), 300);
    }, 5000);
  });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} notification`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Tooltip Functions
function initTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  tooltipElements.forEach(element => {
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
  });
}

function showTooltip(event) {
  const element = event.target;
  const tooltipText = element.getAttribute('data-tooltip');
  
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = tooltipText;
  tooltip.style.cssText = `
    position: absolute;
    background: var(--gray-900);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 10000;
    white-space: nowrap;
    pointer-events: none;
  `;
  
  document.body.appendChild(tooltip);
  
  const rect = element.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
  tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
  
  element.tooltip = tooltip;
}

function hideTooltip(event) {
  const element = event.target;
  if (element.tooltip) {
    element.tooltip.remove();
    element.tooltip = null;
  }
}

// Utility Functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString, format = 'MMM DD, YYYY') {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
}

function formatTime(timeString) {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
}

function getStatusClass(status) {
  const statusMap = {
    'active': 'status-active',
    'completed': 'status-completed',
    'on-hold': 'status-on-hold',
    'planning': 'status-planning',
    'pending': 'status-pending',
    'approved': 'status-approved',
    'rejected': 'status-rejected'
  };
  
  return statusMap[status.toLowerCase()] || 'status-default';
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateDashboardStats,
    showNotification,
    validateForm
  };
}