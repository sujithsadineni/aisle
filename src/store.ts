// Cart, wishlist and orders, kept in localStorage. Pure helpers + one hook.
import { useEffect, useState } from "react";
import { byId, GST, PROMOS, shippingFor } from "./catalog.ts";

export type Line = { key: string; id: string; colour: string; size?: string; qty: number };
export type Order = { id: string; at: string; lines: Line[]; total: number; name: string; city: string; speed: Speed };
export type Speed = "standard" | "express";
export type State = { cart: Line[]; wish: string[]; orders: Order[]; promo?: string };

export const lineKey = (id: string, colour: string, size?: string) => [id, colour, size ?? ""].join("|");

export function addLine(cart: Line[], id: string, colour: string, size: string | undefined, qty: number): Line[] {
  const key = lineKey(id, colour, size);
  const stock = byId.get(id)?.stock ?? 0;
  const found = cart.find((l) => l.key === key);
  if (found) return cart.map((l) => (l.key === key ? { ...l, qty: Math.min(stock, l.qty + qty) } : l));
  return [...cart, { key, id, colour, size, qty: Math.min(stock, qty) }].filter((l) => l.qty > 0);
}

export const setQty = (cart: Line[], key: string, qty: number) =>
  cart.map((l) => (l.key === key ? { ...l, qty: Math.max(0, Math.min(byId.get(l.id)?.stock ?? 0, qty)) } : l)).filter((l) => l.qty > 0);

/** Money for a cart: rupees, rounded to whole rupees at each step. Prices include GST (shown separately). */
export function totals(cart: Line[], promo: string | undefined, speed: Speed = "standard") {
  const subtotal = cart.reduce((s, l) => s + (byId.get(l.id)?.price ?? 0) * l.qty, 0);
  const discount = Math.round(subtotal * (promo ? PROMOS[promo] ?? 0 : 0));
  const shipping = cart.length ? shippingFor(subtotal - discount, speed) : 0;
  const total = subtotal - discount + shipping;
  const gstIncluded = Math.round(((subtotal - discount) * GST) / (1 + GST));
  return { subtotal, discount, shipping, total, gstIncluded, count: cart.reduce((s, l) => s + l.qty, 0) };
}

const KEY = "aisle.v1";
const empty: State = { cart: [], wish: [], orders: [] };
function load(): State {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (s && Array.isArray(s.cart)) return { ...empty, ...s, cart: s.cart.filter((l: Line) => byId.has(l.id)) };
  } catch { /* blocked or corrupt storage */ }
  return empty;
}

export function useShop() {
  const [state, setState] = useState<State>(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked */ }
  }, [state]);
  return [state, setState] as const;
}
