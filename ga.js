import { convertSatangToBaht } from './helpers/numeral';
import {
	pdAction,
	pdCategory,
	installmentPlanText,
} from './helpers/ga';

import PRODUCT_TYPE from './enums/productType';
import CHECKOUT_STEP_TYPE from './enums/checkoutStepType';
import MEDIA_GALLERY_TYPE from './enums/mediaGalleryType';
import ADD_TO_CART_ACTION_TYPE from './enums/addToCartActionType';

/**
 * Helper function to create a GA event object
 * @param {String} eventCategory - Event category
 * @param {String} eventAction - Event action
 * @param {String} eventLabel - Event label
 * @param {Number} eventValue - Event value
 * @returns {Object} - GA event object
 */
const gaWrapper = (eventCategory, eventAction, eventLabel, eventValue) => {
	return {
		event: 'eventTracking',
		eventCategory,
		eventAction,
		eventLabel,
		eventValue,
	};
};

export const createGaBuilders = ({ config, dataLayerPush }) => ({
	// #region Home
	// 2
	homeWidgetClicked(widgetType, widgetPosition, widgetName, bannerImageName, bannerPosition) {
		dataLayerPush(gaWrapper(`Homepage_${widgetPosition}`, `${widgetType}_${widgetName}`, `${bannerImageName}_${bannerPosition}`));
	},

	homeWidgetSwipe(widgetType, widgetPosition, widgetName, bannerImageName, bannerPosition, isClicked) {
		dataLayerPush(gaWrapper(`Homepage_${widgetPosition}_swiper${isClicked ? '_clicked' : ''}`, `${widgetType}_${widgetName}_swiper${isClicked ? '_clicked' : ''}`, `${bannerImageName}_${bannerPosition}`));
	},

	homeWidgetClickedViewAll(widgetType, widgetPosition, widgetName, url) {
		dataLayerPush(gaWrapper(`Homepage_${widgetPosition}_viewall`, `${widgetType}_${widgetName}_viewall`, url));
	},

	// 4
	flashSaleAddToCart(flashSaleName, productPosition) {
		dataLayerPush(gaWrapper('Homepage_Flashsales', 'Flashsale_product', `${flashSaleName}_${productPosition}`));
	},

	// 5
	flashSaleSeeMore(flashSaleName) {
		dataLayerPush(gaWrapper('Homepage_Flashsales', 'Flashsale_category', flashSaleName));
	},
	// #endregion

	// #region Header
	// 14
	headerMainMenuCategoryClicked(category) {
		if (!category) {
			return;
		}

		const selectedCategory = [...(category?.parentSlugList ?? []), category.slug].join('|');
		const categoryPosition = `${category.gaCateLv1Position || 0}`;
		dataLayerPush(gaWrapper('all_Menu', categoryPosition, selectedCategory));
	},

	// 15
	headerSearch(category = 'all', searchKeyword = '') {
		dataLayerPush(gaWrapper('all_Search', category, searchKeyword));
	},

	// 16
	headerMiniCartClicked() {
		dataLayerPush(gaWrapper('all_minicart', 'Minicart', 'minicart'));
	},

	/**
	 * 18
	 * @param {'email'|'google'|'facebook'|'apple'} loginType
	 */
	loginAttempt(loginType) {
		dataLayerPush(gaWrapper('all_Login', 'Login', loginType));
	},

	// 19
	switchLanguage(selectedLang) {
		dataLayerPush(gaWrapper('all_switch', 'Language', selectedLang));
	},

	// 20
	headerStoreLocationClicked() {
		dataLayerPush(gaWrapper('all_store', 'store'));
	},
	// #endregion

	// #region Footer
	/**
	 * 22
	 * @param {'facebook'|'instagram'|'line'} loginType
	 */
	footerSocialClicked(socialType) {
		dataLayerPush(gaWrapper('all_Social', 'Social_Footer', socialType));
	},
	// #endregion

	// #region PDPA
	/**
	 * 10
	 * @param {'Yes'|'Setting'} buttonClicked
	 */
	pdpaBarAction(buttonClicked) {
		dataLayerPush(gaWrapper('Policy', 'Policy', buttonClicked));
	},

	// 11
	pdpaSettingSubmit(consents = []) {
		dataLayerPush(gaWrapper('PDPA', 'PDPA', consents.map((consent) => (consent ? 'Accept' : 'Decline')).join('|')));
	},
	// #endregion

	// #region Contact Us
	// 12
	contactUsFormSubmit(topic) {
		dataLayerPush(gaWrapper('ContactUs_submit', 'ContactUS', topic));
	},

	// 13
	contactUsCallCenter(phoneNumber) {
		dataLayerPush(gaWrapper('ContactUs_Call', 'ContactUS', phoneNumber));
	},
	// #endregion

	// #region Signup
	/**
	 * 23
	 * @param {'email'|'google'|'facebook'|'apple'} registerType
	 */
	register(registerType) {
		dataLayerPush(gaWrapper('all_Login', 'Signup', registerType));
	},

	// 24
	forgetPassword() {
		dataLayerPush(gaWrapper('all_Login', 'forgetpassword'));
	},
	// #endregion

	// #region Store Location
	// 28
	storeLocationStoreClicked(storeName) {
		dataLayerPush(gaWrapper('Storelocation', 'click', storeName));
	},

	// 28 - 2 trigger when store lcoation node displayed
	storeLocationStoreViewed(storeName, storeAddress) {
		dataLayerPush(gaWrapper('Storelocation', 'view', `${storeName}|${storeAddress}`));
	},

	// 29
	storeLocationSelectProvince(province = {}) {
		dataLayerPush(gaWrapper('Storelocation', province.name));
	},
	// #endregion

	// #region Product List / MKT
	// 30
	plProductClicked(product, productPosition, pageNumber, categoryPageSlug) {
		if (!product) {
			return;
		}

		dataLayerPush(gaWrapper(`PL_${categoryPageSlug}_select`, `select_${product.sku}`, `${pageNumber}_${productPosition}`));
	},

	// 31
	plProductSorted(sortingSelected, categoryPageSlug) {
		dataLayerPush(gaWrapper(`PL_${categoryPageSlug}_sorting`, 'sorting', `${sortingSelected}`));
	},

	/**
	 * 32
	 * @param {'next'|'previous'} buttonType
	 */
	plProductPaginationNextPrevClicked(buttonType, categoryPageSlug) {
		dataLayerPush(gaWrapper(`PL_${categoryPageSlug}_page`, buttonType));
	},

	// 34
	plFilterChanged(filterGroup, filterValue, categoryPageSlug) {
		dataLayerPush(gaWrapper(`PL_${categoryPageSlug}_filter`, filterGroup, filterValue));
	},

	// 35
	plFilterShowInStockOnly(value, categoryPageSlug) {
		dataLayerPush(gaWrapper(`PL_${categoryPageSlug}_filter`, 'rankstock', `${value}`));
	},

	plExpand(expand, categoryPageSlug) {
		dataLayerPush(gaWrapper(`PL_${categoryPageSlug}_collapse`, 'content_collapse', expand));
	},
	// #endregion

	// #region Product Detail
	/**
	 * 36, 52
	 * @param {ProductDetail} product
	 * @param {String} variantGroup Selected variant group
	 * @param {String} variantValue Selected variant value's text
	 */
	pdVariantSelected(product, variantGroup, variantValue) {
		if (!product) {
			return;
		}

		dataLayerPush(gaWrapper(pdCategory('Variant', product), variantGroup, variantValue));
	},

	/**
	 * 37, 53
	 * @param {ProductDetail} product
	 * @param {Object} bundle
	 */
	pdBundleSelected(product, bundle) {
		if (!product || !bundle || !bundle.items || bundle.items.length <= 0) {
			return;
		}
		const skuList = bundle.items.map((item) => item.sku).join(',');
		dataLayerPush(gaWrapper(pdCategory('Bundle', product), `BundleView_${bundle.bundleName}`, skuList));
	},

	/**
	 * 38, 54
	 * @param {ProductDetail} product
	 * @param {Object} bundle
	 */
	pdBundleBuy(product, bundle, addToCartAction) {
		if (!product || !bundle || !bundle.items || bundle.items.length <= 0) {
			return;
		}
		let addToCartActionText;
		switch (addToCartAction) {
			case ADD_TO_CART_ACTION_TYPE.ADD_TO_CART:
				addToCartActionText = 'Add';
				break;
			case ADD_TO_CART_ACTION_TYPE.BUY_NOW:
				addToCartActionText = 'Buy';
				break;
			default:
				return;
		}
		const skuList = bundle.items.map((item) => item.sku).join(',');
		dataLayerPush(gaWrapper(pdCategory('Bundle', product), `Bundle${addToCartActionText}_${bundle.bundleName}`, skuList, convertSatangToBaht(bundle.sellingPrice)));
	},

	/**
	 * 39, 55
	 * @param {ProductDetail} product
	 * @param {{ promotion, index }} promotionObj
	 */
	pdViewPromotion(product, promotionObj) {
		if (!product || !promotionObj?.promotion) {
			return;
		}
		const { promotion, index } = promotionObj;
		dataLayerPush(gaWrapper(pdCategory('Promo', product), pdAction(promotion.type, product), `${promotion.label}_${index + 1}`));
	},

	/**
	 * 40, 57
	 * @param {ProductDetail} product
	 * @param {{ promotion, index }} promotionObj
	 */
	pdViewFreeGifts(product, promotionObj) {
		if (!product || !promotionObj?.promotion) {
			return;
		}
		const { promotion, index } = promotionObj;
		dataLayerPush(gaWrapper(pdCategory('Freebie', product), pdAction('Freebie', product), `${promotion.label}_${index + 1}`));
	},

	/**
	 * 41, 56
	 * @param {ProductDetail} product
	 * @param {{ promotion, index }} promotionObj
	 */
	pdApplyCouponCode(product, promotionObj) {
		if (!product || !promotionObj?.promotion) {
			return;
		}
		const { promotion, index } = promotionObj;
		dataLayerPush(gaWrapper(pdCategory('Promo', product), pdAction(promotion.type, product), `${promotion.code}_${index + 1}`));
	},

	/**
	 * 43, 59
	 * @param {ProductDetail} product
	 */
	pdViewInstallmentPlans(product) {
		if (!product || !product.installmentsDetail || product.installmentsDetail.length <= 0) {
			return;
		}
		const bankNames = product.installmentsDetail.map((bank) => bank.bankName).join(',');
		dataLayerPush(gaWrapper(pdCategory('Installment', product), pdAction('Installment', product), bankNames));
	},

	/**
	 * 44, 45, 46, 60, 61, 62
	 * @param {ProductDetail} product
	 * @param {ProductMedias} media
	 * @param {Number} mediaIndex
	 */
	pdGalleryView(product, media, mediaIndex) {
		let gaCategoryName;
		switch (media.type) {
			case MEDIA_GALLERY_TYPE.IMAGE:
				gaCategoryName = 'ProductView';
				break;
			case MEDIA_GALLERY_TYPE.VIDEO:
				gaCategoryName = 'VideoView';
				break;
			case MEDIA_GALLERY_TYPE.IMAGE360:
				gaCategoryName = '360View';
				break;
			default:
				return;
		}
		dataLayerPush(gaWrapper(pdCategory(gaCategoryName, product), pdAction('View', product), `${mediaIndex + 1}`));
	},

	pdGallerySwipe(product, mediaIndex) {
		dataLayerPush(gaWrapper(pdCategory('swiper', product), pdAction('swiper', product), `${mediaIndex + 1}`));
	},

	/**
	 * 45, 61
	 * @param {ProductDetail} product
	 */
	pdVideoPlay(product, mediaIndex) {
		dataLayerPush(gaWrapper(pdCategory('VideoView', product), pdAction('View', product), `${mediaIndex + 1}`));
	},

	/**
	 * 47, 63
	 * @param {ProductDetail} product
	 * @param {'link'|'facebook'|'line'} shareType
	 * @param {String} url
	 */
	pdSocialShare(product, shareType, url) {
		if (!product) {
			return;
		}
		dataLayerPush(gaWrapper(pdCategory('Share', product), pdAction('Share', product), `${shareType}|${url}`));
	},

	/**
	 * 48, 64
	 * @param {ProductDetail} product
	 * @param {undefined|'preOrderFullPrice'|'preOrderReservePrice'} [preorderType]
	 */
	pdBuyNow(product, preorderType) {
		if (!product) {
			return;
		}
		let preorderTypeText;
		switch (preorderType) {
			case PRODUCT_TYPE.PRE_ORDER_FULL_PRICE:
				preorderTypeText = 'Fullprice';
				break;
			case PRODUCT_TYPE.PRE_ORDER_RESERVE_PRICE:
				preorderTypeText = 'Deposit';
				break;
			default:
				break;
		}
		dataLayerPush(gaWrapper(pdCategory('Buy', product), pdAction('Buy', product), preorderTypeText, convertSatangToBaht(product.sellingPrice)));
	},

	/**
	 * 49, 65
	 * @param {ProductDetail} product
	 */
	pdAddToCart(product) {
		if (!product) {
			return;
		}
		dataLayerPush(gaWrapper(pdCategory('AddToCart', product), pdAction('Add', product), null, convertSatangToBaht(product.sellingPrice)));
	},

	/**
	 * 51
	 * @param {ProductDetail} product
	 * @param {ProductDetail} similarProduct
	 */
	pdSimilarProductClicked(product, similarProduct) {
		if (!product || !similarProduct) {
			return;
		}
		dataLayerPush(gaWrapper(pdCategory('Outofstock', product), pdAction('Similar', product), similarProduct.sku));
	},

	/**
	 * 67
	 * @param {ProductDetail} product
	 */
	pdPreOrderAcceptTerm(product) {
		dataLayerPush(gaWrapper(pdCategory('Condition', product), 'PrePP_acceptterm'));
	},

	/**
	 * 68
	 * @param {ProductDetail} product
	 * @param {Boolean} isIDRequired
	 */
	pdPreOrderFilledPersonalID(product, isIDRequired) {
		const isIDRequiredText = isIDRequired ? 'Yes' : 'No';
		dataLayerPush(gaWrapper(pdCategory('Condition', product), 'PrePP_Personalid', isIDRequiredText));
	},
	// #endregion

	// #region Compare products
	compareProductsProductSelected(sku) {
		dataLayerPush(gaWrapper('compare', 'Compare', sku));
	},

	compareProductsAddToWishlist(sku) {
		dataLayerPush(gaWrapper('compare', 'Compare_wishlist', sku));
	},

	compareProductsBuyNow(sku) {
		dataLayerPush(gaWrapper('compare', 'Compare_buy', sku));
	},
	// #endregion

	couponApplied(code) {
		dataLayerPush(gaWrapper('Coupon', 'Promo_Coupon', code));
	},

	// #region Cart
	/**
	 * 75
	 * @param {DataInCart} cartData
	 */
	cartProceedToCheckout(cartData) {
		const skuList = cartData.productItems?.map((product) => product.sku).join(',') ?? '';
		dataLayerPush(gaWrapper('Cart', 'Cart', skuList, convertSatangToBaht(cartData.subTotal)));
	},

	/**
	 * 76
	 * @param {DataInCart} cartData
	 */
	cartContinueShopping(cartData) {
		const skuList = cartData.productItems?.map((product) => product.sku).join(',') ?? '';
		dataLayerPush(gaWrapper('Cart', 'Cart_Continue', skuList, convertSatangToBaht(cartData.subTotal)));
	},

	// 78
	cartEmptyBackToHome() {
		dataLayerPush(gaWrapper('Cart', 'Cart_Recommend'));
	},

	/**
	 * shipping method collect-in-one-hour
	 * @param {DataInCart} cartData
	 * @param {String} branchName
	 */
	cartShippingMethodCollectInOneHour(cartData, branchName) {
		const sku = cartData.productItems?.[0]?.sku ?? '';
		dataLayerPush(gaWrapper('Cart', 'Cart_Branch1hr', `${sku},${branchName}`));
	},
	// #endregion

	// #region Checkout
	// 79
	shippingSubmit(shipment) {
		if (!shipment) {
			return;
		}
		const gaLabel = shipment.branchDetail
			? `${shipment.type}|${shipment.branchDetail.branchId}`
			: shipment.type;
		dataLayerPush(gaWrapper('Shipping_type', shipment.type, gaLabel));
	},

	// 80
	shippingMethodChanged(shippingMethod) {
		dataLayerPush(gaWrapper('Shipping_method', shippingMethod.method, shippingMethod.method));
	},

	// 81
	shippingRequestTaxInvoice(taxInvoiceRequested) {
		const taxInvoiceRequestedText = taxInvoiceRequested ? 'Yes' : 'No';
		dataLayerPush(gaWrapper('Shipping_vat', taxInvoiceRequestedText, taxInvoiceRequestedText));
	},

	// 82, 83
	paymentSelected(payment, paymentType, subtotal) {
		if (!payment) {
			return;
		}
		const eventCategory = paymentType === CHECKOUT_STEP_TYPE.INITIAL_PAYMENT
			? 'PrePP_Payment'
			: 'Payment';
		const paymentInstallment = installmentPlanText(payment.installmentPlan);
		const eventLabel = paymentInstallment
			? `${payment.slug}|${paymentInstallment}`
			: payment.slug;
		dataLayerPush(gaWrapper(eventCategory, payment.paymentMethodGroup.slug, eventLabel, convertSatangToBaht(subtotal)));
	},
	// #endregion

	// #region Order History
	// 85
	orderCancelSubmit(reason) {
		dataLayerPush(gaWrapper('OrderDetail', 'CancelOrder', reason));
	},

	// 88
	orderReSelectPayment(payment) {
		const paymentMethod = payment?.paymentMethodSubgroup?.paymentMethodGroup?.slug ?? null;
		const paymentInstallment = installmentPlanText(payment.installmentPlan);
		const eventLabel = paymentInstallment
			? `new_${payment.slug}|${paymentInstallment}`
			: `new_${payment.slug}`;
		dataLayerPush(gaWrapper('OrderDetail', `ReSelectpayment_${paymentMethod}`, eventLabel));
	},

	// 89
	orderRepayment(payment) {
		if (!payment) {
			return;
		}
		const paymentMethod = payment?.paymentMethodSubgroup?.paymentMethodGroup?.slug ?? null;
		const paymentInstallment = installmentPlanText(payment.installmentPlan);
		const eventLabel = paymentInstallment
			? `${payment.slug}|${paymentInstallment}`
			: payment.slug;
		dataLayerPush(gaWrapper('OrderDetail', `Repayment_${paymentMethod}`, eventLabel));
	},
	// #endregion

	// #region 404
	// 90
	error404ToHomePage() {
		dataLayerPush(gaWrapper('404_errorpage', 'to_homepage'));
	},

	// 91
	error404ToContactUs() {
		dataLayerPush(gaWrapper('404_errorpage', 'to_Contact_Us'));
	},
	// #endregion

	// 93
	mainHeaderLogoClicked() {
		dataLayerPush(gaWrapper('all_Logo', 'logo'));
	},

	// #region Bundle V2
	pdBundleSelectCampaignName(sku, position, bundle) {
		dataLayerPush(gaWrapper(`PP${sku}_ClickBundle2`, `BundleView_${position}`, `Click${bundle.bundleName}_${bundle.id}`));
	},

	pdBundleCustomize(sku, position, bundle) {
		dataLayerPush(gaWrapper(`PP${sku}_ChooseBundle2`, `BundleCustomize_${position}`, `Choose${bundle.bundleName}_${bundle.id}`));
	},

	bpBundleSelectCampaignName(sku, position, bundle) {
		dataLayerPush(gaWrapper(`BP${sku}_Bundle`, `BundleView_${bundle.id}`, `Select${position}_${bundle.bundleName}`));
	},

	bpBundleBanner(sku, bundleName, bannerLink) {
		dataLayerPush(gaWrapper(`BP${sku}_coverpage`, `BP_${bundleName}`, `${bundleName}_${bannerLink || ''}`));
	},

	bpBundleReward(sku, bundle, skuList) {
		dataLayerPush(gaWrapper(`BP${sku}_checkreward`, `BP_${bundle.bundleName}_${bundle.id}`, skuList.join(',')));
	},

	bpBundleRewardFreebie(sku, bundle, rewardType, discount, freebieSkuList) {
		const reward = discount || freebieSkuList.join(',');
		dataLayerPush(gaWrapper(`BP${sku}_checkreward`, `BP_${bundle.bundleName}_${bundle.id}`, `${rewardType}_${reward}`));
	},

	bpBundlePaginationNextPrevClicked(sku, buttonType) {
		dataLayerPush(gaWrapper(`BP${sku}_page`, buttonType));
	},

	bpBundleProductAdd(sku, groupName, groupIndex, selectedSku, position) {
		dataLayerPush(gaWrapper(`addBP${sku}_product`, `BP_${groupName}_${groupIndex}`, `Add${selectedSku}_${position}`));
	},

	bpBundleProductView(sku, groupName, groupIndex, selectedSku, position) {
		dataLayerPush(gaWrapper(`viewBP${sku}_product`, `BP_${groupName}_${groupIndex}`, `View${selectedSku}_${position}`));
	},
	// #endregion

	collectAtStore() {
		dataLayerPush(gaWrapper('clickAndCollect', 'Click_And_Collect'));
	},

	// #region Equip detail
	// 2 - add to cart
	equipAddToCart() {
		dataLayerPush(gaWrapper('Equip', 'add to cart'));
	},
	// 4 - clear all product
	equipClearAll() {
		dataLayerPush(gaWrapper('Equip_Clear_All_Product', 'Equip_Clear All Product'));
	},
	// 5 - search project
	equipSearchProduct(category, keyword) {
		dataLayerPush(gaWrapper(`addEquip_${category}_search`, 'Equip_search', keyword));
	},
	// 6 - select filter
	equipSelectFilter(category, filterName, filterValue) {
		dataLayerPush(gaWrapper(`addEquip_${category}_filter`, `Equip_filter_${filterName}`, `${filterValue}`));
	},
	// 7 - reset filter
	equipResetFilter(category) {
		dataLayerPush(gaWrapper(`addEquip_${category}_filter`, `Equip_filter_reset_default`, 'Reset to Default'));
	},
	// 8 - click next, prev
	equipNextPrevPage(category, type, pageNo) {
		dataLayerPush(gaWrapper(`addEquip_${category}_page`, type, pageNo));
	},
	// 9 - 24 - add product to component
	equipAddProductToComponent(category, productName, productSKU, productPosition) {
		dataLayerPush(gaWrapper(`addEquip_${category}`, `add_${productName}`, `select_${productSKU}_${productPosition}`));
	},
	// 25 - click view product
	equipViewProduct(category, productName, productSKU, productPosition) {
		dataLayerPush(gaWrapper(`addEquip_${category}_view`, `view_${productName}`, `view_${productSKU}_${productPosition}`));
	},
	// delete product from component
	equipDeleteProduct(category, productName, productSKU) {
		dataLayerPush(gaWrapper(`addEquip_${category}_delete`, `delete_${productName}`, `delete_${productSKU}`));
	},
	// change product qty
	equipChangeProductQuantity(category, type, productSKU) {
		dataLayerPush(gaWrapper(`addEquip_${category}_qty`, `qty_${type}`, `qty_${productSKU}`));
	},
	// toggle have own OS checkbox
	equipToggleOwnOSCheckbox(own) {
		dataLayerPush(gaWrapper('addEquip_OS_serial', 'Serial no.', own ? 'Yes' : 'No'));
	},
	// #endregion

	// #region Equip require for build the pc
	// require for build - ok
	equipSubmitRequireForBuild() {
		dataLayerPush(gaWrapper('Equip_allow_addProduct', 'Allow_addProduct'));
	},
	// require for build - cancel
	equipCancelRequireForBuild() {
		dataLayerPush(gaWrapper('Equip_allow_addProduct', 'Cancel_addProduct'));
	},
	// #endregion

	// #region Equip let us build your pc modal
	// equip build my pc
	equipClickBuildMyPC() {
		dataLayerPush(gaWrapper('Equip_request', 'Build my PC', 'Yes'));
	},
	// equip don't build my pc
	equipClickDontBuildMyPC() {
		dataLayerPush(gaWrapper('Equip_request', 'Don\'t Build my PC', 'Yes'));
	},
	// equip allow install software
	equipAllowInstallSoftware(consent) {
		dataLayerPush(gaWrapper('Equip_request', 'Allow Install Software', consent ? 'Yes' : 'No'));
	},
	// equip allow install unpack
	equipAllowUnpack(consent) {
		dataLayerPush(gaWrapper('Equip_request', 'Allow Unpack', consent ? 'Yes' : 'No'));
	},
	equipClickContinueToBuild() {
		dataLayerPush(gaWrapper('Equip_request', 'Continue to Build my PC'));
	},
	equipClickAddToCart() {
		dataLayerPush(gaWrapper('Equip_request', 'Equip_request_Add to cart'));
	},
	// #endregion

	// #region Collect at store in 1 hour
	checkStockBranch(sku) {
		dataLayerPush(gaWrapper(`PP${sku}_checkstockBranch`, 'PP_checkstock'));
	},
	clickCollectOneHour(sku) {
		dataLayerPush(gaWrapper(`PP${sku}_clickcollect1hr`, 'PP_clickcollect1hr'));
	},
	// #endregion

	// #region Check stock at store
	checkStockAtStoreSearchBranch(sku, keyword) {
		dataLayerPush(gaWrapper(`PP${sku}_checkstockBranch_popup`, 'search_branch', keyword));
	},
	checkStockAtStoreFilterProvince(sku, provinceName) {
		dataLayerPush(gaWrapper(`PP${sku}_checkstockBranch_popup`, 'filter_province', provinceName));
	},
	checkStockAtStoreFilterInStock(sku, filterInstock = false) {
		dataLayerPush(gaWrapper(`PP${sku}_checkstockBranch_popup`, 'filter_instock', filterInstock));
	},
	checkStockAtStoreSelectStoreNode(sku, branchName, position, stockStatus) {
		dataLayerPush(gaWrapper(`PP${sku}_checkstockBranch_popup`, `select_${branchName}_${position}`, stockStatus));
	},
	checkStockAtStoreSelectClickOnGoogleMaps(sku, branchName, position) {
		dataLayerPush(gaWrapper(`PP${sku}_checkstockBranch_popup`, `select_${branchName}_${position}_map`));
	},
	// #endregion

	// #region collect at store
	clickCollectOneHrSearchBranch(sku, keyword) {
		dataLayerPush(gaWrapper(`PP${sku}_clickcollect1hr_popup`, 'search_branch', keyword));
	},
	clickCollectOneHrFilterProvince(sku, provinceName) {
		dataLayerPush(gaWrapper(`PP${sku}_clickcollect1hr_popup`, 'filter_province', provinceName));
	},
	clickCollectOneHrFilterInStock(sku, filterInstock = false) {
		dataLayerPush(gaWrapper(`PP${sku}_clickcollect1hr_popup`, 'filter_instock', filterInstock));
	},
	clickCollectOneHrSelectClickBuy(sku, branchName, position) {
		dataLayerPush(gaWrapper(`PP${sku}_clickcollect1hr_popup`, `buy_${branchName}_${position}`));
	},
	clickCollectOneHrSelectClickOnGoogleMaps(sku, branchName, position) {
		dataLayerPush(gaWrapper(`PP${sku}_clickcollect1hr_popup`, `select_${branchName}_${position}_map`));
	},
	// #endregion

	// #region GA - Checkout (shipment)
	checkoutShipmentChangeBranch(shippingType, branchName) {
		dataLayerPush(gaWrapper(`Shipping_type`, `${shippingType}_change_branch`, branchName));
	},
	checkoutShipmentSearchBranch(shippingType, keyword) {
		dataLayerPush(gaWrapper(`Shipping_type`, `${shippingType}_search_branch`, keyword));
	},
	checkoutShipmentFilterProvince(shippingType, provinceName) {
		dataLayerPush(gaWrapper(`Shipping_type`, `${shippingType}_filter_province`, provinceName));
	},
	checkoutShipmentFilterInStock(shippingType, filterInstock = false) {
		dataLayerPush({ ecommerce: null }); // Clear the previous ecommerce object.
		dataLayerPush(gaWrapper(`Shipping_type`, `${shippingType}_filter_instock`, filterInstock));
	},
	checkoutShipmentSelectClickBuy(shippingType, branchName, position) {
		dataLayerPush(gaWrapper(`Shipping_type`, `${shippingType}_buy_${branchName}_${position}`));
	},
	checkoutShipmentSelectClickOnGoogleMaps(shippingType, branchName, position) {
		dataLayerPush(gaWrapper(`Shipping_type`, `${shippingType}_select_${branchName}_${position}_map`));
	},
	// #endregion
});

export default {};
