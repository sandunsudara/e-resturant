const DEFAULT_CURRENCY = 'LKR';
const DEFAULT_VENDOR_ID = 5;

function titleCaseSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function hashSlug(slug) {
  return slug.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
}

function createLogoDataUri(shopName, color) {
  const initial = shopName.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="20" fill="${color}"/><text x="48" y="59" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="700" fill="#ffffff">${initial}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const palettes = [
  {
    primary: { light: '#d7f5ee', main: '#007c70', dark: '#00564f' },
    secondary: { light: '#ffe2df', main: '#d65045', dark: '#a8332b' },
    background: { default: '#f7fbf8', paper: '#ffffff' },
    text: { primary: '#24302f', secondary: '#5c6f6c' }
  },
  {
    primary: { light: '#e2ecff', main: '#315fbd', dark: '#23458b' },
    secondary: { light: '#fce4ec', main: '#c63c6f', dark: '#8d244b' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#18243a', secondary: '#5c6678' }
  },
  {
    primary: { light: '#e4f4dd', main: '#4d7f28', dark: '#34591a' },
    secondary: { light: '#fff1d6', main: '#b46d13', dark: '#824a08' },
    background: { default: '#fbfbf4', paper: '#ffffff' },
    text: { primary: '#26301d', secondary: '#65705b' }
  }
];

const catalog = [
  {
    id: 'item-espresso',
    categoryId: 18,
    name: 'Cold Brew Bottle',
    description: 'Slow-steeped coffee with a smooth finish.',
    price: 5.5,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80',
    combination: [
      {
        id: 'item-espresso-regular',
        name: 'Regular',
        price: 5.5,
        current_stock: 18,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'item-espresso-large',
        name: 'Large',
        price: 7.25,
        current_stock: 9,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80'
      }
    ]
  },
  {
    id: 'item-bowl',
    categoryId: 18,
    name: 'Seasonal Grain Bowl',
    description: 'Roasted vegetables, greens, seeds, and citrus dressing.',
    price: 12.25,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    combination: [
      {
        id: 'item-bowl-classic',
        name: 'Classic',
        price: 12.25,
        current_stock: 12,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'item-bowl-extra-protein',
        name: 'Extra protein',
        price: 15.5,
        current_stock: 6,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80'
      }
    ]
  },
  {
    id: 'item-pastry',
    categoryId: 18,
    name: 'Almond Morning Bun',
    description: 'Layered pastry with toasted almond and vanilla glaze.',
    price: 4.75,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'item-juice',
    categoryId: 18,
    name: 'Pressed Citrus Juice',
    description: 'Orange, lime, ginger, and a crisp herbal note.',
    price: 6.25,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'item-sandwich',
    categoryId: 18,
    name: 'Garden Sandwich',
    description: 'Herbed cheese, greens, cucumber, and tomato on sourdough.',
    price: 9.75,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'item-dessert',
    categoryId: 8,
    name: 'Chocolate Tart',
    description: 'Dark chocolate ganache, cocoa crust, and sea salt.',
    price: 7.25,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80'
  }
];

const categories = [
  {
    id: 18,
    name: 'Foods and Restaurants',
    slug: 'foods-and-restaurants',
    icon: '',
    priority: 0,
    homeStatus: true,
    is_products_available: 'Y'
  },
  { id: 4, name: 'Electronics', slug: 'electronics', icon: '', priority: 1, homeStatus: true, is_products_available: 'Y' },
  { id: 5, name: 'Clothing', slug: 'clothing', icon: '', priority: 2, homeStatus: true, is_products_available: 'Y' },
  {
    id: 8,
    name: 'Beauty and Cosmetics',
    slug: 'beauty-and-cosmetics',
    icon: '',
    priority: 3,
    homeStatus: true,
    is_products_available: 'Y'
  },
  { id: 12, name: 'Jewelry and Watches', slug: 'jewelry-and-watches', icon: '', priority: 4, homeStatus: true, is_products_available: 'Y' }
];

export function getMockShopDetails(shopSlug) {
  const cleanSlug = shopSlug || 'demo-shop';
  const palette = palettes[hashSlug(cleanSlug) % palettes.length];
  const shopName = titleCaseSlug(cleanSlug) || 'Demo Shop';

  return {
    id: DEFAULT_VENDOR_ID,
    slug: cleanSlug,
    name: shopName,
    vendorId: DEFAULT_VENDOR_ID,
    logo: createLogoDataUri(shopName, palette.primary.main),
    tagline: 'Fresh picks, ready for this shop.',
    currency: DEFAULT_CURRENCY,
    theme: {
      borderRadius: 8,
      palette
    },
    items: catalog.map((item) => ({
      ...item,
      currency: DEFAULT_CURRENCY
    }))
  };
}

export function getMockCategories() {
  return categories.map((category) => ({
    ...category,
    isProductsAvailable: category.is_products_available === 'Y'
  }));
}

export function getMockProducts(categoryId) {
  return catalog
    .filter((item) => !categoryId || categoryId === 'all' || Number(item.categoryId) === Number(categoryId))
    .map((item) => ({
      ...item,
      currency: DEFAULT_CURRENCY
    }));
}
