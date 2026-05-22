import { convertSatangToBahtWithDecimal } from './helpers/numeral';
import { getProductDetailRouteObject } from './helpers/route';
import { getCustomerIdFromGACookie } from './helpers/ga';
import { dateTimeFormat } from './helpers/date';
import { transformConsentModeV2, buildConsentUpdatePayload, buildConsentDefaultPayload } from './helpers/consent';

import {
	transformProductItem,
	transformPurchasePayment,
	transformBundleSetsItems,
	orderDetailProductPrice,
} from './resolvers/order';
import { transformConsents, transformUserProfile } from './resolvers/customer';


import CHECKOUT_EVENT from './enums/checkoutEvent';
import PROMOTION_TYPE from './enums/promotionType';
import PRODUCT_REFERRER_SLUG from './enums/productReferrerSlug';
import ADD_TO_CART_TYPE from './enums/addToCartType';
import PRODUCT_TYPE from './enums/productType';

const productURL = (product, app, productDetailRouteName) => {
	if (!app || !app.localePath) {
		return null;
	}
	return `${process.env.APP_BASE_URL}${app.localePath(getProductDetailRouteObject(product, productDetailRouteName))}`;
};

const getCouponCode = (promotions) => {
	if (!promotions) {
		return '';
	}

	const promotionCodes = promotions
		.filter((promotion) => promotion.code)
		.map((promotion) => promotion.code);
	return promotionCodes.join();
};

const getPromotionName = (promotions) => {
	if (!promotions) {
		return '';
	}

	// Case checkout data layer
	if (promotions.promotions) {
		const promotionCodes = promotions.promotions
			.filter((promotion) => promotion.type === PROMOTION_TYPE.GENERAL)
			.map((promotion) => promotion.label);
		return promotionCodes.join();
	}

	const promotionCodes = promotions
		.filter((promotion) => promotion.type === PROMOTION_TYPE.GENERAL)
		.map((promotion) => promotion.displayName);
	return promotionCodes.join();
};

const getTotalLine = (products) => {
	const specificFreeGiftsReducer = (acc, cur) => {
		if (!cur.freeGifts || !cur.freeGifts.items) {
			return acc;
		}

		return acc + cur.freeGifts.items.length;
	};

	const productItemsLength = products.productItems?.length ?? 0;
	const freeGiftsLength = products.freeGifts?.items?.length ?? 0;
	const specificFreeGiftsLength = products.productItems.reduce(specificFreeGiftsReducer, 0);

	return productItemsLength + freeGiftsLength + specificFreeGiftsLength;
};

const getCurrentDate = () => {
	return dateTimeFormat(new Date());
};

const checkoutEventName = (step) => {
	switch (step) {
		case 1:
			return CHECKOUT_EVENT.CART;
		case 2:
			return CHECKOUT_EVENT.SHIPPING;
		case 3:
			return CHECKOUT_EVENT.PAYMENT;
		case 4:
			return CHECKOUT_EVENT.REVIEW_ORDER;
		case 5:
			return CHECKOUT_EVENT.PLACE_ORDER;
		case 6:
			return CHECKOUT_EVENT.SESSIONS_WITH_TRANSACTIONS;
		default:
			return 'checkout';
	}
};

