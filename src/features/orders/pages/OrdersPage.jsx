import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import PageLoader from 'components/PageLoader/PageLoader';
import { selectCurrentShop } from 'features/shop/shopSlice';
import OrderService from 'services/OrderService';
import { formatCurrency } from 'utils/formatters';
import { getShopVendorId } from 'utils/shopUtils';

const DEFAULT_CURRENCY = 'LKR';

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

function getStatusColor(status) {
  const normalizedStatus = String(status || '').toUpperCase();

  if (['DELIVERED', 'COMPLETED', 'PAID'].includes(normalizedStatus)) return 'success';
  if (['CANCELLED', 'CANCELED', 'FAILED', 'REJECTED'].includes(normalizedStatus)) return 'error';
  if (['PROCESSING', 'CONFIRMED', 'SHIPPED'].includes(normalizedStatus)) return 'info';

  return 'warning';
}

function formatAddress(address) {
  if (!address) return '';
  if (typeof address === 'string') return address;

  return [address.contact_name, address.contact_phone, address.address, address.city, address.country].filter(Boolean).join(', ');
}

export default function OrdersPage() {
  const shop = useSelector(selectCurrentShop);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!shop) return undefined;

    const controller = new AbortController();

    async function loadOrders() {
      setLoading(true);
      setError('');

      try {
        const nextOrders = await OrderService.getOrders({
          signal: controller.signal,
          vendorId: getShopVendorId(shop)
        });

        setOrders(nextOrders);
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError.message || 'Unable to load orders.');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();

    return () => controller.abort();
  }, [shop]);

  if (loading) return <PageLoader label="Loading orders..." minHeight="60vh" />;

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h2">Orders</Typography>
        <Typography color="text.secondary">View your recent order status and details.</Typography>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {!error && !orders.length ? (
        <Stack alignItems="center" spacing={1.5} sx={{ py: 8, textAlign: 'center' }}>
          <ReceiptLongIcon color="disabled" sx={{ fontSize: 56 }} />
          <Box>
            <Typography variant="h4">No orders found</Typography>
            <Typography color="text.secondary">Your orders will appear here after checkout.</Typography>
          </Box>
        </Stack>
      ) : null}

      <Stack spacing={1.5}>
        {orders.map((order) => (
          <Accordion key={order.id} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ minWidth: 0, width: '100%' }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap variant="subtitle1">
                    #{order.orderNumber}
                  </Typography>
                  {order.createdAt ? (
                    <Typography color="text.secondary" variant="caption">
                      {formatDate(order.createdAt)}
                    </Typography>
                  ) : null}
                </Box>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Chip color={getStatusColor(order.status)} label={order.status} size="small" />
                  <Typography sx={{ minWidth: 80, textAlign: 'right' }} variant="subtitle2">
                    {formatCurrency(order.total, shop?.currency || DEFAULT_CURRENCY)}
                  </Typography>
                </Stack>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography color="text.secondary" variant="caption">
                      Payment
                    </Typography>
                    <Typography variant="body2">
                      {[order.paymentMethod, order.paymentStatus].filter(Boolean).join(' / ') || 'Not available'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography color="text.secondary" variant="caption">
                      Shipping
                    </Typography>
                    <Typography variant="body2">{formatAddress(order.shippingAddress) || 'Not available'}</Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={1}>
                  {order.items.length ? (
                    order.items.map((item) => (
                      <Stack key={`${order.id}-${item.id}`} direction="row" justifyContent="space-between" spacing={2}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap variant="body2">
                            {item.name}
                          </Typography>
                          <Typography color="text.secondary" variant="caption">
                            Qty {item.quantity}
                            {item.variation ? ` / ${item.variation}` : ''}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {formatCurrency(item.price * item.quantity, shop?.currency || DEFAULT_CURRENCY)}
                        </Typography>
                      </Stack>
                    ))
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      Item details are not available.
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Stack>
  );
}
