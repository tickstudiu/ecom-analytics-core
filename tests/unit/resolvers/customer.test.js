import { transformUserProfile, transformConsents } from '../../../resolvers/customer';
import PDPA_KEYS from '../../../enums/pdpaKeys';

describe('resolvers/customer', () => {

	// ─────────────────────────────────────────────────────────────────────────
	// transformUserProfile
	// ─────────────────────────────────────────────────────────────────────────
	describe('transformUserProfile', () => {
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

		it('map ทุก field ถูกต้อง', () => {
			const result = transformUserProfile(profile);
			expect(result).toEqual({
				id:          42,
				referenceId: 'ref-001',
				provider:    'email',
				firstname:   'สมชาย',
				lastname:    'ใจดี',
				phoneNumber: '0812345678',
				email:       'test@example.com',
				transacted:  true,
				method:      'MEMBER',   // ← customerGroup
				group:       'email',    // ← provider
				type:        'GOLD',     // ← rank
				birthdate:   '1990-01-15',
			});
		});

		it('คืน {} เมื่อรับ null', () => {
			expect(transformUserProfile(null)).toEqual({});
		});

		it('คืน {} เมื่อรับ undefined', () => {
			expect(transformUserProfile(undefined)).toEqual({});
		});

		it('รับ partial profile ได้ (fields ที่ขาดเป็น undefined)', () => {
			const result = transformUserProfile({ id: 1 });
			expect(result.id).toBe(1);
			expect(result.firstname).toBeUndefined();
		});
	});

	// ─────────────────────────────────────────────────────────────────────────
	// transformConsents
	// ─────────────────────────────────────────────────────────────────────────
	describe('transformConsents', () => {
		const consents = [
			{ name: PDPA_KEYS.FUNCTIONAL,  value: true  },
			{ name: PDPA_KEYS.ANALYTICAL,  value: true  },
			{ name: PDPA_KEYS.MARKETING,   value: false },
		];

		it('map consent array เป็น object keyed by PDPA_KEY', () => {
			const result = transformConsents(consents);
			expect(result[PDPA_KEYS.FUNCTIONAL]).toMatchObject({ value: true });
			expect(result[PDPA_KEYS.ANALYTICAL]).toMatchObject({ value: true });
			expect(result[PDPA_KEYS.MARKETING]).toMatchObject({ value: false });
		});

		it('คืน {} เมื่อรับ null (ไม่ throw)', () => {
			expect(transformConsents(null)).toEqual({});
		});

		it('คืน {} เมื่อรับ string (non-array)', () => {
			expect(transformConsents('invalid')).toEqual({});
		});

		it('คืน {} เมื่อรับ object (non-array)', () => {
			expect(transformConsents({ a: 1 })).toEqual({});
		});

		it('ใช้ default [] เมื่อไม่ส่ง argument', () => {
			expect(transformConsents()).toEqual({
				[PDPA_KEYS.FUNCTIONAL]: undefined,
				[PDPA_KEYS.ANALYTICAL]: undefined,
				[PDPA_KEYS.MARKETING]:  undefined,
			});
		});
	});
});
