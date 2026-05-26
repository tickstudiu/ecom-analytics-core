/**
 * Integration tests for createGa4Builders
 *
 * Covers the highest-value methods:
 *   - userData  (user_id, consent, consentModeV2, profile transform)
 *   - onAddToWishList / onRemoveFromWishList
 *   - promotionBanner (view/click)
 *   - pdpaSettingSubmit
 *   - headerSearch / switchLanguage
 *   - cartProceedToCheckout
 *   - onSelectPayment (guard + slug formatting)
 *   - paymentSelected
 *   - register / forgetPassword
 */

import { createGa4Builders } from '../../ga4';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
	CHANNEL:       'online',
	CURRENCY_CODE: 'THB',
};

const makeBuilders = (cookieOverrides = {}) => {
	const push = jest.fn();
	const $cookies = {
		get: jest.fn((key) => cookieOverrides[key] ?? false),
	};
	const builders = createGa4Builders({ config: CONFIG, dataLayerPush: push, $cookies });
	return { push, builders, $cookies };
};

const profile = {
	id:            42,
	referenceId:   'ref-001',
	provider:      'email',
	firstname:     'สมชาย',
	lastname:      'ใจดี',
	phoneNumber:   '0812345678',
	email:         'test@example.com',
	transacted:    true,
	customerGroup: 'MEMBER',
	rank:          'GOLD',
};

const consents = [
	{ name: 'FUNCTIONAL',  value: true },
	{ name: 'ANALYTICAL',  value: true },
	{ name: 'MARKETING',   value: false },
];

// ─────────────────────────────────────────────────────────────────────────────

