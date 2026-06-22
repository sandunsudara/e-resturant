import ApiManager from 'app/apiManager';
import { getMockCategories } from 'features/shop/shopMock';
import { getImageUrl } from 'utils/assets';

const ENABLE_MOCK_SHOP_FALLBACK = true;

function normalizeCategories(payload) {
  const categories = payload?.data?.data || payload?.data || payload?.categories || [];

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: getImageUrl({ imageName: category.icon || category.image || '', type: 'category' }),
    priority: category.priority || 0,
    homeStatus: category.homeStatus,
    isProductsAvailable: category.is_products_available === 'Y' || category.isProductsAvailable === true
  }));
}

function waitForMockResponse() {
  return new Promise((resolve) => {
    globalThis.setTimeout(() => resolve(getMockCategories()), 300);
  });
}

export default class CategoryService {
  static async getCategories({ vendorId, signal }) {
    try {
      const payload = await ApiManager.post({ body: { vendor_id: vendorId }, endpoint: '/categories/list', signal });
      return normalizeCategories(payload);
    } catch (error) {
      if (error.name === 'AbortError') throw error;

      if (ENABLE_MOCK_SHOP_FALLBACK) {
        console.warn('Category API failed. Falling back to mock categories:', error);
        return waitForMockResponse();
      }

      throw error;
    }
  }
}
