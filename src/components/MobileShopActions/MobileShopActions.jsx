import HomeIcon from '@mui/icons-material/Home';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { selectCartTotalQuantity } from 'features/cart/cartSlice';

export default function MobileShopActions({ onCartOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { shopSlug } = useParams();
  const [open, setOpen] = useState(false);
  const cartQuantity = useSelector((state) => selectCartTotalQuantity(state, shopSlug));
  const isOrdersPage = location.pathname === `/${shopSlug}/orders`;
  const isPaymentPage = location.pathname === `/${shopSlug}/payment`;
  const orderActionLabel = isOrdersPage ? 'Go home' : 'View orders';
  const orderActionPath = isOrdersPage ? `/${shopSlug}` : `/${shopSlug}/orders`;
  const paymentActionLabel = isPaymentPage ? 'Go home' : 'Payment';
  const paymentActionPath = isPaymentPage ? `/${shopSlug}` : `/${shopSlug}/payment`;

  const handleAction = (action) => {
    setOpen(false);
    action();
  };

  return (
    <SpeedDial
      ariaLabel="Shop actions"
      direction="up"
      FabProps={{ color: 'primary', size: 'medium' }}
      icon={<SpeedDialIcon />}
      open={open}
      onClick={() => setOpen((prev) => !prev)}
      onClose={() => setOpen(false)}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        display: { xs: 'flex', sm: 'none' },
        zIndex: 9999,
        '& .MuiSpeedDial-actions': {
          marginBottom: '0px',
          padding: '0px'
        }
      }}
    >
      <SpeedDialAction
        tooltipTitle={orderActionLabel}
        icon={isOrdersPage ? <HomeIcon /> : <ReceiptLongIcon />}
        onClick={(e) => {
          e.stopPropagation();
          handleAction(() => navigate(orderActionPath));
        }}
      />

      <SpeedDialAction
        tooltipTitle={paymentActionLabel}
        icon={isPaymentPage ? <HomeIcon /> : <PaymentIcon />}
        onClick={(e) => {
          e.stopPropagation();
          handleAction(() => navigate(paymentActionPath));
        }}
      />

      <SpeedDialAction
        tooltipTitle="Cart"
        icon={
          <Badge badgeContent={cartQuantity} color="secondary" max={99}>
            <ShoppingCartIcon />
          </Badge>
        }
        onClick={(e) => {
          e.stopPropagation();
          handleAction(onCartOpen);
        }}
      />
    </SpeedDial>
  );
}
