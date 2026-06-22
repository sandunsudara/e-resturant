import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PageLoader from 'components/PageLoader/PageLoader';
import { selectActiveSessionId, setActiveSessionId } from 'features/cart/cartSlice';
import { selectCurrentShop } from 'features/shop/shopSlice';
import OrderService from 'services/OrderService';
import { formatCurrency } from 'utils/formatters';
import { createSavedSessionId } from 'utils/session';
import { getShopVendorId } from 'utils/shopUtils';

const DEFAULT_CURRENCY = 'LKR';

function getOrderTotal(orders) {
  return orders.reduce((total, order) => total + order.total, 0);
}

export default function PaymentPage() {
  const dispatch = useDispatch();
  const activeSessionId = useSelector(selectActiveSessionId);
  const shop = useSelector(selectCurrentShop);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('cash');
  const [orders, setOrders] = useState([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const currency = shop?.currency || DEFAULT_CURRENCY;
  const total = useMemo(() => getOrderTotal(orders), [orders]);
  const hasOrders = orders.length > 0;

  useEffect(() => {
    if (!shop || !activeSessionId) return undefined;

    const controller = new AbortController();

    async function loadPaymentOrders() {
      setLoading(true);
      setError('');

      try {
        const nextOrders = await OrderService.getOrder({
          activeSessionId,
          signal: controller.signal,
          vendorId: getShopVendorId(shop)
        });

        setOrders(nextOrders);
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError.message || 'Unable to load payment details.');
      } finally {
        setLoading(false);
      }
    }

    loadPaymentOrders();

    return () => controller.abort();
  }, [activeSessionId, shop]);

  const handleConfirmPayment = () => {
    if (method === 'card') {
      alert('This feature is not available');
      return;
    }

    alert('Payment successful');
    setPaymentOpen(false);
    setOrders([]);
    dispatch(setActiveSessionId(createSavedSessionId()));
  };

  if (loading) return <PageLoader label="Loading payment..." minHeight="60vh" />;

  return (
    <Stack spacing={2} sx={{ minHeight: 'calc(100vh - 120px)' }}>
      <Box>
        <Typography variant="h2">Payment</Typography>
        <Typography color="text.secondary">Pay for the orders linked to your current session.</Typography>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box sx={{ flex: 1 }}>
        {!error && !hasOrders ? (
          <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 320, textAlign: 'center' }}>
            <ReceiptLongIcon color="disabled" sx={{ fontSize: 56 }} />
            <Box>
              <Typography variant="h4">No pending payment</Typography>
              <Typography color="text.secondary">Checkout an order to see it here.</Typography>
            </Box>
          </Stack>
        ) : null}

        <Stack spacing={1.5}>
          {orders.map((order) => (
            <Box key={order.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap variant="subtitle1">
                    #{order.orderNumber}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {order.status} / {order.paymentStatus || 'PENDING'}
                  </Typography>
                </Box>
                <Typography variant="subtitle1">{formatCurrency(order.total, currency)}</Typography>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Stack spacing={1}>
                {order.items.map((item) => (
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
                    <Typography variant="body2">{formatCurrency(item.price * item.quantity, currency)}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box
        sx={{ bottom: 0, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', mx: -2, p: 2, position: 'sticky' }}
      >
        <Stack spacing={1.5}>
          <Typography color="text.secondary" variant="caption" noWrap>
            Session: {activeSessionId}
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h4">Total</Typography>
            <Typography variant="h4">{formatCurrency(total, currency)}</Typography>
          </Stack>
          <Button disabled={!hasOrders} fullWidth onClick={() => setPaymentOpen(true)} startIcon={<PaymentIcon />} variant="contained">
            Pay
          </Button>
        </Stack>
      </Box>

      <Dialog fullWidth maxWidth="xs" open={paymentOpen} onClose={() => setPaymentOpen(false)}>
        <DialogTitle>Select payment method</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Button
              color={method === 'cash' ? 'primary' : 'inherit'}
              fullWidth
              onClick={() => setMethod('cash')}
              startIcon={<LocalAtmIcon />}
              sx={{ justifyContent: 'flex-start' }}
              variant={method === 'cash' ? 'contained' : 'outlined'}
            >
              <Radio checked={method === 'cash'} color="inherit" size="small" />
              Cash
            </Button>
            <Button
              color={method === 'card' ? 'primary' : 'inherit'}
              fullWidth
              onClick={() => setMethod('card')}
              startIcon={<CreditCardIcon />}
              sx={{ justifyContent: 'flex-start' }}
              variant={method === 'card' ? 'contained' : 'outlined'}
            >
              <Radio checked={method === 'card'} color="inherit" size="small" />
              Card
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setPaymentOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmPayment} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
