import { convertSatangToBahtWithDecimal } from '../helpers/numeral';

import PRODUCT_REFERRER_SLUG from '../enums/productReferrerSlug';
import PRODUCT_TYPE from '../enums/productType';

/**
 * Return product category slug, including its ancestors
 * @param {Object} category Category data
 * @return {String} product category slug
 */
export const productCategory = (category) => {
	if (!category || !category.slug || !Array.isArray(category.parentSlugList)) {
		return '';
	}

	return [
		...category.parentSlugList,
		category.slug,
	].join('/');
};

/**
 * Return product price in THB, given a product object
 * @param {Object} productObj product object
 * @return {Number} product price in THB
 */
export const productPrice = (productObj) => {
	return convertSatangToBahtWithDecimal(productObj.sellingPrice || productObj.primaryPrice || productObj.minPrice || 0);
};

/**
 * Return the product price in THB from an order detail object
 * @param {Object} productObj product object from order detail
 * @return {Number} product price in THB
 */
export const orderDetailProductPrice = (productObj) => {
	return convertSatangToBahtWithDecimal(productObj.priceSelling || productObj.priceSrp || 0);
};

/**
 * Transform Product Item
 * @param {Object} productItem product item data
 * @return {ProductItemDataLayer}
 */
export const transformProductItem = (productItem) => {
	const sellingPrice = convertSatangToBahtWithDecimal(productItem.sellingPrice ?? productItem.priceSelling);
	const srpPrice = convertSatangToBahtWithDecimal(productItem.srpPrice ?? productItem.priceSrp);

	let productStockStatus = productItem.isInStock || productItem.availableStock ? 'in stock' : 'out of stock';
	if (productItem?.hasCollectAtStore) {
		productStockStatus = '1 hour only';
	}

	return {
		id: productItem.sku,
		appleId: productItem.appleSku || null,
		title: productItem.name, // Name or ID is required.
		name: productItem.name, // GA4
		brand: productItem.brand,
		image: productItem.image,
		preorderStatus: productItem.isPreOrder || productItem.preOrder || productItem.type ? 'on' : 'off', // “on” or “off”
		productStockStatus,
		productType: PRODUCT_TYPE.NORMAL, // “Freebies” or “Normal”
		category: productCategory(productItem.categories?.[0]),
		breadcrumb: `home/${productCategory(productItem.categories?.[0])}`,
		price: productPrice(productItem),
		sellingPrice,
		srpPrice,
		savePrice: convertSatangToBahtWithDecimal(productItem.savePrice),
		quantity: productItem.quantity,
	};
};

/**
 * Transform all of products in bundle sets for GA4
 * @param {Array} bundleSets
 * @returns Array of products in all of bundle sets
 */
export const transformBundleSetsItems = (bundleSets = []) => {
	const products = [];

	for (const bundle of bundleSets) {
		let productRef = PRODUCT_REFERRER_SLUG.LIST;

		for (const item of bundle.items) {
			productRef = item.list;
			products.push({
				...transformProductItem(item),
				bundleName: bundle.name,
				list: item.list,
			});
		}

		// If bundle has freebie
		if (bundle?.freeGifts?.items?.length > 0) {
			for (const item of bundle.freeGifts.items) {
				products.push({
					...transformProductItem(item),
					productType: PRODUCT_TYPE.FREEBIES,
					bundleName: bundle.name,
					list: productRef,
				});
			}
		}
	}

	return products;
};

/**
 * Transform Product Item
 * @param {Object} payment payment item data
 * @return {PurchasePaymentDataLayer}
 */
export const transformPurchasePayment = (payment) => {
	if (!payment) {
		return null;
	}

	return {
		channel: payment.name,
		slug: payment.slug,
		date: payment.paidOn,
		method: payment.paymentMethodSubgroup?.name || null,
		name: payment.paymentMethodSubgroup?.paymentMethodGroup?.name || null,
		status: payment.status,
	};
};

export default {};
