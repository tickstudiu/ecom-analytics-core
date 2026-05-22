/**
 * Enum for product type for GA4
 * @readonly
 * @enum {String}
 */
export default Object.freeze({
	NORMAL: 'Normal',
	FREEBIES: 'Freebies',
	FLASH_SALE: 'flashSale',

	// Pre-order
	PRE_ORDER_FULL_PRICE: 'preOrderFullPrice',
	PRE_ORDER_RESERVE_PRICE: 'preOrderReservePrice',

	// Pre-order API Keys
	API_PRE_ORDER: 'pre_order',
	API_PRE_ORDER_FULL_PRICE: 'full_price',
	API_PRE_ORDER_RESERVE_PRICE: 'reserve',

	// Braze
	BRAZE_FIXED: 'fixed',
	BRAZE_PERSONALIZED: 'personalized',
});
