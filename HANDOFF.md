# HashGroc — Agent Handoff & Architecture Guide

**Last Updated**: November 18, 2026  
**Live Deployment**: `https://hash-groc.vercel.app` (Auto-deploys from `origin/main`)  
**Repository Path**: `c:\Users\Amin Alhashim\Documents\GitHub\hash-sb\hash-groc`  
**Latest Commit on `main`**: `9d8f34d`

---

## 1. Project Overview
**HashGroc** is an offline-first, mobile-ergonomic household grocery shopping, multi-store price optimization, and trip runner progressive web app (PWA) built with:
- **React 19 + TypeScript + Vite 8 + Tailwind CSS v4**
- **Local-First Persistence (`localStorage`) + Optional Firebase Auth & Firestore Household Sync**
- **Gemini 1.5 Flash Vision OCR** (via Vercel Serverless Function `/api/scan-receipt` with client BYOK fallback)
- **HTML5 QR/Barcode Scanner (`html5-qrcode`)** with OpenFoodFacts lookup and multi-barcode linking

---

## 2. Core UX & Design Conventions (Must Be Preserved)
1. **No Native Browser Dialogs or Native Keypads for Prices/Quantities**:
   - **Never** use `window.confirm` or `window.alert`. Always use the global themed hook `useConfirmDialog()` (`confirm(...)` / `showAlert(...)`) from [`src/components/ConfirmDialogModal.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/components/ConfirmDialogModal.tsx) (`z-[80]`).
   - All numeric price, quantity, and package size edits use the custom calculator modal [`src/components/KeypadCalculatorModal.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/components/KeypadCalculatorModal.tsx) (`z-[70]`).
