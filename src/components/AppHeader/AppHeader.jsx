import HomeIcon from '@mui/icons-material/Home';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ShopBrand from '../ShopBrand/ShopBrand';
import CartButton from '../CartButton/CartButton';

const buttonHoverSx = {
  transition: 'all 0.2s ease',
  '&:hover': {
    bgcolor: 'secondary.light'
  }
};

export default function AppHeader({ onCartOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { shopSlug } = useParams();
  const isOrdersPage = location.pathname === `/${shopSlug}/orders`;
  const isPaymentPage = location.pathname === `/${shopSlug}/payment`;
  const orderActionLabel = isOrdersPage ? 'Home' : 'Orders';
  const orderActionPath = isOrdersPage ? `/${shopSlug}` : `/${shopSlug}/orders`;
  const paymentActionLabel = isPaymentPage ? 'Home' : 'Payment';
  const paymentActionPath = isPaymentPage ? `/${shopSlug}` : `/${shopSlug}/payment`;

  return (
    <AppBar color="inherit" elevation={0} position="sticky" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 2, justifyContent: 'space-between', minHeight: 64, px: { xs: 1.5, sm: 3 } }}>
        <ShopBrand />
        <Stack alignItems="center" direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <Button
            color="primary"
            variant="text"
            startIcon={isOrdersPage ? <HomeIcon /> : <ReceiptLongIcon />}
            onClick={() => navigate(orderActionPath)}
            sx={buttonHoverSx}
          >
            {orderActionLabel}
          </Button>

          <Button
            color="primary"
            variant="text"
            startIcon={isPaymentPage ? <HomeIcon /> : <PaymentIcon />}
            onClick={() => navigate(paymentActionPath)}
            sx={buttonHoverSx}
          >
            {paymentActionLabel}
          </Button>

          <CartButton onClick={onCartOpen} sx={buttonHoverSx} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
