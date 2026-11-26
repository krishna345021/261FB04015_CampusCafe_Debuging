# CampusCafe – Student Order Portal

CampusCafe is a simple two-page café ordering web application built with **HTML, CSS, and JavaScript**. Students can browse menu items, search and filter the menu, add items to a cart, adjust quantities, apply a promo code, and confirm an order.

## Features

- Responsive, styled menu with SVG icons
- Filter menu by **All**, **Drinks**, or **Snacks**
- Live menu search combined with category filtering
- Add items to cart; repeated items increase quantity
- Increase/decrease quantities and remove items at zero
- Cart badge shows total item quantity
- Subtotal calculation using price × quantity
- Checkout page with GST and grand total
- Promo code **STUDENT15**: 15% discount for subtotal of ₹150 or more
- Checkout validation for cart, Full Name, and Roll Number
- Order confirmation with generated Order ID; cart cleared after success

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Browser `localStorage`

## Project Structure

```text
CampusCafe-Debug-Task/
├── index.html
├── pages/
│   └── checkout.html
├── scripts/
│   ├── menuData.js
│   ├── app.js
│   └── checkout.js
├── styles/
│   ├── main.css
│   └── theme.css
├── assets/
│   ├── bg-pattern.svg
│   └── icons/
│       ├── coffee.svg
│       ├── sandwich.svg
│       ├── muffin.svg
│       └── juice.svg
├── .vscode/
├── README.md
└── CORRECTION_REPORT.md
```

## How to Run

1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension if it is not already installed.
3. Right-click `index.html` and select **Open with Live Server** (or click **Go Live**).
4. Use the menu to add items to your cart and proceed to checkout.

No build step or `npm install` is required.


## Promo Code

Use `STUDENT15` at checkout to get **15% off** when the subtotal is at least **₹150**. The code is case-insensitive. Invalid codes or subtotals below the minimum show an error and apply no discount.


## Testing

The corrected application was verified using **32 automated checks**, all passing. Checks covered file paths and assets, menu rendering, cart operations, quantity controls, filtering and search, checkout totals, promo-code validation, order-form validation, order confirmation, and cart clearing.


## Bug Fixes and Improvements

- Corrected stylesheet, script, checkout, icon, and background-image paths
- Fixed JavaScript load order and menu rendering
- Corrected numeric prices and cart subtotal calculations
- Enabled all Add to Cart buttons
- Fixed cart persistence between menu and checkout pages
- Corrected Grand Total display
- Added filtering, live search, quantity controls, promo-code logic, and order confirmation validation


## Documentation

See `CORRECTION_REPORT.md` for the detailed before-and-after bug-fix report.
