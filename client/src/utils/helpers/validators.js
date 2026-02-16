export const validators = {
  // Email validation
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  // Phone number validation (Indian)
  phone: (phone) => {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
  },
  
  // GSTIN validation
  gstin: (gstin) => {
    const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return re.test(gstin);
  },
  
  // PAN validation
  pan: (pan) => {
    const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return re.test(pan);
  },
  
  // Pincode validation (Indian)
  pincode: (pincode) => {
    const re = /^[1-9][0-9]{5}$/;
    return re.test(pincode);
  },
  
  // URL validation
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Number validation
  number: (value, min, max) => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
  },
  
  // Required field
  required: (value) => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  },
  
  // Password strength
  password: (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    
    return {
      isValid: score >= 3,
      checks,
      score
    };
  },
  
  // Positive number
  positiveNumber: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  },
  
  // Integer validation
  integer: (value) => {
    const num = parseInt(value);
    return !isNaN(num) && num.toString() === value.toString();
  }
};