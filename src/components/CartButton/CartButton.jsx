import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { selectCartTotalQuantity } from 'features/cart/cartSlice';

export default function CartButton({ onClick, shopSlug, sx, variant = 'text' }) {
  const params = useParams();
  const activeShopSlug = shopSlug || params.shopSlug;
  const cartQuantity = useSelector((state) => selectCartTotalQuantity(state, activeShopSlug));

  return (
    <Button
      aria-label="Open cart"
      color="primary"
      onClick={onClick}
      startIcon={
        <Badge badgeContent={cartQuantity} color="secondary" max={99}>
          <ShoppingCartIcon />
        </Badge>
      }
      sx={sx}
      variant={variant}
    >
      Cart
    </Button>
  );
}
