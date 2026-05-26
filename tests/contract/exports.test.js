/**
 * API Contract Tests — index.js public surface
 *
 * Purpose: prevent accidental breaking changes to the library's public API.
 * These tests do NOT test behavior — only that named exports exist with the
 * correct type (function vs object/enum).
 *
 * A failure here means a consumer would get "X is not a function" at runtime.
 */

import * as lib from '../../index';

// ─────────────────────────────────────────────────────────────────────────────

describe('index.js public API contract', () => {

	// ── Builders ─────────────────────────────────────────────────────────────

	describe('Builders', () => {
		it('exports createGtmBuilders as a function', () => {
			expect(typeof lib.createGtmBuilders).toBe('function');
		});

		it('exports createGa4Builders as a function', () => {
			expect(typeof lib.createGa4Builders).toBe('function');
		});

		it('does NOT export createGaBuilders (removed in v2.2.0 — UA sunset)', () => {
			// Ensures legacy Universal Analytics builder was not accidentally re-added
			expect(lib.createGaBuilders).toBeUndefined();
		});
	});

	// ── Resolvers ─────────────────────────────────────────────────────────────

	describe('Resolvers', () => {
		const resolvers = [
			'transformUserProfile',
			'transformConsents',
			'transformProductItem',
			'transformPurchasePayment',
			'transformBundleSetsItems',
			'orderDetailProductPrice',
			'productCategory',
			'productPrice',
		];

		for (const name of resolvers) {
			it(`exports ${name} as a function`, () => {
				expect(typeof lib[name]).toBe('function');
			});
		}
	});

	// ── Helpers ───────────────────────────────────────────────────────────────

	describe('Helpers', () => {
		const helpers = [
			'convertSatangToBaht',
			'convertSatangToBahtWithDecimal',
			'getProductDetailRouteObject',
			'getCustomerIdFromGACookie',
			'dateTimeFormat',
			'transformConsentModeV2',
			'buildConsentUpdatePayload',
			'buildConsentDefaultPayload',
		];

		for (const name of helpers) {
			it(`exports ${name} as a function`, () => {
				expect(typeof lib[name]).toBe('function');
			});
		}

		it('does NOT export gaWrapper (removed in v2.2.0 — UA-only helper)', () => {
			expect(lib.gaWrapper).toBeUndefined();
		});
	});

	// ── Enums ─────────────────────────────────────────────────────────────────

	describe('Enums', () => {
		const enums = [
			'ADD_TO_CART_ACTION_TYPE',
			'ADD_TO_CART_TYPE',
			'CHECKOUT_EVENT',
			'CHECKOUT_STEP_TYPE',
			'COUPON_ACTION_TYPE',
			'CUSTOMER_CORPORATE_RANK',
			'MEDIA_GALLERY_TYPE',
			'MENU_POSITION',
			'PDPA_KEYS',
			'PRODUCT_REFERRER_SLUG',
			'PRODUCT_SORTING_KEYS',
			'PRODUCT_TYPE',
			'PROMOTION_TYPE',
			'PROVIDER',
			'WIDGET_HOMEPAGE_TYPE',
			'WISHLIST',
		];

		for (const name of enums) {
			it(`exports ${name} as an object`, () => {
				expect(typeof lib[name]).toBe('object');
				expect(lib[name]).not.toBeNull();
			});
		}

		it('PDPA_KEYS มี FUNCTIONAL, ANALYTICAL, MARKETING', () => {
			expect(lib.PDPA_KEYS.FUNCTIONAL).toBeDefined();
			expect(lib.PDPA_KEYS.ANALYTICAL).toBeDefined();
			expect(lib.PDPA_KEYS.MARKETING).toBeDefined();
		});

		it('PRODUCT_TYPE มี NORMAL และ FREEBIES', () => {
			expect(lib.PRODUCT_TYPE.NORMAL).toBeDefined();
			expect(lib.PRODUCT_TYPE.FREEBIES).toBeDefined();
		});

		it('PRODUCT_REFERRER_SLUG มี LIST', () => {
			expect(lib.PRODUCT_REFERRER_SLUG.LIST).toBeDefined();
		});

		it('WISHLIST มี ADDED และ REMOVED', () => {
			expect(lib.WISHLIST.ADDED).toBeDefined();
			expect(lib.WISHLIST.REMOVED).toBeDefined();
		});
	});

	// ── Smoke: builders return objects with methods ───────────────────────────

	describe('Builder smoke tests', () => {
		const ctx = {
			config:        { CHANNEL: 'test', CURRENCY_CODE: 'THB' },
			dataLayerPush: jest.fn(),
			$cookies:      { get: jest.fn() },
		};

		it('createGtmBuilders returns object with clearEcommerce', () => {
			const b = lib.createGtmBuilders(ctx);
			expect(typeof b.clearEcommerce).toBe('function');
		});

		it('createGa4Builders returns object with userData', () => {
			const b = lib.createGa4Builders(ctx);
			expect(typeof b.userData).toBe('function');
		});
	});
});
