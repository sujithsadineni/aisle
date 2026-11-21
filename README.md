<p align="center"><img src="logo.svg" width="88" alt="aisle logo"></p>

# aisle

A modern demo storefront: browse, filter and search 24 products, pick colours and sizes, use a cart with
promo codes, and check out in three steps with card, UPI or cash on delivery. Prices are in rupees.

**Live demo:** https://sujithsadineni.github.io/aisle/

> Demo store: products and prices are made up, product pictures are drawn in SVG (no brand names or photos),
> and checkout never charges anything or sends data anywhere. Cart, wishlist and orders live in your browser.

## Features

- **Home:** hero, shop by category, new in, deals
- **Shop:** category chips, max-price slider, rating, in-stock and on-sale filters, sort, search
- **Product page:** colour swatches that repaint the picture, size picker (required for shirts and sneakers),
  quantity capped at stock, sold-out state, low-stock note, details and delivery info, related products
- **Cart drawer** (native `<dialog>`): quantity steppers, remove, promo codes `WELCOME10` / `AISLE20`,
  free delivery over ₹2,999, GST shown as included
- **Checkout:** address (Indian mobile and PIN checks) → delivery (standard / express ₹199) → payment
  (card with Luhn, expiry and CVC checks, UPI ID, or cash on delivery) → review → order confirmation with tracking steps
- **Orders and wishlist** saved in `localStorage`; light and dark themes; works at phone width

## Run

```bash
npm install
npm run dev               # http://localhost:5186/aisle/
npm run build
node src/store.check.ts   # cart maths: stock caps, promos, shipping, GST
```

The first version of this repo (2021 PHP + MySQL "Lifestyle Store", built during an Internshala course) is
kept at tag `v1-php-2021`.
