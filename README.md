# @comseven/analytics-core

Shared GTM / GA4 analytics builders สำหรับ Nuxt 2 projects ในกลุ่ม comseven (bnn, ustore, app-storefront)

> **v2.2.0** — Universal Analytics (UA) ถูก Google ปิดไปแล้วตั้งแต่ 1 July 2023  
> `createGaBuilders` deprecated แล้ว — ทุก event ย้ายมาอยู่ใน `createGa4Builders` ครบถ้วนแล้ว

---

## ปัญหาที่แก้

3 project มี `plugins/analytics/` โครงสร้างเหมือนกันแต่ drift ห่างออกจากกันเรื่อยๆ เพราะแก้คนละที่คนละเวลา package นี้รวม core analytics logic ไว้ที่เดียว แก้ที่นี่แล้ว apply ได้ทุก project

---

## Install

```bash
# production
npm install github:tickstudiu/ecom-analytics-core

# local dev
npm link @comseven/analytics-core
```

---

## โครงสร้าง package

```
analytics-core/
├── index.js          ← main entry (re-exports ทั้งหมด)
├── gtm.js            ← createGtmBuilders  (GA4 ecommerce events)
├── ga4.js            ← createGa4Builders  (GA4 custom events — 150+ methods)
├── ga.js             ← ⚠️ deprecated stub (จะลบใน v3.0.0)
├── enums/            ← shared constants
├── helpers/          ← date, numeral, ga, consent, route
└── resolvers/        ← customer, order
```

---

## Usage

### 1. เพิ่ม transpile ใน nuxt.config.js

```js
build: {
  transpile: ['@comseven/analytics-core'],
}
```

### 2. สร้าง config ของ project

```js
// plugins/analytics/config.js
export default Object.freeze({
  CHANNEL: 'BNN',                                      // ชื่อ brand
  CURRENCY_CODE: 'THB',
  PRODUCT_DETAIL_ROUTE_NAME: 'products-productDetail', // Nuxt route name
});
```

### 3. อัปเดต analytics-plugin.js

```js
import { createGtmBuilders, createGa4Builders } from '@comseven/analytics-core';
import config from './analytics/config';

export default ({ $gtm, $cookies }, inject) => {
  const dataLayerPush = $gtm?.push ?? (() => {});
  const ctx = { config, dataLayerPush };

  // GTM ecommerce events (select_item, add_to_cart, purchase ฯลฯ)
  inject('dataLayer', createGtmBuilders(ctx));

  // GA4 custom events + Consent Mode v2
  // (ครอบคลุม 150+ events รวมทุก event ที่เคยอยู่ใน createGaBuilders)
  inject('ga4Event', createGa4Builders({ ...ctx, $cookies }));

  // Fire consent default BEFORE any GTM tags load
  createGtmBuilders(ctx).consentDefault();
};
```

### 4. Project-specific events → extension file

Event ที่มีเฉพาะ project ให้แยกไว้ใน `plugins/analytics/ga4-extensions.js` แล้ว merge เข้า inject:

```js
// plugins/analytics/ga4-extensions.js
export const createGa4Extensions = ({ config, dataLayerPush }) => ({
  async clickOnSitePopup(payload) {
    dataLayerPush({
      event:     'eventTracking',
      channel:   config.CHANNEL,
      eventName: 'click_onsite_popup',
      ...payload,
    });
  },
});

// analytics-plugin.js
inject('ga4Event', {
  ...createGa4Builders({ ...ctx, $cookies }),
  ...createGa4Extensions(ctx),
});
```

---

## Builders

### `createGtmBuilders({ config, dataLayerPush })`

GA4 ecommerce events ทุก event push เข้า `window.dataLayer`  
`ecommerce{}` ใช้ GA4-standard fields เท่านั้น — custom fields อยู่ที่ top level ของ event

