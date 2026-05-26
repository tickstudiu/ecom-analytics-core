import {
	productCategory,
	productPrice,
	orderDetailProductPrice,
	transformProductItem,
	transformBundleSetsItems,
	transformPurchasePayment,
} from '../../../resolvers/order';
import PRODUCT_TYPE from '../../../enums/productType';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const category = {
	slug:           'iphone-16',
	parentSlugList: ['smartphones', 'apple'],
};

const baseProduct = {
	sku:          'SKU-001',
	name:         'iPhone 16 Pro',
	brand:        'Apple',
	sellingPrice: 10000,   // 100.00 THB
	srpPrice:     12000,   // 120.00 THB
	savePrice:    2000,    // 20.00 THB
	isInStock:    true,
	quantity:     1,
	categories:   [category],
	image:        'https://example.com/iphone.jpg',
};

// ─────────────────────────────────────────────────────────────────────────────

describe('resolvers/order', () => {

	// ─────────────────────────────────────────────────────────────────────────
	// productCategory
	// ─────────────────────────────────────────────────────────────────────────
	describe('productCategory', () => {
		it('รวม parentSlugList + slug เป็น path', () => {
			expect(productCategory(category)).toBe('smartphones/apple/iphone-16');
		});

		it('คืน slug เดียวเมื่อไม่มี parentSlugList หรือ empty', () => {
			expect(productCategory({ slug: 'tablets', parentSlugList: [] })).toBe('tablets');
		});

		it('คืน "" เมื่อรับ null', () => {
			expect(productCategory(null)).toBe('');
		});

		it('คืน "" เมื่อไม่มี slug', () => {
			expect(productCategory({ parentSlugList: ['a'] })).toBe('');
		});

		it('คืน "" เมื่อ parentSlugList ไม่ใช่ Array', () => {
			expect(productCategory({ slug: 'x', parentSlugList: 'wrong' })).toBe('');
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// productPrice
	// ─────────────────────────────────────────────────────────────────────────
	describe('productPrice', () => {
		it('ใช้ sellingPrice ก่อน', () => {
			expect(productPrice({ sellingPrice: 5000, primaryPrice: 9999 })).toBe('50.00');
		});

		it('fallback ไป primaryPrice เมื่อไม่มี sellingPrice', () => {
			expect(productPrice({ primaryPrice: 8000 })).toBe('80.00');
		});

		it('fallback ไป minPrice', () => {
			expect(productPrice({ minPrice: 3000 })).toBe('30.00');
		});

		it('คืน "0.00" เมื่อไม่มี price field ใดเลย', () => {
			expect(productPrice({})).toBe('0.00');
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// orderDetailProductPrice
	// ─────────────────────────────────────────────────────────────────────────
	describe('orderDetailProductPrice', () => {
		it('ใช้ priceSelling ก่อน', () => {
			expect(orderDetailProductPrice({ priceSelling: 7500 })).toBe('75.00');
		});

		it('fallback ไป priceSrp', () => {
			expect(orderDetailProductPrice({ priceSrp: 9900 })).toBe('99.00');
		});

		it('คืน "0.00" เมื่อไม่มี price field', () => {
			expect(orderDetailProductPrice({})).toBe('0.00');
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// transformProductItem
	// ─────────────────────────────────────────────────────────────────────────
	describe('transformProductItem', () => {

		it('ใช้ GA4 standard field names (item_id, item_name, item_brand, item_category)', () => {
			const result = transformProductItem(baseProduct);
			expect(result.item_id).toBe('SKU-001');
			expect(result.item_name).toBe('iPhone 16 Pro');
			expect(result.item_brand).toBe('Apple');
			expect(result.item_category).toBe('smartphones/apple/iphone-16');
		});

		it('ไม่มี UA legacy fields (id, name, brand, category) — removed in v2.1.0', () => {
			const result = transformProductItem(baseProduct);
			expect(result).not.toHaveProperty('id');
			expect(result).not.toHaveProperty('name');
			expect(result).not.toHaveProperty('brand');
			expect(result).not.toHaveProperty('category');
		});

		it('แปลง sellingPrice เป็น THB string', () => {
			const result = transformProductItem(baseProduct);
			expect(result.sellingPrice).toBe('100.00');
		});

		it('แปลง srpPrice เป็น THB string', () => {
			const result = transformProductItem(baseProduct);
			expect(result.srpPrice).toBe('120.00');
		});

		it('ตั้งค่า quantity default เป็น 1 เมื่อไม่ส่งมา', () => {
			const result = transformProductItem({ ...baseProduct, quantity: undefined });
			expect(result.quantity).toBe(1);
		});

		it('ใช้ quantity ที่ส่งมา', () => {
			const result = transformProductItem({ ...baseProduct, quantity: 3 });
			expect(result.quantity).toBe(3);
		});

		it('สร้าง breadcrumb จาก category path', () => {
			const result = transformProductItem(baseProduct);
			expect(result.breadcrumb).toBe('home/smartphones/apple/iphone-16');
		});

		it('productType เป็น NORMAL โดย default', () => {
			const result = transformProductItem(baseProduct);
			expect(result.productType).toBe(PRODUCT_TYPE.NORMAL);
		});

		// ── Stock status ────────────────────────────────────────────────────
		it('productStockStatus เป็น "in stock" เมื่อ isInStock = true', () => {
			const result = transformProductItem({ ...baseProduct, isInStock: true });
			expect(result.productStockStatus).toBe('in stock');
		});

		it('productStockStatus เป็น "in stock" เมื่อ availableStock = 5', () => {
			const result = transformProductItem({ ...baseProduct, isInStock: false, availableStock: 5 });
			expect(result.productStockStatus).toBe('in stock');
		});

		it('productStockStatus เป็น "out of stock" เมื่อ isInStock=false และ availableStock=0', () => {
			const result = transformProductItem({ ...baseProduct, isInStock: false, availableStock: 0 });
			expect(result.productStockStatus).toBe('out of stock');
		});

		it('productStockStatus เป็น "1 hour only" เมื่อ hasCollectAtStore=true', () => {
			const result = transformProductItem({ ...baseProduct, hasCollectAtStore: true });
			expect(result.productStockStatus).toBe('1 hour only');
		});

		// ── preorderStatus regression (v2.1.0 bug fix) ──────────────────────
		describe('[regression] preorderStatus', () => {
			it('เป็น "off" เมื่อ isPreOrder=false และ preOrder=false', () => {
				const result = transformProductItem({ ...baseProduct, isPreOrder: false, preOrder: false });
				expect(result.preorderStatus).toBe('off');
			});

			it('เป็น "off" เมื่อ isPreOrder และ preOrder ไม่มีใน object (undefined)', () => {
				// Bug v2.1.0: ถ้า || productItem.type ถูกใช้ ทุก product จะได้ "on"
				const result = transformProductItem({ ...baseProduct });
				expect(result.preorderStatus).toBe('off');
			});

			it('เป็น "on" เมื่อ isPreOrder=true', () => {
				const result = transformProductItem({ ...baseProduct, isPreOrder: true });
				expect(result.preorderStatus).toBe('on');
			});

			it('เป็น "on" เมื่อ preOrder=true (ชื่อ field ต่างกัน)', () => {
				const result = transformProductItem({ ...baseProduct, preOrder: true });
				expect(result.preorderStatus).toBe('on');
			});

			it('เป็น "off" เมื่อ product.type มีค่า (ต้อง not affect preorderStatus)', () => {
				// Bug เดิม: "|| productItem.type" ทำให้ type ใดๆ ก็ตาม → 'on'
				const result = transformProductItem({ ...baseProduct, type: 'pre_order', isPreOrder: false, preOrder: false });
				expect(result.preorderStatus).toBe('off');
			});
		});

		// ── Apple ID ────────────────────────────────────────────────────────
		it('appleId คือ appleSku เมื่อมี', () => {
			const result = transformProductItem({ ...baseProduct, appleSku: 'APL-001' });
			expect(result.appleId).toBe('APL-001');
		});

		it('appleId เป็น null เมื่อไม่มี appleSku', () => {
			const result = transformProductItem({ ...baseProduct, appleSku: undefined });
			expect(result.appleId).toBeNull();
		});

		// ── sellingPrice/srpPrice via priceSelling/priceSrp aliases ─────────
		it('รับ priceSelling alias ได้', () => {
			const result = transformProductItem({ ...baseProduct, sellingPrice: undefined, priceSelling: 6000 });
			expect(result.sellingPrice).toBe('60.00');
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// transformBundleSetsItems
	// ─────────────────────────────────────────────────────────────────────────
	describe('transformBundleSetsItems', () => {
		const bundle = {
			name: 'iPhone Bundle',
			items: [
				{ ...baseProduct, list: 'bundle' },
				{ ...baseProduct, sku: 'SKU-002', name: 'AirPods', list: 'bundle' },
			],
		};

		it('แปลงทุก item ใน bundle ได้', () => {
			const result = transformBundleSetsItems([bundle]);
			expect(result).toHaveLength(2);
			expect(result[0].item_id).toBe('SKU-001');
			expect(result[1].item_id).toBe('SKU-002');
		});

		it('แต่ละ item มี bundleName และ list', () => {
			const result = transformBundleSetsItems([bundle]);
			expect(result[0].bundleName).toBe('iPhone Bundle');
			expect(result[0].list).toBe('bundle');
		});

		it('freeGifts items มี productType = FREEBIES', () => {
			const bundleWithFreebie = {
				...bundle,
				freeGifts: {
					items: [{ ...baseProduct, sku: 'FREE-001', name: 'Case' }],
				},
			};
			const result = transformBundleSetsItems([bundleWithFreebie]);
			const freebie = result.find((p) => p.item_id === 'FREE-001');
			expect(freebie).toBeDefined();
			expect(freebie.productType).toBe(PRODUCT_TYPE.FREEBIES);
		});

		it('คืน [] เมื่อรับ empty array', () => {
			expect(transformBundleSetsItems([])).toEqual([]);
		});

		it('ใช้ default [] เมื่อไม่ส่ง argument', () => {
			expect(transformBundleSetsItems()).toEqual([]);
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// transformPurchasePayment
	// ─────────────────────────────────────────────────────────────────────────
	describe('transformPurchasePayment', () => {
		const payment = {
			name:   'Credit Card',
			slug:   'credit-card',
			paidOn: '2024-01-15',
			status: 'paid',
			paymentMethodSubgroup: {
				name: 'Visa',
				paymentMethodGroup: {
					name: 'Card Payment',
				},
			},
		};

		it('map ทุก field ถูกต้อง', () => {
			const result = transformPurchasePayment(payment);
			expect(result).toEqual({
				channel: 'Credit Card',
				slug:    'credit-card',
				date:    '2024-01-15',
				method:  'Visa',
				name:    'Card Payment',
				status:  'paid',
			});
		});

		it('method และ name เป็น null เมื่อไม่มี paymentMethodSubgroup', () => {
			const result = transformPurchasePayment({ ...payment, paymentMethodSubgroup: undefined });
			expect(result.method).toBeNull();
			expect(result.name).toBeNull();
		});

		it('คืน null เมื่อรับ null', () => {
			expect(transformPurchasePayment(null)).toBeNull();
		});

		it('คืน null เมื่อรับ undefined', () => {
			expect(transformPurchasePayment(undefined)).toBeNull();
		});
	});
});
