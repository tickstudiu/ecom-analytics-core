# Changelog

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
