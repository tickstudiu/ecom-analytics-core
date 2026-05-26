/**
 * Integration tests for createGtmBuilders
 *
 * Strategy: inject a jest.fn() dataLayerPush and assert what gets pushed.
 * We do NOT mock the helpers/resolvers — these tests exercise the full
 * data-transformation pipeline end-to-end.
 */

import { createGtmBuilders } from '../../gtm';
import PRODUCT_REFERRER_SLUG from '../../enums/productReferrerSlug';
import PRODUCT_TYPE from '../../enums/productType';
import WISHLIST from '../../enums/wishlist';

// ─────────────────────────────────────────────────────────────────────────────
// Shared fixtures
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
	CHANNEL:       'online',
	CURRENCY_CODE: 'THB',
};

const makeBuilders = () => {
	const push = jest.fn();
	const builders = createGtmBuilders({ config: CONFIG, dataLayerPush: push });
	return { push, builders };
};

const product = {
	sku:          'SKU-001',
	name:         'iPhone 16 Pro',
	brand:        'Apple',
	sellingPrice: 10000,
	srpPrice:     12000,
	savePrice:    2000,
	isInStock:    true,
	quantity:     1,
	categories:   [{ slug: 'iphone', parentSlugList: ['smartphones'] }],
};

const profile = {
	id:          42,
	referenceId: 'ref-001',
	provider:    'email',
	firstname:   'สมชาย',
	lastname:    'ใจดี',
	phoneNumber: '0812345678',
	email:       'test@example.com',
	transacted:  true,
	customerGroup: 'MEMBER',
	rank:          'GOLD',
};

const consents = [
	{ name: 'FUNCTIONAL',  value: true },
	{ name: 'ANALYTICAL',  value: true },
	{ name: 'MARKETING',   value: false },
];

// ─────────────────────────────────────────────────────────────────────────────

