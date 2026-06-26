import ApiManager from 'app/apiManager';
import { getMockProducts } from 'features/shop/shopMock';
import { getImageUrl } from 'utils/assets';

const DEFAULT_CURRENCY = 'LKR';
const ENABLE_MOCK_SHOP_FALLBACK = true;

function firstPresent(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function toNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function isDeletedRecord(record) {
  return (
    record?.is_deleted === true || record?.isDeleted === true || String(record?.is_deleted || record?.isDeleted || '').toUpperCase() === 'Y'
  );
}

function extractOptionLabel(option) {
  if (!option) return '';
  if (typeof option !== 'object') return String(option);

  const optionValue = firstPresent(
    option.value,
    option.name,
    option.label,
    option.title,
    option.attribute_value,
    option.attributeValue,
    option.attribute_value_name,
    option.attributeValueName,
    option.option,
    option.option_name,
    option.optionName
  );

  if (optionValue) return String(optionValue);

  const nestedValue = firstPresent(option.attribute?.value, option.attribute?.name, option.value_data?.value, option.valueData?.value);
  return nestedValue ? String(nestedValue) : '';
}

function getCombinationLabel(combination, index) {
  const directLabel = firstPresent(
    combination.name,
    combination.label,
    combination.title,
    combination.combination_name,
    combination.combinationName,
    combination.variant_name,
    combination.variantName,
    combination.variation,
    combination.sku
  );

  if (directLabel) return String(directLabel);

  const optionGroups = [
    combination.attributes,
    combination.attribute_values,
    combination.attributeValues,
    combination.values,
    combination.options,
    combination.variation_values,
    combination.variationValues,
    combination.product_attributes,
    combination.productAttributes
  ];

  const optionLabels = optionGroups
    .filter(Array.isArray)
    .flatMap((group) => group.map(extractOptionLabel))
    .filter(Boolean);

  return optionLabels.length ? optionLabels.join(' / ') : `Option ${index + 1}`;
}

function normalizeCombination(combination, product, index) {
  const id = firstPresent(combination.id, combination.variation_id, combination.variationId, combination.sku, `${product.id}-${index}`);
  const rawStock = firstPresent(
    combination.current_stock,
    combination.currentStock,
    combination.stock,
    combination.qty,
    combination.quantity
  );
  const stockNumber = rawStock === undefined ? null : Number(rawStock);
  const stockLabel = Number.isFinite(stockNumber) ? `${stockNumber} left` : 'Available';
  const status = String(combination.status || '').toUpperCase();
  const available = !isDeletedRecord(combination) && status !== 'INACTIVE' && (!Number.isFinite(stockNumber) || stockNumber > 0);

  return {
    id,
    variationId: firstPresent(combination.variation_id, combination.variationId, combination.id, 0),
    label: getCombinationLabel(combination, index),
    price: toNumber(firstPresent(combination.price, combination.unit_price, combination.unitPrice, product.unit_price, product.price), 0),
    currency: combination.currency || product.currency || DEFAULT_CURRENCY,
    image: getImageUrl({
      imageName: firstPresent(combination.image, combination.thumbnail, combination.meta_image, combination.metaImage, ''),
      type: 'brand'
    }),
    currentStock: Number.isFinite(stockNumber) ? stockNumber : undefined,
    stockLabel,
    available,
    raw: combination
  };
}

function normalizeProduct(product) {
  const combinations = Array.isArray(product.combination)
    ? product.combination
        .filter((variation) => !isDeletedRecord(variation))
        .map((variation, index) => normalizeCombination(variation, product, index))
    : [];
  const firstVariation = combinations[0];
  const price = toNumber(firstPresent(firstVariation?.price, product.unit_price, product.price, product.purchase_price), 0);

  return {
    id: product.id,
    name: product.name,
    description: product.short_description || product.description || '',
    price,
    currency: product.currency || DEFAULT_CURRENCY,
    image: getImageUrl({
      imageName: firstPresent(firstVariation?.image, product.thumbnail, product.image, product.meta_image, ''),
      type: 'brand'
    }),
    badgeLabel: product.badge_label || product.badgeLabel || '',
    combinations,
    currentStock: product.current_stock,
    productId: product.id,
    slug: product.slug,
    variationId: firstVariation?.variationId || 0,
    raw: product
  };
}

function normalizeProducts({ limit, page, payload }) {
  const responseData = payload?.data || payload;
  const products = responseData?.data || responseData?.products || (Array.isArray(responseData) ? responseData : []);
  const currentPage = Number(responseData?.currentPage || page);
  const total = Number(responseData?.total || products.length);
  const totalPages = Number(responseData?.totalPages || (products.length < limit ? currentPage : currentPage + 1));

  return {
    currentPage,
    hasMore: currentPage < totalPages,
    items: products.map(normalizeProduct),
    total,
    totalPages
  };
}

function waitForMockResponse({ categoryId, limit, page }) {
  return new Promise((resolve) => {
    const products = getMockProducts(categoryId);
    const startIndex = (page - 1) * limit;
    const items = products.slice(startIndex, startIndex + limit).map(normalizeProduct);
    const totalPages = Math.max(Math.ceil(products.length / limit), 1);

    globalThis.setTimeout(
      () =>
        resolve({
          currentPage: page,
          hasMore: page < totalPages,
          items,
          total: products.length,
          totalPages
        }),
      350
    );
  });
}

export default class ProductService {
  static async getProducts({ categoryId, limit = 8, page = 1, signal, vendorId }) {
    const requestBody = {
      is_approved: 'APPROVED',
      vendor_id: vendorId,
      status: 'ACTIVE',
      // type: 'NEW_ARRIVALS',
      sort_by: 'LATEST',
      page,
      limit
    };

    if (categoryId && categoryId !== 'all') {
      requestBody.category_id = categoryId;
    }

    try {
      const payload = await ApiManager.post({ body: requestBody, endpoint: '/products/list', signal });
      return normalizeProducts({ limit, page, payload });
    } catch (error) {
      if (error.name === 'AbortError') throw error;

      if (ENABLE_MOCK_SHOP_FALLBACK) {
        console.warn('Product API failed. Falling back to mock products:', error);
        return waitForMockResponse({ categoryId, limit, page });
      }

      throw error;
    }
  }

  static async getProductById(productId, signal) {
    const payload = await ApiManager.post({
      body: { product_id: productId },
      endpoint: '/products/view',
      signal
    });
    return payload?.data || payload;
  }
}
