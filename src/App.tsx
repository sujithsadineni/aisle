import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ProductArt } from "./art.tsx";
import { byId, inr, PROMOS } from "./catalog.ts";
import Checkout from "./Checkout.tsx";
import { Confirmation, Home, Orders, ProductPage, Shop, Wishlist } from "./pages.tsx";
import { setQty, totals, useShop, type State } from "./store.ts";

const BASE = import.meta.env.BASE_URL;
export type Ctx = { state: State; setState: Dispatch<SetStateAction<State>>; nav: (h: string) => void; openCart: () => void; toast: (m: string) => void };

function useHash() {
  const [hash, setHash] = useState(location.hash.slice(1) || "/");
  useEffect(() => {
    const on = () => { setHash(location.hash.slice(1) || "/"); scrollTo(0, 0); };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const [state, setState] = useShop();
  const [msg, setMsg] = useState("");
  const [query, setQuery] = useState("");
  const drawer = useRef<HTMLDialogElement>(null);
  const t = totals(state.cart, state.promo);
  const nav = (h: string) => { location.hash = h; };
  const openCart = () => drawer.current?.showModal();
  const toast = (m: string) => { setMsg(""); requestAnimationFrame(() => setMsg(m)); };
  useEffect(() => { if (!msg) return; const id = setTimeout(() => setMsg(""), 3000); return () => clearTimeout(id); }, [msg]);

  const ctx: Ctx = { state, setState, nav, openCart, toast };
  const [path, qs = ""] = hash.split("?");
  const params = new URLSearchParams(qs);
  const parts = path.split("/").filter(Boolean);

  let page;
  if (parts[0] === "shop") page = <Shop ctx={ctx} params={params} />;
  else if (parts[0] === "p" && byId.has(parts[1])) page = <ProductPage key={parts[1]} ctx={ctx} product={byId.get(parts[1])!} />;
  else if (parts[0] === "checkout") page = <Checkout ctx={ctx} />;
  else if (parts[0] === "order") page = <Confirmation ctx={ctx} id={parts[1]} />;
  else if (parts[0] === "orders") page = <Orders ctx={ctx} />;
  else if (parts[0] === "wishlist") page = <Wishlist ctx={ctx} />;
  else if (parts.length === 0) page = <Home ctx={ctx} />;
  else page = (
    <div className="empty-state"><h1>Page not found</h1><p>That aisle doesn't exist.</p><a className="btn" href="#/shop">Go shopping</a></div>
  );

  return (
    <>
      <div className="promo-bar">Free delivery over ₹2,999 · use <b>WELCOME10</b> for 10% off · demo store: nothing is charged or sent</div>
      <header className="top">
        <a href="#/" className="brand" aria-label="aisle home"><img src={`${BASE}logo.svg`} alt="" width={34} height={34} /><span>aisle</span></a>
        <nav className="links" aria-label="Main">
          <a href="#/shop" aria-current={parts[0] === "shop" && !params.get("cat") ? "page" : undefined}>Shop all</a>
          {["Cameras", "Watches", "Shirts"].map((c) => (
            <a key={c} href={`#/shop?cat=${c}`} aria-current={params.get("cat") === c ? "page" : undefined}>{c}</a>
          ))}
        </nav>
        <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); nav(`/shop?q=${encodeURIComponent(query.trim())}`); }}>
          <input type="search" placeholder="Search products" aria-label="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>
        <a href="#/wishlist" className="icon-btn" aria-label={`Wishlist, ${state.wish.length} items`}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.4C1 7.9 3.4 4.5 7 4.5c2 0 3.6 1.1 5 2.8 1.4-1.7 3-2.8 5-2.8 3.6 0 6 3.4 4.5 7.1C19.5 16.4 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
          {state.wish.length > 0 && <span className="count">{state.wish.length}</span>}
        </a>
        <button className="icon-btn" onClick={openCart} aria-label={`Cart, ${t.count} items`}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 8h14l-1.3 11.2a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8z M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
          {t.count > 0 && <span className="count" key={t.count}>{t.count}</span>}
        </button>
      </header>

      <main className="main">{page}</main>

      <footer className="foot">
        <div><img src={`${BASE}logo.svg`} alt="" width={28} height={28} /> <b>aisle</b> · a demo storefront. Products and prices are made up; checkout never charges anything.</div>
        <div><a href="#/orders">Your orders</a> · <a href="https://github.com/sujithsadineni/aisle">Code on GitHub</a></div>
      </footer>

      <dialog ref={drawer} className="drawer" aria-label="Your cart" onClick={(e) => e.target === drawer.current && drawer.current.close()}>
        <div className="drawer-inner">
          <div className="drawer-head"><h2>Your cart <span>({t.count})</span></h2><button className="icon-btn" onClick={() => drawer.current?.close()} aria-label="Close cart">✕</button></div>
          {state.cart.length === 0 ? (
            <div className="drawer-empty"><p>Your cart is empty.</p><button className="btn" onClick={() => { drawer.current?.close(); nav("/shop"); }}>Start shopping</button></div>
          ) : (
            <>
              <ul className="lines">
                {state.cart.map((l) => {
                  const p = byId.get(l.id)!;
                  const hex = p.colours.find((c) => c.name === l.colour)?.hex ?? p.colours[0].hex;
                  return (
                    <li key={l.key}>
                      <div className="line-art"><ProductArt category={p.category} colour={hex} /></div>
                      <div className="line-info">
                        <b>{p.name}</b>
                        <small>{l.colour}{l.size ? ` · Size ${l.size}` : ""}</small>
                        <div className="stepper" role="group" aria-label={`Quantity of ${p.name}`}>
                          <button onClick={() => setState((s) => ({ ...s, cart: setQty(s.cart, l.key, l.qty - 1) }))} aria-label="One less">−</button>
                          <span aria-live="polite">{l.qty}</span>
                          <button onClick={() => setState((s) => ({ ...s, cart: setQty(s.cart, l.key, l.qty + 1) }))} disabled={l.qty >= p.stock} aria-label="One more">+</button>
                        </div>
                      </div>
                      <div className="line-end">
                        <b>{inr(p.price * l.qty)}</b>
                        <button className="link" onClick={() => setState((s) => ({ ...s, cart: setQty(s.cart, l.key, 0) }))}>Remove</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <PromoBox ctx={ctx} />
              <dl className="sums">
                <div><dt>Subtotal</dt><dd>{inr(t.subtotal)}</dd></div>
                {t.discount > 0 && <div className="good"><dt>Promo {state.promo}</dt><dd>−{inr(t.discount)}</dd></div>}
                <div><dt>Delivery</dt><dd>{t.shipping ? inr(t.shipping) : "Free"}</dd></div>
                <div className="total"><dt>Total</dt><dd>{inr(t.total)}</dd></div>
                <div className="note"><dt>Includes GST</dt><dd>{inr(t.gstIncluded)}</dd></div>
              </dl>
              <button className="btn primary block" onClick={() => { drawer.current?.close(); nav("/checkout"); }}>Checkout</button>
            </>
          )}
        </div>
      </dialog>
      <div className={`toast${msg ? " on" : ""}`} role="status" aria-live="polite">{msg}</div>
    </>
  );
}

function PromoBox({ ctx }: { ctx: Ctx }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  if (ctx.state.promo) {
    return <p className="promo-on">Code <b>{ctx.state.promo}</b> applied. <button className="link" onClick={() => ctx.setState((s) => ({ ...s, promo: undefined }))}>Remove</button></p>;
  }
  return (
    <form className="promo" onSubmit={(e) => {
      e.preventDefault();
      const c = code.trim().toUpperCase();
      if (!(c in PROMOS)) { setErr("That code isn't valid. Try WELCOME10."); return; }
      setErr(""); ctx.setState((s) => ({ ...s, promo: c })); ctx.toast(`${c} applied`);
    }}>
      <label htmlFor="promo">Promo code</label>
      <div><input id="promo" value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={!!err || undefined} aria-describedby={err ? "promo-err" : undefined} /><button className="btn">Apply</button></div>
      {err && <p className="error" id="promo-err" role="alert">{err}</p>}
    </form>
  );
}
