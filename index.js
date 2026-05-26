// Builders
export { createGtmBuilders } from './gtm';
export { createGa4Builders } from './ga4';
// createGaBuilders (Universal Analytics) removed in v2.2.0 — GA was sunset July 2023

// Resolvers
export { transformUserProfile, transformConsents } from './resolvers/customer';
export {
	transformProductItem,
	transformPurchasePayment,
	transformBundleSetsItems,
	orderDetailProductPrice,
	productCategory,
	productPrice,
} from './resolvers/order';

// Helpers
// gaWrapper removed in v2.2.0 (UA-only helper)
export { convertSatangToBaht, convertSatangToBahtWithDecimal } from './helpers/numeral';
export { getProductDetailRouteObject } from './helpers/route';
export { getCustomerIdFromGACookie } from './helpers/ga';
export { dateTimeFormat } from './helpers/date';
export {
	transformConsentModeV2,
	buildConsentUpdatePayload,
	buildConsentDefaultPayload,
} from './helpers/consent';

// Enums
export { default as ADD_TO_CART_ACTION_TYPE } from './enums/addToCartActionType';
export { default as ADD_TO_CART_TYPE } from './enums/addToCartType';
export { default as CHECKOUT_EVENT } from './enums/checkoutEvent';
export { default as CHECKOUT_STEP_TYPE } from './enums/checkoutStepType';
export { default as COUPON_ACTION_TYPE } from './enums/couponActionType';
export { default as CUSTOMER_CORPORATE_RANK } from './enums/customerCorporateRanks';
export { default as MEDIA_GALLERY_TYPE } from './enums/mediaGalleryType';
export { default as MENU_POSITION } from './enums/menuPosition';
export { default as PDPA_KEYS } from './enums/pdpaKeys';
export { default as PRODUCT_REFERRER_SLUG } from './enums/productReferrerSlug';
export { default as PRODUCT_SORTING_KEYS } from './enums/productSortingKeys';
export { default as PRODUCT_TYPE } from './enums/productType';
export { default as PROMOTION_TYPE } from './enums/promotionType';
export { default as PROVIDER } from './enums/provider';
export { default as WIDGET_HOMEPAGE_TYPE } from './enums/widgetHomepageType';
export { default as WISHLIST } from './enums/wishlist';
