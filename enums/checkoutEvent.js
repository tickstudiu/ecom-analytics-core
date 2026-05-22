/**
 * Enum for checkout event name
 * @readonly
 * @enum {String}
 */
export default Object.freeze({
	CART: 'cart',
	SHIPPING: 'shipping',
	PAYMENT: 'payment',
	REVIEW_ORDER: 'reviewOrder',
	PLACE_ORDER: 'placeOrder',
	SESSIONS_WITH_TRANSACTIONS: 'sessionsWithTransactions',
});
