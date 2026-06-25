import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { forwardRef } from 'react';

const Transition = forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

export default function OrderReadyDialog({ open, orderId, onClose }) {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-describedby="order-ready-dialog-slide-description"
      PaperProps={{
        sx: {
          borderRadius: 4,
          padding: 2,
          maxWidth: 400,
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
        }
      }}
    >
      <DialogContent sx={{ pb: 1, pt: 3 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'primary.light',
            color: 'primary.main',
            mb: 3,
            animation: 'pulse 2s infinite ease-in-out',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(0.95)',
                boxShadow: '0 0 0 0 rgba(248, 161, 39, 0.4)',
              },
              '70%': {
                transform: 'scale(1)',
                boxShadow: '0 0 0 16px rgba(248, 161, 39, 0)',
              },
              '100%': {
                transform: 'scale(0.95)',
                boxShadow: '0 0 0 0 rgba(248, 161, 39, 0)',
              },
            },
          }}
        >
          <FastfoodIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
          Your Order is Ready!
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, px: 1 }}>
          Great news! Your delicious meal has been freshly prepared and is ready for pickup.
        </Typography>

        {orderId && (
          <Box
            sx={{
              display: 'inline-block',
              px: 3,
              py: 1.5,
              borderRadius: 3,
              backgroundColor: 'grey.100',
              border: '1px dashed',
              borderColor: 'grey.300',
              mb: 2,
            }}
          >
            <Typography variant="caption" display="block" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 1.5 }}>
              Order Number
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
              {orderId}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
          Please present this number at the counter to collect your order.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', px: 3, pb: 2, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: '1rem',
            boxShadow: (theme) => `0 8px 20px ${theme.palette.primary.main}30`,
            '&:hover': {
              boxShadow: (theme) => `0 10px 24px ${theme.palette.primary.main}40`,
            }
          }}
        >
          Awesome, Got It!
        </Button>
      </DialogActions>
    </Dialog>
  );
}
