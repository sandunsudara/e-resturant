import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentShop: null,
  loading: false,
  error: null,
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  products: [],
  productsLoading: false,
  productsLoadingMore: false,
  productsError: null,
  productsPage: 1,
  productsTotalPages: 1,
  productsHasMore: false,
  selectedCategoryId: 'all'
};

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    setShopLoading(state) {
      state.loading = true;
      state.error = null;
      state.categories = [];
      state.categoriesError = null;
      state.products = [];
      state.productsError = null;
      state.productsPage = 1;
      state.productsTotalPages = 1;
      state.productsHasMore = false;
      state.productsLoadingMore = false;
      state.selectedCategoryId = 'all';
    },
    setShopDetails(state, action) {
      state.currentShop = action.payload;
      state.loading = false;
      state.error = null;
    },
    setShopError(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setCategoriesLoading(state) {
      state.categoriesLoading = true;
      state.categoriesError = null;
    },
    setCategories(state, action) {
      state.categories = action.payload;
      state.categoriesLoading = false;
      state.categoriesError = null;
    },
    setCategoriesError(state, action) {
      state.categoriesLoading = false;
      state.categoriesError = action.payload;
    },
    setProductsLoading(state, action) {
      const append = Boolean(action.payload?.append);

      if (append) {
        state.productsLoadingMore = true;
      } else {
        state.products = [];
        state.productsLoading = true;
        state.productsPage = 1;
        state.productsTotalPages = 1;
        state.productsHasMore = false;
      }

      state.productsError = null;
    },
    setProducts(state, action) {
      const { append, currentPage, hasMore, items, totalPages } = action.payload;
      const nextItems = items || [];

      if (append) {
        const existingIds = new Set(state.products.map((product) => product.id));
        state.products = [...state.products, ...nextItems.filter((product) => !existingIds.has(product.id))];
      } else {
        state.products = nextItems;
      }

      state.productsLoading = false;
      state.productsLoadingMore = false;
      state.productsError = null;
      state.productsPage = currentPage || 1;
      state.productsTotalPages = totalPages || 1;
      state.productsHasMore = Boolean(hasMore);
    },
    setProductsError(state, action) {
      state.productsLoading = false;
      state.productsLoadingMore = false;
      state.productsError = action.payload;
    },
    setSelectedCategoryId(state, action) {
      state.selectedCategoryId = action.payload;
    }
  }
});

export const {
  setCategories,
  setCategoriesError,
  setCategoriesLoading,
  setProducts,
  setProductsError,
  setProductsLoading,
  setSelectedCategoryId,
  setShopDetails,
  setShopError,
  setShopLoading
} = shopSlice.actions;

export function selectCurrentShop(state) {
  return state.shop.currentShop;
}

export function selectShopBrand(state) {
  const shop = selectCurrentShop(state);

  return {
    logo: shop?.logo || shop?.logoUrl || '',
    name: shop?.name || 'Shop',
    slug: shop?.slug || ''
  };
}

export function selectShopError(state) {
  return state.shop.error;
}

export function selectShopLoading(state) {
  return state.shop.loading;
}

export function selectCategories(state) {
  return state.shop.categories;
}

export function selectCategoriesError(state) {
  return state.shop.categoriesError;
}

export function selectCategoriesLoading(state) {
  return state.shop.categoriesLoading;
}

export function selectProducts(state) {
  return state.shop.products;
}

export function selectProductsError(state) {
  return state.shop.productsError;
}

export function selectProductsLoading(state) {
  return state.shop.productsLoading;
}

export function selectProductsLoadingMore(state) {
  return state.shop.productsLoadingMore;
}

export function selectProductsPage(state) {
  return state.shop.productsPage;
}

export function selectProductsHasMore(state) {
  return state.shop.productsHasMore;
}

export function selectSelectedCategoryId(state) {
  return state.shop.selectedCategoryId;
}

export default shopSlice.reducer;
