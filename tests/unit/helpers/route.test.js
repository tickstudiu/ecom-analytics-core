import { getProductDetailRouteObject } from '../../../helpers/route';
import PRODUCT_REFERRER_SLUG from '../../../enums/productReferrerSlug';

describe('helpers/route', () => {

	describe('getProductDetailRouteObject', () => {
		const baseProduct = {
			uid:   'prod-001',
			slug:  'iphone-16-pro',
			categories: [{
				slug:           'smartphones',
				parentSlugList: ['devices'],
			}],
		};

		it('สร้าง route object ที่ถูกต้อง', () => {
			const result = getProductDetailRouteObject(baseProduct, 'product-detail');
			expect(result).toMatchObject({
				name: 'product-detail',
				params: {
					uid:       'prod-001',
					pathMatch: 'devices/smartphones/iphone-16-pro',
				},
			});
		});

		it('ใส่ default ref query = LIST', () => {
			const result = getProductDetailRouteObject(baseProduct, 'product-detail');
			expect(result.query.ref).toBe(PRODUCT_REFERRER_SLUG.LIST);
		});

		it('ใช้ custom productReferrerSlug ได้', () => {
			const result = getProductDetailRouteObject(
				baseProduct, 'product-detail', PRODUCT_REFERRER_SLUG.SEARCH_RESULT,
			);
			expect(result.query.ref).toBe(PRODUCT_REFERRER_SLUG.SEARCH_RESULT);
		});

		it('ใช้ productSlug แทน slug เมื่อไม่มี slug', () => {
			const product = { uid: 'p-002', productSlug: 'macbook-air', categories: [] };
			const result = getProductDetailRouteObject(product, 'product-detail');
			expect(result.params.pathMatch).toBe('macbook-air');
		});

		it('สร้าง pathMatch จาก slug เดียวเมื่อไม่มี category', () => {
			const product = { uid: 'p-003', slug: 'no-category-product', categories: [] };
			const result = getProductDetailRouteObject(product, 'product-detail');
			expect(result.params.pathMatch).toBe('no-category-product');
		});

		it('throw error เมื่อไม่มี uid', () => {
			const product = { slug: 'some-product' };
			expect(() => getProductDetailRouteObject(product, 'product-detail'))
				.toThrow('product.uid not found');
		});

		it('throw error เมื่อไม่มี slug และ productSlug', () => {
			const product = { uid: 'p-004' };
			expect(() => getProductDetailRouteObject(product, 'product-detail'))
				.toThrow('product.slug or product.productSlug not found');
		});
	});
});
