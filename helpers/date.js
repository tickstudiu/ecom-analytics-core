import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import buddhistEra from 'dayjs/plugin/buddhistEra';

dayjs.extend(utc);
dayjs.extend(buddhistEra);

/**
 * Get year format for render date time
 * If locale is 'en' will use 'YYYY' format
 * If locale is 'th' will use 'BBBB' format
 * @returns {String} year format
 */
export const getYearFormat = () => {
	return dayjs.locale() === 'en' ? 'YYYY' : 'BBBB';
};

/**
 * Format the date
 * @param {String} date in other format
 */
export const dateTimeFormat = (date) => {
	if (!date) {
		return '';
	}

	return dayjs(date)
		.utcOffset(7)
		.format(`D MMM ${getYearFormat()}, HH:mm`);
};

/**
 * Format the date in to `D MMM YYYY`
 * @param {String} date date original format
 */
export const dateFormat = (date) => {
	if (!date) {
		return '';
	}

	return dayjs(date)
		.utcOffset(7)
		.format(`D MMM ${getYearFormat()}`);
};

/**
 * Format the date to `D MMMM YYYY` format
 * @param {String} date date original format
 */
export const fullDateFormat = (date) => {
	if (!date) {
		return '';
	}

	return dayjs(date)
		.utcOffset(7)
		.format(`D MMMM ${getYearFormat()}`);
};

/**
 * Format the time from `HH:mm:ssZ` to `HH:mm` format
 * @param {String} time time original format
 */
export const storeBranchOpeningHoursFormat = (time) => {
	if (!time) {
		throw new Error('Invalid time format');
	}

	// Since time value from Back-office setting is come with format `HH:mm:ssZ`
	// and it can't parse into dayjs() function
	// So we will use the mock date to fulfill datetime and get time in the format `HH:mm`
	// for render pick up at store branch opening hours
	const mockDate = '2021-01-01T';

	return dayjs(`${mockDate}${time}`)
		.utcOffset(7)
		.format('HH:mm');
};

/**
 * Get current year
 * @returns {String} current year
 */
export const getCurrentYear = () => {
	return dayjs().year();
};

/**
 * Format time
 * @param {String} date date original format
 * @param {String} format
 *
 * @returns {String} time
 */
export const timeFormat = (date, format = 'HH:mm') => {
	if (!date) {
		return '';
	}

	return dayjs(date)
		.utcOffset(7)
		.format(format);
};

/**
 * Add day to date
 * @param {Date} date
 * @param {Number} addDays
 * @returns {Date} added date
 */
export const addDaysToDate = (date, addDays = 0) => {
	if (!date) {
		return '';
	}

	const days = typeof addDays === 'number' ? addDays : 0;

	return dayjs(date).add(days, 'day');
};

export default {};
