# Migration Plan — stu-ecom & app-storefront → `@tickstudiu/ecom-analytics-core` v2.2.0

> **เป้าหมาย**: ลบ duplicate code ที่มีอยู่ใน project ออก และให้ import จาก core package แทน
> ทำให้ bug fix และ feature ใหม่ใน core กระจายไปถึงทุก project โดยอัตโนมัติ

---

## สถานะปัจจุบัน (อัปเดต 2026-05-27)

| | bnn-bnn.in.th | ustore-ecom | app-storefront |
|---|---|---|---|
| `@tickstudiu/ecom-analytics-core` ใน package.json | ✅ (npm link) | ✅ | ✅ |
| GTM `autoInit: false` + delay setup | ✅ | ✅ | ✅ |
| `TRACKING_DELAY_MS` env var | ✅ 5000ms | ✅ 5000ms | ✅ 5000ms |
| `analytics-plugin.client.js` (GTM setTimeout init) | ✅ | ✅ | ✅ |
| Force `$gtm?.init?.()` ใน complete.vue | ✅ | ✅ | ✅ |
| `purchase` / `purchaseItem` ย้ายไป Backend API | ✅ | ✅ | ✅ |
| `serverMiddleware/trackPurchase.js` | ✅ | ✅ | ✅ |
| `ga4-extensions.js` (project-specific events) | ✅ 6 events | ✅ 13 events | ✅ 10 events |
| `ga-extensions.js` (Drawer/MiniCart) | — | — | ✅ 16 events |
| `gtm-extensions.js` (viewLOB) | — | — | ✅ 1 event |
| `createGaBuilders` (UA deprecated) removed | ✅ | ✅ | ✅ |
| `transforms/gtm.js` duplicate resolvers (ustore) | — | ⏳ Phase 2 | — |
| `helpers/numeral.js` re-export จาก core | — | ⏳ Phase 2 | ⏳ Phase 2 |

---

## ustore-ecom — Migration Steps

### Step 1 — เพิ่ม package เข้า dependencies

```json
// package.json
"dependencies": {
  "@tickstudiu/ecom-analytics-core": "github:tickstudiu/ecom-analytics-core#v2.2.0"
}
```

ระหว่าง development ยังใช้ npm link ได้ — เปลี่ยนเป็น github: ก่อน deploy

---

### Step 2 — แทนที่ `transforms/gtm.js` ทั้งหมด

`transforms/gtm.js` มี 8 functions ที่ซ้ำกับ core ทั้งหมด:

| Function ใน transforms/gtm.js | Function ใน core |
|---|---|
| `productCategory` | `productCategory` from `@tickstudiu/ecom-analytics-core` |
| `productPrice` | `productPrice` from `@tickstudiu/ecom-analytics-core` |
| `orderDetailProductPrice` | `orderDetailProductPrice` from `@tickstudiu/ecom-analytics-core` |
| `transformUserProfile` | `transformUserProfile` from `@tickstudiu/ecom-analytics-core` |
| `transformConsents` | `transformConsents` from `@tickstudiu/ecom-analytics-core` |
| `transformProductItem` | `transformProductItem` from `@tickstudiu/ecom-analytics-core` |
| `transformBundleSetsItems` | `transformBundleSetsItems` from `@tickstudiu/ecom-analytics-core` |
| `transformPurchasePayment` | `transformPurchasePayment` from `@tickstudiu/ecom-analytics-core` |

**แก้ไข**: แทนที่ file ด้วย re-export จาก core

```js
// transforms/gtm.js — after migration
export {
  productCategory,
  productPrice,
  orderDetailProductPrice,
  transformUserProfile,
  transformConsents,
  transformProductItem,
  transformBundleSetsItems,
  transformPurchasePayment,
} from '@tickstudiu/ecom-analytics-core';
```

> ⚠️ **ตรวจสอบก่อน**: compare แต่ละ function กับ core version
> ustore อาจมี field พิเศษที่ core ไม่มี (เช่น student-specific fields)
> ถ้ามี → เก็บไว้ใน transforms/gtm.js เฉพาะ function ที่ต่างออกไป และ import ที่เหลือจาก core

---

### Step 3 — แทนที่ `helpers/numeral.js` local imports

ไฟล์หลายตัวใน ustore-ecom import `convertSatangToBahtWithDecimal` จาก `~/helpers/numeral`

```bash
# หา files ที่ใช้
grep -rl "from.*helpers/numeral" pages/ components/ store/ transforms/
```

