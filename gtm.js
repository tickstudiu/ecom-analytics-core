import { convertSatangToBahtWithDecimal } from './helpers/numeral';
import { getProductDetailRouteObject } from './helpers/route';
import { getCustomerIdFromGACookie } from './helpers/ga';
import { dateTimeFormat } from './helpers/date';

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

const productURL = (product, app) => {
	if (!app || !app.localePath) {
		return null;
	}
	return `${process.env.APP_BASE_URL}${app.localePath(getProductDetailRouteObject(product, config.PRODUCT_DETAIL_ROUTE_NAME))}`;
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
		dataLayerPush({ ecommerce: null }); // Clear the previous ecommerce object.
	},

	async register(profile, provider = null) {
		dataLayerPush({ ecommerce: null }); // Clear the previous ecommerce object.
		dataLayerPush({
			event: 'register',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				profile: {
					...transformUserProfile(profile),
					provider,
				},
			},
		});
	},

	async login({ profile }, { cookieConsents }, cid) {
		dataLayerPush({ ecommerce: null }); // Clear the previous ecommerce object.
		dataLayerPush({
			event: 'login',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				profile: {
					customerId: getCustomerIdFromGACookie(cid),
					...transformUserProfile(profile),
				},
				consent: transformConsents(cookieConsents),
			},
		});
	},

	async logout({ profile }, { cookieConsents }, cid) {
		dataLayerPush({ ecommerce: null }); // Clear the previous ecommerce object.
		dataLayerPush({
			event: 'logout',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				profile: {
					customerId: getCustomerIdFromGACookie(cid),
					...transformUserProfile(profile),
				},
				consent: transformConsents(cookieConsents),
			},
		});
	},

	async updateProfile(profile) {
		dataLayerPush({
			event: 'updateProfile',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				profile: transformUserProfile(profile),
			},
		});
	},

	async productClick(productObj, productPosition, productReferrer = PRODUCT_REFERRER_SLUG.LIST) {
		if (!productObj || !productObj.name || !productObj.sku) {
			return;
		}

		dataLayerPush({
			event: 'productClick',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				actionField: { list: productReferrer },
				click: {
					products: [{
						...transformProductItem(productObj),
						position: productPosition,
					}],
				},
			},
		});
	},

	async viewCart(products, step) {
		if (!products || !Array.isArray(products.productItems)) {
			return;
		}

		const actionName = checkoutEventName(step);

		// Products items
		const items = products.productItems.map((product) => {
			return {
				...transformProductItem(product),
				list: product.list,
				a2cType: product.addToCartType,
			};
		});
		// Bundle items
		const bundleItems = transformBundleSetsItems(products.bundleSets);
		// Freebie items
		const freebieItems = products.freeGifts?.items?.map((product) => {
			return {
				...transformProductItem(product),
				// Override product type
				productType: PRODUCT_TYPE.FREEBIES,
				list: product.list,
				a2cType: product.addToCartType,
			};
		}) ?? [];

		dataLayerPush({ ecommerce: null }); // Clear the previous ecommerce object.
		dataLayerPush({
			event: 'viewCart',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				actionField: { step, action: actionName },
				checkout: {
					products: [
						...items,
						...bundleItems,
						...freebieItems,
					],
					totalQuantities: products.totalQuantities,
					subTotal: products.subTotal,
					grandTotal: products.grandTotal,
				},
			},
		});
	},

	async addToCart(products, productReferrer = PRODUCT_REFERRER_SLUG.LIST, a2cType = ADD_TO_CART_TYPE.STANDARD) {
		if (!Array.isArray(products)) {
			return;
		}

		dataLayerPush({
			event: 'addToCart',
			channel: config.CHANNEL,
			a2cType,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				actionField: { list: productReferrer },
				add: {
					products: products.map(transformProductItem),
				},
			},
		});
	},

	async removeFromCart(products) {
		if (!Array.isArray(products)) {
			return;
		}

		dataLayerPush({
			event: 'removeFromCart',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				remove: {
					products: products.map(transformProductItem),
				},
			},
		});
	},

	async checkout(products, step, profile) {
		if (!products || !Array.isArray(products.productItems)) {
			return;
		}

		const couponCode = products.coupons ? getCouponCode(products.coupons) : '';
		const promotionName = products.promotions ? getPromotionName(products.promotions) : '';

		const actionName = checkoutEventName(step);

		// Products items
		const items = products.productItems.map((product) => {
			return {
				...transformProductItem(product),
				list: product.list,
				a2cType: product.addToCartType,
			};
		});
		// Bundle items
		const bundleItems = transformBundleSetsItems(products.bundleSets);
		// Freebie items
		const freebieItems = products.freeGifts?.items?.map((product) => {
			return {
				...transformProductItem(product),
				// Override product type
				productType: PRODUCT_TYPE.FREEBIES,
				list: product.list,
				a2cType: product.addToCartType,
			};
		}) ?? [];

		dataLayerPush({ ecommerce: null }); // Clear the previous ecommerce object.
		dataLayerPush({
			event: 'checkout',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				checkout: {
					actionField: { step, option: products?.payment?.slug || products?.shipment?.method, action: actionName },
					products: [
						...items,
						...bundleItems,
						...freebieItems,
					],
					coupons: products.coupons,
					profile: {
						...transformUserProfile(profile),
					},
					discount: {
						total: products.discount ? convertSatangToBahtWithDecimal(products.discount) : '0.00',
						couponDiscount: products.couponDiscount ? convertSatangToBahtWithDecimal(products.couponDiscount) : '0.00',
						couponCode,
						promotionDiscount: products.promotionDiscount ? convertSatangToBahtWithDecimal(products.promotionDiscount) : '0.00',
						promotionName,
					},
					totalQuantities: products.totalQuantities,
					subTotal: products.subTotal,
					grandTotal: products.grandTotal,
					value: products.grandTotal ? convertSatangToBahtWithDecimal(products.grandTotal) : '0.00', // GA4
					totalLine: getTotalLine(products),
				},
			},
		});
	},

	async purchase(orderDetail, profile) {
		const couponCode = orderDetail.discount ? getCouponCode(orderDetail.discount.promotions) : '';
		const promotionName = orderDetail.discount ? getPromotionName(orderDetail.discount.promotions) : '';

		const totalQuantitiesReducer = (acc, cur) => {
			return acc + (cur.quantity ?? 0);
		};

		dataLayerPush({ ecommerce: null }); // Clear the previous ecommerce object.
		dataLayerPush({
			event: 'purchase',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				purchase: {
					actionField: {
						id: orderDetail.id,
						affiliation: 'Online Store',
						revenue: convertSatangToBahtWithDecimal(orderDetail.grandTotal),
						shipping: convertSatangToBahtWithDecimal(orderDetail.shippingFee),
						discount: orderDetail.discount?.totalAmount ? convertSatangToBahtWithDecimal(orderDetail.discount?.totalAmount) : '0.00',
						couponDiscount: orderDetail.couponDiscount ? convertSatangToBahtWithDecimal(orderDetail.couponDiscount) : '0.00',
						couponCode,
						promotionDiscount: orderDetail.promotionDiscount ? convertSatangToBahtWithDecimal(orderDetail.promotionDiscount) : '0.00',
						promotionName,
					},
					payment: transformPurchasePayment(orderDetail.paymentMethod),
					remainingPayment: transformPurchasePayment(orderDetail.remainingPaymentMethod),
					shippingAddresses: orderDetail.addresses.shipping,
					billingAddresses: orderDetail.addresses.billing,
					taxInvoiceAddresses: orderDetail.addresses.taxInvoice,
					coupons: orderDetail.coupons,
					products: orderDetail.items.map((productObj) => {
						return {
							...transformProductItem(productObj),
							// Overide transform product item
							productStockStatus: 'in stock',
							brandId: productObj.brandId,
							mainCategoryId: productObj.mainCategoryId,
							mainCategoryName: productObj.categories?.[0]?.slug ?? '',
							netAmount: convertSatangToBahtWithDecimal(productObj.netAmount),
							list: productObj.list,
							a2cType: productObj.addToCartType,
							preorderStatus: productObj.preOrder ? 'on' : 'off', // “on” or “off”

							// GA4 purchase event
							price: orderDetailProductPrice(productObj),
							...(productObj.type === PRODUCT_TYPE.FREEBIE && { productType: PRODUCT_TYPE.FREEBIES }), // Overide if type is freebie
							...(productObj?.bundleName && { bundleName: productObj?.bundleName }),
						};
					}),
					totalQuantities: orderDetail.items.reduce(totalQuantitiesReducer, 0),
					subTotal: orderDetail.subtotal,
					grandTotal: orderDetail.grandTotal,
					shippingFee: orderDetail.shippingFee,
					totalLine: orderDetail.items?.length ?? 0,
				},
				profile: {
					...transformUserProfile(profile),
				},
			},
		});
	},

	async purchaseItem(productItem, orderId, profile) {
		if (!orderId) {
			return;
		}

		dataLayerPush({
			event: 'purchaseItem',
			channel: config.CHANNEL,
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				purchase: {
					actionField: {
						id: orderId,
						affiliation: 'Online Store',
					},
					product: {
						...transformProductItem(productItem),
						brandId: productItem.brandId,
						mainCategoryId: productItem.mainCategoryId,
						mainCategoryName: productItem.categories?.[0]?.slug ?? '',
						netAmount: convertSatangToBahtWithDecimal(productItem.netAmount),
					},
				},
				profile: {
					...transformUserProfile(profile),
				},
			},
		});
	},

	async productImpression(productList, app, productReferrer = PRODUCT_REFERRER_SLUG.LIST) {
		const perChunk = 8; // items per chunk

		// ref:: https://stackoverflow.com/questions/8495687/split-array-into-chunks
		const result = productList.reduce((resultArray, item, index) => {
			const chunkIndex = Math.floor(index / perChunk);

			if (!resultArray[chunkIndex]) {
				resultArray[chunkIndex] = []; // start a new chunk
			}

			resultArray[chunkIndex].push(item);

			return resultArray;
		}, []);

		dataLayerPush({ ecommerce: null }); // Clear the previous ecommerce object.
		result.forEach((products, chunkIndex) => {
			dataLayerPush({
				event: 'impressions',
				channel: config.CHANNEL,
				date: getCurrentDate(),
				ecommerce: {
					currencyCode: config.CURRENCY_CODE,
					impressions: products.map((product, index) => {
						return {
							...transformProductItem(product),
							// TODO: Need a discussion further with client.
							// list: 'Apparel Gallery',
							position: (chunkIndex * perChunk) + index + 1,
							url: productURL(product, app),
							list: productReferrer, // * Where the item came from
						};
					}),
				},
			});
		});
	},

	async productDetailImpression(productDetail, url, productReferrer = PRODUCT_REFERRER_SLUG.LIST) {
		dataLayerPush({ ecommerce: null }); // Clear the previous ecommerce object.
		dataLayerPush({
			event: 'productDetail',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				detail: {
					actionField: { list: productReferrer },
					products: [{
						...transformProductItem(productDetail),
						availableStock: productDetail.availableStock,
						url,
					}],
				},
			},
		});
	},

	async search(keyword, suggestionList) {
		dataLayerPush({
			event: 'search',
			channel: config.CHANNEL,
			date: getCurrentDate(),
			ecommerce: {
				currencyCode: config.CURRENCY_CODE,
				keyword,
				// return array of name
				suggestions: suggestionList?.map((item) => (item.text)) || [],
			},
		});
	},

});

export default {};
