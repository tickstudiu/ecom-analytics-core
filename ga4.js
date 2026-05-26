import { convertSatangToBaht } from './helpers/numeral';
import { transformConsents, transformUserProfile } from './resolvers/customer';
import { transformConsentModeV2 } from './helpers/consent';
import { getCustomerIdFromGACookie, installmentPlanText } from './helpers/ga';

import PDPA_KEYS from './enums/pdpaKeys';
import PRODUCT_SORTING from './enums/productSortingKeys';
import CUSTOMER_CORPORATE_RANK from './enums/customerCorporateRanks';
import COUPON_ACTION_TYPE from './enums/couponActionType';
import CHECKOUT_STEP_TYPE from './enums/checkoutStepType';
import MEDIA_GALLERY_TYPE from './enums/mediaGalleryType';
import ADD_TO_CART_ACTION_TYPE from './enums/addToCartActionType';

export const createGa4Builders = ({ config, dataLayerPush, $cookies }) => ({

	// ── 1. Internal Promotion Performance ────────────────────────────────────

	/**
	 * View/Click on Hero Banner, Small Banner, Highlight Banner
	 */
	promotionBanner(widgetSlot, widgetType, bannerPosition, promotionName, widgetPosition, isClicked = false) {
		dataLayerPush({
			event: isClicked ? 'select_promotion' : 'view_promotion',
			channel: config.CHANNEL,
			ecommerce: {
				creative_slot:  widgetSlot,
				creative_name:  widgetType,
				promotion_name: promotionName,
				promotion_id:   bannerPosition,
				widget_position: widgetPosition,
			},
		});
	},

	// ── 2. All Pages ──────────────────────────────────────────────────────────

	/**
	 * PDPA setting submit
	 */
	async pdpaSettingSubmit(analytic, marketing) {
		dataLayerPush({
			event:     'eventTracking',
			channel:   config.CHANNEL,
			eventName: 'pdpa',
			analytics: analytic  ? 'yes' : 'no',
			marketing: marketing ? 'yes' : 'no',
		});
	},

	async login() {
		dataLayerPush({
			event:     'eventTracking',
			channel:   config.CHANNEL,
			eventName: 'login',
		});
	},

	async logout() {
		dataLayerPush({
			event:     'eventTracking',
			channel:   config.CHANNEL,
			eventName: 'logout',
		});
	},

	async onRegistrationStarted(isSocial = false, payload = {}) {
		dataLayerPush({
			event:         'eventTracking',
			channel:       config.CHANNEL,
			eventName:     'on_registration_started',
			eventCategory: null,
			eventLabel:    null,
			eventValue:    null,
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
			event:         'eventTracking',
			channel:       config.CHANNEL,
			eventName:     'on_registration_completed',
			eventCategory: null,
			eventLabel:    null,
			eventValue:    null,
			form:     safeForm,
			provider,
			consent: {
				[PDPA_KEYS.ANALYTICAL]: !!$cookies?.get(PDPA_KEYS.ANALYTICAL),
				[PDPA_KEYS.FUNCTIONAL]: !!$cookies?.get(PDPA_KEYS.FUNCTIONAL),
				[PDPA_KEYS.MARKETING]:  !!$cookies?.get(PDPA_KEYS.MARKETING),
			},
		});
	},

	async clickMainMenu(status) {
		dataLayerPush({
			event:      'eventTracking',
			channel:    config.CHANNEL,
			eventName:  'click_hamburger',
			statusMenu: status ? 'open' : 'close',
		});
	},

	async clickCategory(categorySlug) {
		dataLayerPush({
			event:        'eventTracking',
			channel:      config.CHANNEL,
			eventName:    'click_menu_category',
			menuCategory: categorySlug,
		});
	},

	async clickTopHeaderAndFooterMenu(menuName, menuPosition) {
		dataLayerPush({
			event:        'eventTracking',
			channel:      config.CHANNEL,
			eventName:    'click_menu',
			menuName,
			menuPosition,
		});
	},

	async clickUserIcon(status) {
		dataLayerPush({
			event:      'eventTracking',
			channel:    config.CHANNEL,
			eventName:  'click_user',
			userStatus: status ? 'logged in' : 'logged out',
		});
	},

	async clickMiniCart() {
		dataLayerPush({
			event:     'eventTracking',
			channel:   config.CHANNEL,
			eventName: 'click_minicart',
		});
	},

	async userData({ profile }, { cookieConsents }, cid, page) {
		if (!profile) return;

		dataLayerPush({
			event:   'userData',
			channel: config.CHANNEL,
			page,
			profile: {
				customerId: getCustomerIdFromGACookie(cid),
				...transformUserProfile(profile),
				rank: profile.rank || CUSTOMER_CORPORATE_RANK.MEMBER,
			},
			consent:       transformConsents(cookieConsents),
			consentModeV2: transformConsentModeV2(cookieConsents),
			user_id: profile.id ? String(profile.id) : undefined,
		});
	},

	async viewPage(type, page) {
		dataLayerPush({
			event:     'eventTracking',
			channel:   config.CHANNEL,
			eventName: 'view_page',
			type,
			page,
		});
	},

	// ── 3. Header / Footer ────────────────────────────────────────────────────

	/**
	 * Site search (header search bar)
	 */
	headerSearch(category = 'all', keyword = '') {
		dataLayerPush({
			event:     'eventTracking - Header',
			channel:   config.CHANNEL,
			eventName: 'search',
			searchCategory: category,
			searchKeyword:  keyword,
		});
	},

	/**
	 * Login attempt — type: 'email' | 'google' | 'facebook' | 'apple'
	 */
	loginAttempt(loginType) {
		dataLayerPush({
			event:     'eventTracking',
			channel:   config.CHANNEL,
			eventName: 'login_attempt',
			loginType,
		});
	},

	/**
	 * Language switch
	 */
	switchLanguage(selectedLang) {
		dataLayerPush({
			event:     'eventTracking - Header',
			channel:   config.CHANNEL,
			eventName: 'switch_language',
			language:  selectedLang,
		});
	},

	headerStoreLocationClicked() {
		dataLayerPush({
			event:     'eventTracking - Header',
			channel:   config.CHANNEL,
			eventName: 'click_store_location',
		});
	},

	mainHeaderLogoClicked() {
		dataLayerPush({
			event:     'eventTracking - Header',
			channel:   config.CHANNEL,
			eventName: 'click_logo',
		});
	},

	/**
	 * Social icon click in footer — socialType: 'facebook' | 'instagram' | 'line'
	 */
	footerSocialClicked(socialType) {
		dataLayerPush({
			event:      'eventTracking - Footer',
			channel:    config.CHANNEL,
			eventName:  'click_social',
			socialType,
		});
	},

	// ── 4. PDPA ───────────────────────────────────────────────────────────────

	/**
	 * PDPA consent bar action — buttonClicked: 'Yes' | 'Setting'
	 */
	pdpaBarAction(buttonClicked) {
		dataLayerPush({
			event:         'eventTracking',
			channel:       config.CHANNEL,
			eventName:     'pdpa_bar_action',
			buttonClicked,
		});
	},

	// ── 5. Contact Us ─────────────────────────────────────────────────────────

	contactUsFormSubmit(topic) {
		dataLayerPush({
			event:     'eventTracking - Contact',
			channel:   config.CHANNEL,
			eventName: 'contact_us_submit',
			topic,
		});
	},

	contactUsCallCenter(phoneNumber) {
		dataLayerPush({
			event:       'eventTracking - Contact',
			channel:     config.CHANNEL,
			eventName:   'contact_us_call',
			phoneNumber,
		});
	},

	// ── 6. Homepage ───────────────────────────────────────────────────────────

	homeWidgetClicked(widgetType, widgetPosition, widgetName, bannerImageName, bannerPosition) {
		dataLayerPush({
			event:           'eventTracking - Homepage',
			channel:         config.CHANNEL,
			eventName:       'click_widget',
			widgetType,
			widgetPosition,
			widgetName,
			bannerImageName,
			bannerPosition,
		});
	},

	homeWidgetSwipe(widgetType, widgetPosition, widgetName, bannerImageName, bannerPosition, isClicked) {
		dataLayerPush({
			event:           'eventTracking - Homepage',
			channel:         config.CHANNEL,
			eventName:       isClicked ? 'swipe_widget_clicked' : 'swipe_widget',
			widgetType,
			widgetPosition,
			widgetName,
			bannerImageName,
			bannerPosition,
		});
	},

	homeWidgetClickedViewAll(widgetType, widgetPosition, widgetName, url) {
		dataLayerPush({
			event:         'eventTracking - Homepage',
			channel:       config.CHANNEL,
			eventName:     'click_widget_view_all',
			widgetType,
			widgetPosition,
			widgetName,
			url,
		});
	},

	flashSaleAddToCart(flashSaleName, productPosition) {
		dataLayerPush({
			event:          'eventTracking - Homepage',
			channel:        config.CHANNEL,
			eventName:      'flash_sale_add_to_cart',
			flashSaleName,
			productPosition,
		});
	},

	flashSaleSeeMore(flashSaleName) {
		dataLayerPush({
			event:         'eventTracking - Homepage',
			channel:       config.CHANNEL,
			eventName:     'flash_sale_see_more',
			flashSaleName,
		});
	},

	// ── 7. Store Location ─────────────────────────────────────────────────────

	async onClickStore(store) {
		dataLayerPush({
			event:     'eventTracking - Store location',
			channel:   config.CHANNEL,
			eventName: 'on_click_store',
			store,
		});
	},

	async onEnterStorePage() {
		dataLayerPush({
			event:     'eventTracking - Store location',
			channel:   config.CHANNEL,
			eventName: 'on_enter_store_page',
		});
	},

	async onDisplayStoreDetail(detail) {
		dataLayerPush({
			event:     'eventTracking - Store location',
			channel:   config.CHANNEL,
			eventName: 'on_display_store_detail',
			detail,
		});
	},

	storeLocationStoreViewed(storeName, storeAddress) {
		dataLayerPush({
			event:        'eventTracking - Store location',
			channel:      config.CHANNEL,
			eventName:    'view_store',
			storeName,
			storeAddress,
		});
	},

	storeLocationSelectProvince(province = {}) {
		dataLayerPush({
			event:        'eventTracking - Store location',
			channel:      config.CHANNEL,
			eventName:    'select_province',
			provinceName: province.name,
		});
	},

	// ── 8. Product List ───────────────────────────────────────────────────────

	async viewProductList(categoryPath = 'index', categoryId = -1) {
		dataLayerPush({
			event:        'eventTracking - Product List',
			channel:      config.CHANNEL,
			eventName:    'view_productlist',
			categoryPath,
			categoryId,
		});
	},

	async clickCheckInStockOnProductList(status) {
		dataLayerPush({
			event:       'eventTracking - Product List',
			channel:     config.CHANNEL,
			eventName:   'checkstock',
			checkStatus: status ? 'on' : 'off',
		});
	},

	async clickFilterOnProductList(category, priceMin, priceMax, brand) {
		dataLayerPush({
			event:          'eventTracking - Product List',
			channel:        config.CHANNEL,
			eventName:      'click_filter_productlist',
			filterCategory: category,
			filterPricemin: priceMin,
			filterPricemax: priceMax,
			filterBrand:    brand ?? '',
		});
	},

	async sortingProductList(type) {
		const sortingMap = {
			[PRODUCT_SORTING.RELEVANCE]:  'relevance',
			[PRODUCT_SORTING.PRICE_DESC]: 'high to low',
			[PRODUCT_SORTING.PRICE_ASC]:  'low to high',
		};
		dataLayerPush({
			event:       'eventTracking - Product List',
			channel:     config.CHANNEL,
			eventName:   'sorting',
			sortingType: sortingMap[type] ?? '',
		});
	},

	async clickGridOrListOnProductList(type) {
		dataLayerPush({
			event:     'eventTracking - Product List',
			channel:   config.CHANNEL,
			eventName: 'click_grid_or_list',
			listType:  type,
		});
	},

	async changeProductListPage(from, to, outOfStockQty) {
		dataLayerPush({
			event:            'eventTracking - Product List',
			channel:          config.CHANNEL,
			eventName:        'changepage',
			pageNumber:       from,
			pageChange:       to,
			numberOutofstock: outOfStockQty,
		});
	},

	async clickProductListBreadcrumbs(breadcrumbText) {
		dataLayerPush({
			event:       'eventTracking - Product List',
			channel:     config.CHANNEL,
			eventName:   'click_breadcrumb_category',
			breadcrumbs: breadcrumbText,
		});
	},

	/**
	 * Click a product card on the listing page
	 */
	plProductClicked(product, productPosition, pageNumber, categoryPageSlug) {
		if (!product) return;
		dataLayerPush({
			event:           'eventTracking - Product List',
			channel:         config.CHANNEL,
			eventName:       'click_product',
			sku:             product.sku,
			productPosition,
			pageNumber,
			categoryPageSlug,
		});
	},

	/**
	 * Sort product list
	 */
	plProductSorted(sortingSelected, categoryPageSlug) {
		dataLayerPush({
			event:           'eventTracking - Product List',
			channel:         config.CHANNEL,
			eventName:       'sort_product',
			sortingSelected,
			categoryPageSlug,
		});
	},

	/**
	 * Pagination next/prev — buttonType: 'next' | 'previous'
	 */
	plProductPaginationNextPrevClicked(buttonType, categoryPageSlug) {
		dataLayerPush({
			event:           'eventTracking - Product List',
			channel:         config.CHANNEL,
			eventName:       'pagination_click',
			buttonType,
			categoryPageSlug,
		});
	},

	plFilterChanged(filterGroup, filterValue, categoryPageSlug) {
		dataLayerPush({
			event:           'eventTracking - Product List',
			channel:         config.CHANNEL,
			eventName:       'filter_change',
			filterGroup,
			filterValue,
			categoryPageSlug,
		});
	},

	plFilterShowInStockOnly(value, categoryPageSlug) {
		dataLayerPush({
			event:           'eventTracking - Product List',
			channel:         config.CHANNEL,
			eventName:       'filter_in_stock',
			filterInStock:   value,
			categoryPageSlug,
		});
	},

	plExpand(expand, categoryPageSlug) {
		dataLayerPush({
			event:           'eventTracking - Product List',
			channel:         config.CHANNEL,
			eventName:       'expand_content',
			expand,
			categoryPageSlug,
		});
	},

	// ── 9. Product Detail ─────────────────────────────────────────────────────

	async clickProductDetailBreadcrumbs(breadcrumbText) {
		dataLayerPush({
			event:       'eventTracking - Product',
			channel:     config.CHANNEL,
			eventName:   'click_breadcrumb_product',
			breadcrumbs: breadcrumbText,
		});
	},

	async onClickInstallmentPlan(sku) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'on_click_installment_plan',
			eventValue: sku,
		});
	},

	async clickProductDetailMainPromotion() {
		dataLayerPush({
			event:     'eventTracking - Product',
			channel:   config.CHANNEL,
			eventName: 'click_main-promotion_modal',
		});
	},

	async onClickSubPromotion(name, sku) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'on_click_sub_promotion',
			eventLabel: name,
			eventValue: sku,
		});
	},

	async clickProductDetailAddToCart() {
		dataLayerPush({
			event:     'eventTracking - Product',
			channel:   config.CHANNEL,
			eventName: 'add-to-cart_modal',
		});
	},

	async onClickProductDetailCollectIn1Hr(sku, name) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'on_click_collect_in_1hr',
			eventLabel: name,
			eventValue: sku,
		});
	},

	async onClickShareProduct(sku, name) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'on_share_product',
			eventLabel: name,
			eventValue: sku,
		});
	},

	async onAddToCompare() {
		dataLayerPush({
			event:     'eventTracking - Product',
			channel:   config.CHANNEL,
			eventName: 'on_add_to_compare',
		});
	},

	async addedToCompareSuccessed(sku, name) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'on_add_to_compare_successed',
			eventLabel: name,
			eventValue: sku,
		});
	},

	async productDetailSelectBundle(bundleName, bundlePosition) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'select_bundle',
			bundleName,
			bundleRank: `${bundlePosition}`,
		});
	},

	async productDetailCustomizeBundle(bundleName, bundlePosition) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'customize_bundle',
			bundleName,
			bundleRank: `${bundlePosition}`,
		});
	},

	/**
	 * Select a product variant (color, storage, etc.)
	 */
	pdVariantSelected(product, variantGroup, variantValue) {
		if (!product) return;
		dataLayerPush({
			event:        'eventTracking - Product',
			channel:      config.CHANNEL,
			eventName:    'select_variant',
			sku:          product.sku,
			isPreorder:   !!product.preOrder,
			variantGroup,
			variantValue,
		});
	},

	/**
	 * View a bundle on the product detail page
	 */
	pdBundleSelected(product, bundle) {
		if (!product || !bundle?.items?.length) return;
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'view_bundle',
			sku:        product.sku,
			isPreorder: !!product.preOrder,
			bundleName: bundle.bundleName,
			bundleSkus: bundle.items.map((i) => i.sku),
		});
	},

	/**
	 * Buy/Add a bundle from the product detail page
	 * addToCartAction: ADD_TO_CART_ACTION_TYPE.ADD_TO_CART | .BUY_NOW
	 */
	pdBundleBuy(product, bundle, addToCartAction) {
		if (!product || !bundle?.items?.length) return;
		const actionText = addToCartAction === ADD_TO_CART_ACTION_TYPE.ADD_TO_CART ? 'add_to_cart'
			: addToCartAction === ADD_TO_CART_ACTION_TYPE.BUY_NOW ? 'buy_now'
			: null;
		if (!actionText) return;
		dataLayerPush({
			event:         'eventTracking - Product',
			channel:       config.CHANNEL,
			eventName:     'buy_bundle',
			sku:           product.sku,
			isPreorder:    !!product.preOrder,
			bundleName:    bundle.bundleName,
			bundleSkus:    bundle.items.map((i) => i.sku),
			bundlePrice:   convertSatangToBaht(bundle.sellingPrice),
			action:        actionText,
		});
	},

	/**
	 * View a promotion row on the product detail page
	 */
	pdViewPromotion(product, promotionObj) {
		if (!product || !promotionObj?.promotion) return;
		const { promotion, index } = promotionObj;
		dataLayerPush({
			event:          'eventTracking - Product',
			channel:        config.CHANNEL,
			eventName:      'view_promotion',
			sku:            product.sku,
			isPreorder:     !!product.preOrder,
			promotionType:  promotion.type,
			promotionLabel: `${promotion.label}_${index + 1}`,
		});
	},

	/**
	 * View a freebie/free-gift section on the product detail page
	 */
	pdViewFreeGifts(product, promotionObj) {
		if (!product || !promotionObj?.promotion) return;
		const { promotion, index } = promotionObj;
		dataLayerPush({
			event:          'eventTracking - Product',
			channel:        config.CHANNEL,
			eventName:      'view_freebie',
			sku:            product.sku,
			isPreorder:     !!product.preOrder,
			promotionLabel: `${promotion.label}_${index + 1}`,
		});
	},

	/**
	 * Apply coupon code on the product detail page
	 */
	pdApplyCouponCode(product, promotionObj) {
		if (!product || !promotionObj?.promotion) return;
		const { promotion, index } = promotionObj;
		dataLayerPush({
			event:         'eventTracking - Product',
			channel:       config.CHANNEL,
			eventName:     'apply_coupon_pdp',
			sku:           product.sku,
			isPreorder:    !!product.preOrder,
			couponCode:    `${promotion.code}_${index + 1}`,
			promotionType: promotion.type,
		});
	},

	/**
	 * View installment plans on the product detail page
	 */
	pdViewInstallmentPlans(product) {
		if (!product?.installmentsDetail?.length) return;
		dataLayerPush({
			event:     'eventTracking - Product',
			channel:   config.CHANNEL,
			eventName: 'view_installment',
			sku:       product.sku,
			isPreorder: !!product.preOrder,
			bankNames: product.installmentsDetail.map((b) => b.bankName),
		});
	},

	/**
	 * View a media item in the product gallery
	 * media.type: MEDIA_GALLERY_TYPE.IMAGE | VIDEO | IMAGE360
	 */
	pdGalleryView(product, media, mediaIndex) {
		const typeMap = {
			[MEDIA_GALLERY_TYPE.IMAGE]:   'image',
			[MEDIA_GALLERY_TYPE.VIDEO]:   'video',
			[MEDIA_GALLERY_TYPE.IMAGE360]: '360',
		};
		const mediaType = typeMap[media?.type];
		if (!mediaType) return;
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'view_gallery',
			sku:        product.sku,
			isPreorder: !!product.preOrder,
			mediaType,
			mediaIndex: mediaIndex + 1,
		});
	},

	pdGallerySwipe(product, mediaIndex) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'swipe_gallery',
			sku:        product.sku,
			isPreorder: !!product.preOrder,
			mediaIndex: mediaIndex + 1,
		});
	},

	pdVideoPlay(product, mediaIndex) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'play_video',
			sku:        product.sku,
			isPreorder: !!product.preOrder,
			mediaIndex: mediaIndex + 1,
		});
	},

	/**
	 * Share product — shareType: 'link' | 'facebook' | 'line'
	 */
	pdSocialShare(product, shareType, url) {
		if (!product) return;
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'share_product',
			sku:        product.sku,
			isPreorder: !!product.preOrder,
			shareType,
			url,
		});
	},

	/**
	 * Buy Now on product detail page
	 * preorderType: PRODUCT_TYPE.PRE_ORDER_FULL_PRICE | PRE_ORDER_RESERVE_PRICE | undefined
	 */
	pdBuyNow(product, preorderType) {
		if (!product) return;
		dataLayerPush({
			event:        'eventTracking - Product',
			channel:      config.CHANNEL,
			eventName:    'buy_now',
			sku:          product.sku,
			isPreorder:   !!product.preOrder,
			preorderType: preorderType ?? null,
			price:        convertSatangToBaht(product.sellingPrice),
		});
	},

	/**
	 * Add to Cart on product detail page
	 */
	pdAddToCart(product) {
		if (!product) return;
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'add_to_cart_pdp',
			sku:        product.sku,
			isPreorder: !!product.preOrder,
			price:      convertSatangToBaht(product.sellingPrice),
		});
	},

	/**
	 * Click a similar product suggestion (shown when out-of-stock)
	 */
	pdSimilarProductClicked(product, similarProduct) {
		if (!product || !similarProduct) return;
		dataLayerPush({
			event:             'eventTracking - Product',
			channel:           config.CHANNEL,
			eventName:         'click_similar_product',
			sku:               product.sku,
			isPreorder:        !!product.preOrder,
			similarProductSku: similarProduct.sku,
		});
	},

	pdPreOrderAcceptTerm(product) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'preorder_accept_term',
			sku:        product.sku,
		});
	},

	pdPreOrderFilledPersonalID(product, isIDRequired) {
		dataLayerPush({
			event:        'eventTracking - Product',
			channel:      config.CHANNEL,
			eventName:    'preorder_fill_personal_id',
			sku:          product.sku,
			isIDRequired: isIDRequired ? 'yes' : 'no',
		});
	},

	/**
	 * Check stock at branch (PP page check-stock icon)
	 */
	checkStockBranch(sku) {
		dataLayerPush({
			event:     'eventTracking - Product',
			channel:   config.CHANNEL,
			eventName: 'check_stock_branch',
			sku,
		});
	},

	clickCollectOneHour(sku) {
		dataLayerPush({
			event:     'eventTracking - Product',
			channel:   config.CHANNEL,
			eventName: 'click_collect_1hr',
			sku,
		});
	},

	// ── 10. Check Stock at Store popup ───────────────────────────────────────

	checkStockAtStoreSearchBranch(sku, keyword) {
		dataLayerPush({
			event: 'eventTracking - Check Stock',
			channel: config.CHANNEL,
			eventName: 'check_stock_search_branch',
			sku,
			keyword,
		});
	},

	checkStockAtStoreFilterProvince(sku, provinceName) {
		dataLayerPush({
			event: 'eventTracking - Check Stock',
			channel: config.CHANNEL,
			eventName: 'check_stock_filter_province',
			sku,
			provinceName,
		});
	},

	checkStockAtStoreFilterInStock(sku, filterInstock = false) {
		dataLayerPush({
			event:        'eventTracking - Check Stock',
			channel:      config.CHANNEL,
			eventName:    'check_stock_filter_instock',
			sku,
			filterInstock,
		});
	},

	checkStockAtStoreSelectStoreNode(sku, branchName, position, stockStatus) {
		dataLayerPush({
			event:       'eventTracking - Check Stock',
			channel:     config.CHANNEL,
			eventName:   'check_stock_select_store',
			sku,
			branchName,
			position,
			stockStatus,
		});
	},

	checkStockAtStoreSelectClickOnGoogleMaps(sku, branchName, position) {
		dataLayerPush({
			event:     'eventTracking - Check Stock',
			channel:   config.CHANNEL,
			eventName: 'check_stock_click_maps',
			sku,
			branchName,
			position,
		});
	},

	// ── 11. Collect in 1 Hour popup ───────────────────────────────────────────

	clickCollectOneHrSearchBranch(sku, keyword) {
		dataLayerPush({
			event:     'eventTracking - Collect 1hr',
			channel:   config.CHANNEL,
			eventName: 'collect_1hr_search_branch',
			sku,
			keyword,
		});
	},

	clickCollectOneHrFilterProvince(sku, provinceName) {
		dataLayerPush({
			event:        'eventTracking - Collect 1hr',
			channel:      config.CHANNEL,
			eventName:    'collect_1hr_filter_province',
			sku,
			provinceName,
		});
	},

	clickCollectOneHrFilterInStock(sku, filterInstock = false) {
		dataLayerPush({
			event:        'eventTracking - Collect 1hr',
			channel:      config.CHANNEL,
			eventName:    'collect_1hr_filter_instock',
			sku,
			filterInstock,
		});
	},

	clickCollectOneHrSelectClickBuy(sku, branchName, position) {
		dataLayerPush({
			event:     'eventTracking - Collect 1hr',
			channel:   config.CHANNEL,
			eventName: 'collect_1hr_buy',
			sku,
			branchName,
			position,
		});
	},

	clickCollectOneHrSelectClickOnGoogleMaps(sku, branchName, position) {
		dataLayerPush({
			event:     'eventTracking - Collect 1hr',
			channel:   config.CHANNEL,
			eventName: 'collect_1hr_click_maps',
			sku,
			branchName,
			position,
		});
	},

	// ── 12. Compare Products ──────────────────────────────────────────────────

	compareProductsProductSelected(sku) {
		dataLayerPush({
			event:     'eventTracking - Compare',
			channel:   config.CHANNEL,
			eventName: 'compare_select_product',
			sku,
		});
	},

	compareProductsAddToWishlist(sku) {
		dataLayerPush({
			event:     'eventTracking - Compare',
			channel:   config.CHANNEL,
			eventName: 'compare_add_to_wishlist',
			sku,
		});
	},

	compareProductsBuyNow(sku) {
		dataLayerPush({
			event:     'eventTracking - Compare',
			channel:   config.CHANNEL,
			eventName: 'compare_buy_now',
			sku,
		});
	},

	// ── 13. Bundle V2 (BP page) ───────────────────────────────────────────────

	pdBundleSelectCampaignName(sku, position, bundle) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'bundle_v2_select',
			sku,
			position,
			bundleName: bundle.bundleName,
			bundleId:   bundle.id,
		});
	},

	pdBundleCustomize(sku, position, bundle) {
		dataLayerPush({
			event:      'eventTracking - Product',
			channel:    config.CHANNEL,
			eventName:  'bundle_v2_customize',
			sku,
			position,
			bundleName: bundle.bundleName,
			bundleId:   bundle.id,
		});
	},

	bpBundleSelectCampaignName(sku, position, bundle) {
		dataLayerPush({
			event:      'eventTracking - Bundle',
			channel:    config.CHANNEL,
			eventName:  'bundle_page_select',
			sku,
			position,
			bundleName: bundle.bundleName,
			bundleId:   bundle.id,
		});
	},

	bpBundleBanner(sku, bundleName, bannerLink) {
		dataLayerPush({
			event:      'eventTracking - Bundle',
			channel:    config.CHANNEL,
			eventName:  'bundle_page_banner',
			sku,
			bundleName,
			bannerLink: bannerLink || null,
		});
	},

	bpBundleReward(sku, bundle, skuList) {
		dataLayerPush({
			event:      'eventTracking - Bundle',
			channel:    config.CHANNEL,
			eventName:  'bundle_page_check_reward',
			sku,
			bundleName: bundle.bundleName,
			bundleId:   bundle.id,
			skuList,
		});
	},

	bpBundleRewardFreebie(sku, bundle, rewardType, discount, freebieSkuList) {
		dataLayerPush({
			event:          'eventTracking - Bundle',
			channel:        config.CHANNEL,
			eventName:      'bundle_page_check_reward_freebie',
			sku,
			bundleName:     bundle.bundleName,
			bundleId:       bundle.id,
			rewardType,
			discount:       discount || null,
			freebieSkuList,
		});
	},

	bpBundlePaginationNextPrevClicked(sku, buttonType) {
		dataLayerPush({
			event:      'eventTracking - Bundle',
			channel:    config.CHANNEL,
			eventName:  'bundle_page_pagination',
			sku,
			buttonType,
		});
	},

	bpBundleProductAdd(sku, groupName, groupIndex, selectedSku, position) {
		dataLayerPush({
			event:       'eventTracking - Bundle',
			channel:     config.CHANNEL,
			eventName:   'bundle_page_add_product',
			sku,
			groupName,
			groupIndex,
			selectedSku,
			position,
		});
	},

	bpBundleProductView(sku, groupName, groupIndex, selectedSku, position) {
		dataLayerPush({
			event:       'eventTracking - Bundle',
			channel:     config.CHANNEL,
			eventName:   'bundle_page_view_product',
			sku,
			groupName,
			groupIndex,
			selectedSku,
			position,
		});
	},

	collectAtStore() {
		dataLayerPush({
			event:     'eventTracking',
			channel:   config.CHANNEL,
			eventName: 'click_and_collect',
		});
	},

	// ── 14. Cart ──────────────────────────────────────────────────────────────

	cartProceedToCheckout(cartData) {
		dataLayerPush({
			event:       'eventTracking - Cart',
			channel:     config.CHANNEL,
			eventName:   'proceed_to_checkout',
			skuList:     cartData.productItems?.map((p) => p.sku) ?? [],
			subTotal:    convertSatangToBaht(cartData.subTotal),
		});
	},

	cartContinueShopping(cartData) {
		dataLayerPush({
			event:     'eventTracking - Cart',
			channel:   config.CHANNEL,
			eventName: 'continue_shopping',
			skuList:   cartData.productItems?.map((p) => p.sku) ?? [],
			subTotal:  convertSatangToBaht(cartData.subTotal),
		});
	},

	cartEmptyBackToHome() {
		dataLayerPush({
			event:     'eventTracking - Cart',
			channel:   config.CHANNEL,
			eventName: 'empty_cart_back_to_home',
		});
	},

	cartShippingMethodCollectInOneHour(cartData, branchName) {
		dataLayerPush({
			event:      'eventTracking - Cart',
			channel:    config.CHANNEL,
			eventName:  'select_collect_1hr',
			sku:        cartData.productItems?.[0]?.sku ?? null,
			branchName,
		});
	},

	// ── 15. Shipping Page ─────────────────────────────────────────────────────

	onSubmitPromotionCode(codeName, codeStatus = false) {
		dataLayerPush({
			event:      'eventTracking - Shipping',
			channel:    config.CHANNEL,
			eventName:  'apply_code',
			codeName,
			codeStatus: codeStatus ? 'pass' : 'error',
		});
	},

	onSubmitRemovePromotionCode(codeName, codeStatus = false) {
		dataLayerPush({
			event:      'eventTracking - Shipping',
			channel:    config.CHANNEL,
			eventName:  'remove_code',
			codeName,
			codeStatus: codeStatus ? 'pass' : 'error',
		});
	},

	onSelectPayment(paymentSlug) {
		if (!paymentSlug || typeof paymentSlug !== 'string') return;
		dataLayerPush({
			event:       'eventTracking - Shipping',
			channel:     config.CHANNEL,
			eventName:   'select_payment',
			paymentType: paymentSlug.replace(/-/g, ' '),
		});
	},

	/**
	 * Submit shipping method selection (full payment object)
	 */
	shippingSubmit(shipment) {
		if (!shipment) return;
		dataLayerPush({
			event:        'eventTracking - Checkout',
			channel:      config.CHANNEL,
			eventName:    'submit_shipping',
			shippingType: shipment.type,
			branchId:     shipment.branchDetail?.branchId ?? null,
		});
	},

	shippingMethodChanged(shippingMethod) {
		dataLayerPush({
			event:          'eventTracking - Checkout',
			channel:        config.CHANNEL,
			eventName:      'change_shipping_method',
			shippingMethod: shippingMethod.method,
		});
	},

	shippingRequestTaxInvoice(taxInvoiceRequested) {
		dataLayerPush({
			event:               'eventTracking - Checkout',
			channel:             config.CHANNEL,
			eventName:           'request_tax_invoice',
			taxInvoiceRequested: taxInvoiceRequested ? 'yes' : 'no',
		});
	},

	/**
	 * Payment method selected at checkout
	 * paymentType: CHECKOUT_STEP_TYPE.INITIAL_PAYMENT | other
	 */
	paymentSelected(payment, paymentType, subtotal) {
		if (!payment) return;
		const isInitial = paymentType === CHECKOUT_STEP_TYPE.INITIAL_PAYMENT;
		dataLayerPush({
			event:          'eventTracking - Checkout',
			channel:        config.CHANNEL,
			eventName:      isInitial ? 'select_initial_payment' : 'select_payment',
			paymentSlug:    payment.slug,
			paymentGroup:   payment.paymentMethodGroup?.slug ?? null,
			installment:    installmentPlanText(payment.installmentPlan) || null,
			subTotal:       convertSatangToBaht(subtotal),
		});
	},

	codeApplied(code) {
		dataLayerPush({
			event:     'eventTracking - Checkout',
			channel:   config.CHANNEL,
			eventName: 'apply_code',
			code,
		});
	},

	// ── 16. Checkout shipment branch popup ────────────────────────────────────

	checkoutShipmentChangeBranch(shippingType, branchName) {
		dataLayerPush({
			event:        'eventTracking - Checkout',
			channel:      config.CHANNEL,
			eventName:    'shipment_change_branch',
			shippingType,
			branchName,
		});
	},

	checkoutShipmentSearchBranch(shippingType, keyword) {
		dataLayerPush({
			event:        'eventTracking - Checkout',
			channel:      config.CHANNEL,
			eventName:    'shipment_search_branch',
			shippingType,
			keyword,
		});
	},

	checkoutShipmentFilterProvince(shippingType, provinceName) {
		dataLayerPush({
			event:        'eventTracking - Checkout',
			channel:      config.CHANNEL,
			eventName:    'shipment_filter_province',
			shippingType,
			provinceName,
		});
	},

	checkoutShipmentFilterInStock(shippingType, filterInstock = false) {
		dataLayerPush({ ecommerce: null });
		dataLayerPush({
			event:        'eventTracking - Checkout',
			channel:      config.CHANNEL,
			eventName:    'shipment_filter_instock',
			shippingType,
			filterInstock,
		});
	},

	checkoutShipmentSelectClickBuy(shippingType, branchName, position) {
		dataLayerPush({
			event:        'eventTracking - Checkout',
			channel:      config.CHANNEL,
			eventName:    'shipment_select_buy',
			shippingType,
			branchName,
			position,
		});
	},

	checkoutShipmentSelectClickOnGoogleMaps(shippingType, branchName, position) {
		dataLayerPush({
			event:        'eventTracking - Checkout',
			channel:      config.CHANNEL,
			eventName:    'shipment_select_map',
			shippingType,
			branchName,
			position,
		});
	},

	// ── 17. Order History ─────────────────────────────────────────────────────

	orderCancelSubmit(reason) {
		dataLayerPush({
			event:     'eventTracking - Order',
			channel:   config.CHANNEL,
			eventName: 'cancel_order',
			reason,
		});
	},

	orderReSelectPayment(payment) {
		if (!payment) return;
		dataLayerPush({
			event:        'eventTracking - Order',
			channel:      config.CHANNEL,
			eventName:    'reselect_payment',
			paymentSlug:  payment.slug,
			paymentGroup: payment?.paymentMethodSubgroup?.paymentMethodGroup?.slug ?? null,
			installment:  installmentPlanText(payment.installmentPlan) || null,
		});
	},

	orderRepayment(payment) {
		if (!payment) return;
		dataLayerPush({
			event:        'eventTracking - Order',
			channel:      config.CHANNEL,
			eventName:    'repayment',
			paymentSlug:  payment.slug,
			paymentGroup: payment?.paymentMethodSubgroup?.paymentMethodGroup?.slug ?? null,
			installment:  installmentPlanText(payment.installmentPlan) || null,
		});
	},

	// ── 18. 404 ───────────────────────────────────────────────────────────────

	error404ToHomePage() {
		dataLayerPush({
			event:     'eventTracking - 404',
			channel:   config.CHANNEL,
			eventName: '404_to_homepage',
		});
	},

	error404ToContactUs() {
		dataLayerPush({
			event:     'eventTracking - 404',
			channel:   config.CHANNEL,
			eventName: '404_to_contact_us',
		});
	},

	// ── 19. Coupon ────────────────────────────────────────────────────────────

	async onApplyCoupon(code, actionType = COUPON_ACTION_TYPE.CLICKED_BUTTON) {
		dataLayerPush({
			event:         'eventTracking - Coupon',
			channel:       config.CHANNEL,
			eventName:     'on_apply_coupon',
			eventCategory: actionType,
			eventValue:    code,
		});
	},

	async applyCouponSuccessed(code) {
		dataLayerPush({
			event:      'eventTracking - Coupon',
			channel:    config.CHANNEL,
			eventName:  'on_apply_coupon_successed',
			eventLabel: code,
		});
	},

	async applyCouponFailed(code) {
		dataLayerPush({
			event:      'eventTracking - Coupon',
			channel:    config.CHANNEL,
			eventName:  'on_apply_coupon_failed',
			eventLabel: code,
		});
	},

	async onRemoveCoupon(code, actionType = COUPON_ACTION_TYPE.CLICKED_BUTTON) {
		dataLayerPush({
			event:         'eventTracking - Coupon',
			channel:       config.CHANNEL,
			eventName:     'on_remove_coupon',
			eventCategory: actionType,
			eventLabel:    code,
		});
	},

	async removeCouponSuccessed(code) {
		dataLayerPush({
			event:      'eventTracking - Coupon',
			channel:    config.CHANNEL,
			eventName:  'on_remove_coupon_successed',
			eventLabel: code,
		});
	},

	async removeCouponFailed(code) {
		dataLayerPush({
			event:      'eventTracking - Coupon',
			channel:    config.CHANNEL,
			eventName:  'on_remove_coupon_failed',
			eventLabel: code,
		});
	},

	async onClickCoupon(coupon) {
		dataLayerPush({
			event:      'eventTracking - Coupon',
			channel:    config.CHANNEL,
			eventName:  'on_click_coupon',
			eventLabel: coupon.label,
			eventValue: coupon.code,
		});
	},

	async onOpenModalCouponDetail(coupon) {
		dataLayerPush({
			event:      'eventTracking - Coupon',
			channel:    config.CHANNEL,
			eventName:  'on_open_modal_coupon_detail',
			eventLabel: coupon.label,
			eventValue: coupon.code,
		});
	},

	async onCloseModalCouponDetail() {
		dataLayerPush({
			event:     'eventTracking - Coupon',
			channel:   config.CHANNEL,
			eventName: 'on_close_modal_coupon_detail',
		});
	},

	// ── 20. Wishlist ──────────────────────────────────────────────────────────

	async onAddToWishList(product) {
		dataLayerPush({
			event:     'add_to_wishlist',
			channel:   config.CHANNEL,
			eventName: 'on_add_to_wish_list',
			product,
		});
	},

	async onRemoveFromWishList(product) {
		dataLayerPush({
			event:     'remove_from_wishlist',
			channel:   config.CHANNEL,
			eventName: 'on_remove_from_wish_list',
			product,
		});
	},

	// ── 21. Flash Sale ────────────────────────────────────────────────────────

	async onEnterFlashSalePage() {
		dataLayerPush({
			event:     'eventTracking - Flash Sale',
			channel:   config.CHANNEL,
			eventName: 'on_enter_flash_sale_page',
		});
	},

	// ── 22. Misc ──────────────────────────────────────────────────────────────

	clickOpenAppHeader(action) {
		dataLayerPush({
			event:       'eventTracking',
			channel:     config.CHANNEL,
			eventName:   'click_open_app_header',
			clickStatus: action ? 'open' : 'close',
		});
	},

	onClickOpenPreviewETax(payload) {
		dataLayerPush({
			event:     'eventTracking',
			channel:   config.CHANNEL,
			eventName: 'click_open_preview_e_tax',
			payload,
		});
	},

	// ── 23. Equip (PC Builder) ────────────────────────────────────────────────

	equipAddToCart() {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_add_to_cart' });
	},

	equipClearAll() {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_clear_all' });
	},

	equipSearchProduct(category, keyword) {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_search_product', category, keyword });
	},

	equipSelectFilter(category, filterName, filterValue) {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_select_filter', category, filterName, filterValue: `${filterValue}` });
	},

	equipResetFilter(category) {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_reset_filter', category });
	},

	equipNextPrevPage(category, type, pageNo) {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_change_page', category, type, pageNo });
	},

	equipAddProductToComponent(category, productName, productSKU, productPosition) {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_add_product', category, productName, productSKU, productPosition });
	},

	equipViewProduct(category, productName, productSKU, productPosition) {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_view_product', category, productName, productSKU, productPosition });
	},

	equipDeleteProduct(category, productName, productSKU) {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_delete_product', category, productName, productSKU });
	},

	equipChangeProductQuantity(category, type, productSKU) {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_change_qty', category, type, productSKU });
	},

	equipToggleOwnOSCheckbox(own) {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_toggle_os', hasOwnOS: own ? 'yes' : 'no' });
	},

	equipSubmitRequireForBuild() {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_allow_build' });
	},

	equipCancelRequireForBuild() {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_cancel_build' });
	},

	equipClickBuildMyPC() {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_click_build_pc' });
	},

	equipClickDontBuildMyPC() {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_click_dont_build_pc' });
	},

	equipAllowInstallSoftware(consent) {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_allow_install_software', consent: consent ? 'yes' : 'no' });
	},

	equipAllowUnpack(consent) {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_allow_unpack', consent: consent ? 'yes' : 'no' });
	},

	equipClickContinueToBuild() {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_continue_to_build' });
	},

	equipClickAddToCart() {
		dataLayerPush({ event: 'eventTracking - Equip', channel: config.CHANNEL, eventName: 'equip_request_add_to_cart' });
	},

	// ── Register / Forgot password ────────────────────────────────────────────

	/**
	 * Register attempt — registerType: 'email' | 'google' | 'facebook' | 'apple'
	 */
	register(registerType) {
		dataLayerPush({
			event:        'eventTracking',
			channel:      config.CHANNEL,
			eventName:    'register_attempt',
			registerType,
		});
	},

	forgetPassword() {
		dataLayerPush({
			event:     'eventTracking',
			channel:   config.CHANNEL,
			eventName: 'forget_password',
		});
	},

});

export default {};
