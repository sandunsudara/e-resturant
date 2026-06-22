import { BASE_URL } from '../config';
import { store } from '../store';

const DEFAULT_VENDOR_ID = 5;

function getRequestVendorId({ body, vendorId }) {
  return body?.vendor_id || body?.vendorId || vendorId || DEFAULT_VENDOR_ID;
}

function shouldAttachJsonVendorId(body) {
  return !body || (typeof body === 'object' && body.constructor === Object);
}

function getUserHeaders() {
  const user = store.getState().user || {};
  const name = String(user.name || '').trim();
  const phone = String(user.phoneNumber || '').trim();

  return {
    ...(name ? { name } : {}),
    ...(phone ? { phone } : {})
  };
}

export default class ApiManager {
  static get baseUrl() {
    return BASE_URL.replace(/\/$/, '');
  }

  static hasBaseUrl() {
    return Boolean(ApiManager.baseUrl);
  }

  static buildUrl(endpoint) {
    if (/^https?:\/\//i.test(endpoint)) return endpoint;
    return `${ApiManager.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  static buildRequestUrl({ endpoint, isVendorIdHide, method, vendorId }) {
    const requestUrl = ApiManager.buildUrl(endpoint);

    if (isVendorIdHide || method !== 'GET') return requestUrl;

    const url = new URL(requestUrl, globalThis.location?.origin || 'http://localhost');

    if (!url.searchParams.has('vendor_id')) {
      url.searchParams.set('vendor_id', vendorId || DEFAULT_VENDOR_ID);
    }

    return /^https?:\/\//i.test(requestUrl) ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
  }

  static buildRequestBody({ body, isVendorIdHide, vendorId }) {
    if (isVendorIdHide || !shouldAttachJsonVendorId(body)) return body;

    const requestBody = body ? { ...body } : {};

    if (!requestBody.vendor_id) {
      requestBody.vendor_id = getRequestVendorId({ body, vendorId });
    }

    return requestBody;
  }

  static async request({ body, endpoint, headers, isVendorIdHide = false, method = 'GET', vendorId, ...fetchOptions }) {
    if (!ApiManager.hasBaseUrl() && !/^https?:\/\//i.test(endpoint)) {
      throw new Error('API base URL is not configured.');
    }

    const requestBody = method === 'GET' ? undefined : ApiManager.buildRequestBody({ body, isVendorIdHide, vendorId });

    const response = await fetch(ApiManager.buildRequestUrl({ endpoint, isVendorIdHide, method, vendorId }), {
      ...fetchOptions,
      method,
      headers: {
        Accept: 'application/json',
        ...(requestBody ? { 'Content-Type': 'application/json' } : {}),
        ...getUserHeaders(),
        ...headers
      },
      body: requestBody && typeof requestBody === 'object' ? JSON.stringify(requestBody) : requestBody
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = payload?.message || payload || `Request failed with status ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  }

  static get({ endpoint, ...options }) {
    return ApiManager.request({ ...options, endpoint, method: 'GET' });
  }

  static post({ body, endpoint, requestBody, ...options }) {
    return ApiManager.request({ ...options, body: body ?? requestBody, endpoint, method: 'POST' });
  }
}
