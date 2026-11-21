// Run: node src/store.check.ts   (cart maths: stock caps, promos, free-shipping line, GST share)
import assert from "node:assert/strict";
import { addLine, setQty, totals } from "./store.ts";

let cart = addLine([], "s1", "White", "M", 2);
cart = addLine(cart, "s1", "White", "M", 1);
assert.equal(cart.length, 1, "same product+colour+size merges");
assert.equal(cart[0].qty, 3);
cart = addLine(cart, "s1", "Sky", "M", 1);
assert.equal(cart.length, 2, "another colour is another line");

assert.equal(addLine([], "c2", "Graphite", undefined, 99)[0].qty, 3, "capped at stock (3)");
assert.deepEqual(addLine([], "c4", "Silver", undefined, 1), [], "out of stock adds nothing");
assert.equal(setQty(cart, cart[0].key, 0).length, 1, "qty 0 removes the line");

// 2 × ₹1,500 = ₹3,000 → free standard shipping (≥ ₹2,999)
const t = totals(addLine([], "s1", "White", "M", 2), undefined);
assert.deepEqual([t.subtotal, t.shipping, t.total], [3000, 0, 3000]);
assert.equal(t.gstIncluded, 458, "18% GST included in ₹3,000 = ₹458");
// WELCOME10 takes it under the line → ₹99 shipping
const p = totals(addLine([], "s1", "White", "M", 2), "WELCOME10");
assert.deepEqual([p.discount, p.shipping, p.total], [300, 99, 2799]);
assert.equal(totals(addLine([], "s4", "White", "M", 1), undefined, "express").shipping, 199);
assert.equal(totals([], "AISLE20").total, 0, "empty cart: no shipping");
assert.equal(totals(addLine([], "s1", "White", "M", 1), "NOPE").discount, 0, "unknown promo ignored");
console.log("store: all checks pass");
