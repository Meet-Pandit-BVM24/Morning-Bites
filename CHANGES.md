# Morning Bites — Change Log
**Date:** 23 April 2026  
**Session:** Bug Fixes, Enhancements & Multi-Package Feature

---

## Files Modified

| File | Type of Change |
|------|---------------|
| `src/lib/supabase.ts` | New interfaces & utility functions |
| `src/lib/store.tsx` | Added `customerPackages` to global state |
| `src/pages/billing.tsx` | Bug fix — scroll + IST date |
| `src/pages/bill-reports.tsx` | Bug fix — Edit Bill UI |
| `src/pages/menu.tsx` | Bug fix — price input |
| `src/pages/sub-reports.tsx` | Full rewrite — simplified stats |
| `src/pages/sub-dashboard.tsx` | Bug fix — weekly counts |
| `src/pages/packages.tsx` | Full rewrite — edit + toggle + meals count |
| `src/pages/subscribed.tsx` | Full rewrite — multi-pack + all fixes |
| `src/pages/walkins.tsx` | Enhanced — multi-pack subscribe + templates |

---

## 1. `src/lib/supabase.ts`

### Added
- `getISTISODate()` — returns current date in IST as `YYYY-MM-DD` (used everywhere dates are stored)
- `getISTDateDisplay()` — returns current date in IST as `DD/MM/YYYY` (used for `bill_date`)
- `formatISTDate(isoDate)` — formats a `YYYY-MM-DD` string to `D/M/YYYY` for WhatsApp messages
- `dbUpdWhere(table, filter, data)` — PATCH with a custom filter (used to bulk-reset skips on renewal)
- `CustomerPackage` interface — new type for the `customer_packages` table
- `meals_count: number` field added to `Package` interface

---

## 2. `src/lib/store.tsx`

