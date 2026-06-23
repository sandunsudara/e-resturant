import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
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
import { useNavigate, useParams } from 'react-router-dom';

import PageLoader from 'components/PageLoader/PageLoader';
import { useSnackbar } from 'components/Snackbar/SnackbarProvider';
import { selectActiveSessionId, setActiveSessionId } from 'features/cart/cartSlice';
import { selectCurrentShop } from 'features/shop/shopSlice';
import OrderService from 'services/OrderService';
import { formatCurrency, getStatusDescription } from 'utils/formatters';
import { createSavedSessionId } from 'utils/session';
import { getShopVendorId } from 'utils/shopUtils';

const DEFAULT_CURRENCY = 'LKR';

export default function PaymentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const { showSnackbar } = useSnackbar();
  const activeSessionId = useSelector(selectActiveSessionId);
  const shop = useSelector(selectCurrentShop);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('cash');
  const [order, setOrder] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const currency = shop?.currency || DEFAULT_CURRENCY;
  const total = useMemo(() => (order ? order.total : 0), [order]);
  const hasOrder = !!order;
  const vendorId = shop ? getShopVendorId(shop) : null;

  useEffect(() => {
    if (!vendorId || !activeSessionId) return undefined;

    const controller = new AbortController();

    async function loadPaymentOrders() {
      setLoading(true);
      setError('');

      try {
        const nextOrder = await OrderService.getOrder({
          activeSessionId,
          signal: controller.signal,
          vendorId
        });

        if (nextOrder && nextOrder.paymentStatus?.toUpperCase() === 'PAID') {
          setOrder(null);
        } else {
          setOrder(nextOrder);
        }
        setLoading(false);
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError.message || 'Unable to load payment details.');
        setLoading(false);
      }
    }

    loadPaymentOrders();

    return () => controller.abort();
  }, [activeSessionId, vendorId]);

  const handleConfirmPayment = async () => {
    if (method === 'card') {
      alert('This feature is not available');
      return;
    }

    try {
      setSubmitting(true);
      await OrderService.updateOrderStatus({
        sessionId: activeSessionId,
        status: 'REQ_PAYMENT',
        vendorId: getShopVendorId(shop)
      });
      setPaymentOpen(false);
      setSuccessOpen(true);
    } catch (requestError) {
      showSnackbar(requestError.message || 'Unable to update payment status.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessOpen(false);
    setOrder(null);
    dispatch(setActiveSessionId(createSavedSessionId()));
    navigate(`/${shopSlug}`);
  };

  if (loading) return <PageLoader label="Loading payment..." minHeight="60vh" />;

  return (
    <Stack spacing={2} sx={{ minHeight: 'calc(100vh - 120px)' }}>
      <Box>
        <Typography variant="h2">Payment</Typography>
        <Typography color="text.secondary">Pay for the order linked to your current session.</Typography>
      </Box>

      {/* {error ? <Alert severity="error">{error}</Alert> : null} */}

      <Box sx={{ flex: 1 }}>
        {!order ? (
          <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 320, textAlign: 'center' }}>
            <ReceiptLongIcon color="disabled" sx={{ fontSize: 56 }} />
            <Box>
              <Typography variant="h4">No pending payment</Typography>
              <Typography color="text.secondary">Checkout an order to see it here.</Typography>
            </Box>
          </Stack>
        ) : null}

        {order ? (
          <Box key={order.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap variant="subtitle1">
                  #{order.orderNumber}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {getStatusDescription(order.status)} / {getStatusDescription(order.paymentStatus || 'PENDING')}
                </Typography>
              </Box>
              <Typography variant="subtitle1">{formatCurrency(order.total, currency)}</Typography>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1.5}>
              {order.items && order.items.length ? (
                order.items.map((item) => (
                  <Stack key={`${order.id}-${item.id}`} direction="row" alignItems="center" spacing={2}>
                    {item.image ? (
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1,
                          objectFit: 'cover',
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.default'
                        }}
                      />
                    ) : null}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
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
                ))
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No items in this order.
                </Typography>
              )}
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{ bottom: 0, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', mx: -2, p: 2, position: 'sticky' }}
      >
        <Stack spacing={1.5}>
          {/* <Typography color="text.secondary" variant="caption" noWrap>
            Session: {activeSessionId}
          </Typography> */}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h4">Total</Typography>
            <Typography variant="h4">{formatCurrency(total, currency)}</Typography>
          </Stack>
          <Button disabled={!hasOrder} fullWidth onClick={() => setPaymentOpen(true)} startIcon={<PaymentIcon />} variant="contained">
            Pay
          </Button>
        </Stack>
      </Box>

      <Dialog fullWidth maxWidth="xs" open={paymentOpen} onClose={submitting ? undefined : () => setPaymentOpen(false)}>
        <DialogTitle>Select payment method</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Button
              color={method === 'cash' ? 'primary' : 'inherit'}
              disabled={submitting}
              fullWidth
              onClick={() => setMethod('cash')}
              startIcon={<LocalAtmIcon />}
              sx={{ justifyContent: 'flex-start' }}
              variant={method === 'cash' ? 'contained' : 'outlined'}
            >
              <Radio checked={method === 'cash'} color="inherit" disabled={submitting} size="small" />
              Cash
            </Button>
            <Button
              color={method === 'card' ? 'primary' : 'inherit'}
              disabled={submitting}
              fullWidth
              onClick={() => setMethod('card')}
              startIcon={<CreditCardIcon />}
              sx={{ justifyContent: 'flex-start' }}
              variant={method === 'card' ? 'contained' : 'outlined'}
            >
              <Radio checked={method === 'card'} color="inherit" disabled={submitting} size="small" />
              Card
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" disabled={submitting} onClick={() => setPaymentOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={submitting}
            onClick={handleConfirmPayment}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
            variant="contained"
          >
            {submitting ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog fullWidth maxWidth="xs" open={successOpen} onClose={handleCloseSuccessModal}>
        <DialogContent sx={{ py: 4, textAlign: 'center' }}>
          <Stack alignItems="center" spacing={2.5}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64 }} />
            <Box>
              <Typography variant="h3" sx={{ mb: 1 }}>
                Payment Request Sent
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Your payment request has been submitted successfully.
              </Typography>
            </Box>
            <Button fullWidth onClick={handleCloseSuccessModal} variant="contained" size="large">
              Back to Home
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
