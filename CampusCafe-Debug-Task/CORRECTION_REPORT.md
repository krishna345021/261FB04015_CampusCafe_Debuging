# CampusCafe — Step-by-Step Correction Report

All bugs were found by reading every file in the project and cross-checking paths, element IDs,
storage keys and data types between files. After fixing, the result was verified with an automated
browser-DOM test (32 checks, all passing).

---

## How to run in VS Code

1. Open VS Code → **File → Open Folder…** → select `CampusCafe-Debug-Task`.
2. Install the **Live Server** extension (VS Code will offer it automatically from `.vscode/extensions.json`).
3. Right-click `index.html` → **Open with Live Server** (or click **Go Live** in the status bar).
4. Browser opens at `http://127.0.0.1:5500/` — no build step or `npm install` is needed.

> Double-clicking `index.html` also works, but Live Server is recommended because the cart is shared
> between the two pages via `localStorage`, which behaves most reliably over `http://`.

### Final folder structure
```
CampusCafe-Debug-Task/
├── index.html
├── pages/checkout.html
├── scripts/  menuData.js · app.js · checkout.js
├── styles/   main.css · theme.css
├── assets/   bg-pattern.svg · icons/ (coffee, sandwich, muffin, juice .svg)
├── .vscode/  extensions.json · settings.json
├── README.md
└── CORRECTION_REPORT.md
```

---

## PART 1 — Folder structure, resource links & existing bugs

### Step 1 — Broken CSS links in `index.html`
| | |
|---|---|
| **Symptom** | Page appears completely unstyled. |
| **Cause** | `href="css/main.css"` — no `css/` folder exists. `href="styles/them.css"` — typo. |
| **Fix** | `styles/main.css` and `styles/theme.css`. |

### Step 2 — Broken script paths and wrong load order in `index.html`
| | |
|---|---|
| **Symptom** | Console error `MENU_ITEMS is not defined`; menu never renders. |
| **Cause** | (a) `js/menuData.js` — folder is actually `scripts/`. (b) `app.js` was loaded **before** `menuData.js`, but `app.js` uses `MENU_ITEMS` immediately. |
| **Fix** | `<script src="scripts/menuData.js">` first, then `<script src="scripts/app.js">`. |

### Step 3 — Wrong relative paths in `pages/checkout.html`
| | |
|---|---|
| **Symptom** | Checkout page unstyled, no JavaScript, "Back to Menu" gives 404. |
| **Cause** | The file lives in `pages/`, but links were written as if it were in the project root (`styles/main.css`, `scripts/checkout.js`, `index.html`). |
| **Fix** | Prefixed with `../` → `../styles/main.css`, `../styles/theme.css`, `../scripts/checkout.js`, `../index.html`. |

### Step 4 — Broken CSS `url(...)` in `styles/theme.css`
| | |
|---|---|
| **Symptom** | Background pattern missing. |
| **Cause** | `url()` in a CSS file resolves relative to the **CSS file**, not the HTML page. `assets/bg-pattern.svg` pointed to `styles/assets/…`. |
| **Fix** | `url("../assets/bg-pattern.svg")`. |

### Step 5 — Broken menu icons in `scripts/menuData.js`
| Item | Before | After | Problem |
|---|---|---|---|
| Cold Brew | `images/coffee-cup.svg` | `assets/icons/coffee.svg` | wrong folder & filename |
| Sandwich | `assets/icons/sandwhich.svg` | `assets/icons/sandwich.svg` | spelling typo |
| Muffin | `assets/muffin.svg` | `assets/icons/muffin.svg` | missing `icons/` |
| Orange Juice | `assets/icons/fresh-juice.svg` | `assets/icons/juice.svg` | wrong filename |

### Step 6 — Prices stored as strings (root cause of "concatenating" totals)
| | |
|---|---|
| **Symptom** | Subtotal displayed like `0120856090`. |
| **Cause** | Prices were `"120"`, `"85"` … (strings), so `+` joined text instead of adding. |
| **Fix** | Prices are now numbers in `menuData.js`, **and** `addToCart` wraps with `Number(...)` as a safety net. |

