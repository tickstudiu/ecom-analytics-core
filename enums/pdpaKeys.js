/**
 * Enum for PDPA API and cookie Keys
 * FUNCTIONAL :: ความยินยอมในการให้ข้อมูลส่วนบุคลล
 * ANALYTICAL :: ความยินยอมให้บริษัทนำเสนอผลิตภัณฑ์ บริการ หรือโปรโมชั่นพิเศษต่างๆ
 * MARKETING :: ความยินยอมให้นำข้อมูลไปใช้พัฒนาให้เกิดการพัฒนาสินค้าหรือบริการให้ดียิ่งขึ้น
 * @readonly
 * @enum {String}
 */
export default Object.freeze({
	// Force update consents to use browser before
	IS_USING_BROWSER_BEFORE: 'IS_USING_BROWSER_BEFORE',
	FUNCTIONAL: 'FUNCTIONAL', // always true and it equals to ad_user_data and ad_storage
	ANALYTICAL: 'ANALYTICAL', // equals to analytics_storage
	MARKETING: 'MARKETING', // equals to ad_personalization
});
