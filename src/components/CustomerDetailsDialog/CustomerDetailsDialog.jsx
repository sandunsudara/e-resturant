import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export default function CustomerDetailsDialog({ onChange, onSubmit, open, userForm }) {
  return (
    <Dialog disableEscapeKeyDown fullWidth maxWidth="xs" open={open}>
      <Box component="form" onSubmit={onSubmit}>
        <DialogTitle>Customer details</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField autoComplete="name" autoFocus fullWidth label="Name" onChange={onChange('name')} required value={userForm.name} />
            <TextField
              autoComplete="tel"
              fullWidth
              label="Phone number"
              onChange={onChange('phoneNumber')}
              required
              slotProps={{ input: { inputMode: 'tel' } }}
              value={userForm.phoneNumber}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button disabled={!userForm.name.trim() || !userForm.phoneNumber.trim()} fullWidth type="submit" variant="contained">
            Continue
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
