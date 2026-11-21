// The catalogue. Original made-up products (no real brands); prices in rupees like the 2021 store.
export const CATEGORIES = ["Cameras", "Watches", "Shirts", "Bags", "Headphones", "Sneakers"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Colour = { name: string; hex: string };
export type Product = {
  id: string; name: string; category: Category; price: number; was?: number;
  rating: number; reviews: number; colours: Colour[]; sizes?: string[]; stock: number;
  blurb: string; details: string[]; isNew?: boolean;
};

const C = {
  graphite: { name: "Graphite", hex: "#2f3437" }, sand: { name: "Sand", hex: "#d8c3a5" },
  sage: { name: "Sage", hex: "#8aa58f" }, clay: { name: "Clay", hex: "#c2703d" },
  navy: { name: "Navy", hex: "#23395b" }, cream: { name: "Cream", hex: "#efe6d2" },
  rose: { name: "Rose", hex: "#d9a5a0" }, forest: { name: "Forest", hex: "#2f5d46" },
  sky: { name: "Sky", hex: "#8fb8de" }, silver: { name: "Silver", hex: "#b9bec4" },
  gold: { name: "Gold", hex: "#c9a646" }, white: { name: "White", hex: "#f4f4f1" },
};
const SHIRT = ["S", "M", "L", "XL"], SHOE = ["7", "8", "9", "10", "11"];

export const PRODUCTS: Product[] = [
  { id: "c1", name: "Field Mirrorless 24", category: "Cameras", price: 36000, rating: 4.6, reviews: 214, colours: [C.graphite, C.silver], stock: 8, blurb: "A light 24 MP mirrorless body for travel and street.", details: ["24 MP sensor", "4K video", "Flip screen", "Weather sealed"] },
  { id: "c2", name: "Studio Pro 45", category: "Cameras", price: 45000, was: 49900, rating: 4.8, reviews: 131, colours: [C.graphite], stock: 3, blurb: "45 MP for portraits and product shots.", details: ["45 MP sensor", "In-body stabilisation", "Dual card slots", "Battery grip ready"] },
  { id: "c3", name: "Pocket Snap", category: "Cameras", price: 18500, rating: 4.3, reviews: 402, colours: [C.cream, C.sage, C.graphite], stock: 20, blurb: "Fits a jacket pocket, shoots like a big one.", details: ["20 MP", "3× optical zoom", "USB-C charging"], isNew: true },
  { id: "c4", name: "Retro Rangefinder", category: "Cameras", price: 50000, rating: 4.7, reviews: 76, colours: [C.silver, C.graphite], stock: 0, blurb: "Manual dials and a bright optical window.", details: ["Optical viewfinder", "Manual dials", "Leather strap"] },
  { id: "w1", name: "Meridian 301", category: "Watches", price: 13000, rating: 4.5, reviews: 188, colours: [C.silver, C.gold], stock: 12, blurb: "A clean dress watch with a sapphire face.", details: ["Sapphire crystal", "5 ATM", "Swiss-style quartz"] },
  { id: "w2", name: "Daily 201", category: "Watches", price: 3000, rating: 4.1, reviews: 960, colours: [C.navy, C.forest, C.sand], stock: 40, blurb: "Simple, light, goes with everything.", details: ["Canvas strap", "3 ATM", "Two-year warranty"] },
  { id: "w3", name: "Tide Diver", category: "Watches", price: 18000, was: 21000, rating: 4.7, reviews: 143, colours: [C.navy, C.graphite], stock: 6, blurb: "200 m, rotating bezel, glowing hands.", details: ["20 ATM", "Rotating bezel", "Luminous hands"] },
  { id: "w4", name: "Atlas Chrono", category: "Watches", price: 8000, rating: 4.2, reviews: 254, colours: [C.silver, C.rose], stock: 15, blurb: "Three dials, one tidy face.", details: ["Chronograph", "Steel bracelet", "10 ATM"], isNew: true },
  { id: "s1", name: "Oxford Everyday", category: "Shirts", price: 1500, rating: 4.4, reviews: 512, colours: [C.white, C.sky, C.rose], sizes: SHIRT, stock: 50, blurb: "Soft cotton oxford that gets better with washing.", details: ["100% cotton", "Button-down collar", "Regular fit"] },
  { id: "s2", name: "Linen Camp", category: "Shirts", price: 1300, rating: 4.3, reviews: 287, colours: [C.sand, C.sage, C.white], sizes: SHIRT, stock: 30, blurb: "Breezy linen with a relaxed camp collar.", details: ["100% linen", "Camp collar", "Relaxed fit"] },
  { id: "s3", name: "Flannel Check", category: "Shirts", price: 1000, was: 1400, rating: 4.2, reviews: 198, colours: [C.clay, C.forest, C.navy], sizes: SHIRT, stock: 22, blurb: "Brushed flannel for cool mornings.", details: ["Brushed cotton", "Chest pocket", "Regular fit"] },
  { id: "s4", name: "Poplin Band", category: "Shirts", price: 800, rating: 4.0, reviews: 143, colours: [C.white, C.navy], sizes: SHIRT, stock: 35, blurb: "Crisp poplin with a band collar.", details: ["Cotton poplin", "Band collar", "Slim fit"] },
  { id: "b1", name: "Commuter Backpack", category: "Bags", price: 4200, rating: 4.6, reviews: 321, colours: [C.graphite, C.sage, C.clay], stock: 18, blurb: "Fits a 16\" laptop and a day's worth of things.", details: ["22 L", "Laptop sleeve", "Water-resistant"], isNew: true },
  { id: "b2", name: "Weekend Duffel", category: "Bags", price: 5600, rating: 4.5, reviews: 98, colours: [C.sand, C.navy], stock: 9, blurb: "Carry-on size for two-night trips.", details: ["38 L", "Shoe pocket", "Shoulder strap"] },
  { id: "b3", name: "Market Tote", category: "Bags", price: 1200, rating: 4.4, reviews: 410, colours: [C.cream, C.forest, C.rose], stock: 60, blurb: "Heavy canvas tote with an inside pocket.", details: ["Canvas", "Inner pocket", "Long handles"] },
  { id: "b4", name: "Sling Mini", category: "Bags", price: 1900, was: 2400, rating: 4.1, reviews: 176, colours: [C.graphite, C.clay], stock: 14, blurb: "Phone, keys, wallet. That's it.", details: ["2 L", "Adjustable strap", "Hidden pocket"] },
  { id: "h1", name: "Quiet Over-Ear", category: "Headphones", price: 14900, rating: 4.7, reviews: 640, colours: [C.graphite, C.sand, C.sky], stock: 25, blurb: "Noise cancelling for flights and open offices.", details: ["Active noise cancelling", "30 h battery", "USB-C"] },
  { id: "h2", name: "Loop Buds", category: "Headphones", price: 5900, rating: 4.3, reviews: 1220, colours: [C.white, C.graphite], stock: 70, blurb: "Small buds, big sound, wireless case.", details: ["8 h + 24 h case", "IPX4", "Wireless charging"], isNew: true },
  { id: "h3", name: "Studio Monitor", category: "Headphones", price: 9900, rating: 4.6, reviews: 211, colours: [C.graphite], stock: 4, blurb: "Flat, honest sound for mixing.", details: ["Wired", "Detachable cable", "Velour pads"] },
  { id: "h4", name: "Kids Volume-Safe", category: "Headphones", price: 2200, rating: 4.2, reviews: 154, colours: [C.rose, C.sky, C.sage], stock: 30, blurb: "Capped at 85 dB, tough hinges.", details: ["85 dB limit", "Foldable", "Share port"] },
  { id: "n1", name: "Court Low", category: "Sneakers", price: 4800, rating: 4.5, reviews: 530, colours: [C.white, C.cream], sizes: SHOE, stock: 28, blurb: "Clean leather low-tops for everyday wear.", details: ["Leather upper", "Rubber cup sole", "Cushioned insole"] },
  { id: "n2", name: "Trail Runner", category: "Sneakers", price: 6900, was: 7900, rating: 4.6, reviews: 302, colours: [C.forest, C.clay, C.graphite], sizes: SHOE, stock: 11, blurb: "Grippy, light, happy on dirt.", details: ["Lugged outsole", "Rock plate", "Breathable mesh"] },
  { id: "n3", name: "Canvas Classic", category: "Sneakers", price: 2500, rating: 4.2, reviews: 870, colours: [C.navy, C.white, C.rose], sizes: SHOE, stock: 45, blurb: "The canvas shoe everyone owns, done well.", details: ["Cotton canvas", "Vulcanised sole", "Washable"] },
  { id: "n4", name: "Cloud Knit", category: "Sneakers", price: 5600, rating: 4.4, reviews: 260, colours: [C.sky, C.graphite, C.sand], sizes: SHOE, stock: 16, blurb: "Sock-like knit with a soft foam sole.", details: ["Knit upper", "Foam midsole", "Slip-on"], isNew: true },
];

export const byId = new Map(PRODUCTS.map((p) => [p.id, p]));
export const inr = (n: number) => n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const PROMOS: Record<string, number> = { WELCOME10: 0.1, AISLE20: 0.2 };
export const shippingFor = (subtotal: number, speed: "standard" | "express") =>
  speed === "express" ? 199 : subtotal >= 2999 ? 0 : 99;
export const GST = 0.18;
