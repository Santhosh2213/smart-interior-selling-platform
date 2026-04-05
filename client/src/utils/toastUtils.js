import toast from 'react-hot-toast';

// Success toast with custom styling
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: 4000,
    position: 'top-right',
    className: 'animate-slide-in-right',
    icon: '✅',
    ...options,
  });
};

// Error toast with custom styling
export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: 5000,
    position: 'top-right',
    className: 'animate-slide-in-right',
    icon: '❌',
    ...options,
  });
};

// Loading toast
export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    position: 'top-right',
    className: 'animate-slide-in-right',
    ...options,
  });
};

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Promise toast (for async operations)
export const showPromise = (promise, messages, options = {}) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    },
    {
      position: 'top-right',
      className: 'animate-slide-in-right',
      success: {
        icon: '✅',
        style: {
          background: '#f0fdf4',
          color: '#166534',
          border: '1px solid #86efac',
        },
      },
      error: {
        icon: '❌',
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fca5a5',
        },
      },
      ...options,
    }
  );
};