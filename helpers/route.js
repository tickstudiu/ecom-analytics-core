import PRODUCT_REFERRER_SLUG from '../enums/productReferrerSlug';

/**
 * Get Product detail route object
 * @param {Object} product - ProductDetail, ProductItemInCart or ProductListItem
 * @param {String} productDetailRouteName - route name for product detail page (project-specific)
 * @param {String} [productReferrerSlug]
 * @returns {Object} Route object
 */
export const getProductDetailRouteObject = (product, productDetailRouteName, productReferrerSlug = PRODUCT_REFERRER_SLUG.LIST) => {
	const {
		uid,
		slug = product.productSlug,
		categories,
	} = product;

	if (!uid) {
		throw new Error('product.uid not found', product);
	}
	if (!slug) {
		throw new Error('product.slug or product.productSlug not found', product);
	}

	const category = categories?.[0] || null;
	const pathMatch = category ? [...category.parentSlugList, category.slug, slug].join('/') : slug;

	return {
		name: productDetailRouteName,
		query: { ref: productReferrerSlug },
		params: { pathMatch, uid },
	};
};

export default {};
