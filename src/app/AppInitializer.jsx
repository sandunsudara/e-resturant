import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import useConfig from '../hooks/useConfig';
import { useSnackbar } from '../components/Snackbar/SnackbarProvider';
import {
  selectCurrentShop,
  selectShopError,
  selectShopLoading,
  setCategories,
  setCategoriesError,
  setCategoriesLoading,
  setShopDetails,
  setShopError,
  setShopLoading
} from '../features/shop/shopSlice';
import { selectHasUserDetails, selectUserName, selectUserPhoneNumber, setUserDetails } from '../features/user/userSlice';
import PageLoader from '../components/PageLoader/PageLoader';
import CustomerDetailsDialog from '../components/CustomerDetailsDialog/CustomerDetailsDialog';
import MainLayout from '../layouts/MainLayout';
import ShopService from '../services/ShopService';
import CategoryService from '../services/CategoryService';
import OrderService from '../services/OrderService';
import { getShopVendorId } from '../utils/shopUtils';
import { useUserOrderSocket } from '../components/UserOrderSocket/UserOrderSocket';
import OrderReadyDialog from '../components/OrderReadyDialog/OrderReadyDialog';

function getUserDetailsFromSearch(search) {
  const params = new URLSearchParams(search);

  return {
    name: (params.get('name') || params.get('customerName') || params.get('customer_name') || params.get('fullName') || '').trim(),
    phoneNumber: (
      params.get('phoneNumber') ||
      params.get('phone_number') ||
      params.get('phone') ||
      params.get('mobile') ||
      params.get('mobileNumber') ||
      params.get('contact') ||
      ''
    ).trim()
  };
}

function isShopNotFoundError(error) {
  return error.status === 404 || /vendor.*not found|not found/i.test(error.message || '');
}

function setDynamicTitle(title) {
  const nextTitle = title || 'BB Shops';
  const titleElement = document.getElementById('dynamic-title');

  document.title = nextTitle;

  if (titleElement) {
    titleElement.textContent = nextTitle;
  }
}

function getPageComponent(pageContent, key) {
  return pageContent?.components?.find((component) => component?.[key])?.[key] || null;
}

function parseRadius(value) {
  if (value === undefined || value === null || value === '') return undefined;

  const radius = Number.parseFloat(String(value));
  return Number.isFinite(radius) ? radius : undefined;
}

function getFontWeight(style) {
  const normalizedStyle = String(style || '').toLowerCase();

  if (normalizedStyle.includes('bold')) return 700;
  if (normalizedStyle.includes('medium')) return 500;
  if (normalizedStyle.includes('light')) return 300;
  return 400;
}

function getTypographyVariant(fontSetting) {
  if (!fontSetting) return undefined;

  const fontSize = Number.parseFloat(fontSetting.size);

  return {
    ...(fontSetting.font ? { fontFamily: fontSetting.font } : {}),
    ...(Number.isFinite(fontSize) ? { fontSize: `${fontSize}px` } : {}),
    ...(fontSetting.color ? { color: fontSetting.color } : {}),
    fontWeight: getFontWeight(fontSetting.style)
  };
}

function getThemeConfigFromPageContent(pageContent) {
  const selectedPalette = getPageComponent(pageContent, 'selectedPalette');
  const fontSettings = getPageComponent(pageContent, 'fontSettings');
  const buttonSettings = getPageComponent(pageContent, 'buttonSettings');
  const radius = parseRadius(buttonSettings?.cornerRadius);
  const themeConfig = {};

  if (selectedPalette) {
    themeConfig.palette = {
      primary: {
        main: selectedPalette.primary || selectedPalette.colors?.[0]
      },
      secondary: {
        main: selectedPalette.secondary || selectedPalette.colors?.[1]
      },
      background: {
        default: selectedPalette.background || selectedPalette.colors?.[3],
        paper: selectedPalette.background || selectedPalette.colors?.[3]
      },
      text: {
        primary: selectedPalette.accent || selectedPalette.colors?.[2],
        secondary: selectedPalette.accent || selectedPalette.colors?.[2],
        heading: selectedPalette.primary || selectedPalette.colors?.[0]
      }
    };
  }

  if (fontSettings) {
    themeConfig.fontFamily = fontSettings.header1?.font || fontSettings.header2?.font || fontSettings.header3?.font;
    themeConfig.typography = {
      h1: getTypographyVariant(fontSettings.header1),
      h2: getTypographyVariant(fontSettings.header2),
      h3: getTypographyVariant(fontSettings.header3)
    };
  }

  if (radius !== undefined) {
    themeConfig.borderRadius = radius;
  }

  return themeConfig;
}

