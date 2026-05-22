
import { transformConsents, transformUserProfile } from './resolvers/customer';

import { getCustomerIdFromGACookie } from './helpers/ga';
import PDPA_KEYS from './enums/pdpaKeys';

import PRODUCT_SORTING from './enums/productSortingKeys';
import CUSTOMER_CORPORATE_RANK from './enums/customerCorporateRanks';
import COUPON_ACTION_TYPE from './enums/couponActionType';

export const createGa4Builders = ({ config, dataLayerPush, $cookies }) => ({
	// #region 1. Internal Promotion Performance
	/**
	 * View/Click on Hero Banner, Small Banner, Highlight Banner
	 */
	promotionBanner(widgetSlot, widgetType, bannerPosition, promotionName, widgetPosition, isClicked = false) {
		dataLayerPush({
			event: isClicked ? 'select_promotion' : 'view_promotion', // swipe = view, click = select
			channel: config.CHANNEL,
			ecommerce: {
				creative_slot: widgetSlot,
				creative_name: widgetType,
				promotion_name: promotionName, // banner image name
				promotion_id: bannerPosition,
				widget_position: widgetPosition,
			},
		});
	},
	// #endregion

	// #region 2. Event Tracking - ??
	// #endregion

	// #region 3. Event Tracking - All Pages
	/**
	 * PDPA setting submit
	 */
	async pdpaSettingSubmit(analytic, marketing) {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'pdpa',
			analytics: analytic ? 'yes' : 'no',
			marketing: marketing ? 'yes' : 'no',
		});
	},

	/**
	 * Login
	 */
	async login() {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'login',
		});
	},

	/**
	 * Logout
	 */
	async logout() {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'logout',
		});
	},

	/**
	 * Sign up / Registration
	 */
	async onRegistrationStarted(isSocial = false, payload = {}) {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'on_registration_started',
			eventCategory: null,
			eventLabel: null,
			eventValue: null,

			// additional data
			isSocial,
			...payload,
		});
	},

	async onRegistrationCompleted(form, provider = 'password') {
		const safeForm = { ...form };
		delete safeForm.password;
		delete safeForm.verificationCode;
		delete safeForm.recaptchaToken;

		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'on_registration_completed',
			eventCategory: null,
			eventLabel: null,
			eventValue: null,

			// additional data
			form: safeForm,
			provider,

			consent: {
				[PDPA_KEYS.ANALYTICAL]: !!$cookies?.get(PDPA_KEYS.ANALYTICAL),
				[PDPA_KEYS.FUNCTIONAL]: !!$cookies?.get(PDPA_KEYS.FUNCTIONAL),
				[PDPA_KEYS.MARKETING]: !!$cookies?.get(PDPA_KEYS.MARKETING),
			},
		});
	},

	/**
	 * Click main menu icon (hamburger menu)
	 */
	async clickMainMenu(status) {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'click_hamburger',
			statusMenu: status ? 'open' : 'close',
		});
	},

	/**
	 * Click category
	 */
	async clickCategory(categorySlug) {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'click_menu_category',
			menuCategory: categorySlug, // Make it unique and th, en will be same thing.
		});
	},

	/**
	 * Click top header and footer menu
	 */
	async clickTopHeaderAndFooterMenu(menuName, menuPosition) {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'click_menu',
			menuName,
			menuPosition, // Header or Footer
		});
	},

	/**
	 * Click user icon
	 */
	async clickUserIcon(status) {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'click_user',
			userStatus: status ? 'logged in' : 'logged out',
		});
	},

	/**
	 * Click mini cart
	 */
	async clickMiniCart() {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'click_minicart',
		});
	},

	/**
	 * User data
	 */
	async userData({ profile }, { cookieConsents }, cid, page) {
		if (!profile) {
			return;
		}

		dataLayerPush({
			event: 'userData',
			channel: config.CHANNEL,
			page,
			profile: {
				customerId: getCustomerIdFromGACookie(cid),
				...transformUserProfile(profile),
				rank: profile.rank || CUSTOMER_CORPORATE_RANK.MEMBER,
			},
			consent: transformConsents(cookieConsents),
		});
	},

	async viewPage(type, page) {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'view_page',
			type,
			page,
		});
	},
	// #endregion

	// #region 4. Event Tracking - Product list page
	/**
	 * View product list
	 */
	async viewProductList(categoryPath = 'index', categoryId = -1) {
		dataLayerPush({
			event: 'eventTracking - Product List',
			channel: config.CHANNEL,
			eventName: 'view_productlist',
			categoryPath,
			categoryId,
		});
	},

	/**
	 * Click check in stock on product list
	 */
	async clickCheckInStockOnProductList(status) {
		dataLayerPush({
			event: 'eventTracking - Product List',
			channel: config.CHANNEL,
			eventName: 'checkstock',
			checkStatus: status ? 'on' : 'off',
		});
	},

	/**
	 * Click filter product list
	 */
	async clickFilterOnProductList(category, priceMin, priceMax, brand) {
		dataLayerPush({
			event: 'eventTracking - Product List',
			channel: config.CHANNEL,
			eventName: 'click_filter_productlist',
			filterCategory: category,
			filterPricemin: priceMin,
			filterPricemax: priceMax,
			filterBrand: brand ?? '',
		});
	},

	/**
	 * Sorting product list
	 */
	async sortingProductList(type) {
		let sortingType = '';

		switch (type) {
			case PRODUCT_SORTING.RELEVANCE:
				sortingType = 'relevance';
				break;
			case PRODUCT_SORTING.PRICE_DESC:
				sortingType = 'high to low';
				break;
			case PRODUCT_SORTING.PRICE_ASC:
				sortingType = 'low to high';
				break;
			default:
				break;
		}

		dataLayerPush({
			event: 'eventTracking - Product List',
			channel: config.CHANNEL,
			eventName: 'sorting',
			sortingType,
		});
	},

	/**
	 * View product (grid/list) on product list
	 */
	async clickGridOrListOnProductList(type) {
		dataLayerPush({
			event: 'eventTracking - Product List',
			channel: config.CHANNEL,
			eventName: 'click_grid_or_list',
			listType: type,
		});
	},

	/**
	 * Change page on product list
	 */
	async changeProductListPage(from, to, outOfStockQty) {
		dataLayerPush({
			event: 'eventTracking - Product List',
			channel: config.CHANNEL,
			eventName: 'changepage',
			pageNumber: from,
			pageChange: to,
			numberOutofstock: outOfStockQty,
		});
	},

	/**
	 * Click product list breadcrumbs
	 */
	async clickProductListBreadcrumbs(breadcrumbText) {
		dataLayerPush({
			event: 'eventTracking - Product List',
			channel: config.CHANNEL,
			eventName: 'click_breadcrumb_category',
			breadcrumbs: breadcrumbText,
		});
	},
	// #endregion

	// #region 5. Event Tracking - Product Detail Page
	/**
	 * Click product detail breadcrumbs
	 */
	async clickProductDetailBreadcrumbs(breadcrumbText) {
		dataLayerPush({
			event: 'eventTracking - Product',
			channel: config.CHANNEL,
			eventName: 'click_breadcrumb_product',
			breadcrumbs: breadcrumbText,
		});
	},

	/**
	 * Click product detail installment plan
	 */
	async onClickInstallmentPlan(sku) {
		dataLayerPush({
			event: 'eventTracking - Product',
			channel: config.CHANNEL,
			eventName: 'on_click_installment_plan',
			eventCategory: null,
			eventLabel: null,
			eventValue: sku,
		});
	},

	/**
	 * Click product detail main promotion
	 */
	async clickProductDetailMainPromotion() {
		dataLayerPush({
			event: 'eventTracking - Product',
			channel: config.CHANNEL,
			eventName: 'click_main-promotion_modal',
		});
	},

	/**
	 * Click product detail sub promotion
	 */
	async onClickSubPromotion(name, sku) {
		dataLayerPush({
			event: 'eventTracking - Product',
			channel: config.CHANNEL,
			eventName: 'on_click_sub_promotion',
			eventCategory: null,
			eventLabel: name,
			eventValue: sku,
		});
	},

	/**
	 * Click product detail add to cart
	 */
	async clickProductDetailAddToCart() {
		dataLayerPush({
			event: 'eventTracking - Product',
			channel: config.CHANNEL,
			eventName: 'add-to-cart_modal',
		});
	},

	/**
	 * Click product detail collect in 1 hr
	 */
	async onClickProductDetailCollectIn1Hr(sku, name) {
		dataLayerPush({
			event: 'eventTracking - Product',
			channel: config.CHANNEL,
			eventName: 'on_click_collect_in_1hr',
			eventCategory: null,
			eventLabel: name,
			eventValue: sku,
		});
	},

	/**
	 * Click product detail share button
	 */
	async onClickShareProduct(sku, name) {
		dataLayerPush({
			event: 'eventTracking - Product',
			channel: config.CHANNEL,
			eventName: 'on_share_product',
			eventCategory: null,
			eventLabel: name,
			eventValue: sku,
		});
	},

	/**
	 * Click product detail compare button
	 */
	async onAddToCompare() {
		dataLayerPush({
			event: 'eventTracking - Product',
			channel: config.CHANNEL,
			eventName: 'on_add_to_compare',
			eventCategory: null,
			eventLabel: null,
			eventValue: null,
		});
	},

	async addedToCompareSuccessed(sku, name) {
		dataLayerPush({
			event: 'eventTracking - Product',
			channel: config.CHANNEL,
			eventName: 'on_add_to_compare_successed',
			eventCategory: null,
			eventLabel: name,
			eventValue: sku,
		});
	},


	/**
	 * Product detail select bundle
	 */
	async productDetailSelectBundle(bundleName, bundlePosition) {
		dataLayerPush({
			event: 'eventTracking - Product',
			channel: config.CHANNEL,
			eventName: 'select_bundle',
			bundleName,
			bundleRank: `${bundlePosition}`,
		});
	},

	/**
	 * Product detail select bundle
	 */
	async productDetailCustomizeBundle(bundleName, bundlePosition) {
		dataLayerPush({
			event: 'eventTracking - Product',
			channel: config.CHANNEL,
			eventName: 'customize_bundle',
			bundleName,
			bundleRank: `${bundlePosition}`,
		});
	},

	// #endregion

	// #region 6. Event Tracking - Shipping Page
	/**
	 * View/Click on user submit promotion code
	 */
	onSubmitPromotionCode(codeName, codeStatus = false) {
		dataLayerPush({
			event: 'eventTracking - Shipping',
			channel: config.CHANNEL,
			eventName: 'apply_code',
			codeName,
			codeStatus: codeStatus ? 'pass' : 'error',
		});
	},

	/**
	 * View/Click on user remove promotion code
	 */
	onSubmitRemovePromotionCode(codeName, codeStatus = false) {
		dataLayerPush({
			event: 'eventTracking - Shipping',
			channel: config.CHANNEL,
			eventName: 'remove_code',
			codeName,
			codeStatus: codeStatus ? 'pass' : 'error',
		});
	},

	/**
	 * View/Click on user select payment
	 */
	onSelectPayment(paymentSlug) {
		if (!paymentSlug || typeof paymentSlug != 'string') {
			return;
		}

		dataLayerPush({
			event: 'eventTracking - Shipping',
			channel: config.CHANNEL,
			eventName: 'select_payment',
			paymentType: paymentSlug.replace(/-/g, ' '),
		});
	},
	// #endregion


	// #region ?. Event Tracking - Open App header
	clickOpenAppHeader(action) {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'click_open_app_header',
			clickStatus: action ? 'open' : 'close',
		});
	},
	// #endregion

	// #region ?. Event Tracking - Preview e-tax
	onClickOpenPreviewETax(payload) {
		dataLayerPush({
			event: 'eventTracking',
			channel: config.CHANNEL,
			eventName: 'click_open_preview_e_tax',
			payload,
		});
	},
	// #endregion

	// #region ?. Event Tracking - Coupon
	/**
	 * View/Click on user submit coupon code
	 * @param {string} code - Code of promotion coupon
	 * @param {string} [actionType=COUPON_ACTION_TYPE.CLICKED_BUTTON] - Type of action where the coupon is applied
	 */
	async onApplyCoupon(code, actionType = COUPON_ACTION_TYPE.CLICKED_BUTTON) {
		dataLayerPush({
			event: 'eventTracking - Coupon',
			channel: config.CHANNEL,
			eventName: 'on_apply_coupon',
			eventCategory: actionType,
			eventLabel: null,
			eventValue: code,
		});
	},

	/**
	 * Send event when coupon is successfully applied
	 * @param {string} code - Code of promotion coupon
	 */
	async applyCouponSuccessed(code) {
		dataLayerPush({
			event: 'eventTracking - Coupon',
			channel: config.CHANNEL,
			eventName: 'on_apply_coupon_successed',
			eventCategory: null,
			eventLabel: code,
			eventValue: null,
		});
	},

	/**
	 * Send event when coupon is failed to apply
	 * @param {string} code - Code of promotion coupon
	 */
	async applyCouponFailed(code) {
		dataLayerPush({
			event: 'eventTracking - Coupon',
			channel: config.CHANNEL,
			eventName: 'on_apply_coupon_failed',
			eventCategory: null,
			eventLabel: code,
			eventValue: null,
		});
	},

	/**
	 * Send event when user remove coupon code
	 * @param {string} code - Code of promotion coupon
	 */
	async onRemoveCoupon(code, actionType = COUPON_ACTION_TYPE.CLICKED_BUTTON) {
		dataLayerPush({
			event: 'eventTracking - Coupon',
			channel: config.CHANNEL,
			eventName: 'on_remove_coupon',
			eventCategory: actionType,
			eventLabel: code,
			eventValue: null,
		});
	},

	/**
	 * Send event when coupon is successfully removed
	 * @param {string} code - Code of promotion coupon
	 */
	async removeCouponSuccessed(code) {
		dataLayerPush({
			event: 'eventTracking - Coupon',
			channel: config.CHANNEL,
			eventName: 'on_remove_coupon_successed',
			eventCategory: null,
			eventLabel: code,
			eventValue: null,
		});
	},

	/**
	 * Send event when user remove coupon code but failed
	 * @param {string} code - Code of promotion coupon
	 */
	async removeCouponFailed(code) {
		dataLayerPush({
			event: 'eventTracking - Coupon',
			channel: config.CHANNEL,
			eventName: 'on_remove_coupon_failed',
			eventCategory: null,
			eventLabel: code,
			eventValue: null,
		});
	},

	// !! WE DONT HAVE ALL COUPON BUTTON
	// async onClickSeeAllCoupon() {
	// 	dataLayerPush({
	// 		event: 'eventTracking - Coupon',
	// 		channel: config.CHANNEL,
	// 		eventName: 'on_click_see_all_coupon',
	// 		eventCategory: null,
	// 		eventLabel: null,
	// 		eventValue: null,
	// 	});
	// },

	async onClickCoupon(coupon) {
		dataLayerPush({
			event: 'eventTracking - Coupon',
			channel: config.CHANNEL,
			eventName: 'on_click_coupon',
			eventCategory: null,
			eventLabel: coupon.label,
			eventValue: coupon.code,
		});
	},

	// !! WE DONT HAVE COUPON CONDITOIN BUTTON
	// async onClickConditionCoupon(coupon) {
	// 	dataLayerPush({
	// 		event: 'eventTracking - Coupon',
	// 		channel: config.CHANNEL,
	// 		eventName: 'on_click_condition_coupon',
	// 		eventCategory: null,
	// 		eventLabel: coupon.label,
	// 		eventValue: coupon.code,
	// 	});
	// },

	// !! WE DONT HAVE COUPON LIST IN BNN
	// async onOpenModalCouponList(coupons, component) {
	// 	dataLayerPush({
	// 		event: 'eventTracking - Coupon',
	// 		channel: config.CHANNEL,
	// 		eventName: 'on_open_modal_coupon_list',
	// 		eventCategory: null,
	// 		eventLabel: component,
	// 		eventValue: null,

	// 		// addon
	// 		coupons,
	// 	});
	// },

	// !! WE DONT HAVE COUPON LIST IN BNN
	// async onCloseModalCouponList(component) {
	// 	dataLayerPush({
	// 		event: 'eventTracking - Coupon',
	// 		channel: config.CHANNEL,
	// 		eventName: 'on_close_modal_coupon_list',
	// 		eventCategory: null,
	// 		eventLabel: component,
	// 		eventValue: null,
	// 	});
	// },

	async onOpenModalCouponDetail(coupon) {
		dataLayerPush({
			event: 'eventTracking - Coupon',
			channel: config.CHANNEL,
			eventName: 'on_open_modal_coupon_detail',
			eventCategory: null,
			eventLabel: coupon.label,
			eventValue: coupon.code,
		});
	},

	async onCloseModalCouponDetail() {
		dataLayerPush({
			event: 'eventTracking - Coupon',
			channel: config.CHANNEL,
			eventName: 'on_close_modal_coupon_detail',
			eventCategory: null,
			eventLabel: null,
			eventValue: null,
		});
	},

	// TODO: onClickProductInCoupon

	// !! WE DONT HAVE SWITCH BUTTON IN BNN
	// async onClickSwtichToCouponList() {
	// 	dataLayerPush({
	// 		event: 'eventTracking - Coupon',
	// 		channel: config.CHANNEL,
	// 		eventName: 'on_click_switch_to_coupon_list',
	// 		eventCategory: null,
	// 		eventLabel: null,
	// 		eventValue: null,
	// 	});
	// },
	// #endregion

	// #region ?. Event Tracking - Wishlist
	async onAddToWishList(product) {
		dataLayerPush({
			event: 'eventTracking - Wishlist',
			channel: config.CHANNEL,
			eventName: 'on_add_to_wish_list',
			eventCategory: null,
			eventLabel: null,
			eventValue: null,

			// additional data
			product,
		});
	},
	async onRemoveFromWishList(product) {
		dataLayerPush({
			event: 'eventTracking - Wishlist',
			channel: config.CHANNEL,
			eventName: 'on_remove_from_wish_list',
			eventCategory: null,
			eventLabel: null,
			eventValue: null,

			// additional data
			product,
		});
	},
	// #endregion

	// #region ?. Event Tracking - Store location
	async onClickStore(store) {
		dataLayerPush({
			event: 'eventTracking - Store location',
			channel: config.CHANNEL,
			eventName: 'on_click_store',
			eventCategory: null,
			eventLabel: null,
			eventValue: null,

			// additional data
			store,
		});
	},

	async onEnterStorePage() {
		dataLayerPush({
			event: 'eventTracking - Store location',
			channel: config.CHANNEL,
			eventName: 'on_enter_store_page',
			eventCategory: null,
			eventLabel: null,
			eventValue: null,
		});
	},

	async onDisplayStoreDetail(detail) {
		dataLayerPush({
			event: 'eventTracking - Store location',
			channel: config.CHANNEL,
			eventName: 'on_display_store_detail',
			eventCategory: null,
			eventLabel: null,
			eventValue: null,

			// additional data
			detail,
		});
	},
	// #endregion

	// #region ?. Event Tracking - Flash Sale
	async onEnterFlashSalePage() {
		dataLayerPush({
			event: 'eventTracking - Flash Sale',
			channel: config.CHANNEL,
			eventName: 'on_enter_flash_sale_page',
			eventCategory: null,
			eventLabel: null,
			eventValue: null,
		});
	},
	// #endregion
});

export default {};