| Method | GA4 Event | Description |
|---|---|---|
| `consentDefault()` | `consent_default` | Fire ก่อน GTM tags ทุกตัว (page load) |
| `consentUpdate(cookieConsents)` | `consent_update` | Fire เมื่อ user เปลี่ยน PDPA |
| `register(profile, provider)` | `register` | สมัครสมาชิก |
| `login({ profile }, { cookieConsents }, cid)` | `login` | เข้าสู่ระบบ |
| `logout({ profile }, { cookieConsents }, cid)` | `logout` | ออกจากระบบ |
| `updateProfile(profile)` | `updateProfile` | อัปเดตโปรไฟล์ |
| `productClick(product, position, referrer)` | `select_item` | คลิก product card |
| `productImpression(productList, app, referrer)` | `view_item_list` | เห็น product list |
| `productDetailImpression(product, url, referrer)` | `view_item` | เห็นหน้า product detail |
| `addToCart(products, referrer, a2cType)` | `add_to_cart` | เพิ่มลงตะกร้า |
| `removeFromCart(products)` | `remove_from_cart` | ลบออกจากตะกร้า |
| `viewCart(products, step)` | `view_cart` | ดูตะกร้า |
| `checkout(products, step, profile)` | `begin_checkout` | เริ่ม checkout |
| `purchase(orderDetail, profile)` | `purchase` | สั่งซื้อสำเร็จ |
| `purchaseItem(item, orderId, profile)` | `purchaseItem` | สั่งซื้อรายชิ้น |
| `productAddWishlist(product, profile, action)` | `add/remove_to_wishlist` | wishlist |
| `search(keyword, suggestions)` | `search` | ค้นหา |
| `couponsApplied(couponCode)` | `coupon_applied` | ใส่ coupon สำเร็จ |
| `couponsRemoved(couponCode)` | `coupon_removed` | ลบ coupon |

### `createGa4Builders({ config, dataLayerPush, $cookies })`

GA4 custom event tracking — 150+ methods ครอบคลุมทุก user interaction

| กลุ่ม | Methods ตัวอย่าง |
|---|---|
| Auth | `login`, `logout`, `onRegistrationStarted`, `onRegistrationCompleted`, `loginAttempt`, `register`, `forgetPassword` |
| User data | `userData`, `viewPage` |
| Consent | ผ่าน `createGtmBuilders` |
| Homepage | `homeWidgetClicked`, `homeWidgetSwipe`, `flashSaleAddToCart`, `flashSaleSeeMore` |
| Header / Footer | `headerSearch`, `switchLanguage`, `headerStoreLocationClicked`, `footerSocialClicked`, `mainHeaderLogoClicked` |
| PDPA | `pdpaBarAction`, `pdpaSettingSubmit` |
| Product List | `viewProductList`, `plProductClicked`, `plProductSorted`, `plFilterChanged`, `sortingProductList` ฯลฯ |
| Product Detail | `pdBuyNow`, `pdAddToCart`, `pdVariantSelected`, `pdBundleSelected`, `pdGalleryView`, `pdViewPromotion` ฯลฯ |
| Promotion | `promotionBanner` |
| Wishlist | `onAddToWishList`, `onRemoveFromWishList` |
| Compare | `compareProductsProductSelected`, `compareProductsBuyNow` |
| Bundle V2 | `pdBundleSelectCampaignName`, `bpBundleSelectCampaignName`, `bpBundleReward` ฯลฯ |
| Check Stock | `checkStockBranch`, `checkStockAtStoreSearchBranch`, `checkStockAtStoreSelectStoreNode` ฯลฯ |
| Collect 1hr | `clickCollectOneHour`, `clickCollectOneHrSelectClickBuy` ฯลฯ |
| Cart | `cartProceedToCheckout`, `cartContinueShopping`, `cartEmptyBackToHome` |
| Checkout | `shippingSubmit`, `paymentSelected`, `shippingRequestTaxInvoice`, `onSelectPayment` ฯลฯ |
| Order | `orderCancelSubmit`, `orderReSelectPayment`, `orderRepayment` |
| Coupon | `onApplyCoupon`, `applyCouponSuccessed`, `onRemoveCoupon`, `onClickCoupon` ฯลฯ |
| Store | `onClickStore`, `storeLocationStoreViewed`, `storeLocationSelectProvince` |
| Contact | `contactUsFormSubmit`, `contactUsCallCenter` |
| Equip | `equipAddToCart`, `equipSearchProduct`, `equipClickBuildMyPC` ฯลฯ (20+ methods) |
| Flash Sale | `onEnterFlashSalePage` |
| 404 | `error404ToHomePage`, `error404ToContactUs` |

