import PDPA_KEYS from '../enums/pdpaKeys';

/**
 * Transform PDPA consents → Google Consent Mode v2 signals
 *
 * Mapping (per comments in pdpaKeys enum):
 *   FUNCTIONAL  → ad_storage + ad_user_data  (always granted; it's the baseline consent)
 *   ANALYTICAL  → analytics_storage
 *   MARKETING   → ad_personalization
 *
 * Reference: https://developers.google.com/tag-platform/security/guides/consent
 *
 * Accepts TWO formats:
 *   - Array (from API/login/logout):  [{ name: 'ANALYTICAL', value: true }, ...]
 *   - Object (from PDPA modal):       { FUNCTIONAL: true, ANALYTICAL: false, MARKETING: false }
 *
 * @param {Array|Object} consents
 * @returns {ConsentModeV2} - object ready to spread into a GTM dataLayer push
 */
export const transformConsentModeV2 = (consents = []) => {
	const get = (key) => {
		// Array format: [{ name: 'KEY', value: bool }]
		if (Array.isArray(consents)) {
			const found = consents.find((c) => c.name === key);
			return found?.value === true ? 'granted' : 'denied';
		}
		// Object format: { KEY: bool }
		return consents[key] === true ? 'granted' : 'denied';
	};

	const functional  = get(PDPA_KEYS.FUNCTIONAL);
	const analytical  = get(PDPA_KEYS.ANALYTICAL);
	const marketing   = get(PDPA_KEYS.MARKETING);

	return {
		ad_storage:          functional,   // FUNCTIONAL covers ad cookies
		analytics_storage:   analytical,   // ANALYTICAL covers measurement
		ad_user_data:        functional,   // FUNCTIONAL covers sending user data to Google
		ad_personalization:  marketing,    // MARKETING covers personalised ads
		functionality_storage: 'granted',  // always required for site to work
		security_storage:      'granted',  // always required
	};
};

/**
 * Build a GTM-ready consent_update push payload
 * Use this when PDPA consent changes (e.g. user updates cookie preferences)
 *
 * @param {Array} consents
 * @returns {Object} dataLayer payload
 */
export const buildConsentUpdatePayload = (consents = []) => ({
	event: 'consent_update',
	...transformConsentModeV2(consents),
});

/**
 * Build a GTM-ready consent default payload (fire BEFORE any other tags on page load)
 * If no stored consent is available, deny everything except functional/security
 *
 * @returns {Object} dataLayer payload
 */
export const buildConsentDefaultPayload = () => ({
	event: 'consent_default',
	ad_storage:          'denied',
	analytics_storage:   'denied',
	ad_user_data:        'denied',
	ad_personalization:  'denied',
	functionality_storage: 'granted',
	security_storage:      'granted',
	wait_for_update:       500,  // ms — wait for CMP to update
});

export default {};
