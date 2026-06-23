import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export default function CustomerDetailsDialog({ onChange, onSubmit, open, userForm }) {
  const phoneNumber = userForm.phoneNumber || '';
  const isPhoneValid = /^0\d{9}$/.test(phoneNumber);

  const hasPhoneError = phoneNumber.length > 0 && !phoneNumber.startsWith('0');

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

  return (
    <Dialog disableEscapeKeyDown fullWidth maxWidth="xs" open={open}>
      <Box component="form" onSubmit={onSubmit}>
        <DialogTitle>Customer details</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField autoComplete="name" autoFocus fullWidth label="Name" onChange={onChange('name')} required value={userForm.name} />
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
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button disabled={!userForm.name.trim() || !isPhoneValid} fullWidth type="submit" variant="contained">
            Continue
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
