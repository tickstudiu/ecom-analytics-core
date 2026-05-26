import PDPA_KEYS from '../enums/pdpaKeys';

/**
 * Transform User Profile
 * @param {Object} profile profile data
 * @return {UserProfileDataLayer}
 */
export const transformUserProfile = (profile) => {
	if (!profile) {
		return {};
	}

	return {
		id: profile.id,
		referenceId: profile.referenceId,
		provider: profile.provider,
		firstname: profile.firstname,
		lastname: profile.lastname,
		phoneNumber: profile.phoneNumber,
		email: profile.email,
		transacted: profile.transacted,
		method: profile.customerGroup,
		group: profile.provider,
		type: profile.rank,
		birthdate: profile.birthdate,
	};
};

export const transformConsents = (consents = []) => {
	if (!Array.isArray(consents)) {
		return {};
	}

	return {
		[PDPA_KEYS.FUNCTIONAL]: consents.find((cookieConsent) => cookieConsent.name === PDPA_KEYS.FUNCTIONAL),
		[PDPA_KEYS.ANALYTICAL]: consents.find((cookieConsent) => cookieConsent.name === PDPA_KEYS.ANALYTICAL),
		[PDPA_KEYS.MARKETING]: consents.find((cookieConsent) => cookieConsent.name === PDPA_KEYS.MARKETING),
	};
};

export default {};
