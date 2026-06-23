import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { formatCurrency } from 'utils/formatters';

const DEFAULT_CURRENCY = 'LKR';

export default function ShopItemDetailModal({ open, onClose, item, currency = DEFAULT_CURRENCY, onAddItem }) {
  if (!item) return null;

  const showImage = Boolean(item.image);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {item.name}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {showImage ? (
            <Box
              component="img"
              src={item.image}
              alt={item.name}
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: 1,
                bgcolor: 'grey.100'
              }}
            />
          ) : null}
          <Typography color="primary.main" variant="h4">
            {formatCurrency(item.price, item.currency || currency)}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {item.description}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          onClick={() => {
            onAddItem(item);
            onClose();
          }}
          startIcon={<AddShoppingCartIcon />}
          variant="contained"
        >
          Add to cart
        </Button>
      </DialogActions>
    </Dialog>
  );
}
