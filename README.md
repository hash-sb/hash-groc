# HashGroc - Smart Family Shopping App 🛒

A multi-store shopping web application designed for families to collaboratively manage grocery lists, track prices across different shops, organize items by aisle location per store, and compare prices during shopping trips.

---

## 🌟 Key Features

### 1. Two Dedicated Modes
- **➕ Add Mode (List & Catalog Manager)**:
  - Add items with quantities, units, categories, and shopping notes.
  - Quick **1-tap toggle** to move items between your active shopping list and full catalog.
  - Per-store availability matrix: explicitly **include or exclude** stores that carry or do not carry each item.
  - Track **prices across multiple shops** (e.g. Costco, Trader Joe's, Aldi, Target).
  - Note the **aisle / section location** for each store individually (e.g. *Walk-in Dairy Cooler* at Costco vs *Aisle 1 - Dairy* at Aldi).
  - Search, filter by store availability, and filter by category.
  - **Store Manager**: Add custom stores, edit color labels, and customize store aisle sequences.

- **🛒 Shopping Mode (In-Store Runner)**:
  - **Store Switcher**: Pick which store you are currently shopping at.
  - **Store-Specific Location Categorization**: Items automatically group under aisle categories based on their location *in that particular store*. When you switch stores, the layout dynamically rearranges!
  - **Cheaper in Other Shops Alerts**: Highlights items that are cheaper at another store with dollar savings (e.g., `💡 $1.20 cheaper at Aldi ($2.79 vs $3.99)`).
  - **Running Total Cost**:
    - **In-Cart Total**: Real-time sum of items picked into the cart.
    - **Remaining Total**: Estimated cost of items still left to pick.
    - **Trip Total**: Full expected cost.
  - **1-Tap Cart Checkoff**: Checked items strike through and collapse into an *In Cart* section.
  - **In-Store Shelf Price Update**: Tap any price directly in the aisle to update it on the fly if store prices have changed.
  - **Excluded Items Alert**: Clearly lists items on your shopping list that are **not carried** at your current store so you know what will need to be purchased elsewhere.
  - **Checkout Celebration & Trip Summary**: Confetti celebration with a breakdown of amount spent and estimated savings.

### 2. Seamless Family Sharing & Google Auth
- **Google Account Login**: 1-click Google Sign-In with Firebase Authentication.
- **Shared Household Codes**: Any family member logs in with their Google account and enters/clicks the 6-character family invite code or link (`?join=CODE`) to join and sync in real time.
- **Instant Local / Demo Fallback**: Works 100% offline and in demo mode immediately out of the box using reactive LocalStorage, with multi-tab sync, so you can test and use it before configuring Firebase.

---

## 🚀 Getting Started

### 1. Run Locally
```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 2. Firebase Cloud Sync (Optional)
To enable real-time multi-device cloud synchronization with your family:
1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** -> Sign-in method -> **Google**.
3. Enable **Firestore Database** and publish the provided `firestore.rules`.
4. In Project Settings -> Web App, copy your config.
5. In HashGroc, click the **Cloud/Local** button in the header and paste the config directly! (Or add to `.env`).

---

## 🛠️ Tech Stack
- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Auth & Database**: Firebase Auth (Google Provider) + Cloud Firestore
- **State & Sync**: Custom React Context with real-time Firestore listeners & LocalStorage fallback
- **VFX**: Canvas Confetti
