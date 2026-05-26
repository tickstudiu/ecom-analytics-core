import {
	getCustomerIdFromGACookie,
	installmentPlanText,
	isValidEXTCode,
} from '../../../helpers/ga';

describe('helpers/ga', () => {

	describe('getCustomerIdFromGACookie', () => {
		it('แยก client ID จาก GA cookie format ปกติ', () => {
			expect(getCustomerIdFromGACookie('GA1.1.123921809.1642576494'))
				.toBe('123921809.1642576494');
		});

		it('รองรับ GA1.2.xxx.xxx format', () => {
			expect(getCustomerIdFromGACookie('GA1.2.987654321.1700000000'))
				.toBe('987654321.1700000000');
		});

		it('คืน empty string เมื่อ format ผิด', () => {
			expect(getCustomerIdFromGACookie('invalid')).toBe('');
			expect(getCustomerIdFromGACookie('GA1.1')).toBe('');
		});

		it('คืน empty string เมื่อรับ empty string', () => {
			expect(getCustomerIdFromGACookie('')).toBe('');
		});

		it('คืน empty string เมื่อไม่ส่ง argument', () => {
			expect(getCustomerIdFromGACookie()).toBe('');
		});
	});

	// ─────────────────────────────────────────────────────────────────────────

	describe('installmentPlanText', () => {
		it('สร้าง text จาก installment plan', () => {
			const plan = { interestRate: 0, monthCount: 3 };
			expect(installmentPlanText(plan)).toBe('Installment 0% (3 month(s))');
		});

		it('รองรับ interest rate มีทศนิยม', () => {
			const plan = { interestRate: 0.74, monthCount: 10 };
			expect(installmentPlanText(plan)).toBe('Installment 0.74% (10 month(s))');
		});

		it('คืน empty string เมื่อรับ null', () => {
			expect(installmentPlanText(null)).toBe('');
		});

		it('คืน empty string เมื่อรับ undefined', () => {
			expect(installmentPlanText(undefined)).toBe('');
		});
	});

	// ─────────────────────────────────────────────────────────────────────────

	describe('isValidEXTCode', () => {
		it('รู้จัก EXT code รูปแบบ EXT + ตัวเลข', () => {
			expect(isValidEXTCode('EXT12345')).toBe(true);
		});

		it('รู้จัก EXT code ที่มี suffix ตัวอักษรพิมพ์ใหญ่', () => {
			expect(isValidEXTCode('EXT12345_ABC')).toBe(true);
		});

		it('ปฏิเสธ string ที่ไม่ใช่ EXT format', () => {
			expect(isValidEXTCode('SKU12345')).toBe(false);
			expect(isValidEXTCode('ext12345')).toBe(false);
			expect(isValidEXTCode('EXT')).toBe(false);
			expect(isValidEXTCode('')).toBe(false);
		});
	});
});
