import React from 'react';

const Loader = ({ size = 'medium', color = 'blue', fullScreen = true }) => {
  // Size mappings
  const sizes = {
    small: {
      container: 'h-16 w-16',
      inner: 'h-10 w-10',
      border: 'border-2'
    },
    medium: {
      container: 'h-24 w-24',
      inner: 'h-16 w-16',
      border: 'border-4'
    },
    large: {
      container: 'h-32 w-32',
      inner: 'h-20 w-20',
      border: 'border-4'
    }
  };

  // Color mappings
  const colors = {
    blue: {
      outer: 'border-blue-500',
      inner: 'border-blue-300'
    },
    green: {
      outer: 'border-green-500',
      inner: 'border-green-300'
    },
    red: {
      outer: 'border-red-500',
      inner: 'border-red-300'
    },
    purple: {
      outer: 'border-purple-500',
      inner: 'border-purple-300'
    },
    orange: {
      outer: 'border-orange-500',
      inner: 'border-orange-300'
    }
  };

  const selectedSize = sizes[size] || sizes.medium;
  const selectedColor = colors[color] || colors.blue;

  const containerClass = fullScreen 
    ? "flex items-center justify-center min-h-screen" 
    : "flex items-center justify-center p-8";

  // Option 1: Classic Spinner (Current)
  const ClassicSpinner = () => (
    <div className="relative">
      <div className={`${selectedSize.container} rounded-full border-t-4 border-b-4 ${selectedColor.outer} animate-spin`}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`${selectedSize.inner} rounded-full border-t-4 border-b-4 ${selectedColor.inner} animate-spin`}></div>
      </div>
    </div>
  );

  // Option 2: Pulsing Dots
  const PulsingDots = () => (
    <div className="flex space-x-2">
      <div className={`w-4 h-4 ${selectedColor.outer.replace('border', 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '0s' }}></div>
      <div className={`w-4 h-4 ${selectedColor.outer.replace('border', 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
      <div className={`w-4 h-4 ${selectedColor.outer.replace('border', 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '0.4s' }}></div>
    </div>
  );

  // Option 3: Progress Bar
  const ProgressBar = () => (
    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className={`h-full ${selectedColor.outer.replace('border', 'bg')} rounded-full animate-pulse`} style={{ width: '60%' }}></div>
    </div>
  );

  // Option 4: Spinning Circle with Text
  const SpinnerWithText = () => (
    <div className="text-center">
      <div className={`${selectedSize.container} mx-auto rounded-full border-4 border-gray-200 border-t-4 ${selectedColor.outer} animate-spin mb-4`}></div>
      <p className={`text-${color}-600 font-medium`}>Loading...</p>
    </div>
  );

  // Option 5: Simple Pulse
  const SimplePulse = () => (
    <div className={`${selectedSize.container} ${selectedColor.outer.replace('border', 'bg').replace('-500', '-200')} rounded-full animate-pulse flex items-center justify-center`}>
      <div className={`${selectedSize.inner} ${selectedColor.outer.replace('border', 'bg')} rounded-full`}></div>
    </div>
  );

  // Option 6: Ripple Effect
  const RippleEffect = () => (
    <div className="relative">
      <div className={`${selectedSize.container} ${selectedColor.outer.replace('border', 'bg').replace('-500', '-200')} rounded-full opacity-75 animate-ping absolute`}></div>
      <div className={`${selectedSize.container} ${selectedColor.outer.replace('border', 'bg')} rounded-full relative`}></div>
    </div>
  );

  // Option 7: Modern Gradient Spinner
  const GradientSpinner = () => (
    <div className="relative">
      <div className={`${selectedSize.container} rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin`}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`${selectedSize.inner} bg-white rounded-full`}></div>
      </div>
    </div>
  );

  // Option 8: Simple Text with Dots
  const TextWithDots = () => (
    <div className="flex items-center space-x-2">
      <span className={`text-${color}-600 font-medium`}>Loading</span>
      <div className="flex space-x-1">
        <div className={`w-2 h-2 ${selectedColor.outer.replace('border', 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '0s' }}></div>
        <div className={`w-2 h-2 ${selectedColor.outer.replace('border', 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
        <div className={`w-2 h-2 ${selectedColor.outer.replace('border', 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );

  // Choose your preferred loader by changing this line
  const LoaderComponent = ClassicSpinner; // Change this to any of the above options

  return (
    <div className={containerClass}>
      <LoaderComponent />
    </div>
  );
};

export default Loader;