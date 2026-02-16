export const priceFormatter = {
  // Format price with currency symbol
  format: (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },
  
  // Format without currency symbol
  formatNumber: (amount, decimals = 2) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  },
  
  // Parse formatted price back to number
  parse: (formattedPrice) => {
    return parseFloat(formattedPrice.replace(/[^0-9.-]+/g, ''));
  },
  
  // Calculate discount percentage
  calculateDiscount: (originalPrice, discountedPrice) => {
    if (!originalPrice || !discountedPrice) return 0;
    return ((originalPrice - discountedPrice) / originalPrice) * 100;
  },
  
  // Format price per unit
  formatPerUnit: (price, unit) => {
    return `₹${price.toFixed(2)}/${unit}`;
  }
};