**แก้ไข**: เปลี่ยน import ใน transforms/gtm.js และไฟล์อื่นๆ

```js
// Before
import { convertSatangToBahtWithDecimal } from '~/helpers/numeral';

// After
import { convertSatangToBahtWithDecimal } from '@tickstudiu/ecom-analytics-core';
```

> ⚠️ `helpers/numeral.js` อาจมี functions อื่นที่ไม่ได้อยู่ใน core (priceFormat, distanceFormat ฯลฯ)
> เก็บไว้ใน local file เฉพาะ functions ที่ core ไม่มี

---

### Step 4 — ตรวจสอบ `helpers/route.js`

`helpers/route.js` ใช้ `PRODUCT_REFERRER_SLUG` จาก core อยู่แล้ว ✅
แต่มี route functions เฉพาะ ustore (เช่น `getProductListCategoryRouteObject`) → เก็บไว้ local

---

### Step 5 — run tests

```bash
npm test
# ตรวจ ustore-ecom existing tests
# test/unit/plugins/analytics/resolvers/customer.spec.js
```

---

## app-storefront — Migration Steps

### Step 1 — เพิ่ม package เข้า dependencies

```json
// package.json
"dependencies": {
  "@tickstudiu/ecom-analytics-core": "github:tickstudiu/ecom-analytics-core#v2.2.0"
}
```

---

### Step 2 — แทนที่ `helpers/numeral.js` ที่ซ้ำกับ core

```bash
# หา files ที่ import numeral
grep -rl "from.*helpers/numeral" pages/ components/ store/ plugins/
```

functions ใน `app-storefront/helpers/numeral.js` ที่มีใน core (สามารถ import จาก core ได้):
- `convertSatangToBaht` ✅
- `convertSatangToBahtWithDecimal` ✅
- `convertBahtToSatang` ✅
- `priceFormat` ✅
- `priceBathFormat` ✅
- `discountedPriceFormat` ✅
- `numberFormat` ✅
- `positiveOnly` ✅
- `distanceFormat` ✅

**แก้ไข**: เปลี่ยน `helpers/numeral.js` เป็น re-export จาก core + เพิ่ม functions พิเศษของ app-storefront

```js
// app-storefront/helpers/numeral.js — after migration
export {
  convertSatangToBaht,
  convertSatangToBahtWithDecimal,
  convertBahtToSatang,
  priceFormat,
  priceBathFormat,
  discountedPriceFormat,
  numberFormat,
  positiveOnly,
  distanceFormat,
} from '@tickstudiu/ecom-analytics-core';

// app-storefront-specific functions ที่ไม่ได้อยู่ใน core
export { formatToE164 } from '@tickstudiu/ecom-analytics-core'; // หรือ local ถ้า version ต่างกัน
// ... functions อื่นๆ ที่ app-specific
```

> ✅ ข้อดีคือ call-site ทั้งหมดที่ import จาก `~/helpers/numeral` ไม่ต้องเปลี่ยน

---

### Step 3 — ตรวจสอบ `plugins/analytics/resolvers/`

| File | Action |
|---|---|
| `resolvers/equip.js` | เก็บไว้ local — เป็น equip-specific transform ที่ไม่ได้อยู่ใน core |
| `resolvers/braze.js` | เก็บไว้ local — Braze SDK integration |
| `resolvers/brazeContent.js` | เก็บไว้ local |

---

### Step 4 — ตรวจสอบ `transforms/` ถ้ามี

```bash
find /sessions/.../app-storefront/transforms -name "*.js" 2>/dev/null
```

ถ้ามี transform functions ที่ซ้ำกับ core → replace ด้วย import จาก core เช่นเดียวกับ ustore-ecom

---

## ✅ GTM Delayed Loading (Completed 2026-05-26)

### ทำไมต้อง delay?

GTM load หลายๆ 3rd-party scripts (GA4, Meta Pixel, Criteo ฯลฯ) ซึ่งกระทบ Core Web Vitals โดยตรง การ delay 5 วินาทีทำให้ LCP / FID ดีขึ้นอย่างชัดเจน โดยไม่กระทบ business tracking เพราะ:

- Events ที่ push เข้า `window.dataLayer[]` ก่อน GTM โหลด **จะถูก replay** เมื่อ GTM init
- ยกเว้นหน้า `complete.vue` ที่ force init ทันที เพราะต้องยิง tags ก่อน user ออกจากหน้า

