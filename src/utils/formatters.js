const DEFAULT_CURRENCY = 'LKR';

export function formatCurrency(value, currency = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
}

const STATUS_DESCRIPTIONS = {
  PENDING: 'Waiting',
  ACTIVE: 'In Progress',
  PREPARING: 'Preparing',
  READY: 'Ready',
  READY_TO_TABLE: 'Ready to Serve',
  REQ_PAYMENT: 'Payment Done',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled',
  CANCELLED: 'Cancelled',
  SERVED: 'Served',
  PAID: 'Paid',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  REJECTED: 'Rejected',
  PROCESSING: 'Processing',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped'
};

export function getStatusDescription(status) {
  if (!status) return '';
  const normalized = String(status).toUpperCase().trim();
  return STATUS_DESCRIPTIONS[normalized] || status;
}
