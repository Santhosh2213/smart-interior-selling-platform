export const areaCalculator = {
  // Calculate area for different shapes
  rectangle: (length, width) => length * width,
  square: (side) => side * side,
  circle: (radius) => Math.PI * radius * radius,
  triangle: (base, height) => 0.5 * base * height,
  
  // Calculate total area from multiple measurements
  calculateTotal: (measurements) => {
    return measurements.reduce((total, m) => total + (m.areaSqFt || m.areaSqM || 0), 0);
  },
  
  // Estimate materials needed
  estimateMaterials: (area, materialPerUnit, wasteFactor = 0.1) => {
    const netMaterial = area / materialPerUnit;
    return Math.ceil(netMaterial * (1 + wasteFactor));
  },
  
  // Format area with unit
  format: (area, unit = 'sqft', decimals = 2) => {
    const unitSymbol = unit === 'sqft' ? 'ft²' : 'm²';
    return `${area.toFixed(decimals)} ${unitSymbol}`;
  }
};