### การ implement

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `nuxt.config.js` | `autoInit: false`, `pageTracking: false`, เพิ่ม `TRACKING_DELAY_MS` ใน env |
| `plugins/analytics-plugin.client.js` | `setTimeout(() => $gtm?.init?.(), TRACKING_DELAY_MS)` |
| `pages/checkout/complete.vue` | `this.$gtm?.init?.()` ใน `mounted()` |
| `.env.example` | `TRACKING_DELAY_MS=5000` |

### ✅ purchase / purchaseItem → Backend API

เพื่อให้ purchase tracking ไม่หาย ย้าย `$dataLayer.purchase()` ไปยิงผ่าน server:

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `serverMiddleware/trackPurchase.js` | รับ order data → ยิง GA4 Measurement Protocol |
| `nuxt.config.js` | register serverMiddleware |
| `pages/checkout/complete.vue` | เปลี่ยนจาก `$dataLayer.purchase()` → `fetch('/api/track-purchase', ...)` ด้วย `sendBeacon` |
| `ecom-analytics-core/gtm.js` | `purchase()` + `purchaseItem()` ยังอยู่แต่ mark deprecated |

---

## Production Install — ทั้ง 2 Projects

ปัจจุบันทั้ง 3 projects ใช้ `npm link` ซึ่งใช้ได้เฉพาะ local dev เท่านั้น
ก่อน deploy production ต้องเปลี่ยน:

**Option A — GitHub package (แนะนำสำหรับ private repo)**
```json
"@tickstudiu/ecom-analytics-core": "github:tickstudiu/ecom-analytics-core#v2.2.0"
```

**Option B — GitHub npm registry**
```json
"@tickstudiu/ecom-analytics-core": "^2.2.0"
```
```bash
# .npmrc
@tickstudiu:registry=https://npm.pkg.github.com
```

**Option C — Publish ขึ้น npm (public)**
```bash
npm publish --access public
```

---

## Priority & Order

```
Phase 1 — ✅ DONE (2026-05-26/27):
  [✅] เพิ่ม package ใน package.json ustore + app
  [✅] GTM delayed loading setup ทั้ง 3 projects (TRACKING_DELAY_MS=5000)
  [✅] nuxt.config.js: autoInit: false, pageTracking: false
  [✅] analytics-plugin.client.js: setTimeout($gtm.init, TRACKING_DELAY_MS)
  [✅] complete.vue: force $gtm?.init?.() ทันที + ลบ purchase/purchaseItem frontend
  [✅] ส่ง GA4 purchase payload spec ให้ Backend API team (deprecated purchase()/purchaseItem())
  [✅] bnn: สร้าง ga4-extensions.js (6 events)
  [✅] สร้าง gtm-events-spec.xlsx (docs/) ครบ ~200+ events
  [✅] createGaBuilders (UA) removed ทั้ง 3 projects

Phase 2 — ✅ DONE (2026-05-27):
  [✅] ustore-ecom: แทนที่ transforms/gtm.js ด้วย re-export จาก core
  [✅] ustore-ecom: test existing tests ผ่าน
  [✅] ustore-ecom: เปลี่ยน numeral imports
  [✅] app-storefront: เปลี่ยน helpers/numeral.js เป็น re-export

Phase 3 (pre-deploy):
  [ ] เปลี่ยน npm link → github: reference สำหรับ bnn (ustore+app ทำแล้ว)
  [ ] ตั้ง semver tag ใน ecom-analytics-core repo
  [ ] GTM container migration — อัปเดต GTM workspace ให้ตรงกับ event ที่ code ยิงจริง
      ใช้ /gtm-container-migrator skill ใน Cowork ช่วยทำได้:
      - scan events จาก codebase → เทียบกับ tags/triggers ใน GTM container JSON
      - ลบ tags ที่ obsolete (UA type, events ที่ไม่มีแล้ว)
      - fix triggers ที่ยังชี้ไปที่ event name แบบเก่า
      - สร้าง clean container JSON พร้อม import เข้า GTM staging
```

---

## Risk & Notes

- **ustore-ecom transforms/gtm.js อาจมี field พิเศษ** — compare ทีละ function ก่อน replace
- **helpers/numeral.js local** — app-storefront อาจมี version ที่ต่างจาก core เล็กน้อย (เช่น `formatToE164` ที่มีใน core ด้วย) → ตรวจก่อน
- **npm link ยังใช้ได้ระหว่าง develop** — ไม่ต้องรีบเปลี่ยน production install จนกว่าจะ stable
- **ต้องมี semver tag ก่อน** `github:tickstudiu/ecom-analytics-core#v2.2.0` ถึงจะ pin version ได้
