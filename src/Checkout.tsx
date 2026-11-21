// Checkout in 3 steps: address → delivery → payment, then review and place. Demo: nothing is charged or sent.
import { useState, type FormEvent } from "react";
import type { Ctx } from "./App.tsx";
import { ProductArt } from "./art.tsx";
import { byId, inr } from "./catalog.ts";
import { totals, type Speed } from "./store.ts";
import { cardBrand, cvcOk, expiryOk, formatCard, formatExpiry, luhn } from "./validate.ts";

type Pay = "card" | "upi" | "cod";
const STEPS = ["Address", "Delivery", "Payment"] as const;
const isPhone = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").slice(-10)) && v.replace(/\D/g, "").length >= 10;
const isPin = (v: string) => /^[1-9]\d{5}$/.test(v.trim());
const isUpi = (v: string) => /^[\w.-]{2,}@[a-z]{2,}$/i.test(v.trim());

function F({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={`field${error ? " bad" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="error" id={`${id}-e`} role="alert">{error}</p>}
    </div>
  );
}
const a = (id: string, error?: string) => ({ id, "aria-invalid": !!error || undefined, "aria-describedby": error ? `${id}-e` : undefined });

export default function Checkout({ ctx }: { ctx: Ctx }) {
  const { state, setState, nav } = ctx;
  const [step, setStep] = useState(0);
  const [v, setV] = useState({ name: "", phone: "", line1: "", city: "", pin: "", card: "", exp: "", cvc: "", upi: "" });
  const [speed, setSpeed] = useState<Speed>("standard");
  const [pay, setPay] = useState<Pay>("card");
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const t = totals(state.cart, state.promo, speed);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });

  if (!state.cart.length) {
    return <div className="empty-state"><h1>Your cart is empty</h1><a className="btn primary" href="#/shop">Go shopping</a></div>;
  }

  const check = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (v.name.trim().length < 2) e.name = "Enter your full name";
      if (!isPhone(v.phone)) e.phone = "10-digit mobile number";
      if (v.line1.trim().length < 5) e.line1 = "House, street and area";
      if (v.city.trim().length < 2) e.city = "Enter your city";
      if (!isPin(v.pin)) e.pin = "6-digit PIN code";
    }
    if (s === 2 && pay === "card") {
      if (!luhn(v.card)) e.card = "That card number isn't valid";
      if (!expiryOk(v.exp)) e.exp = "MM/YY, not in the past";
      if (!cvcOk(v.cvc, cardBrand(v.card))) e.cvc = "3 or 4 digits";
    }
    if (s === 2 && pay === "upi" && !isUpi(v.upi)) e.upi = "Like name@bank";
    setErr(e);
    return !Object.keys(e).length;
  };
  const next = (e: FormEvent) => { e.preventDefault(); if (check(step)) setStep(step + 1); };
  const place = async () => {
    if (!check(0)) { setStep(0); return; }
    if (!check(2)) { setStep(2); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1100));
    const id = `AIS-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setState((s) => ({ ...s, cart: [], promo: undefined, orders: [{ id, at: new Date().toISOString(), lines: s.cart, total: t.total, name: v.name.trim(), city: v.city.trim(), speed }, ...s.orders] }));
    nav(`/order/${id}`);
  };

  return (
    <div className="checkout">
      <section className="co-main" aria-labelledby="co-h">
        <h1 id="co-h" className="page-h">Checkout</h1>
        <ol className="steps" aria-label="Checkout steps">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? "on" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
              <button type="button" disabled={i > step} onClick={() => setStep(i)}><span>{i < step ? "✓" : i + 1}</span>{s}</button>
            </li>
          ))}
          <li className={step === 3 ? "on" : ""} aria-current={step === 3 ? "step" : undefined}><button type="button" disabled={step < 3}><span>4</span>Review</button></li>
        </ol>

        {step === 0 && (
          <form onSubmit={next} noValidate className="co-form">
            <div className="two">
              <F id="name" label="Full name" error={err.name}><input {...a("name", err.name)} autoComplete="name" value={v.name} onChange={set("name")} /></F>
              <F id="phone" label="Mobile" error={err.phone}><input {...a("phone", err.phone)} autoComplete="tel" inputMode="tel" placeholder="98xxxxxxxx" value={v.phone} onChange={set("phone")} /></F>
            </div>
            <F id="line1" label="Address" error={err.line1}><input {...a("line1", err.line1)} autoComplete="street-address" value={v.line1} onChange={set("line1")} /></F>
            <div className="two">
              <F id="city" label="City" error={err.city}><input {...a("city", err.city)} autoComplete="address-level2" value={v.city} onChange={set("city")} /></F>
              <F id="pin" label="PIN code" error={err.pin}><input {...a("pin", err.pin)} autoComplete="postal-code" inputMode="numeric" maxLength={6} value={v.pin} onChange={set("pin")} /></F>
            </div>
            <button className="btn primary">Continue to delivery</button>
          </form>
        )}
        {step === 1 && (
          <form onSubmit={next} className="co-form">
            <fieldset className="radio-cards"><legend>Delivery speed</legend>
              {([["standard", "Standard", "3–5 days", t.subtotal - t.discount >= 2999 ? "Free" : inr(99)], ["express", "Express", "Next day in metro cities", inr(199)]] as const).map(([val, title, sub, price]) => (
                <label key={val} className={speed === val ? "on" : ""}><input type="radio" name="speed" checked={speed === val} onChange={() => setSpeed(val)} /><span><b>{title}</b><small>{sub}</small></span><b>{price}</b></label>
              ))}
            </fieldset>
            <button className="btn primary">Continue to payment</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={next} noValidate className="co-form">
            <fieldset className="radio-cards"><legend>Pay with</legend>
              {([["card", "Card", "Visa, Mastercard, RuPay, Amex"], ["upi", "UPI", "Any UPI app"], ["cod", "Cash on delivery", "Pay when it arrives"]] as const).map(([val, title, sub]) => (
                <label key={val} className={pay === val ? "on" : ""}><input type="radio" name="pay" checked={pay === val} onChange={() => { setPay(val); setErr({}); }} /><span><b>{title}</b><small>{sub}</small></span></label>
              ))}
            </fieldset>
            {pay === "card" && (
              <>
                <F id="card" label="Card number" error={err.card}><input {...a("card", err.card)} inputMode="numeric" autoComplete="off" placeholder="1234 1234 1234 1234" value={v.card} onChange={(e) => setV({ ...v, card: formatCard(e.target.value) })} /></F>
                <div className="two">
                  <F id="exp" label="Expiry" error={err.exp}><input {...a("exp", err.exp)} inputMode="numeric" autoComplete="off" placeholder="MM/YY" value={v.exp} onChange={(e) => setV({ ...v, exp: formatExpiry(e.target.value) })} /></F>
                  <F id="cvc" label="CVC" error={err.cvc}><input {...a("cvc", err.cvc)} inputMode="numeric" autoComplete="off" value={v.cvc} onChange={(e) => setV({ ...v, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} /></F>
                </div>
                <button type="button" className="link" onClick={() => setV({ ...v, card: "4242 4242 4242 4242", exp: "12/29", cvc: "123" })}>Fill a test card</button>
              </>
            )}
            {pay === "upi" && <F id="upi" label="UPI ID" error={err.upi}><input {...a("upi", err.upi)} autoComplete="off" placeholder="name@bank" value={v.upi} onChange={set("upi")} /></F>}
            <button className="btn primary">Review order</button>
          </form>
        )}
        {step === 3 && (
          <div className="co-form review">
            <dl>
              <div><dt>Deliver to</dt><dd>{v.name}, {v.line1}, {v.city} {v.pin} · {v.phone}</dd><button className="link" onClick={() => setStep(0)}>Change</button></div>
              <div><dt>Delivery</dt><dd>{speed === "express" ? "Express, next day" : "Standard, 3–5 days"}</dd><button className="link" onClick={() => setStep(1)}>Change</button></div>
              <div><dt>Payment</dt><dd>{pay === "card" ? `Card ending ${v.card.replace(/\D/g, "").slice(-4)}` : pay === "upi" ? `UPI ${v.upi}` : "Cash on delivery"}</dd><button className="link" onClick={() => setStep(2)}>Change</button></div>
            </dl>
            <button className="btn primary" disabled={busy} aria-busy={busy} onClick={place}>{busy ? "Placing order…" : `Place order · ${inr(t.total)}`}</button>
            <p className="fine">Demo store: no payment is taken and nothing is sent anywhere.</p>
          </div>
        )}
      </section>

      <aside className="co-sum" aria-label="Order summary">
        <h2>Summary</h2>
        <ul>{state.cart.map((l) => { const p = byId.get(l.id)!; const hex = p.colours.find((c) => c.name === l.colour)?.hex ?? p.colours[0].hex; return (
          <li key={l.key}><div className="line-art"><ProductArt category={p.category} colour={hex} /><span className="qty">{l.qty}</span></div><span><b>{p.name}</b><small>{l.colour}{l.size ? ` · ${l.size}` : ""}</small></span><span>{inr(p.price * l.qty)}</span></li>
        ); })}</ul>
        <dl className="sums">
          <div><dt>Subtotal</dt><dd>{inr(t.subtotal)}</dd></div>
          {t.discount > 0 && <div className="good"><dt>Promo {state.promo}</dt><dd>−{inr(t.discount)}</dd></div>}
          <div><dt>Delivery</dt><dd>{t.shipping ? inr(t.shipping) : "Free"}</dd></div>
          <div className="total"><dt>Total</dt><dd>{inr(t.total)}</dd></div>
          <div className="note"><dt>Includes GST</dt><dd>{inr(t.gstIncluded)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
