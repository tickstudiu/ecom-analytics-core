/**
 * Snapshot Tests — dataLayer payload shape
 *
 * Purpose: freeze the exact payload shape pushed to dataLayer for critical events.
 * If a payload changes (field renamed, added, removed), the test will fail and
 * force an explicit `npm test -- -u` to update the snapshot — preventing silent
 * GTM tag breakage.
 *
 * Events covered: login, register, productClick (select_item), checkout (begin_checkout), purchase
 *
 * NOTE: `date` fields are mocked to a fixed string so snapshots are deterministic.
 */

import { createGtmBuilders } from '../../gtm';
import { createGa4Builders } from '../../ga4';

// ── Mock date so snapshots are stable ─────────────────────────────────────────
jest.mock('../../helpers/date', () => ({
	dateTimeFormat: jest.fn(() => '2024-01-15 10:00:00'),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Shared fixtures
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = { CHANNEL: 'online', CURRENCY_CODE: 'THB' };

const makeGtm = () => {
	const push = jest.fn();
	return { push, gtm: createGtmBuilders({ config: CONFIG, dataLayerPush: push }) };
};

const makeGa4 = () => {
	const push = jest.fn();
	const $cookies = { get: jest.fn(() => false) };
	return { push, ga4: createGa4Builders({ config: CONFIG, dataLayerPush: push, $cookies }) };
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
	birthdate:     '1990-01-15',
};

const consents = [
	{ name: 'FUNCTIONAL',  value: true  },
	{ name: 'ANALYTICAL',  value: true  },
	{ name: 'MARKETING',   value: false },
];

const product = {
	sku:          'APP-SKU-001',
	name:         'iPhone 16 Pro',
	brand:        'Apple',
	sellingPrice: 10000,
	srpPrice:     12000,
	savePrice:    2000,
	isInStock:    true,
	quantity:     1,
	categories:   [{ slug: 'iphone', parentSlugList: ['smartphones', 'apple'] }],
	image:        'https://cdn.example.com/iphone16pro.jpg',
};

const cartProducts = {
	productItems: [{ ...product, list: 'list', addToCartType: 'standard' }],
	bundleSets:   [],
	freeGifts:    null,
	totalQuantities: 1,
	subTotal:     10000,
	grandTotal:   10000,
};

const orderDetail = {
	id:               'ORDER-20240115-001',
	grandTotal:       10000,
	subtotal:         10000,
	shippingFee:      0,
	couponDiscount:   0,
	promotionDiscount: 0,
	discount:         null,
	items: [{
		...product,
		priceSelling: 10000,
		priceSrp:     12000,
		netAmount:    10000,
		quantity:     1,
		brandId:      'brand-apple',
		mainCategoryId: 'cat-smartphones',
		list:           'list',
	}],
	paymentMethod: {
		name:   'Credit Card',
		slug:   'credit-card',
		paidOn: '2024-01-15',
		status: 'paid',
		paymentMethodSubgroup: {
			name: 'Visa',
			paymentMethodGroup: { name: 'Card Payment' },
		},
	},
	remainingPaymentMethod: null,
};

// ─────────────────────────────────────────────────────────────────────────────

describe('Payload snapshots — GTM builder', () => {

	describe('login', () => {
		it('matches snapshot', async () => {
			const { push, gtm } = makeGtm();
			await gtm.login({ profile }, { cookieConsents: consents }, 'GA1.1.123456789.1642576494');
			// push[0] = clearEcommerce, push[1] = login payload
			expect(push.mock.calls[1][0]).toMatchSnapshot();
		});
	});

	describe('register', () => {
		it('matches snapshot', async () => {
			const { push, gtm } = makeGtm();
			await gtm.register(profile, 'email');
			expect(push.mock.calls[1][0]).toMatchSnapshot();
		});
	});

	describe('productClick (select_item)', () => {
		it('matches snapshot', async () => {
			const { push, gtm } = makeGtm();
			await gtm.productClick(product, 1, 'list');
			expect(push.mock.calls[1][0]).toMatchSnapshot();
		});
	});

	describe('addToCart', () => {
		it('matches snapshot', async () => {
			const { push, gtm } = makeGtm();
			await gtm.addToCart([product], 'list', 'standard');
			expect(push.mock.calls[1][0]).toMatchSnapshot();
		});
	});

	describe('checkout (begin_checkout)', () => {
		it('matches snapshot', async () => {
			const { push, gtm } = makeGtm();
			await gtm.checkout(cartProducts, 2, profile);
			expect(push.mock.calls[1][0]).toMatchSnapshot();
		});
	});

	describe('purchase', () => {
		it('matches snapshot', async () => {
			const { push, gtm } = makeGtm();
			await gtm.purchase(orderDetail, profile);
			expect(push.mock.calls[1][0]).toMatchSnapshot();
		});
	});

	describe('consentDefault', () => {
		it('matches snapshot', () => {
			const { push, gtm } = makeGtm();
			gtm.consentDefault();
			expect(push.mock.calls[0][0]).toMatchSnapshot();
		});
	});

	describe('consentUpdate (all granted)', () => {
		it('matches snapshot', () => {
			const { push, gtm } = makeGtm();
			gtm.consentUpdate(consents);
			expect(push.mock.calls[0][0]).toMatchSnapshot();
		});
	});

});

// ─────────────────────────────────────────────────────────────────────────────

describe('Payload snapshots — GA4 builder', () => {

	describe('userData', () => {
		it('matches snapshot', async () => {
			const { push, ga4 } = makeGa4();
			await ga4.userData({ profile }, { cookieConsents: consents }, 'GA1.1.123456789.1642576494', 'home');
			expect(push.mock.calls[0][0]).toMatchSnapshot();
		});
	});

	describe('onRegistrationCompleted', () => {
		it('matches snapshot (sensitive fields stripped)', async () => {
			const { push, ga4 } = makeGa4();
			const form = {
				email:            'new@example.com',
				password:         'should-not-appear',
				verificationCode: 'should-not-appear',
				recaptchaToken:   'should-not-appear',
				phoneNumber:      '0812345678',
			};
			await ga4.onRegistrationCompleted(form, 'email');
			expect(push.mock.calls[0][0]).toMatchSnapshot();
		});
	});

});
