import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { SnackbarProvider } from 'components/Snackbar/SnackbarProvider';
import { AlertProvider } from 'components/Alert/AlertProvider';
import { router } from 'routes';
import { store } from 'store';
import ThemeCustomization from 'themes';

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <Provider store={store}>
      <ThemeCustomization>
        <SnackbarProvider>
          <AlertProvider>
            <RouterProvider router={router} />
          </AlertProvider>
        </SnackbarProvider>
      </ThemeCustomization>
    </Provider>
  );
}
