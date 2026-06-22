import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AppHeader from '../../components/AppHeader/AppHeader';
import CartDrawer from '../../features/cart/components/CartDrawer';
import MobileShopActions from '../../components/MobileShopActions/MobileShopActions';



export default function MainLayout({ children }) {
  const { shopSlug } = useParams();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppHeader onCartOpen={() => setCartOpen(true)} />

      <Container component="main" maxWidth="lg" sx={{ py: { sm: 2 } }}>
        {children}
      </Container>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} shopSlug={shopSlug} />
      <MobileShopActions onCartOpen={() => setCartOpen(true)} />
    </Box>
  );
}
