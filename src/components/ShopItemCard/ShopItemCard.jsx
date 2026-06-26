import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useEffect, useState } from 'react';
import ShopItemDetailModal from '../ShopItemDetailModal/ShopItemDetailModal';

import { formatCurrency } from 'utils/formatters';

const DEFAULT_CURRENCY = 'LKR';

export default function ShopItemCard({ currency = DEFAULT_CURRENCY, item, onAddItem }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [open, setOpen] = useState(false);
  const showImage = Boolean(item.image && !imageError);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [item.image]);

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        '&:hover .view-icon-btn': {
          opacity: 1,
          visibility: 'visible'
        }
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {showImage ? (
          <Box
            sx={{
              aspectRatio: '4 / 3',
              bgcolor: 'grey.100',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {!imageLoaded ? <Skeleton sx={{ height: '100%', transform: 'none', width: '100%' }} variant="rectangular" /> : null}
            <Box
              alt={item.name}
              component="img"
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
              src={item.image}
              sx={{
                height: '100%',
                inset: 0,
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
                position: 'absolute',
                transition: 'opacity 160ms ease',
                width: '100%'
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              alignItems: 'center',
              aspectRatio: '4 / 3',
              bgcolor: 'grey.100',
              color: 'text.secondary',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h2">{item.name.charAt(0).toUpperCase()}</Typography>
          </Box>
        )}

        <Box
          className="view-icon-btn"
          onClick={() => setOpen(true)}
          sx={{
            alignItems: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            left: 0,
            opacity: 0,
            position: 'absolute',
            top: 0,
            transition: 'opacity 0.2s ease, visibility 0.2s ease',
            visibility: 'hidden',
            width: '100%',
            zIndex: 2
          }}
        >
          <IconButton
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)'
              }
            }}
            size="medium"
            color="primary"
          >
            <VisibilityIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h3">{item.name}</Typography>
        <Typography color="primary.main" variant="h4" whiteSpace="nowrap" marginTop={1}>
          {formatCurrency(item.price, item.currency || currency)}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            mt: 1,
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3
          }}
          variant="body2"
        >
          {item.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button fullWidth onClick={() => onAddItem(item)} startIcon={<AddShoppingCartIcon />} variant="contained">
          Add to cart
        </Button>
      </CardActions>

      <ShopItemDetailModal
        open={open}
        onClose={() => setOpen(false)}
        item={item}
        currency={currency}
        onAddItem={onAddItem}
      />
    </Card>
  );
}
