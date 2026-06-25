import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const AlertContext = createContext(undefined);

export function AlertProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    severity: 'info', // 'info' | 'success' | 'warning' | 'error'
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    onConfirm: null,
    onCancel: null
  });

  const showAlert = useCallback((options) => {
    setState({
      open: true,
      title: options.title || 'Alert',
      message: options.message || '',
      severity: options.severity || 'info',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      showCancel: !!options.onCancel || !!options.showCancel,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    });
  }, []);

  const hideAlert = useCallback(() => {
    setState((current) => ({ ...current, open: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    hideAlert();
    if (state.onConfirm) {
      state.onConfirm();
    }
  }, [hideAlert, state]);

  const handleCancel = useCallback(() => {
    hideAlert();
    if (state.onCancel) {
      state.onCancel();
    }
  }, [hideAlert, state]);

  const value = useMemo(() => ({ showAlert, hideAlert }), [showAlert, hideAlert]);

  const severityIcon = useMemo(() => {
    switch (state.severity) {
      case 'success':
        return <CheckCircleOutlinedIcon sx={{ fontSize: 40, color: 'success.main' }} />;
      case 'error':
        return <ErrorOutlineIcon sx={{ fontSize: 40, color: 'error.main' }} />;
      case 'warning':
        return <WarningAmberIcon sx={{ fontSize: 40, color: 'warning.main' }} />;
      case 'info':
      default:
        return <InfoOutlinedIcon sx={{ fontSize: 40, color: 'info.main' }} />;
    }
  }, [state.severity]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <Dialog
        open={state.open}
        onClose={handleCancel}
        aria-labelledby="global-alert-dialog-title"
        aria-describedby="global-alert-dialog-description"
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            p: 1.5
          }
        }}
      >
        <DialogTitle id="global-alert-dialog-title" sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {severityIcon}
            <Box sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
              {state.title}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText id="global-alert-dialog-description" sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
            {state.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 1 }}>
          {state.showCancel && (
            <Button onClick={handleCancel} color="inherit" variant="text" sx={{ borderRadius: 1.5 }}>
              {state.cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={state.severity === 'error' ? 'error' : state.severity === 'warning' ? 'warning' : 'primary'}
            autoFocus
            sx={{ borderRadius: 1.5, px: 3 }}
          >
            {state.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used inside AlertProvider');
  }
  return context;
}