describe('createGa4Builders (integration)', () => {

	// ── factory ───────────────────────────────────────────────────────────────

	it('คืน object ที่มี method ครบ', () => {
		const { builders } = makeBuilders();
		const expected = [
			'userData', 'promotionBanner', 'pdpaSettingSubmit',
			'login', 'logout', 'onRegistrationStarted', 'onRegistrationCompleted',
			'headerSearch', 'switchLanguage', 'footerSocialClicked',
			'onAddToWishList', 'onRemoveFromWishList',
			'cartProceedToCheckout', 'onSelectPayment', 'paymentSelected',
			'register', 'forgetPassword',
			'error404ToHomePage', 'error404ToContactUs',
		];
		for (const m of expected) {
			expect(typeof builders[m]).toBe('function');
		}
	});

	// ── userData ──────────────────────────────────────────────────────────────

	describe('userData', () => {
		it('push event userData', async () => {
			const { push, builders } = makeBuilders();
			await builders.userData({ profile }, { cookieConsents: consents }, 'GA1.1.123.456', 'home');
			const payload = push.mock.calls[0][0];
			expect(payload.event).toBe('userData');
		});

		it('user_id เป็น String ของ profile.id', async () => {
			const { push, builders } = makeBuilders();
			await builders.userData({ profile }, { cookieConsents: consents }, '', 'home');
			expect(push.mock.calls[0][0].user_id).toBe('42');
		});

		it('profile.customerId มาจาก GA cookie', async () => {
			const { push, builders } = makeBuilders();
			await builders.userData({ profile }, { cookieConsents: consents }, 'GA1.2.111.222', 'pdp');
			expect(push.mock.calls[0][0].profile.customerId).toBe('111.222');
		});

		it('consentModeV2 มี ad_storage field', async () => {
			const { push, builders } = makeBuilders();
			await builders.userData({ profile }, { cookieConsents: consents }, '', 'home');
			expect(push.mock.calls[0][0].consentModeV2).toHaveProperty('ad_storage');
		});

		it('ไม่ push เมื่อ profile เป็น null', async () => {
			const { push, builders } = makeBuilders();
			await builders.userData({ profile: null }, { cookieConsents: consents }, '', 'home');
			expect(push).not.toHaveBeenCalled();
		});

		it('profile.rank fallback ไป "member" (CUSTOMER_CORPORATE_RANK.MEMBER) เมื่อ rank ว่าง', async () => {
			const { push, builders } = makeBuilders();
			const noRank = { ...profile, rank: undefined };
			await builders.userData({ profile: noRank }, { cookieConsents: consents }, '', 'home');
			// CUSTOMER_CORPORATE_RANK.MEMBER = 'member' (lowercase)
			expect(push.mock.calls[0][0].profile.rank).toBe('member');
		});
	});

	// ── onRegistrationCompleted ───────────────────────────────────────────────

	describe('onRegistrationCompleted', () => {
		it('ลบ password, verificationCode, recaptchaToken ออกจาก form', async () => {
			const { push, builders } = makeBuilders();
			const form = {
				email: 'a@b.com',
				password: 'secret',
				verificationCode: '123456',
				recaptchaToken: 'token-xyz',
			};
			await builders.onRegistrationCompleted(form, 'email');
			const { form: safeForm } = push.mock.calls[0][0];
			expect(safeForm).not.toHaveProperty('password');
			expect(safeForm).not.toHaveProperty('verificationCode');
			expect(safeForm).not.toHaveProperty('recaptchaToken');
			expect(safeForm.email).toBe('a@b.com');
		});

		it('consent มาจาก $cookies', async () => {
			const { push, builders } = makeBuilders({ FUNCTIONAL: true, ANALYTICAL: false });
			await builders.onRegistrationCompleted({}, 'email');
			const { consent } = push.mock.calls[0][0];
			expect(consent.FUNCTIONAL).toBe(true);
			expect(consent.ANALYTICAL).toBe(false);
		});
	});

	// ── onAddToWishList / onRemoveFromWishList ─────────────────────────────────

	describe('onAddToWishList', () => {
		it('push event add_to_wishlist พร้อม product', async () => {
			const { push, builders } = makeBuilders();
			const product = { sku: 'SKU-001', name: 'iPhone' };
			await builders.onAddToWishList(product);
			const payload = push.mock.calls[0][0];
			expect(payload.event).toBe('add_to_wishlist');
			expect(payload.eventName).toBe('on_add_to_wish_list');
			expect(payload.product).toEqual(product);
			expect(payload.channel).toBe(CONFIG.CHANNEL);
		});
	});

	describe('onRemoveFromWishList', () => {
		it('push event remove_from_wishlist', async () => {
			const { push, builders } = makeBuilders();
			const product = { sku: 'SKU-002' };
			await builders.onRemoveFromWishList(product);
			const payload = push.mock.calls[0][0];
			expect(payload.event).toBe('remove_from_wishlist');
			expect(payload.eventName).toBe('on_remove_from_wish_list');
		});
	});

	// ── promotionBanner ───────────────────────────────────────────────────────

	describe('promotionBanner', () => {
		it('push view_promotion เมื่อ isClicked=false', () => {
			const { push, builders } = makeBuilders();
			builders.promotionBanner('hero', 'banner', 1, 'Summer Sale', 2, false);
			expect(push.mock.calls[0][0].event).toBe('view_promotion');
		});

		it('push select_promotion เมื่อ isClicked=true', () => {
			const { push, builders } = makeBuilders();
			builders.promotionBanner('hero', 'banner', 1, 'Summer Sale', 2, true);
			expect(push.mock.calls[0][0].event).toBe('select_promotion');
		});

		it('ecommerce มี promotion_name และ creative_slot', () => {
			const { push, builders } = makeBuilders();
			builders.promotionBanner('slot-1', 'hero', 3, 'PromoName', 1);
			const { ecommerce } = push.mock.calls[0][0];
			expect(ecommerce.promotion_name).toBe('PromoName');
			expect(ecommerce.creative_slot).toBe('slot-1');
		});
	});

	// ── pdpaSettingSubmit ──────────────────────────────────────────────────────

	describe('pdpaSettingSubmit', () => {
		it('push analytics="yes" marketing="no"', async () => {
			const { push, builders } = makeBuilders();
			await builders.pdpaSettingSubmit(true, false);
			const payload = push.mock.calls[0][0];
			expect(payload.event).toBe('eventTracking');
			expect(payload.eventName).toBe('pdpa');
			expect(payload.analytics).toBe('yes');
			expect(payload.marketing).toBe('no');
		});
	});

	// ── headerSearch ──────────────────────────────────────────────────────────

	describe('headerSearch', () => {
		it('push event eventTracking - Header พร้อม keyword', () => {
			const { push, builders } = makeBuilders();
			builders.headerSearch('phones', 'iPhone');
			const payload = push.mock.calls[0][0];
			expect(payload.event).toBe('eventTracking - Header');
			expect(payload.eventName).toBe('search');
			expect(payload.searchKeyword).toBe('iPhone');
			expect(payload.searchCategory).toBe('phones');
		});

		it('ใช้ default category="all" และ keyword="" เมื่อไม่ส่ง argument', () => {
			const { push, builders } = makeBuilders();
			builders.headerSearch();
			const payload = push.mock.calls[0][0];
			expect(payload.searchCategory).toBe('all');
			expect(payload.searchKeyword).toBe('');
		});
	});

	// ── onSelectPayment ───────────────────────────────────────────────────────

	describe('onSelectPayment', () => {
		it('push eventName=select_payment และ format slug เป็น space', () => {
			const { push, builders } = makeBuilders();
			builders.onSelectPayment('credit-card');
			const payload = push.mock.calls[0][0];
			expect(payload.eventName).toBe('select_payment');
			expect(payload.paymentType).toBe('credit card');
		});

		it('ไม่ push เมื่อ paymentSlug เป็น null', () => {
			const { push, builders } = makeBuilders();
			builders.onSelectPayment(null);
			expect(push).not.toHaveBeenCalled();
		});

		it('ไม่ push เมื่อ paymentSlug เป็น number', () => {
			const { push, builders } = makeBuilders();
			builders.onSelectPayment(123);
			expect(push).not.toHaveBeenCalled();
		});
	});

	// ── cartProceedToCheckout ─────────────────────────────────────────────────

	describe('cartProceedToCheckout', () => {
		it('push event eventTracking - Cart พร้อม skuList', () => {
			const { push, builders } = makeBuilders();
			const cartData = {
				productItems: [{ sku: 'A' }, { sku: 'B' }],
				subTotal:     20000,
			};
			builders.cartProceedToCheckout(cartData);
			const payload = push.mock.calls[0][0];
			expect(payload.event).toBe('eventTracking - Cart');
			expect(payload.eventName).toBe('proceed_to_checkout');
			expect(payload.skuList).toEqual(['A', 'B']);
			expect(payload.subTotal).toBe(200); // 20000 satang → 200 baht
		});
	});

	// ── register (ga4 register attempt) ──────────────────────────────────────

	describe('register', () => {
		it('push eventName=register_attempt พร้อม registerType', () => {
			const { push, builders } = makeBuilders();
			builders.register('google');
			const payload = push.mock.calls[0][0];
			expect(payload.eventName).toBe('register_attempt');
			expect(payload.registerType).toBe('google');
		});
	});

	// ── forgetPassword ────────────────────────────────────────────────────────

	describe('forgetPassword', () => {
		it('push eventName=forget_password', () => {
			const { push, builders } = makeBuilders();
			builders.forgetPassword();
			expect(push.mock.calls[0][0].eventName).toBe('forget_password');
		});
	});

	// ── error 404 events ──────────────────────────────────────────────────────

	describe('error404ToHomePage', () => {
		it('push event 404_to_homepage', () => {
			const { push, builders } = makeBuilders();
			builders.error404ToHomePage();
			expect(push.mock.calls[0][0].eventName).toBe('404_to_homepage');
			expect(push.mock.calls[0][0].event).toBe('eventTracking - 404');
		});
	});

});
