# @comseven/analytics-core

Shared GTM / GA4 / GA analytics builders สำหรับ Nuxt 2 projects ในกลุ่ม comseven (bnn, ustore, app-storefront)

---

## ปัญหาที่แก้

3 project มี `plugins/analytics/` โครงสร้างเหมือนกันแต่ drift ห่างออกจากกันเรื่อยๆ เพราะแก้คนละที่คนละเวลา package นี้รวม core analytics logic ไว้ที่เดียว แก้ที่นี่แล้ว apply ได้ทุก project

---

## Install

```bash
# ใช้ npm link สำหรับ local dev
npm link @comseven/analytics-core

# production
npm install github:tickstudiu/ecom-analytics-core
```

---

## โครงสร้าง package

```
analytics-core/
├── index.js          ← main entry (re-exports ทั้งหมด)
├── gtm.js            ← createGtmBuilders
├── ga4.js            ← createGa4Builders
├── ga.js             ← createGaBuilders
├── enums/            ← shared constants
├── helpers/          ← date, numeral, ga, route
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
import { createGtmBuilders, createGa4Builders, createGaBuilders } from '@comseven/analytics-core';
import config from './analytics/config';

export default ({ $gtm, $cookies }, inject) => {
  const dataLayerPush = $gtm?.push ?? (() => {});
  const ctx = { config, dataLayerPush };

  inject('dataLayer', createGtmBuilders(ctx));
  inject('ga4Event', createGa4Builders({ ...ctx, $cookies }));
  inject('gaEvent', createGaBuilders(ctx));
};
```

### 4. Project-specific events → extension file

Event ที่มีเฉพาะ project ให้แยกไว้ใน `plugins/analytics/ga4-extensions.js` แล้ว merge เข้า inject:

```js
// plugins/analytics/ga4-extensions.js
export const createGa4Extensions = ({ config, dataLayerPush }) => ({
  async clickOnSitePopup(payload) {
    dataLayerPush({
      event: 'eventTracking',
      channel: config.CHANNEL,
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

GTM/UA events สำหรับ ecommerce ทุก event push เข้า `window.dataLayer`

| Event | Description |
|---|---|
| `register(profile, provider)` | สมัครสมาชิก |
| `login({ profile }, { cookieConsents }, cid)` | เข้าสู่ระบบ |
| `logout({ profile }, { cookieConsents }, cid)` | ออกจากระบบ |
| `updateProfile(profile)` | อัปเดตโปรไฟล์ |
| `productClick(product, position, referrer)` | คลิก product |
| `viewCart(products, step)` | ดูตะกร้า |
| `addToCart(products, referrer, a2cType)` | เพิ่มลงตะกร้า |
| `removeFromCart(products)` | ลบออกจากตะกร้า |
| `checkout(products, step, profile)` | checkout |
| `purchase(orderDetail, profile)` | สั่งซื้อสำเร็จ |
| `purchaseItem(productItem, orderId, profile)` | สั่งซื้อรายชิ้น |
| `productImpression(productList, app, referrer)` | เห็น product list |
| `productDetailImpression(product, url, referrer)` | เห็นหน้า product detail |
| `search(keyword)` | ค้นหา |

### `createGa4Builders({ config, dataLayerPush, $cookies })`

GA4 event tracking ครอบคลุม 50+ events ตั้งแต่ promotionBanner ไปจนถึง coupon, wishlist, store

### `createGaBuilders({ dataLayerPush })`

UA/GA classic events ใช้ `gaWrapper` pattern ส่ง `eventCategory / eventAction / eventLabel / eventValue`

---

## Config fields

| Field | Required | Description |
|---|---|---|
| `CHANNEL` | ✅ | ชื่อ brand เช่น `'BNN'`, `'STUDIO7'`, `'Studio7 Education'` |
| `CURRENCY_CODE` | ✅ | รหัสสกุลเงิน เช่น `'THB'` |
| `PRODUCT_DETAIL_ROUTE_NAME` | ✅ | Nuxt route name สำหรับหน้า product detail เช่น `'products-productDetail'` |

---

## Project-specific extensions

| Project | Extension files | Notes |
|---|---|---|
| bnn | `braze.js`, `resolvers/equip.js` | Braze SDK + equip bundle events |
| ustore-ecom | `ga4-extensions.js` | clickOnSitePopup, clickOnSiteStrip, studentCode events ฯลฯ |
| app-storefront | `ga4-extensions.js`, `ga-extensions.js` | equip events, drawer/mini-cart GA events |

---

## การอัปเดต package

เมื่อแก้ไข core events หรือเพิ่ม event ใหม่ที่ทุก project ควรมี:

```bash
cd ~/Project/ecom-analytics-core
# แก้ไขไฟล์
git add .
git commit -m "feat: add <event-name> to gtm core"
git push
```

> **Versioning:** bump version ใน `package.json` ทุกครั้งที่ push เพื่อให้ project สามารถ pin version ได้

---

## What's NOT in this package

ไฟล์เหล่านี้ยังอยู่ใน project แต่ละตัวเพราะเป็น project-specific:

- `plugins/analytics/config.js` — CHANNEL / route name ของแต่ละ brand
- `plugins/analytics/braze.js` + resolvers — Braze SDK (bnn, app-storefront เท่านั้น)
- `plugins/analytics/resolvers/equip.js` — Equip bundle logic (bnn, app-storefront เท่านั้น)
- `plugins/analytics/ga4-extensions.js` — project-specific GA4 events
- `plugins/analytics/ga-extensions.js` — project-specific GA events (app-storefront)

---

## Peer dependencies

```json
{
  "big.js": ">=6.0.0",
  "dayjs": ">=1.0.0"
}
```

ทั้งสอง library ควรมีอยู่แล้วใน Nuxt project ไม่ต้อง install เพิ่ม