describe('createGtmBuilders (integration)', () => {

	// ── factory ───────────────────────────────────────────────────────────────

	it('คืน object ที่มี method ครบทุกตัว', () => {
		const { builders } = makeBuilders();
		const methods = [
			'clearEcommerce', 'consentDefault', 'consentUpdate',
			'register', 'login', 'logout', 'updateProfile',
			'productClick', 'viewCart', 'addToCart', 'removeFromCart',
			'checkout', 'purchase', 'purchaseItem',
			'productImpression', 'productDetailImpression',
			'search', 'productAddWishlist',
			'couponsApplied', 'couponsRemoved',
		];
		for (const m of methods) {
			expect(typeof builders[m]).toBe('function');
		}
	});

	// ── clearEcommerce ────────────────────────────────────────────────────────

	describe('clearEcommerce', () => {
		it('push { ecommerce: null }', () => {
			const { push, builders } = makeBuilders();
			builders.clearEcommerce();
			expect(push).toHaveBeenCalledWith({ ecommerce: null });
		});
	});

	// ── consentDefault ────────────────────────────────────────────────────────

	describe('consentDefault', () => {
		it('push event consent_default', () => {
			const { push, builders } = makeBuilders();
			builders.consentDefault();
			const payload = push.mock.calls[0][0];
			expect(payload.event).toBe('consent_default');
		});

		it('ทุก ad field เป็น denied (safe default)', () => {
			const { push, builders } = makeBuilders();
			builders.consentDefault();
			const payload = push.mock.calls[0][0];
			expect(payload.ad_storage).toBe('denied');
			expect(payload.analytics_storage).toBe('denied');
			expect(payload.ad_user_data).toBe('denied');
			expect(payload.ad_personalization).toBe('denied');
		});

		it('functionality_storage และ security_storage เป็น granted เสมอ', () => {
			const { push, builders } = makeBuilders();
			builders.consentDefault();
			const payload = push.mock.calls[0][0];
			expect(payload.functionality_storage).toBe('granted');
			expect(payload.security_storage).toBe('granted');
		});

		it('มี wait_for_update: 500', () => {
			const { push, builders } = makeBuilders();
			builders.consentDefault();
			expect(push.mock.calls[0][0].wait_for_update).toBe(500);
		});
	});

	// ── consentUpdate ─────────────────────────────────────────────────────────

	describe('consentUpdate', () => {
		it('push event consent_update', () => {
			const { push, builders } = makeBuilders();
			builders.consentUpdate(consents);
			expect(push.mock.calls[0][0].event).toBe('consent_update');
		});

		it('map FUNCTIONAL=true → ad_storage granted', () => {
			const { push, builders } = makeBuilders();
			builders.consentUpdate(consents);
			expect(push.mock.calls[0][0].ad_storage).toBe('granted');
		});

		it('map MARKETING=false → ad_personalization denied', () => {
			const { push, builders } = makeBuilders();
			builders.consentUpdate(consents);
			expect(push.mock.calls[0][0].ad_personalization).toBe('denied');
		});

		it('ใช้ default [] เมื่อไม่ส่ง argument — ทุก field เป็น denied', () => {
			const { push, builders } = makeBuilders();
			builders.consentUpdate();
			expect(push.mock.calls[0][0].ad_storage).toBe('denied');
		});
	});

	// ── register ──────────────────────────────────────────────────────────────

	describe('register', () => {
		it('push { ecommerce: null } ก่อน แล้วค่อย push event', async () => {
			const { push, builders } = makeBuilders();
			await builders.register(profile, 'email');
			expect(push.mock.calls[0][0]).toEqual({ ecommerce: null });
			expect(push.mock.calls[1][0].event).toBe('register');
		});

		it('มี channel และ profile', async () => {
			const { push, builders } = makeBuilders();
			await builders.register(profile, 'email');
			const payload = push.mock.calls[1][0];
			expect(payload.channel).toBe(CONFIG.CHANNEL);
			expect(payload.profile.id).toBe(42);
			expect(payload.profile.provider).toBe('email');
		});
	});

	// ── login ────────────────────────────────────────────────────────────────

	describe('login', () => {
		it('push event login พร้อม profile + consent + consentModeV2', async () => {
			const { push, builders } = makeBuilders();
			await builders.login({ profile }, { cookieConsents: consents }, 'GA1.1.123.456');
			const payload = push.mock.calls[1][0];
			expect(payload.event).toBe('login');
			expect(payload.channel).toBe(CONFIG.CHANNEL);
			expect(payload.profile.customerId).toBe('123.456');
			expect(payload.profile.id).toBe(42);
			expect(payload.consent).toBeDefined();
			expect(payload.consentModeV2).toBeDefined();
		});
	});

	// ── productClick (select_item) ────────────────────────────────────────────

	describe('productClick', () => {
		it('push event select_item', async () => {
			const { push, builders } = makeBuilders();
			await builders.productClick(product, 1);
			const payload = push.mock.calls[1][0];
			expect(payload.event).toBe('select_item');
		});

		it('ecommerce.currency = config.CURRENCY_CODE', async () => {
			const { push, builders } = makeBuilders();
			await builders.productClick(product, 1);
			expect(push.mock.calls[1][0].ecommerce.currency).toBe('THB');
		});

		it('items[0] มี item_id และ index', async () => {
			const { push, builders } = makeBuilders();
			await builders.productClick(product, 3);
			const item = push.mock.calls[1][0].ecommerce.items[0];
			expect(item.item_id).toBe('SKU-001');
			expect(item.index).toBe(3);
		});

		it('ใช้ default productReferrer = LIST', async () => {
			const { push, builders } = makeBuilders();
			await builders.productClick(product, 1);
			expect(push.mock.calls[1][0].ecommerce.item_list_name).toBe(PRODUCT_REFERRER_SLUG.LIST);
		});

		it('ไม่ push เมื่อ product ไม่มี name', async () => {
			const { push, builders } = makeBuilders();
			await builders.productClick({ ...product, name: undefined }, 1);
			expect(push).not.toHaveBeenCalled();
		});

		it('ไม่ push เมื่อ product ไม่มี sku', async () => {
			const { push, builders } = makeBuilders();
			await builders.productClick({ ...product, sku: undefined }, 1);
			expect(push).not.toHaveBeenCalled();
		});
	});

	// ── addToCart ────────────────────────────────────────────────────────────

	describe('addToCart', () => {
		it('push event add_to_cart', async () => {
			const { push, builders } = makeBuilders();
			await builders.addToCart([product]);
			const payload = push.mock.calls[1][0];
			expect(payload.event).toBe('add_to_cart');
			expect(payload.ecommerce.items).toHaveLength(1);
			expect(payload.ecommerce.items[0].item_id).toBe('SKU-001');
		});

		it('ไม่ push เมื่อ products ไม่ใช่ Array', async () => {
			const { push, builders } = makeBuilders();
			await builders.addToCart(null);
			expect(push).not.toHaveBeenCalled();
		});
	});

	// ── removeFromCart ───────────────────────────────────────────────────────

	describe('removeFromCart', () => {
		it('push event remove_from_cart', async () => {
			const { push, builders } = makeBuilders();
			await builders.removeFromCart([product]);
			const payload = push.mock.calls[1][0];
			expect(payload.event).toBe('remove_from_cart');
			expect(payload.ecommerce.items[0].item_id).toBe('SKU-001');
		});

		it('ไม่ push เมื่อ products ไม่ใช่ Array', async () => {
			const { push, builders } = makeBuilders();
			await builders.removeFromCart('wrong');
			expect(push).not.toHaveBeenCalled();
		});
	});

	// ── purchase ─────────────────────────────────────────────────────────────

	describe('purchase', () => {
		const orderDetail = {
			id:               'ORDER-001',
			grandTotal:       50000,
			subtotal:         48000,
			shippingFee:      0,
			couponDiscount:   0,
			promotionDiscount: 0,
			items: [{
				...product,
				priceSelling: 10000,
				priceSrp:     12000,
				netAmount:    10000,
				quantity:     5,
				brand:        'Apple',
				brandId:      'brand-1',
				mainCategoryId: 'cat-1',
				list:           'list',
			}],
			paymentMethod: {
				name:   'Credit Card',
				slug:   'credit-card',
				paidOn: '2024-01-15',
				status: 'paid',
			},
		};

		it('push event purchase', async () => {
			const { push, builders } = makeBuilders();
			await builders.purchase(orderDetail, profile);
			const payload = push.mock.calls[1][0];
			expect(payload.event).toBe('purchase');
		});

		it('ecommerce.transaction_id = orderDetail.id', async () => {
			const { push, builders } = makeBuilders();
			await builders.purchase(orderDetail, profile);
			const { ecommerce } = push.mock.calls[1][0];
			expect(ecommerce.transaction_id).toBe('ORDER-001');
		});

		it('ecommerce.value = grandTotal ใน THB', async () => {
			const { push, builders } = makeBuilders();
			await builders.purchase(orderDetail, profile);
			expect(push.mock.calls[1][0].ecommerce.value).toBe('500.00');
		});

		it('items มี item_id ถูกต้อง', async () => {
			const { push, builders } = makeBuilders();
			await builders.purchase(orderDetail, profile);
			expect(push.mock.calls[1][0].ecommerce.items[0].item_id).toBe('SKU-001');
		});

		it('ecommerce.tax เป็น "0.00" เสมอ', async () => {
			const { push, builders } = makeBuilders();
			await builders.purchase(orderDetail, profile);
			expect(push.mock.calls[1][0].ecommerce.tax).toBe('0.00');
		});
	});

	// ── search ────────────────────────────────────────────────────────────────

	describe('search', () => {
		it('push event search พร้อม search_term', async () => {
			const { push, builders } = makeBuilders();
			await builders.search('iPhone', [{ text: 'iPhone 16' }, { text: 'iPhone 15' }]);
			const payload = push.mock.calls[0][0];
			expect(payload.event).toBe('search');
			expect(payload.search_term).toBe('iPhone');
			expect(payload.suggestions).toEqual(['iPhone 16', 'iPhone 15']);
		});
	});

	// ── productAddWishlist ────────────────────────────────────────────────────

	describe('productAddWishlist', () => {
		it('push event add_to_wishlist', async () => {
			const { push, builders } = makeBuilders();
			await builders.productAddWishlist(product, profile, WISHLIST.ADDED);
			const payload = push.mock.calls[1][0];
			expect(payload.event).toBe('add_to_wishlist');
		});

		it('push event remove_from_wishlist เมื่อ action = REMOVED', async () => {
			const { push, builders } = makeBuilders();
			await builders.productAddWishlist(product, profile, WISHLIST.REMOVED);
			expect(push.mock.calls[1][0].event).toBe('remove_from_wishlist');
		});

		it('ไม่ push เมื่อ product เป็น null', async () => {
			const { push, builders } = makeBuilders();
			await builders.productAddWishlist(null, profile);
			expect(push).not.toHaveBeenCalled();
		});
	});

	// ── couponsApplied / couponsRemoved ───────────────────────────────────────

	describe('couponsApplied', () => {
		it('push event coupon_applied พร้อม coupon code', () => {
			const { push, builders } = makeBuilders();
			builders.couponsApplied('SAVE200');
			const payload = push.mock.calls[1][0];
			expect(payload.event).toBe('coupon_applied');
			expect(payload.ecommerce.coupon).toBe('SAVE200');
		});
	});

	describe('couponsRemoved', () => {
		it('push event coupon_removed', () => {
			const { push, builders } = makeBuilders();
			builders.couponsRemoved('SAVE200');
			expect(push.mock.calls[1][0].event).toBe('coupon_removed');
		});
	});

});
