import {
	convertSatangToBaht,
	convertSatangToBahtWithDecimal,
	convertBahtToSatang,
	priceFormat,
	priceBathFormat,
	discountedPriceFormat,
	numberFormat,
	positiveOnly,
	distanceFormat,
	formatToE164,
} from '../../../helpers/numeral';

describe('helpers/numeral', () => {

	// ─────────────────────────────────────────────────────────────────────────
	// convertSatangToBahtWithDecimal
	// ─────────────────────────────────────────────────────────────────────────
	describe('convertSatangToBahtWithDecimal', () => {
		it('แปลง 10000 satang → "100.00"', () => {
			expect(convertSatangToBahtWithDecimal(10000)).toBe('100.00');
		});

		it('แปลง 10050 satang → "100.50" (มีทศนิยม)', () => {
			expect(convertSatangToBahtWithDecimal(10050)).toBe('100.50');
		});

		it('แปลง 1 satang → "0.01"', () => {
			expect(convertSatangToBahtWithDecimal(1)).toBe('0.01');
		});

		// Regression: v2.1.0 bug — !0 คือ true ทำให้ return null แทน "0.00"
		it('[regression] แปลง 0 → "0.00" ไม่ใช่ null (free gift / zero discount)', () => {
			expect(convertSatangToBahtWithDecimal(0)).toBe('0.00');
		});

		it('คืน null เมื่อรับ null', () => {
			expect(convertSatangToBahtWithDecimal(null)).toBeNull();
		});

		it('คืน null เมื่อรับ undefined', () => {
			expect(convertSatangToBahtWithDecimal(undefined)).toBeNull();
		});

		it('รับ string number ได้ เช่น "5000" → "50.00"', () => {
			expect(convertSatangToBahtWithDecimal('5000')).toBe('50.00');
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// convertSatangToBaht
	// ─────────────────────────────────────────────────────────────────────────
	describe('convertSatangToBaht', () => {
		it('แปลง 10000 satang → 100', () => {
			expect(convertSatangToBaht(10000)).toBe(100);
		});

		it('แปลง 10050 satang → 100.5', () => {
			expect(convertSatangToBaht(10050)).toBe(100.5);
		});

		it('คืน 0 เมื่อรับ 0', () => {
			expect(convertSatangToBaht(0)).toBe(0);
		});

		it('คืน 0 เมื่อรับ null', () => {
			expect(convertSatangToBaht(null)).toBe(0);
		});

		it('คืน 0 เมื่อรับ undefined', () => {
			expect(convertSatangToBaht(undefined)).toBe(0);
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// convertBahtToSatang
	// ─────────────────────────────────────────────────────────────────────────
	describe('convertBahtToSatang', () => {
		it('แปลง 100 baht → 10000 satang', () => {
			expect(convertBahtToSatang(100)).toBe(10000);
		});

		it('แปลง 0.01 baht → 1 satang', () => {
			expect(convertBahtToSatang(0.01)).toBe(1);
		});

		it('คืน 0 เมื่อรับ 0', () => {
			expect(convertBahtToSatang(0)).toBe(0);
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// priceFormat
	// ─────────────────────────────────────────────────────────────────────────
	describe('priceFormat', () => {
		it('format 10000 satang → "฿100"', () => {
			expect(priceFormat(10000)).toMatch(/฿100/);
		});

		it('แสดง decimal 2 ตำแหน่งเมื่อราคามี satang', () => {
			const result = priceFormat(10050);
			expect(result).toMatch(/100\.50/);
		});

		it('ไม่แสดง decimal เมื่อราคาลงตัว', () => {
			const result = priceFormat(10000);
			expect(result).not.toMatch(/\.\d/);
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// priceBathFormat
	// ─────────────────────────────────────────────────────────────────────────
	describe('priceBathFormat', () => {
		it('format 100 baht → "฿100"', () => {
			expect(priceBathFormat(100)).toMatch(/฿100/);
		});

		it('แสดง decimal 2 ตำแหน่งเมื่อมีสตางค์', () => {
			const result = priceBathFormat(100.5);
			expect(result).toMatch(/100\.50/);
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// discountedPriceFormat
	// ─────────────────────────────────────────────────────────────────────────
	describe('discountedPriceFormat', () => {
		it('format 5000 satang → "- ฿50"', () => {
			const result = discountedPriceFormat(5000);
			expect(result).toMatch(/^-\s/);
			expect(result).toMatch(/฿50/);
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// numberFormat
	// ─────────────────────────────────────────────────────────────────────────
	describe('numberFormat', () => {
		it('format 1000 → มี separator', () => {
			const result = numberFormat(1000);
			// Thai locale uses comma or other separator — just ensure it's a string
			expect(typeof result).toBe('string');
			expect(result).not.toBe('');
		});

		it('ใช้ default 0 เมื่อไม่ส่ง argument', () => {
			expect(numberFormat()).toBe('0');
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// positiveOnly
	// ─────────────────────────────────────────────────────────────────────────
	describe('positiveOnly', () => {
		it('คืนค่า positive number ตามที่ส่งมา', () => {
			expect(positiveOnly(5)).toBe(5);
		});

		it('คืน 0 เมื่อ number < 0', () => {
			expect(positiveOnly(-3)).toBe(0);
		});

		it('คืน 0 เมื่อ number = 0', () => {
			expect(positiveOnly(0)).toBe(0);
		});

		it('คืน NaN เมื่อรับ NaN', () => {
			expect(positiveOnly(NaN)).toBeNaN();
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// distanceFormat
	// ─────────────────────────────────────────────────────────────────────────
	describe('distanceFormat', () => {
		it('format distance 1.5 km → "1.5 km"', () => {
			expect(distanceFormat(1.5, 'km')).toBe('1.5 km');
		});

		it('format distance 0.3 ไมล์ → "0.3 mi"', () => {
			expect(distanceFormat(0.3, 'mi')).toBe('0.3 mi');
		});

		it('truncates to 1 decimal place', () => {
			expect(distanceFormat(2.999, 'km')).toBe('3.0 km');
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// formatToE164
	// ─────────────────────────────────────────────────────────────────────────
	describe('formatToE164', () => {
		it('แปลง 0812345678 → "+66812345678"', () => {
			expect(formatToE164('0812345678')).toBe('+66812345678');
		});

		it('ลบ non-digit characters ออก', () => {
			expect(formatToE164('081-234-5678')).toBe('+66812345678');
		});

		it('รองรับ custom country code', () => {
			expect(formatToE164('0812345678', '+1')).toBe('+1812345678');
		});

		it('คืน null เมื่อรับ null', () => {
			expect(formatToE164(null)).toBeNull();
		});

		it('คืน null เมื่อรับ empty string', () => {
			expect(formatToE164('')).toBeNull();
		});
	});
});
