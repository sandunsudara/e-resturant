import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import PageLoader from 'components/PageLoader/PageLoader';
import { selectCurrentShop } from 'features/shop/shopSlice';
import { selectUserPhoneNumber } from 'features/user/userSlice';
import OrderService from 'services/OrderService';
import { formatCurrency, getStatusDescription } from 'utils/formatters';
import { getShopVendorId } from 'utils/shopUtils';
import { useUserOrderSocket } from 'components/UserOrderSocket/UserOrderSocket';
import { printOrderBillReceipt } from 'components/BillPrint/BillPrint';


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

function isToday(value) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

const STATUS_STYLES = {
  PENDING: { bg: '#FFF3E0', color: '#E65100' }, // Orange
  ACTIVE: { bg: '#E0F7FA', color: '#006064' }, // Cyan
  PREPARING: { bg: '#F1F8E9', color: '#33691E' }, // Yellow-Green
  READY: { bg: '#E8EAF6', color: '#1A237E' }, // Indigo
  READY_TO_TABLE: { bg: '#FCE4EC', color: '#880E4F' }, // Pink
  REQ_PAYMENT: { bg: '#F9FBE7', color: '#827717' }, // Lime
  COMPLETED: { bg: '#E8F5E9', color: '#2E7D32' }, // Light Green
  CANCELED: { bg: '#FFEBEE', color: '#C62828' }, // Light Red
  CANCELLED: { bg: '#FFEBEE', color: '#C62828' }, // Light Red
  SERVED: { bg: '#E0F2F1', color: '#004D40' }, // Teal
  PAID: { bg: '#E8F5E9', color: '#1B5E20' }, // Green
  DELIVERED: { bg: '#E0F2F1', color: '#00796B' }, // Deep Teal
  FAILED: { bg: '#FFEBEE', color: '#C62828' }, // Red
  REJECTED: { bg: '#FFEBEE', color: '#B71C1C' }, // Dark Red
  PROCESSING: { bg: '#E1F5FE', color: '#01579B' }, // Blue
  CONFIRMED: { bg: '#E3F2FD', color: '#0D47A1' }, // Deep Blue
  SHIPPED: { bg: '#F3E5F5', color: '#4A148C' }, // Purple
  IN_KITCHEN: { bg: '#fffb77ff', color: '#63420bff' }, // Purple
};

function getStatusStyle(status) {
  const normalizedStatus = String(status || '').toUpperCase();
  return STATUS_STYLES[normalizedStatus] || { bg: '#F5F5F5', color: '#616161' };
}

function formatAddress(address) {
  if (!address) return '';
  if (typeof address === 'string') return address;

  return [address.contact_name, address.contact_phone, address.address, address.city, address.country].filter(Boolean).join(', ');
}

