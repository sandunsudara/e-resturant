import { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from '@mui/material/Link';

const maskPhoneNumber = (phone) => {
  if (!phone) return '';
  if (phone.length >= 10) {
    return `${phone.slice(0, 3)} •••• ${phone.slice(7)}`;
  }
  return phone;
};

export default function CustomerDetailsDialog({ onChange, onSubmit, open, userForm }) {
  const phoneNumber = userForm.phoneNumber || '';
  const isPhoneValid = /^0\d{9}$/.test(phoneNumber);
  const hasPhoneError = phoneNumber.length > 0 && !phoneNumber.startsWith('0');

  const [step, setStep] = useState('details');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (open) {
      setStep('details');
      setOtp(['', '', '', '']);
      setOtpError('');
    }
  }, [open]);

  let helperText = '';
  if (phoneNumber.length > 0) {
    if (!phoneNumber.startsWith('0')) {
      helperText = 'Phone number must start with 0';
    } else if (phoneNumber.length < 10) {
      helperText = 'Phone number must be 10 digits';
    }
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '');
    const limitedValue = numericValue.substring(0, 10);

    onChange('phoneNumber')({
      target: {
        value: limitedValue
      }
    });
  };

  const handleOtpChange = (index) => (e) => {
    const val = e.target.value;
    if (val && !/^\d$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    setOtpError('');

    if (val && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index) => (e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs[index - 1].current.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      setOtpError('');
      inputRefs[3].current?.focus();
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (userForm.name.trim() && isPhoneValid) {
      setStep('otp');
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code === '1010') {
      onSubmit(e);
    } else {
      setOtpError('Invalid verification code. Please try "1010".');
    }
  };

  return (
    <Dialog disableEscapeKeyDown fullWidth maxWidth="xs" open={open}>
      {step === 'details' ? (
        <Box component="form" onSubmit={handleContinue}>
          <DialogTitle sx={{ fontWeight: 600 }}>Customer details</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                autoComplete="name"
                autoFocus
                fullWidth
                label="Name"
                onChange={onChange('name')}
                required
                value={userForm.name}
                variant="outlined"
              />
              <TextField
                autoComplete="tel"
                error={hasPhoneError}
                fullWidth
                helperText={helperText}
                label="Phone number"
                onChange={handlePhoneChange}
                required
                slotProps={{ input: { inputMode: 'tel', maxLength: 10 } }}
                value={userForm.phoneNumber}
                variant="outlined"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0.5 }}>
            <Button
              disabled={!userForm.name.trim() || !isPhoneValid}
              fullWidth
              type="submit"
              variant="contained"
              sx={{ py: 1.25, borderRadius: 2, fontWeight: 600 }}
            >
              Continue
            </Button>
          </DialogActions>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleVerify}>
          <Stack direction="row" alignItems="center" sx={{ px: 1.5, pt: 1.5 }}>
            <IconButton onClick={() => setStep('details')} size="small" sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Verify Phone Number
            </Typography>
          </Stack>
          <DialogContent sx={{ pb: 1 }}>
            <Stack spacing={3} alignItems="center" sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                We've sent a 4-digit verification code to <strong style={{ color: 'inherit' }}>{maskPhoneNumber(phoneNumber)}</strong>.
              </Typography>
              
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ width: '100%' }}>
                {otp.map((digit, index) => (
                  <Box
                    key={index}
                    component="input"
                    ref={inputRefs[index]}
                    value={digit}
                    onChange={handleOtpChange(index)}
                    onKeyDown={handleKeyDown(index)}
                    onPaste={handlePaste}
                    maxLength={1}
                    autoFocus={index === 0}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: otpError ? 'error.main' : 'divider',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      outline: 'none',
                      backgroundColor: 'background.paper',
                      color: 'text.primary',
                      transition: 'all 0.2s ease-in-out',
                      '&:focus': {
                        borderColor: otpError ? 'error.main' : 'primary.main',
                        boxShadow: (theme) => `0 0 0 3px ${otpError ? theme.palette.error.light : theme.palette.primary.light}40`,
                      }
                    }}
                  />
                ))}
              </Stack>

              {otpError && (
                <Typography variant="caption" color="error" sx={{ fontWeight: 500 }}>
                  {otpError}
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary" align="center">
                Didn't receive the code?{' '}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => {
                    setOtp(['', '', '', '']);
                    setOtpError('');
                  }}
                  sx={{ fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}
                >
                  Resend OTP
                </Link>
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1.5 }}>
            <Button
              disabled={otp.some(digit => !digit)}
              fullWidth
              type="submit"
              variant="contained"
              sx={{ py: 1.25, borderRadius: 2, fontWeight: 600 }}
            >
              Verify & Proceed
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
}
