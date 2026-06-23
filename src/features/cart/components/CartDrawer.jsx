import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  clearCart,
  decrementItem,
  incrementItem,
  removeItem,
  selectActiveSessionId,
  selectCartItems,
  selectCartSubtotal
} from '../cartSlice';
import { useSnackbar } from 'components/Snackbar/SnackbarProvider';
import ShopBrand from 'components/ShopBrand/ShopBrand';
import { selectCurrentShop } from 'features/shop/shopSlice';
import OrderService from 'services/OrderService';
import { formatCurrency } from 'utils/formatters';
import { getShopVendorId } from 'utils/shopUtils';

const DEFAULT_CURRENCY = 'LKR';

export default function CartDrawer({ open, onClose, shopSlug }) {
  const dispatch = useDispatch();
  const [placingOrder, setPlacingOrder] = useState(false);
  const { showSnackbar } = useSnackbar();
  const shop = useSelector(selectCurrentShop);
  const sessionId = useSelector(selectActiveSessionId);
  const cartItems = useSelector((state) => selectCartItems(state, shopSlug));
  const subtotal = useSelector((state) => selectCartSubtotal(state, shopSlug));
  const currency = cartItems[0]?.currency || shop?.currency || DEFAULT_CURRENCY;
  const hasItems = cartItems.length > 0;

  const handleClearCart = () => {
    dispatch(clearCart({ shopSlug }));
    showSnackbar('Cart cleared.', 'info');
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeItem({ shopSlug, itemId }));
    showSnackbar('Item removed from cart.', 'info');
  };

  const handlePlaceOrder = async () => {
    if (!hasItems) return;

    setPlacingOrder(true);

    try {
      await OrderService.createOrder({
        activeSessionId: sessionId,
        items: cartItems,
        returnUrlBase: `${window.location.origin}/${shopSlug}/confirmation`,
        vendorId: getShopVendorId(shop)
      });

      dispatch(clearCart({ shopSlug }));
      showSnackbar('Order placed successfully.', 'success');
      onClose();
    } catch (error) {
      showSnackbar(error.message || 'Unable to place order.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ mb: 1 }}>
              <ShopBrand showSlug={false} size={30} />
            </Box>
            <Typography variant="h3">Cart</Typography>
          </Box>
          <Tooltip title="Close cart">
            <IconButton aria-label="Close cart" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {!hasItems ? (
            <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: 280, textAlign: 'center' }}>
              <ShoppingCartCheckoutIcon color="disabled" sx={{ fontSize: 54 }} />
              <Box>
                <Typography variant="h4">Your cart is empty</Typography>
                <Typography color="text.secondary" variant="body2">
                  Add an item from the shop to start the order.
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {cartItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: '72px 1fr',
                    p: 1
                  }}
                >
                  {item.image ? (
                    <Box
                      component="img"
                      alt={item.name}
                      src={item.image}
                      sx={{
                        aspectRatio: '1',
                        borderRadius: 1,
                        height: 72,
                        objectFit: 'cover',
                        width: 72
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        alignItems: 'center',
                        aspectRatio: '1',
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        color: 'text.secondary',
                        display: 'flex',
                        height: 72,
                        justifyContent: 'center',
                        width: 72
                      }}
                    >
                      <Typography variant="h4">{item.name.charAt(0).toUpperCase()}</Typography>
                    </Box>
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Typography variant="subtitle1" noWrap>
                        {item.name}
                      </Typography>
                      <Tooltip title="Remove item">
                        <IconButton aria-label={`Remove ${item.name}`} color="error" onClick={() => handleRemoveItem(item.id)} size="small">
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Typography color="text.secondary" variant="body2">
                      {formatCurrency(item.price, item.currency)}
                    </Typography>
                    {item.variationLabel ? (
                      <Typography color="text.secondary" sx={{ display: 'block' }} variant="caption">
                        {item.variationLabel}
                      </Typography>
                    ) : null}
                    <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                      <Stack alignItems="center" direction="row" spacing={0.5}>
                        <Tooltip title="Decrease quantity">
                          <IconButton
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => dispatch(decrementItem({ shopSlug, itemId: item.id }))}
                            size="small"
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Typography sx={{ minWidth: 28, textAlign: 'center' }} variant="subtitle1">
                          {item.quantity}
                        </Typography>
                        <Tooltip title="Increase quantity">
                          <IconButton
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() => dispatch(incrementItem({ shopSlug, itemId: item.id }))}
                            size="small"
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <Typography variant="subtitle1">{formatCurrency(item.price * item.quantity, item.currency)}</Typography>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        <Divider />

        <Stack spacing={1.5} sx={{ p: 2 }}>
          <Typography color="text.secondary" variant="caption" noWrap>
            Session: {sessionId}
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h4">Subtotal</Typography>
            <Typography variant="h4">{formatCurrency(subtotal, currency)}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button color="inherit" onClick={onClose} size="small" variant="outlined">
              Back
            </Button>
            <Button color="inherit" disabled={!hasItems} fullWidth onClick={handleClearCart} variant="outlined">
              Clear
            </Button>
            <Button
              disabled={!hasItems || placingOrder}
              fullWidth
              onClick={handlePlaceOrder}
              startIcon={<ShoppingCartCheckoutIcon />}
              variant="contained"
            >
              {placingOrder ? 'Placing order...' : 'Order'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}