export default function AppInitializer() {
  const { shopSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setConfig } = useConfig();
  const { showSnackbar } = useSnackbar();
  const shop = useSelector(selectCurrentShop);
  const loading = useSelector(selectShopLoading);
  const error = useSelector(selectShopError);
  const hasUserDetails = useSelector(selectHasUserDetails);
  const userName = useSelector(selectUserName);
  const userPhoneNumber = useSelector(selectUserPhoneNumber);
  const [userForm, setUserForm] = useState({ name: '', phoneNumber: '' });
  const isActiveShopLoaded = shop?.slug === shopSlug;
  const userDetailsRequired = isActiveShopLoaded && !hasUserDetails;

  const latestStatus = useUserOrderSocket(userPhoneNumber);
  const [readyOrder, setReadyOrder] = useState(null);

  useEffect(() => {
    if (latestStatus && latestStatus.status === 'READY_TO_TABLE') {
      const vendorId = shop ? getShopVendorId(shop) : null;
      if (vendorId && (latestStatus.order_db_id || latestStatus.id)) {
        const controller = new AbortController();
        OrderService.getOrder({
          orderId: latestStatus.order_db_id || latestStatus.id,
          vendorId,
          signal: controller.signal
        })
          .then((fullOrder) => {
            setReadyOrder(fullOrder || latestStatus);
          })
          .catch((err) => {
            console.warn('Failed to fetch full order details:', err);
            setReadyOrder(latestStatus);
          });
        return () => controller.abort();
      } else {
        setReadyOrder(latestStatus);
      }
    }
  }, [latestStatus, shop]);

  const applyThemeConfig = (config) => {
    const updatedConfig = { ...config };
    if (shopSlug === 'burley') {
      updatedConfig.fontFamily = 'Outfit, sans-serif';
      updatedConfig.palette = {
        ...updatedConfig.palette,
        primary: {
          main: '#F8A127',
          light: '#fdf5e6',
          dark: '#e08a1d',
          contrastText: '#3D1D24',
          200: '#ffd54f',
          800: '#b86d11'
        },
        secondary: {
          main: '#3D1D24',
          light: '#f3ecee',
          dark: '#2e151b',
          contrastText: '#ffffff',
          200: '#bda3a9',
          800: '#1e0e11'
        },
        background: {
          default: '#faf8f5',
          paper: '#ffffff'
        },
        text: {
          primary: '#3D1D24',
          secondary: '#6E555A',
          heading: '#3D1D24'
        }
      };
      updatedConfig.typography = {
        ...updatedConfig.typography,
        fontFamily: 'Outfit, sans-serif',
        h1: { fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#3D1D24' },
        h2: { fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#3D1D24' },
        h3: { fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#3D1D24' },
        h4: { fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#3D1D24' },
        h5: { fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#3D1D24' },
        h6: { fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#3D1D24' },
        button: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 }
      };
    }
    setConfig(updatedConfig);
  };

  useEffect(() => {
    setUserForm({
      name: userName || '',
      phoneNumber: userPhoneNumber || ''
    });
  }, [userName, userPhoneNumber]);

  useEffect(() => {
    const controller = new AbortController();

    async function initializeShop() {
      dispatch(setShopLoading());

      try {
        const nextShop = await ShopService.getShopDetails({ shopSlug, signal: controller.signal });
        const vendorId = getShopVendorId(nextShop);

        dispatch(setShopDetails(nextShop));
        setDynamicTitle(nextShop.name);

        const queryUserDetails = getUserDetailsFromSearch(location.search);

        if (queryUserDetails.name || queryUserDetails.phoneNumber) {
          dispatch(setUserDetails(queryUserDetails));
        }

        if (shopSlug === 'burley') {
          // Inject brand font (e.g. Outfit and Playfair Display)
          if (!document.getElementById('brand-fonts')) {
            const link = document.createElement('link');
            link.id = 'brand-fonts';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap';
            document.head.appendChild(link);
          }
        }

        if (nextShop.theme) {
          applyThemeConfig(nextShop.theme);
        }

        try {
          const pageContent = await ShopService.getPageContent({
            signal: controller.signal,
            slug: 'main',
            vendorId
          });
          applyThemeConfig(getThemeConfigFromPageContent(pageContent));
        } catch (themeError) {
          if (themeError.name === 'AbortError') return;

          console.warn('Unable to load shop theme configuration:', themeError);
        }

        dispatch(setCategoriesLoading());

        try {
          const categories = await CategoryService.getCategories({
            signal: controller.signal,
            vendorId
          });

          dispatch(setCategories(categories));
        } catch (categoryError) {
          if (categoryError.name === 'AbortError') return;

          dispatch(setCategoriesError(categoryError.message));
          showSnackbar(categoryError.message || 'Unable to load categories.', { severity: 'error', vertical: 'top', horizontal: 'center', duration: 4000 });
        }
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;

        if (isShopNotFoundError(requestError)) {
          navigate('/error', { replace: true });
          return;
        }

        dispatch(setShopError(requestError.message));
        showSnackbar(requestError.message || 'Unable to load shop details.', { severity: 'error', vertical: 'top', horizontal: 'center', duration: 4000 });
      }
    }

    initializeShop();

    return () => controller.abort();
  }, [dispatch, location.search, navigate, setConfig, shopSlug, showSnackbar]);

  const handleUserFormChange = (field) => (event) => {
    setUserForm((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleSaveUserDetails = (event) => {
    event.preventDefault();

    const name = userForm.name.trim();
    const phoneNumber = userForm.phoneNumber.trim();

    if (!name || !phoneNumber) {
      showSnackbar('Enter your name and phone number.', { severity: 'warning', vertical: 'top', horizontal: 'center', duration: 3000 });
      return;
    }

    if (!/^0\d{9}$/.test(phoneNumber)) {
      showSnackbar('Phone number must be 10 digits starting with 0.', { severity: 'error', vertical: 'top', horizontal: 'center', duration: 4000 });
      return;
    }

    dispatch(setUserDetails({ name, phoneNumber }));
  };

  if (loading && !isActiveShopLoaded) {
    return <PageLoader label="Loading shop..." />;
  }

  if (error && !isActiveShopLoaded) {
    return (
      <Box sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center', px: 2 }}>
        <Stack alignItems="center" spacing={2} sx={{ maxWidth: 420, textAlign: 'center' }}>
          <Typography variant="h2">Shop unavailable</Typography>
          <Typography color="text.secondary">{error}</Typography>
          <Button onClick={() => window.location.reload()} variant="contained">
            Try again
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <MainLayout>
      <Outlet />
      <CustomerDetailsDialog
        onChange={handleUserFormChange}
        onSubmit={handleSaveUserDetails}
        open={userDetailsRequired}
        userForm={userForm}
      />
      <OrderReadyDialog
        open={Boolean(readyOrder)}
        orderId={readyOrder?.order_id || readyOrder?.orderNumber}
        tokenNumber={readyOrder?.dailyToken || readyOrder?.daily_token || readyOrder?.daily_token_number || readyOrder?.token_number || readyOrder?.token}
        onClose={() => setReadyOrder(null)}
      />
    </MainLayout>
  );
}
