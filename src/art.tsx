// Drawn product pictures: one simple SVG per category, painted in the chosen colour. No photos, no brands.
import type { Category } from "./catalog.ts";

export function ProductArt({ category, colour, label }: { category: Category; colour: string; label?: string }) {
  const dark = "#1f2326", light = "#ffffff";
  return (
    <svg viewBox="0 0 200 200" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className="art">
      <ellipse cx="100" cy="176" rx="62" ry="8" fill="#000" opacity=".08" />
      {category === "Cameras" && (
        <g>
          <rect x="34" y="62" width="132" height="90" rx="14" fill={colour} />
          <rect x="34" y="62" width="132" height="22" rx="10" fill={dark} opacity=".85" />
          <rect x="52" y="50" width="34" height="16" rx="5" fill={dark} />
          <circle cx="110" cy="110" r="34" fill={dark} /><circle cx="110" cy="110" r="24" fill="#3c4650" />
          <circle cx="110" cy="110" r="12" fill="#5f7d95" /><circle cx="104" cy="104" r="4" fill={light} opacity=".7" />
          <circle cx="148" cy="74" r="5" fill="#e9b949" />
        </g>
      )}
      {category === "Watches" && (
        <g>
          <rect x="80" y="20" width="40" height="160" rx="12" fill={dark} opacity=".85" />
          <circle cx="100" cy="100" r="50" fill={colour} /><circle cx="100" cy="100" r="41" fill="#fbfaf7" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x="99" y="63" width="2" height={i % 3 ? 4 : 8} fill={dark} transform={`rotate(${i * 30} 100 100)`} />
          ))}
          <rect x="98.5" y="74" width="3" height="28" rx="1.5" fill={dark} transform="rotate(40 100 100)" />
          <rect x="99" y="66" width="2" height="36" rx="1" fill={dark} transform="rotate(-70 100 100)" />
          <circle cx="100" cy="100" r="3.5" fill={colour} /><rect x="148" y="94" width="8" height="12" rx="2" fill={colour} />
        </g>
      )}
      {category === "Shirts" && (
        <g>
          <path d="M70 34l-40 22 14 34 16-8v86h80V82l16 8 14-34-40-22c-4 12-16 18-30 18S74 46 70 34z" fill={colour} stroke={dark} strokeOpacity=".15" strokeWidth="2" />
          <path d="M70 34c4 12 16 18 30 18s26-6 30-18l-10-4c-2 8-10 12-20 12s-18-4-20-12z" fill={dark} opacity=".12" />
          <line x1="100" y1="52" x2="100" y2="168" stroke={dark} strokeOpacity=".18" strokeWidth="2" />
          {[70, 92, 114, 136].map((y) => <circle key={y} cx="100" cy={y} r="2.6" fill={dark} opacity=".35" />)}
          <rect x="112" y="76" width="18" height="16" rx="2" fill={dark} opacity=".08" />
        </g>
      )}
      {category === "Bags" && (
        <g>
          <path d="M74 58v-8a26 26 0 0 1 52 0v8" fill="none" stroke={dark} strokeWidth="7" strokeLinecap="round" opacity=".8" />
          <rect x="44" y="56" width="112" height="116" rx="22" fill={colour} />
          <rect x="60" y="104" width="80" height="48" rx="12" fill={dark} opacity=".12" />
          <rect x="60" y="104" width="80" height="10" rx="5" fill={dark} opacity=".18" />
          <rect x="94" y="98" width="12" height="14" rx="3" fill="#e9b949" />
        </g>
      )}
      {category === "Headphones" && (
        <g>
          <path d="M46 116v-16a54 54 0 0 1 108 0v16" fill="none" stroke={colour} strokeWidth="14" strokeLinecap="round" />
          <path d="M46 116v-16a54 54 0 0 1 108 0v16" fill="none" stroke={dark} strokeOpacity=".15" strokeWidth="14" strokeLinecap="round" strokeDasharray="2 10" />
          <rect x="28" y="104" width="40" height="62" rx="18" fill={colour} /><rect x="132" y="104" width="40" height="62" rx="18" fill={colour} />
          <rect x="54" y="110" width="12" height="50" rx="6" fill={dark} opacity=".55" /><rect x="134" y="110" width="12" height="50" rx="6" fill={dark} opacity=".55" />
        </g>
      )}
      {category === "Sneakers" && (
        <g>
          <path d="M24 136c0-14 6-40 22-50l30 8c10 4 18 12 34 16l42 10c16 4 26 10 26 22v8H24z" fill={colour} />
          <rect x="22" y="148" width="158" height="16" rx="8" fill="#f2f0ea" stroke={dark} strokeOpacity=".2" strokeWidth="2" />
          <path d="M60 96l10 30M76 100l8 26M92 106l6 22" stroke={dark} strokeOpacity=".35" strokeWidth="4" strokeLinecap="round" />
          <path d="M128 128c14 2 30 6 44 14" stroke={dark} strokeOpacity=".2" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