export default function OrdersPage() {
  const shop = useSelector(selectCurrentShop);
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  
  const [activeTab, setActiveTab] = useState(0);
  
  const phone = useSelector(selectUserPhoneNumber);
  const latestStatus = useUserOrderSocket(phone);
  const vendorId = shop ? getShopVendorId(shop) : null;

  const todayOrders = orders.filter((order) => isToday(order.createdAt));
  const previousOrders = orders.filter((order) => !isToday(order.createdAt));
  const displayedOrders = activeTab === 0 ? todayOrders : previousOrders;

  // console.log(latestStatus);  

  useEffect(() => {
    if (!latestStatus) return;

    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        const isMatch =
          String(order.id) === String(latestStatus.order_db_id) ||
          order.orderNumber === latestStatus.order_id;

        if (isMatch) {
          return {
            ...order,
            status: latestStatus.status,
            paymentStatus: latestStatus.payment_status || order.paymentStatus,
            items: (order.items || []).map((item) => ({
              ...item,
              status: latestStatus.status
            }))
          };
        }
        return order;
      })
    );
  }, [latestStatus]);

  useEffect(() => {
    if (!vendorId) return undefined;

    const controller = new AbortController();

    async function loadOrders() {
      setLoading(true);
      setError('');

      try {
        const nextOrders = await OrderService.getOrders({
          signal: controller.signal,
          vendorId
        });

        setOrders(nextOrders);
        setLoading(false);
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError.message || 'Unable to load orders.');
        setLoading(false);
      }
    }

    loadOrders();

    return () => controller.abort();
  }, [vendorId]);

  if (loading) return <PageLoader label="Loading orders..." minHeight="60vh" />;

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h2">Orders</Typography>
        <Typography color="text.secondary">View your recent order status and details.</Typography>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {!error && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="orders tabs">
            <Tab label={`Today (${todayOrders.length})`} />
            <Tab label={`Previous (${previousOrders.length})`} />
          </Tabs>
        </Box>
      )}

      {!error && !displayedOrders.length ? (
        <Stack alignItems="center" spacing={1.5} sx={{ py: 8, textAlign: 'center' }}>
          <ReceiptLongIcon color="disabled" sx={{ fontSize: 56 }} />
          <Box>
            <Typography variant="h4">No orders found</Typography>
            <Typography color="text.secondary">
              {activeTab === 0 ? 'No orders placed today.' : 'No previous orders found.'}
            </Typography>
          </Box>
        </Stack>
      ) : null}

      <Stack spacing={1.5}>
        {displayedOrders.map((order) => (
          <Accordion key={order.id} disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ minWidth: 0, width: '100%' }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {order.dailyToken || order.raw?.daily_token ? `Token: ${order.dailyToken || order.raw?.daily_token}` : `Order #${order.orderNumber}`}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {(order.dailyToken || order.raw?.daily_token) && (
                      <Typography color="text.secondary" variant="caption">
                        Order #${order.orderNumber}
                      </Typography>
                    )}
                    {order.createdAt ? (
                      <Typography color="text.secondary" variant="caption">
                        {(order.dailyToken || order.raw?.daily_token) ? `• ${formatDate(order.createdAt)}` : formatDate(order.createdAt)}
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Chip
                    label={getStatusDescription(order.status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusStyle(order.status).bg,
                      color: getStatusStyle(order.status).color,
                      fontWeight: 600
                    }}
                  />
                  {order.status === 'SERVED' && order.paymentStatus !== 'PAID' && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${shopSlug || shop?.slug}/payment`);
                      }}
                      sx={{ py: 0.25, px: 1.5, fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Pay Now
                    </Button>
                  )}
                  {order.status === 'COMPLETED' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        printOrderBillReceipt(order, shop);
                      }}
                      sx={{ py: 0.25, px: 1.5, fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      View Bill
                    </Button>
                  )}
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
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {[order.paymentMethod, order.paymentStatus].filter(Boolean).join(' / ') || 'Not available'}
                    </Typography>
                    {order.status === 'SERVED' && order.paymentStatus !== 'PAID' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/${shopSlug || shop?.slug}/payment`)}
                      >
                        Pay Now
                      </Button>
                    )}
                    {/* {order.status === 'COMPLETED' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => printOrderBillReceipt(order, shop)}
                      >
                        View Bill
                      </Button>
                    )} */}
                  </Box>
                  {/* <Box sx={{ flex: 1 }}>
                    <Typography color="text.secondary" variant="caption">
                      Shipping
                    </Typography>
                    <Typography variant="body2">{formatAddress(order.shippingAddress) || 'Not available'}</Typography>
                  </Box> */}
                </Stack>

                <Divider />

                <Stack spacing={1.5}>
                  {order.items.length ? (
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
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                            <Typography noWrap variant="body2" sx={{ fontWeight: 500 }}>
                              {item.name}
                            </Typography>
                            {item.status ? (
                              <Chip
                                label={getStatusDescription(item.status)}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  px: 0.5,
                                  bgcolor: getStatusStyle(item.status).bg,
                                  color: getStatusStyle(item.status).color,
                                  fontWeight: 600
                                }}
                              />
                            ) : null}
                          </Stack>
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
