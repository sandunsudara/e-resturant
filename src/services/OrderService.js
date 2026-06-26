import ApiManager from 'app/apiManager';
import { getImageUrl } from 'utils/assets';

const DEFAULT_ORDER_USER_ID = null;

const defaultCustomer = {
  contact_name: 'sasa sudara',
  contact_phone: '94768758662',
  email: 'sasasudara@gmail.com',
  address_type: 'Home'
};

function normalizeOrderProducts(items) {
  return items.map((item) => ({
    product_id: item.productId || item.id,
    variation_id: item.variationId || 0,
    qty: item.quantity
  }));
}

function firstPresent(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function normalizeOrderItems(order) {
  const items = firstPresent(
    order.orderProducts,
    order.order_products,
    order.product,
    order.products,
    order.items,
    order.details,
    order.order_details,
    order.orderDetails,
    []
  );

  return (Array.isArray(items) ? items : []).map((item, index) => ({
    id: firstPresent(item.id, item.product_id, item.productId, index),
    name: firstPresent(item.name, item.product_name, item.productName, item.product?.name, `Item ${index + 1}`),
    quantity: Number(firstPresent(item.qty, item.quantity, item.pivot?.qty, 1)),
    price: Number(
      firstPresent(item.price, item.purchase_price, item.purchasePrice, item.unit_price, item.unitPrice, item.product?.unit_price, 0)
    ),
    image: getImageUrl({
      imageName: firstPresent(item.product?.thumbnail, item.product?.image, item.thumbnail, item.image, ''),
      type: 'brand'
    }),
    status: firstPresent(item.status, 'PENDING'),
    variation: firstPresent(
      item.variation,
      item.variation_name,
      item.variationName,
      item.variant,
      item.productAttributeCombination?.name,
      ''
    )
  }));
}

function normalizeOrder(order, index) {
  return {
    id: firstPresent(order.id, order.order_id, order.orderId, index),
    orderNumber: firstPresent(
      order.order_id,
      order.orderId,
      order.order_number,
      order.orderNumber,
      order.order_no,
      order.orderNo,
      order.id,
      `Order ${index + 1}`
    ),
    status: firstPresent(order.order_status, order.orderStatus, order.status, 'PENDING'),
    paymentStatus: firstPresent(order.payment_status, order.paymentStatus, ''),
    paymentMethod: firstPresent(order.payment_method, order.paymentMethod, ''),
    total: Number(firstPresent(order.order_amount, order.orderAmount, order.total, order.grand_total, order.grandTotal, 0)),
    createdAt: firstPresent(order.created_datetime, order.created_at, order.createdAt, order.date, ''),
    shippingAddress: firstPresent(order.shipping_address, order.shippingAddress, order.shipping, null),
    billingAddress: firstPresent(order.billing_address, order.billingAddress, order.billing, null),
    items: normalizeOrderItems(order),
    dailyToken: firstPresent(order.daily_token, order.dailyToken, order.daily_token_number, order.dailyTokenNumber, ''),
    raw: order
  };
}

function normalizeOrders(payload) {
  const responseData = payload?.data || payload;
  const orders = responseData?.data || responseData?.orders || responseData?.order || (Array.isArray(responseData) ? responseData : []);

  return (Array.isArray(orders) ? orders : []).map(normalizeOrder);
}

export default class OrderService {
  static async createOrder({
    activeSessionId,
    billing = { ...defaultCustomer, country: 'Sri Lanka' },
    isAddressSave = 'N',
    isDefaultAddress = 'N',
    items,
    paymentMethod = 'CASH',
    returnUrlBase,
    shipping = { ...defaultCustomer, country: 'Srilanka' },
    shippingMethod = 'PICK_UP',
    signal,
    userId = DEFAULT_ORDER_USER_ID,
    vendorId
  }) {
    const body = {
      shipping_method: shippingMethod,
      is_default_address: isDefaultAddress,
      is_address_save: isAddressSave,
      user_id: userId,
      product: normalizeOrderProducts(items),
      shipping,
      billing,
      payment_method: paymentMethod,
      return_url_base: returnUrlBase,
      ...(activeSessionId ? { session_id: activeSessionId } : {})
    };

    return ApiManager.post({ body, endpoint: '/order/create', signal, vendorId });
  }

  static async getOrders({ limit = 20, page = 1, signal, userId = DEFAULT_ORDER_USER_ID, vendorId }) {
    const payload = await ApiManager.post({
      body: {
        user_id: userId,
        page,
        limit
      },
      endpoint: '/order/list',
      signal,
      vendorId
    });

    return normalizeOrders(payload);
  }

  static async getOrder({ activeSessionId, orderId = null, signal, vendorId }) {
    const body = {
      ...(activeSessionId ? { session_id: activeSessionId } : {}),
      ...(orderId !== null ? { order_id: orderId } : {})
    };

    const payload = await ApiManager.post({
      body,
      endpoint: '/order/view',
      signal,
      vendorId
    });

    console.log(payload);

    return payload?.data ? normalizeOrder(payload.data) : null;
  }

  static async updateOrderStatus({ sessionId, status, vendorId, signal }) {
    const body = {
      session_id: sessionId,
      status
    };

    return ApiManager.post({
      body,
      endpoint: '/order/status/update',
      signal,
      vendorId
    });
  }
}