---

## Config fields

| Field | Required | Description |
|---|---|---|
| `CHANNEL` | ✅ | ชื่อ brand เช่น `'BNN'`, `'STUDIO7'`, `'Studio7 Education'` |
| `CURRENCY_CODE` | ✅ | รหัสสกุลเงิน เช่น `'THB'` |
| `PRODUCT_DETAIL_ROUTE_NAME` | ✅ | Nuxt route name สำหรับหน้า product detail |

---

## dataLayer structure (v2.x)

### ecommerce events (createGtmBuilders)

```js
// ✅ GA4-standard — ecommerce{} มีแค่ standard fields
{
  event: 'purchase',
  channel: 'BNN',
  profile: { id, email, ... },        // ← top level (ไม่ใช่ใน ecommerce)
  discount: { total, couponCode, ... }, // ← top level
  payment: { slug, method, ... },      // ← top level
  ecommerce: {
    transaction_id, currency, value,
    shipping, coupon, tax, items[],    // ← GA4 standard fields เท่านั้น
  },
}
```

### custom events (createGa4Builders)

```js
// ✅ Named parameters แทน string concatenation
{
  event: 'eventTracking - Product',
  channel: 'BNN',
  eventName: 'add_to_cart_pdp',
  sku: 'ABC123',
  isPreorder: false,
  price: 12990.00,
}
// ไม่ใช่ eventCategory: 'PPABC123_AddToCart' แบบเก่า
```

---

## Migration จาก v2.0.x → v2.2.0

### analytics-plugin.js

```js
// ❌ เก่า
import { createGtmBuilders, createGa4Builders, createGaBuilders } from '@comseven/analytics-core';
inject('gaEvent', createGaBuilders(ctx));

// ✅ ใหม่ — ลบ createGaBuilders ออก
import { createGtmBuilders, createGa4Builders } from '@comseven/analytics-core';
// inject('gaEvent', ...) ลบออก หรือ merge เข้า ga4Event
```

### GTM Container (ทำใน GTM ของแต่ละ project)

1. **ลบ Universal Analytics tags** ทั้งหมด (UA ตาย July 2023)
2. **เพิ่ม GA4 Event tags** สำหรับ event groups ใหม่:
   - `eventTracking - Product` → GA4 custom event
   - `eventTracking - Cart` → GA4 custom event
   - `eventTracking - Checkout` → GA4 custom event
   - `eventTracking - Equip` → GA4 custom event
   - ฯลฯ
3. **อัปเดต GA4 variables** ที่อ่าน ecommerce:
   - `{{DLV - ecommerce.profile.id}}` → `{{DLV - profile.id}}`
   - `{{DLV - ecommerce.items.0.id}}` → `{{DLV - ecommerce.items.0.item_id}}`

---

## Project-specific extensions

| Project | Extension files | Notes |
|---|---|---|
| bnn | `braze.js` | Braze SDK events |
| ustore-ecom | `ga4-extensions.js` | clickOnSitePopup, studentCode events ฯลฯ |
| app-storefront | `ga4-extensions.js` | drawer/mini-cart custom events |

> Equip events และ bundle events ย้ายเข้ามาอยู่ใน core (`createGa4Builders`) แล้วตั้งแต่ v2.2.0

---

## การอัปเดต package

```bash
cd ~/Project/ecom-analytics-core
# แก้ไขไฟล์ + bump version ใน package.json
git add .
git commit -m "feat: ..."
git push
```

> Bump version ใน `package.json` ทุกครั้งเพื่อให้ downstream projects pin version ได้

---

## Peer dependencies

```json
{
  "big.js": ">=6.0.0",
  "dayjs": ">=1.0.0"
}
```
