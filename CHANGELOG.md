# Changelog

All notable changes to `@tickstudiu/ecom-analytics-core` will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [2.2.0] — 2026-05-26

### ⚠️ Breaking Changes

- **Removed `createGaBuilders`** — Universal Analytics (GA3) was sunset by Google on July 1, 2023. The factory and all UA-specific helpers (`gaWrapper`, `gaEvent` string-concatenation format) have been deleted.
  - **Migration**: All methods previously in `createGaBuilders` have been available in `createGa4Builders` since v2.1.0 with the same method names. Update `analytics-plugin.js` to point `$gaEvent` to the `createGa4Builders` instance.
  - Affected projects: `bnn-bnn.in.th`, `app-storefront`, `ustore-ecom` — all migrated.

### Added

- **`consentDefault()`** in `createGtmBuilders` — fires a safe "all denied" Consent Mode v2 payload (`consent_default`) before any GTM tag loads. Must be called once on SSR init (analytics-plugin.js), not on the client.
- **`consentUpdate(cookieConsents)`** in `createGtmBuilders` — fires `consent_update` when the user changes PDPA settings.
- **`productAddWishlist(product, profile, wishlistAction)`** in `createGtmBuilders` — pushes `add_to_wishlist` or `remove_from_wishlist` GA4 ecommerce event.
- **`couponsApplied(couponCode)`** in `createGtmBuilders` — pushes `coupon_applied` GA4 event.
- **`couponsRemoved(couponCode)`** in `createGtmBuilders` — pushes `coupon_removed` GA4 event.

### Changed

- `analytics-plugin.js` (all 3 projects): `$gaEvent` now aliases to the same `createGa4Builders` instance — zero call-site changes required across all projects.
- `app-storefront/plugins/analytics/ga-extensions.js` — fully rewritten from UA `gaWrapper` format to GA4 named-parameter format (`eventTracking - Drawer`, `eventTracking - MiniCart`, `eventTracking - Widget`).
- `app-storefront/plugins/analytics/ga.js` — **deleted** (was the UA `createGaBuilders` stub).
- `ustore-ecom/plugins/analytics/ga-extensions.js` — **deleted** (was an empty stub).

### Fixed

- Consent Mode v2 double-fire: `analytics-plugin.client.js` (all projects) no longer fires `consent_default` directly — handled entirely by `consentDefault()` in the SSR plugin.

### Tests

- Added full Jest + Babel test suite: **233 tests across 10 suites**.
  - `tests/unit/helpers/` — numeral, consent, ga, route
  - `tests/unit/resolvers/` — customer, order
  - `tests/integration/` — gtm builder, ga4 builder, payload snapshots (10 snapshots)
  - `tests/contract/` — API surface contract (exports)
- Snapshot tests freeze payload shape for: `login`, `register`, `select_item`, `add_to_cart`, `begin_checkout`, `purchase`, `consent_default`, `consent_update`, `userData`, `onRegistrationCompleted`.

---

## [2.1.0]

### Fixed

- **`preorderStatus` bug** — `transformProductItem` previously used `|| productItem.type` causing every product to report `preorderStatus: 'on'`. Fixed to check only `isPreOrder || preOrder`.
- **`convertSatangToBahtWithDecimal(0)` regression** — `!0` evaluated to `true`, causing free/zero-price items to return `null` instead of `"0.00"`. Fixed with `value == null` guard.

### Changed

- `transformProductItem` output now uses **GA4 standard field names**: `item_id`, `item_name`, `item_brand`, `item_category`. Legacy UA aliases (`id`, `name`, `brand`, `category`) removed.

---

## [2.0.0]

### Added

- `createGa4Builders` — GA4 event builder factory (130+ methods).
- `transformConsentModeV2` — maps PDPA consent to Google Consent Mode v2 signals.
- `buildConsentDefaultPayload` / `buildConsentUpdatePayload` helpers.
- All enums exported from `index.js`.

### Changed

- `createGtmBuilders` updated to GA4 ecommerce event names: `select_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `purchase`.

---

## [1.x] — Legacy

- `createGaBuilders` — Universal Analytics (GA3) factory. **Removed in v2.2.0.**

#### `ga.js` / `createGaBuilders` deprecated — all events migrated to `createGa4Builders`

Universal Analytics was shut down by Google on **1 July 2023**. Every event pushed via `createGaBuilders` has been going nowhere since then.

All 100+ methods have been migrated to `createGa4Builders` (`ga4.js`) using clean GA4 named parameters instead of string-concatenated `eventCategory/Action/Label/Value`.

**Migration (one-line change per project):**
```js
// Before
const dataLayer = createGaBuilders({ config, dataLayerPush });

