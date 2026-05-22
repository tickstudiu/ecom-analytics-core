import Big from 'big.js';

/**
 * Convert Satang to Baht
 * @param {Number|String} value Satang
 * @returns {String} Baht
 */
export const convertSatangToBaht = (value) => {
	if (!value) {
		return 0;
	}

	return new Big(value).div(100).toNumber();
};

/**
 * Convert Satang to Baht with decimal
 * @param {Number|String} value Satang
 * @returns {String} Baht with decimal
 */
export const convertSatangToBahtWithDecimal = (value) => {
	if (!value) {
		return null;
	}

	return new Big(value).div(100).toFixed(2);
};

/**
 * Convert Baht to Satang
 * @param {Number|String} value Baht
 * @returns {String} Satang
 */
export const convertBahtToSatang = (value = 0) => {
	return new Big(value).times(100).toNumber();
};

/**
 * Format the price value
 * @param {Number|String} price Price in Satang
 */
export const priceFormat = (price = 0) => {
	const satangPrice = new Big(price);

	// Convert price from satang to baht
	const bahtPrice = convertSatangToBaht(satangPrice);

	// If the bahtPrice have decimal, show it as 2 digits
	// Otherwise, do not show the decimal
	let localeStringOptions;
	if (Math.round(bahtPrice) !== Number(bahtPrice)) {
		localeStringOptions = {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		};
	}

	return `฿${Number(bahtPrice).toLocaleString(undefined, localeStringOptions)}`;
};

/**
 * Format the price value
 * @param {Number|String} price Price in Bath
 */
export const priceBathFormat = (price = 0) => {
	const bahtPrice = new Big(price);

	// If the bahtPrice have decimal, show it as 2 digits
	// Otherwise, do not show the decimal
	let localeStringOptions;
	if (Math.round(bahtPrice) !== Number(bahtPrice)) {
		localeStringOptions = {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		};
	}

	return `฿${Number(bahtPrice).toLocaleString(undefined, localeStringOptions)}`;
};

/**
 * Format the discounted price value
 * @param {Number|String} price Price in Satang
 */
export const discountedPriceFormat = (price = 0) => {
	return `- ${priceFormat(price)}`;
};

/**
 * Format number with separator 1000 -> 1,000
 * @param {Number|String} number
 */
export const numberFormat = (number = 0) => {
	return new Intl.NumberFormat('th-TH').format(number);
};

/**
 * Convert number to positive value only
 * @param {Number} number
 * @returns {Number} If the argument is negative, returns 0. Otherwise, return argument.
 */
export const positiveOnly = (number) => {
	if (isNaN(number)) {
		return NaN;
	}
	if (number < 0) {
		return 0;
	}
	return number;
};

/**
 * Convert to distance format
 * @param {Number} distance
 * @returns {Sting} distance in string
 */
export const distanceFormat = (distance, unit) => {
	return `${distance.toFixed(1)} ${unit}`;
};

/**
 * Formats a phone number to the E.164 standard.
 *
 * Removes any non-digit characters and checks if the number starts with a 0.
 * If it starts with a 0, the 0 is removed. The function then prepends the
 * provided country code (defaulting to '+66') to the cleaned number.
 *
 * @param {String} phoneNumber - The phone number to format.
 * @param {String} [countryCode='+66'] - The country code to prepend.
 * @returns {String} - The formatted phone number in E.164 format.
 */
export const formatToE164 = (phoneNumber, countryCode = '+66') => {
	if (!phoneNumber) {
		return null;
	}

	let cleanedNumber = phoneNumber.replace(/\D/g, '');
	if (cleanedNumber.startsWith('0')) {
		cleanedNumber = cleanedNumber.substring(1); // ตัดเลข 0 ออก
	}
	return `${countryCode}${cleanedNumber}`;
};
