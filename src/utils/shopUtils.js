const DEFAULT_VENDOR_ID = 5;

export function getShopVendorId(shop) {
  const rawVendorId = shop?.vendor_id || shop?.vendorId || shop?.id;
  const vendorId = Number(rawVendorId);

  return Number.isFinite(vendorId) && vendorId > 0 ? vendorId : DEFAULT_VENDOR_ID;
}
