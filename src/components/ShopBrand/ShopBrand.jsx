import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { selectShopBrand } from '../../features/shop/shopSlice';

export default function ShopBrand({ size = 36 }) {
  const brand = useSelector(selectShopBrand);
  const shopName = brand.name || 'Shop';
  const logo = brand.logo;

  console.log('ShopBrand render', { shopName, logo });

  return (
    <Stack alignItems="center" direction="row" spacing={1.25} sx={{ minWidth: 0 }}>
      <Avatar
        alt={`${shopName} logo`}
        src={logo || undefined}
        sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', height: size, width: size }}
      >
        {shopName.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" noWrap>
          {shopName}
        </Typography>
      </Box>
    </Stack>
  );
}
