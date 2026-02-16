export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.COMPLETED]: 'Completed',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded'
};

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PAYMENT_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [PAYMENT_STATUS.FAILED]: 'bg-red-100 text-red-800',
  [PAYMENT_STATUS.REFUNDED]: 'bg-purple-100 text-purple-800'
};

export const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
  { id: 'upi', name: 'UPI', icon: '📱' },
  { id: 'netbanking', name: 'Net Banking', icon: '🏦' }
];