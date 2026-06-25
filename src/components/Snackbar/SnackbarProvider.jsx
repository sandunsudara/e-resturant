import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const SnackbarContext = createContext(undefined);

export function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
    vertical: 'top',
    horizontal: 'center',
    duration: 2000
  });

  const hideSnackbar = useCallback(() => {
    setSnackbar((current) => ({ ...current, open: false }));
  }, []);

  const showSnackbar = useCallback((message, options = {}) => {
    const nextOptions = typeof options === 'string' ? { severity: options } : options;

    setSnackbar({
      open: true,
      message,
      severity: nextOptions.severity || 'info',
      vertical: nextOptions.vertical || nextOptions.position?.vertical || 'top',
      horizontal: nextOptions.horizontal || nextOptions.position?.horizontal || 'center',
      duration: nextOptions.duration !== undefined ? nextOptions.duration : 5000
    });
  }, []);

  const value = useMemo(() => ({ hideSnackbar, showSnackbar }), [hideSnackbar, showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: snackbar.vertical, horizontal: snackbar.horizontal }}
        autoHideDuration={snackbar.duration}
        open={snackbar.open}
        onClose={hideSnackbar}
      >
        <Alert onClose={hideSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error('useSnackbar must be used inside SnackbarProvider');
  }

  return context;
}
