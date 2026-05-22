/**
 * Get customer id from GA cookie
 * @param {String} cid cookie _ga value "GA1.1.123921809.1642576494"
 * @return {String} "123921809.1642576494"
 */
export const getCustomerIdFromGACookie = (cid = '') => {
	const splited = cid.split('.');
	if (splited?.[2] && splited?.[3]) {
		return `${splited[2]}.${splited[3]}`;
	}
	return '';
};

/**
 * Create a installment plan's text to be send to GA
 * @returns {String}
 */
export const installmentPlanText = (installmentPlan) => {
	if (!installmentPlan) {
		return '';
	}
	return `Installment ${installmentPlan.interestRate}% (${installmentPlan.monthCount} month(s))`;
};

/**
 * Get GA's category for Product Detail events
 * @param {String} category Event's category
 * @param {ProductDetail} product
 * @returns {String}
 */
export const pdCategory = (category, product) => {
	return product.preOrder ? `PrePP${product.sku}_${category}` : `PP${product.sku}_${category}`;
};

/**
 * Get GA's action for Product Detail events
 * @param {String} actionName Event's action
 * @param {ProductDetail} product
 * @returns {String}
 */
export const pdAction = (actionName, product) => {
	return product.preOrder ? `PrePP_${actionName}` : `PP_${actionName}`;
};

export const isValidEXTCode = (text) => {
	return /^EXT\d+(_[A-Z]+)?$/.test(text);
};

export default {};
