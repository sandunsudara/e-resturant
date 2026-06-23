import HomeIcon from '@mui/icons-material/Home';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { selectCartTotalQuantity } from 'features/cart/cartSlice';

export default function MobileShopActions({ onCartOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { shopSlug } = useParams();
  const cartQuantity = useSelector((state) => selectCartTotalQuantity(state, shopSlug));

  let value = 'home';
  if (location.pathname.endsWith('/payment')) {
    value = 'payment';
  } else if (location.pathname.endsWith('/orders')) {
    value = 'orders';
  }

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', sm: 'none' },
        zIndex: 1000,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          if (newValue === 'cart') {
            onCartOpen();
          } else if (newValue === 'home') {
            navigate(`/${shopSlug}`);
          } else if (newValue === 'payment') {
            navigate(`/${shopSlug}/payment`);
          } else if (newValue === 'orders') {
            navigate(`/${shopSlug}/orders`);
          }
        }}
      >
        <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} />
        <BottomNavigationAction
          label="Cart"
          value="cart"
          icon={
            <Badge badgeContent={cartQuantity} color="secondary" max={99}>
              <ShoppingCartIcon />
            </Badge>
          }
        />
        <BottomNavigationAction label="Payment" value="payment" icon={<PaymentIcon />} />
        <BottomNavigationAction label="Orders" value="orders" icon={<ReceiptLongIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
