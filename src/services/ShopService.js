import { getImageUrl } from '../utils/assets';
import { getMockShopDetails } from '../features/shop/shopMock';
import ApiManager from '../app/apiManager';

const ENABLE_MOCK_SHOP_FALLBACK = true;

function normalizeShopResponse(payload, shopSlug) {
  const vendor = payload?.data || payload?.vendor || payload;
  const shop = vendor?.shop || payload?.shop || vendor;
  const shopImage = shop.logo || shop.logoUrl || shop.logo_url || shop.brandLogo || shop.brand_logo || shop.image || '';
  const vendorId = vendor?.id || shop.vendor_id || shop.vendorId || shop.id;
  const shopName = shop.name || [vendor?.f_name, vendor?.l_name].filter(Boolean).join(' ') || 'Shop';

  return {
    ...shop,
    name: shopName,
    currency: shop.currency || shop.default_currency || undefined,
    logo: getImageUrl({ imageName: shopImage, type: 'profile' }),
    slug: shop.slug || shopSlug,
    vendor,
    vendorId,
    vendor_id: vendorId
  };
}

function waitForMockResponse(shopSlug) {
  return new Promise((resolve) => {
    globalThis.setTimeout(() => resolve(getMockShopDetails(shopSlug)), 250);
  });
}

function isVendorNotFoundError(error) {
  return error.status === 404 || /vendor.*not found|not found/i.test(error.message || '');
}

export default class ShopService {
  static async getShopDetails({ shopSlug, signal }) {
    try {
      const payload = await ApiManager.post({
        body: { slug: shopSlug },
        endpoint: '/vendor/view-by-slug',
        isVendorIdHide: true,
        signal
      });
      return normalizeShopResponse(payload, shopSlug);
    } catch (error) {
      if (error.name === 'AbortError') throw error;

      if (isVendorNotFoundError(error)) throw error;

      if (ENABLE_MOCK_SHOP_FALLBACK) {
        console.warn('Shop API failed. Falling back to mock shop data:', error);
        return waitForMockResponse(shopSlug);
      }

      throw error;
    }
  }

  static async getPageContent({ signal, slug, vendorId }) {
    try {
      const response = await ApiManager.post({
        endpoint: '/template-page/view',
        requestBody: {
          path: slug,
          ...(vendorId ? { vendor_id: vendorId } : {})
        },
        signal
      });
      return response?.data || response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch signup template';
      if (error.response?.status === 404 || errorMessage.includes('vendor')) {
        return {
          components: null, // This will trigger default template usage
          message: 'Vendor signup template not found, using default'
        };
      }
    }
  }
}
