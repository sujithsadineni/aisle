import { useMemo, useState } from "react";
import type { Ctx } from "./App.tsx";
import { ProductArt } from "./art.tsx";
import { byId, CATEGORIES, inr, PRODUCTS, type Category, type Product } from "./catalog.ts";
import { addLine } from "./store.ts";

export const Stars = ({ r, n }: { r: number; n?: number }) => (
  <span className="stars" aria-label={`Rated ${r} out of 5${n ? `, ${n} reviews` : ""}`}>
    <span aria-hidden="true" style={{ "--r": r } as React.CSSProperties}>★★★★★</span>
    {n !== undefined && <small>{r.toFixed(1)} ({n.toLocaleString("en-IN")})</small>}
  </span>
);

function WishButton({ ctx, id }: { ctx: Ctx; id: string }) {
  const on = ctx.state.wish.includes(id);
  return (
    <button className={`wish${on ? " on" : ""}`} aria-pressed={on} aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => { e.preventDefault(); ctx.setState((s) => ({ ...s, wish: on ? s.wish.filter((w) => w !== id) : [...s.wish, id] })); ctx.toast(on ? "Removed from wishlist" : "Saved to wishlist"); }}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.4C1 7.9 3.4 4.5 7 4.5c2 0 3.6 1.1 5 2.8 1.4-1.7 3-2.8 5-2.8 3.6 0 6 3.4 4.5 7.1C19.5 16.4 12 21 12 21z" /></svg>
    </button>
  );
}

export function Card({ ctx, p }: { ctx: Ctx; p: Product }) {
  return (
    <li className="pcard">
      <a href={`#/p/${p.id}`} className="pcard-link">
        <div className="pcard-art" style={{ background: `color-mix(in srgb, ${p.colours[0].hex} 16%, #f6f3ec)` }}>
          <ProductArt category={p.category} colour={p.colours[0].hex} />
          <div className="badges">
            {p.isNew && <span className="badge new">New</span>}
            {p.was && <span className="badge sale">−{Math.round((1 - p.price / p.was) * 100)}%</span>}
            {p.stock === 0 && <span className="badge out">Sold out</span>}
          </div>
        </div>
        <div className="pcard-text">
          <span className="cat">{p.category}</span>
          <b>{p.name}</b>
          <Stars r={p.rating} n={p.reviews} />
          <span className="price">{inr(p.price)} {p.was && <s>{inr(p.was)}</s>}</span>
          <span className="swatches" aria-label={`${p.colours.length} colours`}>{p.colours.map((c) => <i key={c.name} style={{ background: c.hex }} />)}</span>
        </div>
      </a>
      <WishButton ctx={ctx} id={p.id} />
    </li>
  );
}