### Step 7 — Only the first "Add to Cart" button worked (`app.js`)
| | |
|---|---|
| **Cause** | `document.querySelector(".add-btn")` returns only the **first** match, so only one button got a click listener. |
| **Fix** | Replaced with **event delegation** — one listener on `#menu-grid` using `event.target.closest(".add-btn")`. This also keeps buttons working after filter/search re-renders the grid. |

### Step 8 — Subtotal ignored quantity and badge counted rows (`app.js`)
| | |
|---|---|
| **Cause** | `subtotal + item.price` (no `* qty`); badge used `cart.length` (number of rows). |
| **Fix** | `subtotal = Σ price × qty`; badge = `Σ qty`. |

### Step 9 — Saved cart never appeared on checkout (storage-key mismatch)
| | |
|---|---|
| **Cause** | `app.js` saved to `"campus_cart"` but `checkout.js` read `"cartItems"`. |
| **Fix** | Both files now use the single constant `CART_KEY = "campus_cart"`. |

### Step 10 — Grand Total never displayed (element-ID mismatch)
| | |
|---|---|
| **Cause** | `checkout.js` looked up `#total-amount`; the HTML element is `#grand-total` → `null`, so the value was never written. |
| **Fix** | `getElementById("grand-total")`. |

---

## PART 2 — Missing logic added

### Step 11 — Menu filtering & live search (`app.js`)
* State variables `activeCategory` and `searchTerm`; a single `applyFilters()` combines both.
* All / Drinks / Snacks buttons set the category, move the `.active` class and re-render.
* The search box uses the `input` event (real time), case-insensitive match on item name.
* Shows "No menu items match your search." when nothing matches.

### Step 12 — Quantity handling, +/- controls, badge, empty-cart check (`app.js`)
* `addToCart` now looks for an existing item and does `qty += 1` instead of pushing a duplicate row.
* Each cart row has **−** and **+** buttons (`changeQty`); at `qty <= 0` the item is removed.
* Top-right badge shows total quantity.
* **Proceed to Checkout** with an empty cart shows *"Your cart is empty. Please add at least one item…"* and does **not** navigate.

### Step 13 — `STUDENT15` promo logic (`checkout.js`)
1. Discount is **reset to 0** on every click (so invalid attempts never keep an old discount).
2. Code is trimmed and upper-cased (so `student15` works).
3. Wrong code → "Invalid promo code."
4. Right code but subtotal < ₹150 → error stating the ₹150 minimum.
5. Otherwise discount = **15 % of subtotal**, success message shown, totals re-rendered.

Example: subtotal ₹180 → GST ₹9.00 → discount ₹27.00 → **Grand Total ₹162.00**.

### Step 14 — Order confirmation validation (`checkout.js`)
* Blocks if the cart is empty.
* Blocks unless **both** Full Name and Roll Number are non-empty (whitespace trimmed).
* On success: generates an Order ID (`CC-` + base-36 timestamp), shows a green confirmation message,
  removes `campus_cart` from `localStorage`, resets discount/promo, re-renders, and disables the button
  to prevent double submission.

---

## Verification performed
32 automated checks (all passed): every `href`/`src`/`url()`/icon path resolves to a real file; 4 cards
render; add-to-cart works for every button; subtotal 355 for one of each item; no duplicate rows; `+`/`−`
and removal at 0; badge; filter + active highlight; combined search + category; empty-cart block;
checkout totals; invalid/valid/under-₹150 promo; discount reset; blank-field validation; confirmation +
cart cleared; empty-cart order blocked.

---

## Reflection answer

Pasting a single file into a chat window gives the AI only a fragment of the project. The bugs here are
**cross-file**: a `<script>` path in `index.html` that doesn't match the `scripts/` folder, a CSS `url()`
that's relative to a different directory, a `localStorage` key that differs between `app.js` and
`checkout.js`, and an element ID in the JS that doesn't match the HTML. None of these is visible — or even
detectable as a bug — from one file alone; the AI would have to guess names and paths it can't see.
Workspace-aware tools like GitHub Copilot or Antigravity can read the whole folder tree, compare
file names with references, trace IDs and storage keys across files, edit several files at once, and
run the project to confirm the fix — so they locate and correct these mismatches accurately instead of guessing.
