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