export function Home({ ctx }: { ctx: Ctx }) {
  const featured = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  const deals = PRODUCTS.filter((p) => p.was).slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Winter edit · 2026</p>
          <h1>Good things,<br />well made.</h1>
          <p>Cameras, watches and shirts from the original store, now with bags, headphones and sneakers.</p>
          <div className="hero-cta"><a className="btn primary" href="#/shop">Shop all</a><a className="btn" href="#/shop?sale=1">See deals</a></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="float f1"><ProductArt category="Cameras" colour="#c2703d" /></div>
          <div className="float f2"><ProductArt category="Watches" colour="#c9a646" /></div>
          <div className="float f3"><ProductArt category="Sneakers" colour="#8fb8de" /></div>
        </div>
      </section>
      <section aria-labelledby="cats-h">
        <h2 id="cats-h" className="sec-h">Shop by category</h2>
        <ul className="cats">
          {CATEGORIES.map((c, i) => (
            <li key={c}><a href={`#/shop?cat=${c}`} className="cat-tile">
              <ProductArt category={c} colour={["#c2703d", "#c9a646", "#8fb8de", "#8aa58f", "#2f3437", "#d9a5a0"][i]} />
              <span>{c}</span><small>{PRODUCTS.filter((p) => p.category === c).length} products</small>
            </a></li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="new-h"><h2 id="new-h" className="sec-h">New in</h2><ul className="grid">{featured.map((p) => <Card key={p.id} ctx={ctx} p={p} />)}</ul></section>
      <section aria-labelledby="deal-h"><h2 id="deal-h" className="sec-h">Deals</h2><ul className="grid">{deals.map((p) => <Card key={p.id} ctx={ctx} p={p} />)}</ul></section>
      <section className="perks" aria-label="Why aisle">
        <div><b>Free delivery</b><span>On orders over ₹2,999</span></div>
        <div><b>30-day returns</b><span>Change your mind, no questions</span></div>
        <div><b>Secure checkout</b><span>Card, UPI or cash on delivery</span></div>
      </section>
    </>
  );
}

type Sort = "featured" | "price-asc" | "price-desc" | "rating" | "new";

export function Shop({ ctx, params }: { ctx: Ctx; params: URLSearchParams }) {
  const cat = params.get("cat") as Category | null;
  const q = (params.get("q") ?? "").toLowerCase();
  const [sort, setSort] = useState<Sort>("featured");
  const [max, setMax] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [sale, setSale] = useState(params.get("sale") === "1");

  const list = useMemo(() => {
    const out = PRODUCTS.filter((p) =>
      (!cat || p.category === cat) && (!q || `${p.name} ${p.category} ${p.blurb}`.toLowerCase().includes(q)) &&
      p.price <= max && p.rating >= minRating && (!inStock || p.stock > 0) && (!sale || !!p.was));
    const by: Record<Sort, (a: Product, b: Product) => number> = {
      featured: () => 0, "price-asc": (a, b) => a.price - b.price, "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating, new: (a, b) => Number(!!b.isNew) - Number(!!a.isNew),
    };
    return [...out].sort(by[sort]);
  }, [cat, q, sort, max, minRating, inStock, sale]);

  const setCat = (c: string | null) => ctx.nav(`/shop${c ? `?cat=${c}` : ""}`);
  return (
    <div className="shop">
      <aside className="filters" aria-label="Filters">
        <h2>Filters</h2>
        <fieldset><legend>Category</legend>
          <div className="chips">
            <button className={!cat ? "on" : ""} aria-pressed={!cat} onClick={() => setCat(null)}>All</button>
            {CATEGORIES.map((c) => <button key={c} className={cat === c ? "on" : ""} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        </fieldset>
        <fieldset><legend>Max price: {inr(max)}</legend>
          <input type="range" min={1000} max={50000} step={500} value={max} onChange={(e) => setMax(Number(e.target.value))} aria-label="Maximum price" />
        </fieldset>
        <fieldset><legend>Rating</legend>
          <div className="chips">{[0, 4, 4.5].map((r) => <button key={r} className={minRating === r ? "on" : ""} aria-pressed={minRating === r} onClick={() => setMinRating(r)}>{r ? `${r}★ & up` : "Any"}</button>)}</div>
        </fieldset>
        <label className="check"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only</label>
        <label className="check"><input type="checkbox" checked={sale} onChange={(e) => setSale(e.target.checked)} /> On sale</label>
      </aside>
      <section className="results" aria-labelledby="res-h">
        <div className="results-head">
          <h1 id="res-h">{q ? `Results for “${params.get("q")}”` : cat ?? "All products"} <small>{list.length} items</small></h1>
          <label className="sort">Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="featured">Featured</option><option value="new">Newest</option>
              <option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
        </div>
        {list.length ? <ul className="grid">{list.map((p) => <Card key={p.id} ctx={ctx} p={p} />)}</ul>
          : <div className="empty-state"><p>No products match these filters.</p><button className="btn" onClick={() => { setMax(50000); setMinRating(0); setInStock(false); setSale(false); setCat(null); }}>Clear filters</button></div>}
      </section>
    </div>
  );
}

export function ProductPage({ ctx, product: p }: { ctx: Ctx; product: Product }) {
  const [colour, setColour] = useState(p.colours[0]);
  const [size, setSize] = useState<string | undefined>();
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");
  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const add = () => {
    if (p.sizes && !size) { setErr("Pick a size"); return; }
    setErr("");
    ctx.setState((s) => ({ ...s, cart: addLine(s.cart, p.id, colour.name, size, qty) }));
    ctx.toast(`Added ${qty} × ${p.name}`);
    ctx.openCart();
  };
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / <a href={`#/shop?cat=${p.category}`}>{p.category}</a> / <span aria-current="page">{p.name}</span></nav>
      <div className="pdp">
        <div className="pdp-art" style={{ background: `color-mix(in srgb, ${colour.hex} 18%, #f6f3ec)` }}>
          <ProductArt category={p.category} colour={colour.hex} label={`${p.name} in ${colour.name}`} />
        </div>
        <div className="pdp-info">
          <span className="cat">{p.category}</span>
          <h1>{p.name}</h1>
          <Stars r={p.rating} n={p.reviews} />
          <p className="pdp-price">{inr(p.price)} {p.was && <><s>{inr(p.was)}</s> <span className="badge sale">Save {inr(p.was - p.price)}</span></>}</p>
          <p>{p.blurb}</p>
          <fieldset className="opts"><legend>Colour: <b>{colour.name}</b></legend>
            <div className="swatch-pick">{p.colours.map((c) => (
              <label key={c.name} title={c.name}><input type="radio" name="colour" checked={colour.name === c.name} onChange={() => setColour(c)} /><i style={{ background: c.hex }} /><span className="sr">{c.name}</span></label>
            ))}</div>
          </fieldset>
          {p.sizes && (
            <fieldset className="opts"><legend>Size{size ? `: ${size}` : ""}</legend>
              <div className="size-pick">{p.sizes.map((s) => (
                <label key={s}><input type="radio" name="size" checked={size === s} onChange={() => { setSize(s); setErr(""); }} /><span>{s}</span></label>
              ))}</div>
              {err && <p className="error" role="alert">{err}</p>}
            </fieldset>
          )}
          <div className="buy">
            <div className="stepper big" role="group" aria-label="Quantity">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="One less">−</button><span>{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock || 1, qty + 1))} aria-label="One more">+</button>
            </div>
            <button className="btn primary grow" disabled={p.stock === 0} onClick={add}>{p.stock === 0 ? "Sold out" : "Add to cart"}</button>
            <WishButton ctx={ctx} id={p.id} />
          </div>
          <p className={`stock${p.stock > 0 && p.stock <= 5 ? " low" : ""}`}>{p.stock === 0 ? "Out of stock" : p.stock <= 5 ? `Only ${p.stock} left` : "In stock · ships in 1–2 days"}</p>
          <details open><summary>Details</summary><ul>{p.details.map((d) => <li key={d}>{d}</li>)}</ul></details>
          <details><summary>Delivery & returns</summary><p>Free standard delivery over ₹2,999 (3–5 days), express ₹199 (next day in metro cities). 30-day returns.</p></details>
        </div>
      </div>
      {related.length > 0 && <section aria-labelledby="rel-h"><h2 id="rel-h" className="sec-h">You may also like</h2><ul className="grid">{related.map((x) => <Card key={x.id} ctx={ctx} p={x} />)}</ul></section>}
    </>
  );
}

export function Wishlist({ ctx }: { ctx: Ctx }) {
  const items = ctx.state.wish.map((id) => byId.get(id)).filter(Boolean) as Product[];
  return (
    <section aria-labelledby="w-h">
      <h1 id="w-h" className="page-h">Wishlist <small>{items.length} items</small></h1>
      {items.length ? <ul className="grid">{items.map((p) => <Card key={p.id} ctx={ctx} p={p} />)}</ul>
        : <div className="empty-state"><p>Nothing saved yet. Tap the heart on any product.</p><a className="btn" href="#/shop">Browse products</a></div>}
    </section>
  );
}

export function Orders({ ctx }: { ctx: Ctx }) {
  const orders = ctx.state.orders;
  return (
    <section aria-labelledby="o-h">
      <h1 id="o-h" className="page-h">Your orders</h1>
      {orders.length ? (
        <ul className="orders">{orders.map((o) => (
          <li key={o.id}><a href={`#/order/${o.id}`}>
            <b>Order {o.id}</b><span>{new Date(o.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {o.lines.reduce((s, l) => s + l.qty, 0)} items · {o.speed}</span><b>{inr(o.total)}</b>
          </a></li>
        ))}</ul>
      ) : <div className="empty-state"><p>No orders yet.</p><a className="btn" href="#/shop">Start shopping</a></div>}
    </section>
  );
}

export function Confirmation({ ctx, id }: { ctx: Ctx; id: string }) {
  const o = ctx.state.orders.find((x) => x.id === id);
  if (!o) return <div className="empty-state"><h1>Order not found</h1><a className="btn" href="#/orders">Your orders</a></div>;
  const eta = new Date(new Date(o.at).getTime() + (o.speed === "express" ? 1 : 4) * 86_400_000);
  return (
    <section className="confirm" aria-labelledby="c-h">
      <div className="tick" aria-hidden="true">✓</div>
      <h1 id="c-h">Thank you, {o.name.split(" ")[0]}!</h1>
      <p>Order <b>{o.id}</b> is placed (demo: nothing was charged). Arriving in {o.city} by <b>{eta.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</b>.</p>
      <ol className="track" aria-label="Order progress"><li className="done">Placed</li><li>Packed</li><li>Shipped</li><li>Delivered</li></ol>
      <ul className="confirm-lines">{o.lines.map((l) => { const p = byId.get(l.id)!; return <li key={l.key}><span>{l.qty} × {p.name} <small>{l.colour}{l.size ? ` · ${l.size}` : ""}</small></span><span>{inr(p.price * l.qty)}</span></li>; })}</ul>
      <p className="confirm-total">Total paid <b>{inr(o.total)}</b></p>
      <div className="hero-cta"><a className="btn primary" href="#/shop">Keep shopping</a><a className="btn" href="#/orders">All orders</a></div>
    </section>
  );
}