// After
const dataLayer = createGa4Builders({ config, dataLayerPush, $cookies });
```
Method names are preserved — no call-site changes required.

**Removed exports from `index.js`:**
- `createGaBuilders` — use `createGa4Builders`
- `gaWrapper` — no replacement needed (UA-only utility)

`ga.js` is now a deprecation stub (warns in non-production) and will be deleted in **v3.0.0**.

#### New event format — named parameters instead of string concatenation

GA4 custom events now use flat named parameters, which are directly readable as GA4 custom dimensions in BigQuery and the GA4 UI. Examples:

| Old (UA string) | New (GA4 named params) |
|---|---|
| `eventCategory: 'PP{sku}_AddToCart'` | `sku: product.sku` |
| `eventCategory: 'PL_{slug}_select'` | `sku, categoryPageSlug` |
| `eventCategory: 'Storelocation'` + `eventAction: 'click'` | `eventName: 'view_store', storeName, storeAddress` |

**GTM container updates required for 3 projects:**
1. Add new GA4 Event tags triggered by the new `eventTracking - *` event names.
2. Map variables from `{{DLV - sku}}`, `{{DLV - branchName}}` etc. (no more string parsing in GTM).
3. Remove old UA tags (they no longer fire).

### New events added to `createGa4Builders`

Previously only available in `createGaBuilders` (UA) — now available in GA4 format:

- **Homepage:** `homeWidgetClicked`, `homeWidgetSwipe`, `homeWidgetClickedViewAll`, `flashSaleAddToCart`, `flashSaleSeeMore`
- **Header/Footer:** `headerSearch`, `loginAttempt`, `switchLanguage`, `headerStoreLocationClicked`, `mainHeaderLogoClicked`, `footerSocialClicked`
- **PDPA:** `pdpaBarAction`
- **Contact:** `contactUsFormSubmit`, `contactUsCallCenter`
- **Store:** `storeLocationStoreViewed`, `storeLocationSelectProvince`
- **Product List:** `plProductClicked`, `plProductSorted`, `plProductPaginationNextPrevClicked`, `plFilterChanged`, `plFilterShowInStockOnly`, `plExpand`
- **Product Detail:** `pdVariantSelected`, `pdBundleSelected`, `pdBundleBuy`, `pdViewPromotion`, `pdViewFreeGifts`, `pdApplyCouponCode`, `pdViewInstallmentPlans`, `pdGalleryView`, `pdGallerySwipe`, `pdVideoPlay`, `pdSocialShare`, `pdBuyNow`, `pdAddToCart`, `pdSimilarProductClicked`, `pdPreOrderAcceptTerm`, `pdPreOrderFilledPersonalID`, `checkStockBranch`, `clickCollectOneHour`
- **Check Stock popup:** `checkStockAtStoreSearchBranch`, `checkStockAtStoreFilterProvince`, `checkStockAtStoreFilterInStock`, `checkStockAtStoreSelectStoreNode`, `checkStockAtStoreSelectClickOnGoogleMaps`
- **Collect 1hr popup:** `clickCollectOneHrSearchBranch`, `clickCollectOneHrFilterProvince`, `clickCollectOneHrFilterInStock`, `clickCollectOneHrSelectClickBuy`, `clickCollectOneHrSelectClickOnGoogleMaps`
- **Compare:** `compareProductsProductSelected`, `compareProductsAddToWishlist`, `compareProductsBuyNow`
- **Bundle V2:** `pdBundleSelectCampaignName`, `pdBundleCustomize`, `bpBundleSelectCampaignName`, `bpBundleBanner`, `bpBundleReward`, `bpBundleRewardFreebie`, `bpBundlePaginationNextPrevClicked`, `bpBundleProductAdd`, `bpBundleProductView`, `collectAtStore`
- **Cart:** `cartProceedToCheckout`, `cartContinueShopping`, `cartEmptyBackToHome`, `cartShippingMethodCollectInOneHour`
- **Checkout:** `shippingSubmit`, `shippingMethodChanged`, `shippingRequestTaxInvoice`, `paymentSelected`, `codeApplied`
- **Checkout shipment:** `checkoutShipmentChangeBranch`, `checkoutShipmentSearchBranch`, `checkoutShipmentFilterProvince`, `checkoutShipmentFilterInStock`, `checkoutShipmentSelectClickBuy`, `checkoutShipmentSelectClickOnGoogleMaps`
- **Order:** `orderCancelSubmit`, `orderReSelectPayment`, `orderRepayment`
- **404:** `error404ToHomePage`, `error404ToContactUs`
- **Equip (PC Builder):** all 20 `equip*` methods
- **Auth:** `register`, `forgetPassword`

---

## [2.1.0] — 2026-05-26

### Bug Fixes

- **`resolvers/order.js`** — `preorderStatus` operator-precedence bug: `productItem.type` (a truthy string like `'Normal'`) was causing every product to report `preorderStatus: 'on'`. Fixed to `(productItem.isPreOrder || productItem.preOrder) ? 'on' : 'off'`.
- **`gtm.js`** — `purchase` event used `PRODUCT_TYPE.FREEBIE` (undefined) instead of `PRODUCT_TYPE.FREEBIES`, so freebie items never had their `productType` set correctly. Fixed.
- **`resolvers/customer.js`** — `transformConsents()` had no guard against `null`/non-array input, causing a runtime `TypeError`. Added `consents = []` default and `Array.isArray` check.
- **`helpers/numeral.js`** — `convertSatangToBahtWithDecimal(0)` returned `null` because `!0` is `true`. Changed guard to `value == null` so zero-price items (free gifts, zero discounts) correctly return `"0.00"`.

### Breaking Changes

#### `gtm.js` — GA4-standard `ecommerce{}` structure

The `ecommerce` object now contains **only GA4-standard parameters** (`currency`, `value`, `items[]`, `transaction_id`, `coupon`, `shipping`, `tax`, `affiliation`). All custom / business fields have been moved to the **event top level**.

**Fields moved out of `ecommerce{}` → event top level:**

| Field | Affected events |
|---|---|
| `profile` | `login`, `logout`, `register`, `updateProfile`, `purchase`, `checkout` (begin_checkout), `purchaseItem`, `productAddWishlist` |
| `consent`, `consentModeV2` | `login`, `logout` |
| `discount` | `purchase`, `begin_checkout` |
| `payment`, `remainingPayment` | `purchase` |
| `totalQuantities`, `subTotal`, `grandTotal`, `shippingFee`, `totalLine` | `purchase`, `begin_checkout`, `view_cart` |
| `payment_type` | `begin_checkout` |
| `checkoutStep`, `checkoutAction` | `view_cart`, `begin_checkout` |

**Fields removed entirely:**
- `ecommerce.coupons[]` (array) — redundant with `ecommerce.coupon` string per GA4 spec
- `ecommerce.shippingAddresses`, `billingAddresses`, `taxInvoiceAddresses` from `purchase` — PII should not be in the analytics ecommerce payload

**GTM container migration required:** Any GTM variable reading `{{DLV - ecommerce.profile.*}}`, `{{DLV - ecommerce.discount.*}}`, `{{DLV - ecommerce.payment.*}}` etc. must be updated to read from the top level instead: `{{DLV - profile.*}}`, `{{DLV - discount.*}}`, `{{DLV - payment.*}}`.

**`search` event** — `keyword` and `suggestions` moved out of `ecommerce{}` to top level. The `ecommerce` object is removed entirely from this event (search is not an ecommerce event).

#### `resolvers/order.js` — Legacy UA aliases removed from `transformProductItem`

The deprecated `id`, `name`, `brand`, `category` aliases (kept since v2.0.0 for migration) have been removed. Use `item_id`, `item_name`, `item_brand`, `item_category` exclusively.

**GTM container migration:** Update any GTM variables reading `{{DLV - ecommerce.items.0.id}}` → `{{DLV - ecommerce.items.0.item_id}}` (and `name`→`item_name`, `brand`→`item_brand`, `category`→`item_category`).

### Improvements

- **`ga4.js`** — Removed all commented-out dead code blocks (coupon, modal, switch methods that were never implemented). Reduces file noise significantly.
- **`gtm.js`** — Private helpers cleaned up and made more concise. Consistent `ecommerce: null` clear before all ecommerce events.

---

## [2.0.0] — 2026-05-22

### Breaking Changes

#### `gtm.js` — UA Enhanced Ecommerce → GA4 Ecommerce format

Google sunset Universal Analytics in July 2023. All GTM dataLayer pushes now use GA4 ecommerce schema.

| Event (old UA name) | Event (new GA4 name) | Notes |
|---|---|---|
| `productClick` | `select_item` | |
| `impressions` | `view_item_list` | |
| `productDetail` | `view_item` | |
| `addToCart` | `add_to_cart` | |
| `removeFromCart` | `remove_from_cart` | |
| `viewCart` | `view_cart` | |
| `checkout` | `begin_checkout` | |
| `purchase` | `purchase` | name was already correct |

**Ecommerce object structure:**
- `ecommerce.currencyCode` → `ecommerce.currency`
- `ecommerce.add.products[]` / `ecommerce.remove.products[]` etc. → `ecommerce.items[]`
- `ecommerce.purchase.actionField.id` → `ecommerce.transaction_id`
- `ecommerce.purchase.actionField.revenue` → `ecommerce.value`
- `actionField.list` inside products → `item_list_name` inside each item

#### `resolvers/order.js` — `transformProductItem` GA4 item schema

Primary field names updated to GA4 standard. Legacy UA names kept as aliases.

| Field (old) | Field (new GA4) |
|---|---|
| `id` | `item_id` *(legacy `id` still included)* |
| `name` | `item_name` *(legacy `name` still included)* |
| `brand` | `item_brand` *(legacy `brand` still included)* |
| `category` | `item_category` *(legacy `category` still included)* |
| `position` | `index` |
| `list` | `item_list_name` |

### New Features

#### Consent Mode v2 (`helpers/consent.js`) — **Mandatory since March 2024**

New helper file with 3 exports:
- `transformConsentModeV2(consents)` — maps PDPA array → Google Consent Mode v2 signals
- `buildConsentUpdatePayload(consents)` — full GTM push payload for consent update
- `buildConsentDefaultPayload()` — GTM push payload for page-load default (all denied)

New `gtm.js` builders:
- `consentDefault()` — fire before any GTM tags on page load
- `consentUpdate(cookieConsents)` — fire when user changes PDPA settings

**GTM setup required:** Add a Custom HTML tag that fires on `consent_default` event using `gtag('consent', 'default', ...)` or the GTM consent initialization trigger.

#### GA4 Standard Wishlist events

`ga4.js` wishlist builders now push GA4 standard event names:
- `onAddToWishList` → fires `event: 'add_to_wishlist'` (was `eventTracking - Wishlist`)
- `onRemoveFromWishList` → fires `event: 'remove_from_wishlist'`

Legacy `eventName` field kept for backward compat GTM triggers.

#### `search` now includes `search_term`

`gtm.js` `search()` now includes `search_term: keyword` at the top level (GA4 standard parameter for search events).

#### `userData` includes `user_id` and `consentModeV2`

`ga4.js` `userData()` now includes:
- `user_id: profile.id` — required for GA4 cross-device measurement
- `consentModeV2` — consent signals alongside legacy `consent` object

### Migration Guide for Projects

#### GTM Container changes required

1. Update GA4 ecommerce tag triggers from old UA event names to new GA4 event names.
2. Add Consent Initialization trigger + tag for `consent_default`.
3. Add trigger for `consent_update` to call `gtag('consent', 'update', ...)`.

#### Call `consentDefault()` on page load

In `analytics-plugin.js` (or layout component), fire before any other events:

```js
// plugins/analytics-plugin.js
export default ({ $gtm, $cookies }, inject) => {
  const dataLayerPush = $gtm?.push ?? (() => {});
  const ctx = { config, dataLayerPush };
  const dataLayer = createGtmBuilders(ctx);

  // Fire consent default FIRST (before GTM loads other tags)
  dataLayer.consentDefault();

  inject('dataLayer', dataLayer);
  // ...
};
```

#### Call `consentUpdate()` when PDPA consent changes

```js
// wherever PDPA modal confirms:
this.$dataLayer.consentUpdate(this.cookieConsents);
```

---

## [1.0.0] — 2025 (initial release)

- Extracted shared analytics from bnn, ustore, app-storefront
- Factory pattern: `createGtmBuilders`, `createGa4Builders`, `createGaBuilders`
- UA Enhanced Ecommerce format (now superseded by v2.0.0)
