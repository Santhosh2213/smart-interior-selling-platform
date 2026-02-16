export const dateFormatter = {
  // Format date to readable string
  formatDate: (date, format = 'medium') => {
    const d = new Date(date);
    
    const formats = {
      short: d.toLocaleDateString('en-IN'),
      medium: d.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      long: d.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      full: d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    return formats[format] || formats.medium;
  },
  
  // Get relative time (e.g., "2 hours ago")
  getRelativeTime: (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  },
  
  // Check if date is today
  isToday: (date) => {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  },
  
  // Check if date is in the past
  isPast: (date) => {
    return new Date(date) < new Date();
  },
  
  // Check if date is in the future
  isFuture: (date) => {
    return new Date(date) > new Date();
  },
  
  // Add days to date
  addDays: (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },
  
  // Get date range string
  getDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return dateFormatter.formatDate(start, 'medium');
    }
    
    return `${dateFormatter.formatDate(start, 'short')} - ${dateFormatter.formatDate(end, 'short')}`;
  }
};