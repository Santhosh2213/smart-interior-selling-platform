import toast from 'react-hot-toast';

// Success toast - Green
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: 4000,
    position: 'top-center',
    icon: '✅',
    style: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
    },
    ...options,
  });
};

// Error toast - Red
export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: 5000,
    position: 'top-center',
    icon: '❌',
    style: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
    },
    ...options,
  });
};

// Info toast - Light blue
export const showInfo = (message, options = {}) => {
  return toast(message, {
    duration: 4000,
    position: 'top-center',
    icon: 'ℹ️',
    style: {
      background: '#d1ecf1',
      color: '#0c5460',
      border: '1px solid #bee5eb',
    },
    ...options,
  });
};

// Warning toast - Yellow
export const showWarning = (message, options = {}) => {
  return toast(message, {
    duration: 4000,
    position: 'top-center',
    icon: '⚠️',
    style: {
      background: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeeba',
    },
    ...options,
  });
};

// Loading toast - Blue
export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    position: 'top-center',
    icon: '⏳',
    style: {
      background: '#cce5ff',
      color: '#004085',
      border: '1px solid #b8daff',
    },
    ...options,
  });
};

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Promise toast with colored backgrounds
export const showPromise = (promise, messages, options = {}) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error!',
    },
    {
      position: 'top-center',
      success: {
        icon: '✅',
        style: {
          background: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
        },
      },
      error: {
        icon: '❌',
        style: {
          background: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
        },
      },
      loading: {
        icon: '⏳',
        style: {
          background: '#cce5ff',
          color: '#004085',
          border: '1px solid #b8daff',
        },
      },
      ...options,
    }
  );
};