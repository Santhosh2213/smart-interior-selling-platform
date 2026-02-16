export const measurementConverter = {
  // Length conversions
  feetToMeters: (feet) => feet * 0.3048,
  metersToFeet: (meters) => meters * 3.28084,
  
  // Area conversions
  sqftToSqm: (sqft) => sqft * 0.092903,
  sqmToSqft: (sqm) => sqm * 10.7639,
  
  // Calculate area
  calculateArea: (length, width, unit) => {
    const area = length * width;
    if (unit === 'feet') {
      return {
        sqft: area,
        sqm: area * 0.092903
      };
    } else {
      return {
        sqm: area,
        sqft: area * 10.7639
      };
    }
  },
  
  // Format measurement
  formatMeasurement: (value, unit, decimals = 2) => {
    return `${value.toFixed(decimals)} ${unit}`;
  }
};