import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { forwardRef, useCallback, useEffect, useRef } from 'react';

const Transition = forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

export default function OrderReadyDialog({ open, orderId, tokenNumber, onClose }) {
  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);

  const stopAlerts = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {
        // ignore
      }
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {
        // ignore
      }
      audioCtxRef.current = null;
    }
  }, []);

  const unlockAudio = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const playPagerBeep = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const beeps = [
        { time: 0, freq: 950 },
        { time: 0.15, freq: 1200 },
        { time: 0.3, freq: 950 },
        { time: 0.45, freq: 1200 },
      ];

      beeps.forEach(({ time, freq }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gain.gain.setValueAtTime(0.35, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + 0.12);
      });
    } catch (err) {
      console.warn('Unable to play pager sound:', err);
    }
  }, []);

  useEffect(() => {
    const handleTouchOrClick = () => {
      unlockAudio();
    };
    window.addEventListener('touchstart', handleTouchOrClick, { passive: true });
    window.addEventListener('click', handleTouchOrClick, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchOrClick);
      window.removeEventListener('click', handleTouchOrClick);
    };
  }, [unlockAudio]);

  useEffect(() => {
    if (open) {
      unlockAudio();
      const triggerAlert = () => {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([300, 100, 300, 100, 300]);
          } catch (e) {
            // ignore
          }
        }
        playPagerBeep();
      };

      triggerAlert();
      intervalRef.current = setInterval(triggerAlert, 2500);
    } else {
      stopAlerts();
    }

    return () => {
      stopAlerts();
    };
  }, [open, playPagerBeep, stopAlerts, unlockAudio]);

  const handleClose = (event, reason) => {
    stopAlerts();
    if (onClose) {
      onClose(event, reason);
    }
  };
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
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

        {tokenNumber && (
          <Box
            sx={{
              display: 'inline-block',
              px: 3,
              py: 1.5,
              borderRadius: 3,
              backgroundColor: 'primary.light',
              border: '1px solid',
              borderColor: 'primary.main',
              mb: 2,
            }}
          >
            <Typography variant="caption" display="block" color="primary.main" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1.5 }}>
              Token Number
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mt: 0.5 }}>
              {tokenNumber}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
          Please present this number at the counter to collect your order.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', px: 3, pb: 2, pt: 1 }}>
        <Button
          onClick={handleClose}
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