### Added
- `customerPackages: CustomerPackage[]` to `StoreState` type
- `customerPackages` state loaded from `customer_packages` Supabase table in `loadData` (gracefully skipped if table doesn't exist yet)
- `customerPackages` exposed via `StoreProvider`

---

## 3. `src/pages/billing.tsx`

### Bug Fixes
- **Bug #8 — Scroll to top after generating bill:** Added `window.scrollTo({ top: 0, behavior: 'smooth' })` after successful bill generation
- **Bug #4 — IST date:** `bill_date` now stored using `getISTDateDisplay()` instead of `new Date().toLocaleDateString('en-IN')` to guarantee IST timezone

---

## 4. `src/pages/bill-reports.tsx`

### Bug Fixes
- **Bug #2 — Edit Bill UI:** Completely rewrote the "Add Items" section inside the Edit Bill dialog. Items are now grouped by menu item name with a header row, and each option shows +/− quantity controls — identical layout to the main Billing screen. Previously items rendered as a flat clickable list which looked repetitive and confusing.
- Fixed `handleEditQtyChange` to handle `idx = -1` (item not yet in bill) gracefully

---

## 5. `src/pages/menu.tsx`

### Bug Fixes
- **Bug #3 — Price input can't clear zero:** Changed `options` state from `{ name: string; price: number }[]` to `{ name: string; price: string }[]`. The price field is now a free-text number input; conversion to `Number` happens only at save time. This lets the user clear the default `0` and type any amount without the `010` issue.
- Updated `handleOpenNew`, `handleOpenEdit`, "Add option" button, and the `handleSave` payload to match the string-based state

---

## 6. `src/pages/sub-reports.tsx`

### Rewrite
- **Bug #7 — Page simplified:** Removed revenue section, payment-mode breakdown, Renewal Alerts list, New Customers list, and Cancelled list
- Now shows **only** the 6 requested stat cards:
  1. Packages Available (count of active packages)
  2. Total Subscribed (active customers)
  3. Newly Subscribed (`renew_count === 0`)
  4. Active Packs (`used < total`)
  5. Renewed Customers (`renew_count > 0`)
  6. Meals Served (sum of all `used`, uses `customerPackages` if available)

---

## 7. `src/pages/sub-dashboard.tsx`

### Bug Fixes
- **Enhancement #3 — Weekly Overview counts exclude skips:** Added `getISOForDayIndex()` helper to get the IST ISO date for each weekday column. Each day's count now filters out customers who have an active (non-unskipped) skip for that specific date.
- The day-detail dialog (opened by tapping a day cell) also now excludes skipped customers for that day.

---

## 8. `src/pages/packages.tsx`

### Full Rewrite
- **Enhancement #5 — Number of Meals field:** New "Number of Meals" input (alongside Name, Price, Description) stored as `meals_count` column
- **Enhancement #5 — Edit Package:** Each package card now has an Edit (pencil) button that opens the form pre-filled; saves via `dbUpd`
- **Enhancement #6 — Active/Inactive toggle:** All packages (active and inactive) are shown. Each card has a labelled Switch to toggle `is_active`. Inactive packages are shown with reduced opacity. Deactivating prompts a confirmation warning that existing subscriptions are not affected.
- Removed the old "Remove" (trash) button — replaced by the toggle

---

## 9. `src/pages/subscribed.tsx`

### Full Rewrite — Major Changes

#### Bug Fixes
- **Bug #5 — Cancel icon:** Cancel subscription button now uses `XCircle` icon; Delete customer keeps `Trash2`. They are visually distinct.
- **Bug #6 — Notify icon-only:** Notify button is now `w-10 h-10` icon-only (no "Notify" text), consistent with other action buttons

#### Enhancement #1 — Unskip a Date
- Tapping an **orange (skipped) day** in the schedule grid now calls `handleUnskip()` which sets `unskipped = true` on that `meal_skips` record
- A small hint label appears below the grid when skips exist: *"Tap orange day to remove skip"*
- Previously tapping any day always toggled preferred days; now the behaviour forks: orange day → unskip, blue/grey day → toggle preferred day

#### Enhancement #2 — Skip Reset on Renewal
- `handleRenew` now calls `dbUpdWhere('meal_skips', 'customer_id=eq.X&skip_date=gte.TODAY&unskipped=eq.false', { unskipped: true })` after renewing
- All future skips for that customer are cleared automatically when the pack renews (works from both the Renew button on Subscribed and from Walk-ins)

#### New Feature — Multiple Packages per Customer
- `getCustPacks(customerId)` — helper that returns all non-cancelled `customer_packages` rows for a customer, sorted newest-first
- `getSelectedCp(customer)` — returns the currently-selected `CustomerPackage` for that card (tracked in `selectedCpId` state: `Record<number, number>`)
- `getDisplayData(customer)` — returns `{ cp, used, total, packageId }` from the selected package; falls back to `customers.used/total` when no `customer_packages` rows exist (backward compatibility before migration)
- **Package label / dropdown (top-right of card):**
  - Single package → small pill label showing package name
  - Multiple packages → `<Select>` dropdown listing all active packs with meals remaining
- **Multi-pack badge:** "2 packs" badge shown in the badge row when customer has more than one package
- **Mark Used / Undo** operate on the selected `customer_packages` row (also keep `customers.used` in sync for backward compat)
- **Renew** resets the selected `customer_packages` row (`used = 0`, `renew_count++`, new `pack_start_date`)
- **Cancel** sets `status = 'cancelled'` on the selected package; only marks the `customers` row as cancelled if no other active packages remain
- **"Add Another Package"** button inside the Edit modal — opens a full "Add Package" payment dialog (package select, payment mode, cash change calc, QR for scan pay) that creates a new `customer_packages` record without touching the existing pack

#### WhatsApp Templates — All Updated
- **Meal Update** (after Mark Used / Notify → Meal): uses `buildMealUpdateMsg()` matching provided template
- **Renew Pack** (Notify → Low): uses `buildRenewPackMsg()` with price and count
- **Pack Done** (Notify → Done): uses `buildPackDoneMsg()` with total and price
- **Active Subscription** (Add subscriber / Renew): uses `buildActiveSubMsg()` with package name, meals, price, IST start date — matches provided template exactly

---

## 10. `src/pages/walkins.tsx`

### Enhanced
- `handleSaveWalkin` — welcome message updated to include timing and phone number
- `handleSubscribe` — now uses `buildActiveSubMsg`-style message with IST date, meals count, package name. Also creates a `customer_packages` record after saving the customer
- Package selector in Subscribe modal now shows `meals_count` alongside name and price
- `getISTISODate()` used instead of `new Date().toISOString().split('T')[0]` for stored dates

---

## Database Migration Required

**Run the following SQL in your Supabase SQL Editor** before multi-package features are active. The app works without it (falls back to single-package mode), but new package assignments won't be tracked per-package until the migration runs.

```sql
-- 1. Add meals_count to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS meals_count integer DEFAULT 10;

-- 2. Create customer_packages table
CREATE TABLE IF NOT EXISTS customer_packages (
  id bigserial primary key,
  customer_id bigint not null,
  package_id bigint not null,
  used integer not null default 0,
  total integer not null default 10,
  pack_start_date date not null default current_date,
  payment_mode text not null default 'cash',
  status text not null default 'active',
  renew_count integer not null default 0,
  last_renewed date,
  created_at timestamptz default now()
);

-- 3. Migrate existing customer data into customer_packages
INSERT INTO customer_packages (
  customer_id, package_id, used, total,
  pack_start_date, payment_mode, status,
  renew_count, last_renewed, created_at
)
SELECT
  id,
  package_id,
  used,
  total,
  pack_start_date::date,
  payment_mode,
  CASE WHEN status = 'active' THEN 'active' ELSE 'cancelled' END,
  renew_count,
  CASE WHEN last_renewed IS NOT NULL THEN last_renewed::date ELSE NULL END,
  created_at
FROM customers
WHERE package_id IS NOT NULL AND NOT is_deleted
ON CONFLICT DO NOTHING;
```

---

## Not Implemented This Session

| Item | Reason |
|------|--------|
| Enhancement #4 — AI Promotion Generator | Requires Anthropic/OpenAI API integration; separate task |
| Enhancement #7 — Menu duplicate cleanup | Requires knowing exact DB records to merge (Thepla variants, Sev Paratha/Sev Pratha); do via Menu > Edit |
| Promotions — image attachment | Requires file upload storage setup (Supabase Storage) |
