import { useState } from 'react';

export const useMeasurements = (initialUnit = 'feet') => {
  const [measurements, setMeasurements] = useState([]);
  const [unit, setUnit] = useState(initialUnit);

  const addMeasurement = (measurement) => {
    const newMeasurement = {
      ...measurement,
      id: Date.now(),
      unit,
      areaSqFt: unit === 'feet' ? measurement.length * measurement.width : (measurement.length * measurement.width) * 10.764,
      areaSqM: unit === 'meter' ? measurement.length * measurement.width : (measurement.length * measurement.width) * 0.0929
    };
    setMeasurements([...measurements, newMeasurement]);
  };

  const updateMeasurement = (id, updatedData) => {
    setMeasurements(measurements.map(m => 
      m.id === id ? { ...m, ...updatedData } : m
    ));
  };

  const removeMeasurement = (id) => {
    setMeasurements(measurements.filter(m => m.id !== id));
  };

  const convertUnit = (newUnit) => {
    if (newUnit === unit) return;

    const convertedMeasurements = measurements.map(m => {
      if (unit === 'feet' && newUnit === 'meter') {
        // Convert feet to meters
        const lengthInM = m.length * 0.3048;
        const widthInM = m.width * 0.3048;
        return {
          ...m,
          length: lengthInM,
          width: widthInM,
          areaSqM: lengthInM * widthInM,
          areaSqFt: m.areaSqFt
        };
      } else if (unit === 'meter' && newUnit === 'feet') {
        // Convert meters to feet
        const lengthInFt = m.length * 3.28084;
        const widthInFt = m.width * 3.28084;
        return {
          ...m,
          length: lengthInFt,
          width: widthInFt,
          areaSqFt: lengthInFt * widthInFt,
          areaSqM: m.areaSqM
        };
      }
      return m;
    });

    setMeasurements(convertedMeasurements);
    setUnit(newUnit);
  };

  const calculateTotalArea = () => {
    return measurements.reduce((sum, m) => {
      return sum + (unit === 'feet' ? m.areaSqFt : m.areaSqM);
    }, 0);
  };

  return {
    measurements,
    unit,
    addMeasurement,
    updateMeasurement,
    removeMeasurement,
    convertUnit,
    calculateTotalArea,
    setMeasurements
  };
};