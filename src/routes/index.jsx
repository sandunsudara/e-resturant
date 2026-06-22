import { Navigate, createBrowserRouter } from 'react-router-dom';
import AppInitializer from '../app/AppInitializer';
import ShopHomePage from '../features/shop/pages/ShopHomePage';
import ErrorPage from '../features/error/ErrorPage';
import OrdersPage from '../features/orders/pages/OrdersPage';
import PaymentPage from '../features/payment/pages/PaymentPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to="/error" />
  },
  {
    path: '/:shopSlug',
    element: <AppInitializer />,
    children: [
      {
        index: true,
        element: <ShopHomePage />
      },
      {
        path: 'orders',
        element: <OrdersPage />
      },
      {
        path: 'payment',
        element: <PaymentPage />
      }
    ]
  },
  {
    path: '/error',
    element: <ErrorPage />
  },
  {
    path: '*',
    element: <ErrorPage />
  }
]);