export const createGtmBuilders = ({ config, dataLayerPush }) => ({
	clearEcommerce() {
		dataLayerPush({ ecommerce: null });
	},

	// ─────────────────────────────────────────────────────────────────────────
	// Consent Mode v2
	// Fire consentDefault() BEFORE any other tags on page load (via GTM init trigger)
	// Fire consentUpdate() whenever the user changes their PDPA preferences
	// ─────────────────────────────────────────────────────────────────────────

	consentDefault() {
		dataLayerPush(buildConsentDefaultPayload());
	},

	consentUpdate(cookieConsents = []) {
		dataLayerPush(buildConsentUpdatePayload(cookieConsents));
	},

	// ─────────────────────────────────────────────────────────────────────────
	// Auth events
	// ─────────────────────────────────────────────────────────────────────────

	async register(profile, provider = null) {
		dataLayerPush({ ecommerce: null });
		dataLayerPush({
			event: 'register',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currency: config.CURRENCY_CODE,
				profile: {
					...transformUserProfile(profile),
					provider,
				},
			},
		});
	},

	async login({ profile }, { cookieConsents }, cid) {
		dataLayerPush({ ecommerce: null });
		dataLayerPush({
			event: 'login',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currency: config.CURRENCY_CODE,
				profile: {
					customerId: getCustomerIdFromGACookie(cid),
					...transformUserProfile(profile),
				},
				consent: transformConsents(cookieConsents),
				consentModeV2: transformConsentModeV2(cookieConsents),
			},
		});
	},

	async logout({ profile }, { cookieConsents }, cid) {
		dataLayerPush({ ecommerce: null });
		dataLayerPush({
			event: 'logout',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currency: config.CURRENCY_CODE,
				profile: {
					customerId: getCustomerIdFromGACookie(cid),
					...transformUserProfile(profile),
				},
				consent: transformConsents(cookieConsents),
				consentModeV2: transformConsentModeV2(cookieConsents),
			},
		});
	},

	async updateProfile(profile) {
		dataLayerPush({
			event: 'updateProfile',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currency: config.CURRENCY_CODE,
				profile: transformUserProfile(profile),
			},
		});
	},

	// ─────────────────────────────────────────────────────────────────────────
	// GA4 Ecommerce events
	// All events below now use GA4 standard event names + ecommerce.items[] schema
	// Reference: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * GA4: select_item  (was: productClick)
	 */
	async productClick(productObj, productPosition, productReferrer = PRODUCT_REFERRER_SLUG.LIST) {
		if (!productObj || !productObj.name || !productObj.sku) {
			return;
		}

		dataLayerPush({ ecommerce: null });
		dataLayerPush({
			event: 'select_item',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currency: config.CURRENCY_CODE,
				item_list_name: productReferrer,
				items: [{
					...transformProductItem(productObj),
					index: productPosition,
					item_list_name: productReferrer,
				}],
			},
		});
	},

	/**
	 * GA4: view_cart  (was: viewCart — used to be step-based checkout)
	 * Note: The “step” param is kept for GTM custom dim compat but no longer goes into actionField
	 */
	async viewCart(products, step) {
		if (!products || !Array.isArray(products.productItems)) {
			return;
		}

		const actionName = checkoutEventName(step);

		const items = [
			...products.productItems.map((product) => ({
				...transformProductItem(product),
				item_list_name: product.list,
				a2cType: product.addToCartType,
			})),
			...transformBundleSetsItems(products.bundleSets),
			...(products.freeGifts?.items?.map((product) => ({
				...transformProductItem(product),
				productType: PRODUCT_TYPE.FREEBIES,
				item_list_name: product.list,
				a2cType: product.addToCartType,
			})) ?? []),
		];

		dataLayerPush({ ecommerce: null });
		dataLayerPush({
			event: 'view_cart',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			// Custom fields for internal step tracking
			checkoutStep: step,
			checkoutAction: actionName,
			ecommerce: {
				currency: config.CURRENCY_CODE,
				value: products.grandTotal ? convertSatangToBahtWithDecimal(products.grandTotal) : '0.00',
				items,
				// Custom summary fields
				totalQuantities: products.totalQuantities,
				subTotal: products.subTotal,
				grandTotal: products.grandTotal,
			},
		});
	},

	/**
	 * GA4: add_to_cart  (was: addToCart)
	 */
	async addToCart(products, productReferrer = PRODUCT_REFERRER_SLUG.LIST, a2cType = ADD_TO_CART_TYPE.STANDARD) {
		if (!Array.isArray(products)) {
			return;
		}

		dataLayerPush({ ecommerce: null });
		dataLayerPush({
			event: 'add_to_cart',
			channel: config.CHANNEL,
			a2cType,
			date: getCurrentDate(),
			ecommerce: {
				currency: config.CURRENCY_CODE,
				item_list_name: productReferrer,
				items: products.map((p) => ({
					...transformProductItem(p),
					item_list_name: productReferrer,
				})),
			},
		});
	},

	/**
	 * GA4: remove_from_cart  (was: removeFromCart)
	 */
	async removeFromCart(products) {
		if (!Array.isArray(products)) {
			return;
		}

		dataLayerPush({ ecommerce: null });
		dataLayerPush({
			event: 'remove_from_cart',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currency: config.CURRENCY_CODE,
				items: products.map(transformProductItem),
			},
		});
	},

	/**
	 * GA4: begin_checkout  (was: checkout)
	 */
	async checkout(products, step, profile) {
		if (!products || !Array.isArray(products.productItems)) {
			return;
		}

		const couponCode = products.coupons ? getCouponCode(products.coupons) : '';
		const promotionName = products.promotions ? getPromotionName(products.promotions) : '';
		const actionName = checkoutEventName(step);

		const items = [
			...products.productItems.map((product) => ({
				...transformProductItem(product),
				item_list_name: product.list,
				coupon: couponCode || undefined,
				a2cType: product.addToCartType,
			})),
			...transformBundleSetsItems(products.bundleSets),
			...(products.freeGifts?.items?.map((product) => ({
				...transformProductItem(product),
				productType: PRODUCT_TYPE.FREEBIES,
				item_list_name: product.list,
				a2cType: product.addToCartType,
			})) ?? []),
		];

		dataLayerPush({ ecommerce: null });
		dataLayerPush({
			event: 'begin_checkout',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			checkoutStep: step,
			checkoutAction: actionName,
			ecommerce: {
				currency: config.CURRENCY_CODE,
				value: products.grandTotal ? convertSatangToBahtWithDecimal(products.grandTotal) : '0.00',
				coupon: couponCode,
				items,
				// Custom discount breakdown
				discount: {
					total: products.discount ? convertSatangToBahtWithDecimal(products.discount) : '0.00',
					couponDiscount: products.couponDiscount ? convertSatangToBahtWithDecimal(products.couponDiscount) : '0.00',
					couponCode,
					promotionDiscount: products.promotionDiscount ? convertSatangToBahtWithDecimal(products.promotionDiscount) : '0.00',
					promotionName,
				},
				coupons: products.coupons,
				profile: { ...transformUserProfile(profile) },
				payment_type: products?.payment?.slug || products?.shipment?.method,
				totalQuantities: products.totalQuantities,
				subTotal: products.subTotal,
				grandTotal: products.grandTotal,
				totalLine: getTotalLine(products),
			},
		});
	},

	/**
	 * GA4: purchase  (event name was already correct)
	 * Ecommerce structure updated to GA4 flat format
	 */
	async purchase(orderDetail, profile) {
		const couponCode = orderDetail.discount ? getCouponCode(orderDetail.discount.promotions) : '';
		const promotionName = orderDetail.discount ? getPromotionName(orderDetail.discount.promotions) : '';

		const totalQuantitiesReducer = (acc, cur) => acc + (cur.quantity ?? 0);

		const items = orderDetail.items.map((productObj) => ({
			...transformProductItem(productObj),
			productStockStatus: 'in stock',
			item_brand: productObj.brand,
			brandId: productObj.brandId,
			mainCategoryId: productObj.mainCategoryId,
			mainCategoryName: productObj.categories?.[0]?.slug ?? '',
			netAmount: convertSatangToBahtWithDecimal(productObj.netAmount),
			item_list_name: productObj.list,
			a2cType: productObj.addToCartType,
			preorderStatus: productObj.preOrder ? 'on' : 'off',
			price: orderDetailProductPrice(productObj),
			...(productObj.type === PRODUCT_TYPE.FREEBIE && { productType: PRODUCT_TYPE.FREEBIES }),
			...(productObj?.bundleName && { bundleName: productObj?.bundleName }),
		}));

		dataLayerPush({ ecommerce: null });
		dataLayerPush({
			event: 'purchase',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				// ── GA4 standard purchase fields ────────────────────────────
				transaction_id: orderDetail.id,
				affiliation:    'Online Store',
				currency:       config.CURRENCY_CODE,
				value:          convertSatangToBahtWithDecimal(orderDetail.grandTotal),
				shipping:       convertSatangToBahtWithDecimal(orderDetail.shippingFee),
				coupon:         couponCode,
				tax:            '0.00', // set if tax data available
				items,
				// ── Custom fields ────────────────────────────────────────────
				discount: {
					total:             orderDetail.discount?.totalAmount ? convertSatangToBahtWithDecimal(orderDetail.discount.totalAmount) : '0.00',
					couponDiscount:    orderDetail.couponDiscount ? convertSatangToBahtWithDecimal(orderDetail.couponDiscount) : '0.00',
					couponCode,
					promotionDiscount: orderDetail.promotionDiscount ? convertSatangToBahtWithDecimal(orderDetail.promotionDiscount) : '0.00',
					promotionName,
				},
				payment:          transformPurchasePayment(orderDetail.paymentMethod),
				remainingPayment: transformPurchasePayment(orderDetail.remainingPaymentMethod),
				shippingAddresses:    orderDetail.addresses.shipping,
				billingAddresses:     orderDetail.addresses.billing,
				taxInvoiceAddresses:  orderDetail.addresses.taxInvoice,
				coupons:         orderDetail.coupons,
				profile:         { ...transformUserProfile(profile) },
				totalQuantities: orderDetail.items.reduce(totalQuantitiesReducer, 0),
				subTotal:        orderDetail.subtotal,
				grandTotal:      orderDetail.grandTotal,
				shippingFee:     orderDetail.shippingFee,
				totalLine:       orderDetail.items?.length ?? 0,
			},
		});
	},

	/**
	 * GA4: purchase (per-item)  — purchaseItem is a custom event, no GA4 equivalent
	 */
	async purchaseItem(productItem, orderId, profile) {
		if (!orderId) {
			return;
		}

		dataLayerPush({
			event: 'purchaseItem',
			channel: config.CHANNEL,
			ecommerce: {
				currency: config.CURRENCY_CODE,
				transaction_id: orderId,
				affiliation: 'Online Store',
				items: [{
					...transformProductItem(productItem),
					brandId: productItem.brandId,
					mainCategoryId: productItem.mainCategoryId,
					mainCategoryName: productItem.categories?.[0]?.slug ?? '',
					netAmount: convertSatangToBahtWithDecimal(productItem.netAmount),
				}],
				profile: { ...transformUserProfile(profile) },
			},
		});
	},

	/**
	 * GA4: view_item_list  (was: productImpression / impressions)
	 */
	async productImpression(productList, app, productReferrer = PRODUCT_REFERRER_SLUG.LIST) {
		const perChunk = 8;

		const chunks = productList.reduce((acc, item, index) => {
			const chunkIndex = Math.floor(index / perChunk);
			if (!acc[chunkIndex]) acc[chunkIndex] = [];
			acc[chunkIndex].push(item);
			return acc;
		}, []);

		dataLayerPush({ ecommerce: null });
		chunks.forEach((products, chunkIndex) => {
			dataLayerPush({
				event: 'view_item_list',
				channel: config.CHANNEL,
				date: getCurrentDate(),
				ecommerce: {
					currency: config.CURRENCY_CODE,
					item_list_name: productReferrer,
					items: products.map((product, index) => ({
						...transformProductItem(product),
						index: (chunkIndex * perChunk) + index + 1,
						item_list_name: productReferrer,
						url: productURL(product, app, config.PRODUCT_DETAIL_ROUTE_NAME),
					})),
				},
			});
		});
	},

	/**
	 * GA4: view_item  (was: productDetailImpression / productDetail)
	 */
	async productDetailImpression(productDetail, url, productReferrer = PRODUCT_REFERRER_SLUG.LIST) {
		dataLayerPush({ ecommerce: null });
		dataLayerPush({
			event: 'view_item',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currency: config.CURRENCY_CODE,
				item_list_name: productReferrer,
				items: [{
					...transformProductItem(productDetail),
					item_list_name: productReferrer,
					availableStock: productDetail.availableStock,
					url,
				}],
			},
		});
	},

	/**
	 * GA4: search  (event name kept; added search_term field per GA4 standard)
	 */
	async search(keyword, suggestionList) {
		dataLayerPush({
			event: 'search',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			search_term: keyword,         // GA4 standard parameter
			ecommerce: {
				currency: config.CURRENCY_CODE,
				keyword,
				suggestions: suggestionList?.map((item) => item.text) || [],
			},
		});
	},

});

export default {};