2. **Modal Viewport Stability & Scroll Locking**:
   - Every modal must call `useBodyScrollLock(isOpen)` from [`src/utils/scrollLock.ts`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/utils/scrollLock.ts) so background lists never scroll on iOS/Android.
   - Dynamic/filterable/tabbed modals (`WeeklyManagerModal`, `ShopManagerModal`, `BackupModal`, `ReceiptScannerModal`, and `ShoppingModeView`'s Quick Add modal) use **fixed heights** (`h-[calc(100dvh-1.5rem)] sm:h-[85dvh] max-h-[760px] my-auto`) so filtering items or switching tabs **never causes the modal header or search bar to jump vertically**.
   - Z-Index Hierarchy:
     - Sticky headers / bottom summary bars: `z-20` / `z-30`
     - Floating Undo / Feedback toasts: `z-40` / `z-50`
     - Primary Modals & Drawers: `z-[60]`
     - Nested Sub-Modals (`KeypadCalculatorModal`, Aisle Picker): `z-[70]`
     - Global Confirm / Alert Dialog (`ConfirmDialogModal`): `z-[80]`
3. **Unified Icon Semantics**:
   - `<Repeat />` (`teal-600`): Strictly for **Weekly Staples** (recurring weekly items).
   - `<Sparkles />` (`emerald-600` / `amber-400`): Strictly for **Groc Plus**, **Best Price / Lowest Unit Price**, and **AI OCR**.
   - `<ShoppingCart />` / `<CheckSquare />`: Strictly for **Buy List** and **In-Store Shopping Cart** actions.
4. **In-Store Item Row Ergonomics (`ShoppingModeView.tsx`)**:
   - Left zone: Single tap checks/unchecks item in cart (`inCart`).
   - Subtitle row (`[Qty] × [Package Size ▾]`):
     - Clicking the **Quantity chip (`[1]`, `[2]`)** opens the Quick Quantity Keypad (`quickQuantityItem`).
     - Clicking the **Package Size chip (`[16 oz ▾]`)** opens the **Choose Alternative Price / Size** bottom sheet (`sizePickerItem`) when multiple options exist at that store, or opens the Item Editor for single-size items.
   - Right zone: Clicking the **Price (`$4.99`)** opens `ItemEditorModal` focused directly on the **currently selected alternative price** (`activeOpt.id`).

---

## 3. Recently Completed Milestones
- **`6f674d9` & `ab9d425` & `d9449cd` (`UpgradeModal.tsx`)**:
  - Replaced native confirm dialog on subscription cancellation with an inline themed confirmation card.
  - Added an exciting celebratory **"You're on Groc Plus!"** screen on trial activation with confetti accents, multi-pulse haptic feedback, 4 color-coded *"Unlocked Superpowers"* cards, and a `$0.00 Charged Today` timeline.
- **`ca1f993` & `d88844e` & `7890b7f` (Global Modal & Scroll Polish)**:
  - Added reference-counted `useBodyScrollLock` across all 13 modals.
  - Hoisted *List Settings & Actions* out of the sticky header in `AddModeView.tsx` so it renders above the list at `z-[60]`.
  - Created `ConfirmDialogModal.tsx` and replaced all 20 native `confirm()` / `alert()` calls across the app.
- **`10f82d3` & `d42f87a` (Weekly Manager & App-Wide 8-Pillar UX Audit)**:
  - Fixed vertical jumping on filtering in `WeeklyManagerModal.tsx` and unified `<Repeat />` toggle pills and `<ShoppingCart /> Add to Buy List` actions.
  - Upgraded `Navbar.tsx` to a 1-tap 3-mode segmented switcher (`List` • `Shop` • `Prices`).
  - Added a floating **Undo** toast in `AddModeView.tsx` when removing an item from the Buy list.
  - Wired store-specific `+ Add price` cells in `AnalysisModeView.tsx` to open `ItemEditorModal` pre-selected on that exact store.
- **`f652791` & `63d0178` (Multi-Option Alternative Price Selection)**:
  - Updated `compareShopPrices` and `isCheapestAtStore` in `src/utils/pricing.ts` to use `optResult.selectedOption` (falling back to `bestOption`), so picking a non-lowest alternative price at a store immediately recalculates cross-store best deals and Save Mode routing.
  - Made the quantity number (`[1]`), alternative package size (`[16 oz ▾]`), and price (`$4.99`) independently clickable on every row in `ShoppingModeView.tsx`.
- **`9d8f34d` (Production Launch Hardening)**:
  - Added Vercel Serverless Function [`api/scan-receipt.js`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/api/scan-receipt.js) to protect `GEMINI_API_KEY` on the server.
  - Added [`src/components/ErrorBoundary.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/components/ErrorBoundary.tsx) with 1-click Emergency JSON Backup export.
  - Added [`firestore.rules`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/firestore.rules) for authenticated household security.
  - Added **Send Feedback / Report Issue** and **Privacy & Data Security** to [`src/components/MenuDrawer.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/components/MenuDrawer.tsx).

---

## 4. Key Files Map
| File | Responsibility |
| :--- | :--- |
| [`src/App.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/App.tsx) | Root providers (`ErrorBoundary`, `AuthProvider`, `ShoppingProvider`, `ConfirmDialogProvider`) & top-level modal state |
| [`src/context/ShoppingContext.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/context/ShoppingContext.tsx) | Central state for `items`, `shops`, `household`, `receipts`, `localStorage` persistence, and Firestore real-time listeners |
| [`src/utils/pricing.ts`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/utils/pricing.ts) | Unit normalization (`oz`/`lb`, `fl oz`/`gal`, `ct`/`dozen`), `getOptimalStorePackage`, `compareShopPrices`, `isCheapestAtStore` |
| [`src/components/Navbar.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/components/Navbar.tsx) | Sticky top bar with 1-tap mode switcher (`List` • `Shop` • `Prices`), offline badge, and Menu trigger |
| [`src/components/AddModeView.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/components/AddModeView.tsx) | List mode: unified search/quick-add bar, `All / Buy / Weekly` tabs, category groups, Undo toast, and List Settings modal |
| [`src/components/ShoppingModeView.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/components/ShoppingModeView.tsx) | In-store runner: store switcher, Save Mode vs Single Store, aisle grouping, shelf reorder mode, alternative size picker, trip checkout |
| [`src/components/ItemEditorModal.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/components/ItemEditorModal.tsx) | Item & multi-store price/size/aisle editor with multi-option (`packageOptions`) support and barcode linking |
| [`src/components/AnalysisModeView.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/components/AnalysisModeView.tsx) | Side-by-side Store Price Matrix and `SpendingHistoryView` (KPIs, monthly chart, itemized trip receipts) |
| [`src/components/WeeklyManagerModal.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/components/WeeklyManagerModal.tsx) | Rapid 1-tap checklist to designate recurring weekly staples and push them to the active Buy list |
| [`src/components/UpgradeModal.tsx`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/src/components/UpgradeModal.tsx) | Groc Plus paywall, celebratory 14-day trial activation screen, and subscription management / cancellation |
| [`api/scan-receipt.js`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/api/scan-receipt.js) | Vercel Serverless proxy for Gemini 1.5 Flash receipt OCR |

---

## 5. Potential Next Steps for Future Sessions
1. **Vercel & Firebase Dashboard Wiring**:
   - Add `GEMINI_API_KEY` in Vercel project settings → Environment Variables so `/api/scan-receipt` works out-of-the-box for all users.
   - Publish [`firestore.rules`](file:///c:/Users/Amin%20Alhashim/Documents/GitHub/hash-sb/hash-groc/firestore.rules) in Firebase Console when live cloud sync is enabled.
2. **Stripe Checkout Integration (When Ready to Monetize Groc Plus)**:
   - Connect `UpgradeModal.tsx`'s `handleStartTrial` to a Stripe Checkout session endpoint (`/api/create-checkout-session`) and webhook (`/api/stripe-webhook`) to update `household.subscriptionStatus` in Firestore.
3. **Code Splitting / Bundle Size Optimization**:
   - Dynamically import `html5-qrcode` (`BarcodeScannerModal`) and `AnalysisModeView` via `React.lazy` to reduce initial JS bundle size.
