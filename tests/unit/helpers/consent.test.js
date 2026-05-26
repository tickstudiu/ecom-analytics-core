import {
	transformConsentModeV2,
	buildConsentUpdatePayload,
	buildConsentDefaultPayload,
} from '../../../helpers/consent';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const allGrantedArray = [
	{ name: 'FUNCTIONAL',  value: true },
	{ name: 'ANALYTICAL',  value: true },
	{ name: 'MARKETING',   value: true },
];

const allDeniedArray = [
	{ name: 'FUNCTIONAL',  value: false },
	{ name: 'ANALYTICAL',  value: false },
	{ name: 'MARKETING',   value: false },
];

const mixedArray = [
	{ name: 'FUNCTIONAL',  value: true  },
	{ name: 'ANALYTICAL',  value: true  },
	{ name: 'MARKETING',   value: false },
];

const allGrantedObject = { FUNCTIONAL: true, ANALYTICAL: true, MARKETING: true };
const allDeniedObject  = { FUNCTIONAL: false, ANALYTICAL: false, MARKETING: false };
const mixedObject      = { FUNCTIONAL: true, ANALYTICAL: false, MARKETING: true };

// ─────────────────────────────────────────────────────────────────────────────

describe('helpers/consent', () => {

	describe('transformConsentModeV2', () => {

		describe('Array format (from API/login/logout)', () => {
			it('all granted → ทุก field เป็น granted (ยกเว้น functionality/security ที่ granted เสมอ)', () => {
				const result = transformConsentModeV2(allGrantedArray);
				expect(result.ad_storage).toBe('granted');
				expect(result.analytics_storage).toBe('granted');
				expect(result.ad_user_data).toBe('granted');
				expect(result.ad_personalization).toBe('granted');
			});

			it('all denied → ad fields เป็น denied', () => {
				const result = transformConsentModeV2(allDeniedArray);
				expect(result.ad_storage).toBe('denied');
				expect(result.analytics_storage).toBe('denied');
				expect(result.ad_user_data).toBe('denied');
				expect(result.ad_personalization).toBe('denied');
			});

			it('FUNCTIONAL=true → ad_storage และ ad_user_data เป็น granted', () => {
				const result = transformConsentModeV2(mixedArray);
				expect(result.ad_storage).toBe('granted');
				expect(result.ad_user_data).toBe('granted');
			});

			it('ANALYTICAL=true → analytics_storage เป็น granted', () => {
				const result = transformConsentModeV2(mixedArray);
				expect(result.analytics_storage).toBe('granted');
			});

			it('MARKETING=false → ad_personalization เป็น denied', () => {
				const result = transformConsentModeV2(mixedArray);
				expect(result.ad_personalization).toBe('denied');
			});
		});

		describe('Object format (from PDPA modal)', () => {
			it('all granted object → ทุก field เป็น granted', () => {
				const result = transformConsentModeV2(allGrantedObject);
				expect(result.ad_storage).toBe('granted');
				expect(result.analytics_storage).toBe('granted');
				expect(result.ad_user_data).toBe('granted');
				expect(result.ad_personalization).toBe('granted');
			});

			it('mixed object → mapping ถูกต้อง', () => {
				// FUNCTIONAL=true → ad_storage/ad_user_data granted
				// ANALYTICAL=false → analytics_storage denied
				// MARKETING=true → ad_personalization granted
				const result = transformConsentModeV2(mixedObject);
				expect(result.ad_storage).toBe('granted');
				expect(result.ad_user_data).toBe('granted');
				expect(result.analytics_storage).toBe('denied');
				expect(result.ad_personalization).toBe('granted');
			});
		});

		describe('fields ที่ต้อง granted เสมอ', () => {
			it('functionality_storage เป็น granted เสมอ', () => {
				expect(transformConsentModeV2(allDeniedArray).functionality_storage).toBe('granted');
				expect(transformConsentModeV2(allDeniedObject).functionality_storage).toBe('granted');
				expect(transformConsentModeV2([]).functionality_storage).toBe('granted');
			});

			it('security_storage เป็น granted เสมอ', () => {
				expect(transformConsentModeV2(allDeniedArray).security_storage).toBe('granted');
				expect(transformConsentModeV2([]).security_storage).toBe('granted');
			});
		});

		describe('edge cases', () => {
			it('empty array → ทุก ad field เป็น denied', () => {
				const result = transformConsentModeV2([]);
				expect(result.ad_storage).toBe('denied');
				expect(result.analytics_storage).toBe('denied');
			});

			it('ไม่ส่ง argument → ใช้ default [] → ทุก ad field เป็น denied', () => {
				const result = transformConsentModeV2();
				expect(result.ad_storage).toBe('denied');
			});

			it('array ที่ไม่มี key ที่ตรงกัน → denied', () => {
				const result = transformConsentModeV2([{ name: 'UNKNOWN', value: true }]);
				expect(result.ad_storage).toBe('denied');
			});
		});
	});

	// ─────────────────────────────────────────────────────────────────────────

	describe('buildConsentDefaultPayload', () => {
		let payload;

		beforeEach(() => { payload = buildConsentDefaultPayload(); });

		it('มี event: "consent_default"', () => {
			expect(payload.event).toBe('consent_default');
		});

		it('ทุก ad field เป็น denied (safe default ก่อน CMP load)', () => {
			expect(payload.ad_storage).toBe('denied');
			expect(payload.analytics_storage).toBe('denied');
			expect(payload.ad_user_data).toBe('denied');
			expect(payload.ad_personalization).toBe('denied');
		});

		it('functionality_storage และ security_storage เป็น granted', () => {
			expect(payload.functionality_storage).toBe('granted');
			expect(payload.security_storage).toBe('granted');
		});

		it('มี wait_for_update: 500', () => {
			expect(payload.wait_for_update).toBe(500);
		});
	});

	// ─────────────────────────────────────────────────────────────────────────

	describe('buildConsentUpdatePayload', () => {
		it('มี event: "consent_update"', () => {
			expect(buildConsentUpdatePayload(allGrantedArray).event).toBe('consent_update');
		});

		it('spread consent signals ที่ถูก map จาก consents', () => {
			const payload = buildConsentUpdatePayload(allGrantedArray);
			expect(payload.ad_storage).toBe('granted');
			expect(payload.analytics_storage).toBe('granted');
		});

		it('ไม่มี wait_for_update (update ไม่ต้องรอ)', () => {
			expect(buildConsentUpdatePayload(allGrantedArray).wait_for_update).toBeUndefined();
		});
	});
});
