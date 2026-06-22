import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useSnackbar } from 'components/Snackbar/SnackbarProvider';
import ShopItemCombinationModal from 'components/ShopItemCombinationModal/ShopItemCombinationModal';
import ShopItemCard from 'components/ShopItemCard/ShopItemCard';
import ShopItemCardSkeleton from 'components/ShopItemCard/ShopItemCardSkeleton';
import { addItem } from 'features/cart/cartSlice';
import ProductService from 'services/ProductService';
import { getShopVendorId } from 'utils/shopUtils';
import {
  selectCurrentShop,
  selectProducts,
  selectProductsError,
  selectProductsHasMore,
  selectProductsLoading,
  selectProductsLoadingMore,
  selectProductsPage,
  selectSelectedCategoryId,
  setProducts,
  setProductsError,
  setProductsLoading
} from '../shopSlice';
import CategoryNav from '../../../components/CategoryNav/CategoryNav';

const PRODUCT_PAGE_LIMIT = 8;

export default function ShopHomePage() {
  const { shopSlug } = useParams();
  const dispatch = useDispatch();
  const { showSnackbar } = useSnackbar();
  const loadMoreInFlightRef = useRef(false);
  const [combinationProduct, setCombinationProduct] = useState(null);
  const shop = useSelector(selectCurrentShop);
  const items = useSelector(selectProducts);
  const productsHasMore = useSelector(selectProductsHasMore);
  const productsLoading = useSelector(selectProductsLoading);
  const productsLoadingMore = useSelector(selectProductsLoadingMore);
  const productsPage = useSelector(selectProductsPage);
  const productsError = useSelector(selectProductsError);
  const selectedCategoryId = useSelector(selectSelectedCategoryId);

  const loadProducts = useCallback(
    async ({ append = false, page = 1, signal }) => {
      if (!shop) return;

      dispatch(setProductsLoading({ append }));

      try {
        const products = await ProductService.getProducts({
          categoryId: selectedCategoryId,
          limit: PRODUCT_PAGE_LIMIT,
          page,
          signal,
          vendorId: getShopVendorId(shop)
        });

        dispatch(setProducts({ ...products, append }));
      } catch (error) {
        if (error.name === 'AbortError') return;

        dispatch(setProductsError(error.message));
        showSnackbar(error.message || 'Unable to load products.', 'error');
      }
    },
    [dispatch, selectedCategoryId, shop, showSnackbar]
  );

  useEffect(() => {
    if (!shop) return undefined;

    const controller = new AbortController();
    loadProducts({ page: 1, signal: controller.signal });

    return () => controller.abort();
  }, [loadProducts, shop]);

  useEffect(() => {
    if (productsLoading || productsLoadingMore || !productsHasMore) return undefined;

    const handleScroll = () => {
      if (loadMoreInFlightRef.current) return;

      const scrollPosition = window.scrollY + window.innerHeight;
      const loadMorePosition = document.documentElement.scrollHeight - 240;

      if (scrollPosition < loadMorePosition) return;

      loadMoreInFlightRef.current = true;
      loadProducts({
        append: true,
        page: productsPage + 1
      }).finally(() => {
        loadMoreInFlightRef.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadProducts, productsHasMore, productsLoading, productsLoadingMore, productsPage]);

  const addItemToCart = (item) => {
    dispatch(addItem({ shopSlug, item }));
    showSnackbar(`${item.name} added to cart.`, 'success');
  };

  const handleAddItem = (item) => {
    if (item.combinations?.length) {
      setCombinationProduct(item);
      return;
    }

    addItemToCart(item);
  };

  const handleAddCombinationItem = (item) => {
    addItemToCart(item);
    setCombinationProduct(null);
  };

  return (
    <Stack spacing={3}>
      <CategoryNav />
      <Box
        sx={{
          alignItems: { xs: 'flex-start', md: 'center' },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ maxWidth: 680 }}>
          <Chip color="secondary" label="Open for orders" size="small" sx={{ mb: 0.5 }} />
          {/*<Typography variant="h1">{shop?.name || 'Shop'}</Typography>*/}
          <Typography color="text.secondary"  variant="body1">
            {shop?.tagline || 'Choose an item and add it to your cart.'}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          px: 0.2,
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))'
        }}
      >
        {productsLoading
          ? Array.from({ length: PRODUCT_PAGE_LIMIT }).map((_, index) => <ShopItemCardSkeleton key={index} />)
          : items.map((item) => <ShopItemCard key={item.id} currency={shop?.currency} item={item} onAddItem={handleAddItem} />)}
      </Box>

      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          minHeight: productsLoadingMore ? 72 : 1,
          py: productsLoadingMore ? 2 : 0
        }}
      >
        {productsLoadingMore ? <CircularProgress aria-label="Loading more products" size={32} /> : null}
      </Box>

      {!productsLoading && !productsLoadingMore && productsError ? (
        <Typography color="error" textAlign="center" variant="body2">
          {productsError}
        </Typography>
      ) : null}

      {!productsLoading && !productsError && items.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" variant="body2">
          No products available.
        </Typography>
      ) : null}

      <ShopItemCombinationModal
        currency={shop?.currency}
        onAddItem={handleAddCombinationItem}
        onClose={() => setCombinationProduct(null)}
        open={Boolean(combinationProduct)}
        product={combinationProduct}
      />
    </Stack>
  );
}
