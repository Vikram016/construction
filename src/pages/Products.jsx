/**
 * Products.jsx — BuildMart Supplier Page
 * Full price list + quantity selectors + add to cart + tractor wizard
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SITE, GEO } from "../config/seoConfig";
import { CONTACT_CONFIG } from "../config/contactConfig";
import { useCart } from "../context/CartContext";

const wa = (msg) => {
  const n = CONTACT_CONFIG.whatsapp || SITE.whatsapp;
  window.open(
    "https://wa.me/" + n + "?text=" + encodeURIComponent(msg),
    "_blank",
  );
};
const call = () => {
  window.location.href =
    "tel:" + (CONTACT_CONFIG.phoneRaw || CONTACT_CONFIG.whatsapp);
};

/* ── Icons ── */
const WAIcon = ({ cls }) => (
  <svg className={cls || "w-4 h-4"} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);
const CallIcon = ({ cls }) => (
  <svg
    className={cls || "w-4 h-4"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);
const CartIcon = ({ cls }) => (
  <svg
    className={cls || "w-4 h-4"}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

/* ── Data ── */
const CATEGORIES = [
  {
    id: "jelly",
    emoji: "🪨",
    title: "Jelly / Chips",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  {
    id: "sand",
    emoji: "🏖",
    title: "Sand",
    img: "https://images.unsplash.com/photo-1544714042-2a1caefc77ce?w=400&h=300&fit=crop",
  },
  {
    id: "bricks",
    emoji: "🧱",
    title: "Red Bricks",
    img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
  },
  {
    id: "blocks",
    emoji: "🏗",
    title: "Concrete Blocks",
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
  },
  {
    id: "weightless",
    emoji: "⬜",
    title: "Weightless Blocks",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  },
  {
    id: "tractor",
    emoji: "🚜",
    title: "Tractor Loads",
    img: "https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?w=400&h=300&fit=crop",
  },
  {
    id: "cement",
    emoji: "🏢",
    title: "Cement",
    img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
  },
];

const PRICE_SECTIONS = [
  {
    id: "jelly",
    title: "Jelly / Chips",
    emoji: "🪨",
    unit: "per load",
    category: "Jelly",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=300&fit=crop",
    items: [
      {
        id: "jelly-12",
        name: "12mm Patani Jelly",
        price: 100,
        usedFor: "Fine concrete & plastering mix",
        img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
      },
      {
        id: "jelly-20",
        name: "20mm Baby Jelly",
        price: 100,
        usedFor: "Concrete aggregate for slabs & columns",
        img: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=200&h=200&fit=crop",
      },
      {
        id: "jelly-40",
        name: "40mm Mota Jelly",
        price: 100,
        usedFor: "Mass concrete & foundations",
        img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&sat=-50",
      },
    ],
  },
  {
    id: "sand",
    title: "Sand",
    emoji: "🏖",
    unit: "per load",
    category: "Sand",
    img: "https://images.unsplash.com/photo-1544714042-2a1caefc77ce?w=800&h=300&fit=crop",
    items: [
      {
        id: "sand-msand",
        name: "M-Sand",
        price: 100,
        usedFor: "Used for concrete & RCC work",
        img: "https://images.unsplash.com/photo-1544714042-2a1caefc77ce?w=200&h=200&fit=crop",
      },
      {
        id: "sand-river",
        name: "River Sand",
        price: 150,
        usedFor: "Used for plastering & masonry",
        img: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=200&h=200&fit=crop",
      },
      {
        id: "sand-psand",
        name: "P-Sand",
        price: 180,
        usedFor: "Smooth wall plastering finish",
        img: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=200&h=200&fit=crop",
      },
      {
        id: "sand-cblack",
        name: "Cinder Black",
        price: 120,
        usedFor: "Filling, levelling & sub-base",
        img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop",
      },
      {
        id: "sand-cwhite",
        name: "Cinder White",
        price: 100,
        usedFor: "Sub-base & backfilling",
        img: "https://images.unsplash.com/photo-1499336315816-097655dcfbda?w=200&h=200&fit=crop",
      },
    ],
  },
  {
    id: "bricks",
    title: "Red Bricks",
    emoji: "🧱",
    unit: "per brick",
    category: "Bricks",
    img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=300&fit=crop",
    items: [
      {
        id: "brick-mtb",
        name: "Normal MTB Brick",
        price: 10,
        usedFor: "Standard wall construction & masonry work",
        img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&h=200&fit=crop",
      },
      {
        id: "brick-wirecut",
        name: "Wirecut Brick",
        price: 13,
        usedFor: "Load-bearing walls, premium finish",
        img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=200&fit=crop",
      },
    ],
  },
  {
    id: "blocks",
    title: "Concrete / Hollow Blocks",
    emoji: "🏗",
    unit: "per block",
    category: "Concrete Blocks",
    img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=300&fit=crop",
    items: [
      {
        id: "block-4",
        name: '4" Hollow Block',
        price: 32,
        usedFor: "Partition walls & non-load-bearing dividers",
        img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200&h=200&fit=crop&crop=center",
      },
      {
        id: "block-6",
        name: '6" Hollow Block',
        price: 42,
        usedFor: "Standard residential & commercial walls",
        img: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=200&h=200&fit=crop",
      },
      {
        id: "block-8",
        name: '8" Hollow Block',
        price: 55,
        usedFor: "Load-bearing & compound boundary walls",
        img: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=200&h=200&fit=crop",
      },
    ],
  },
  {
    id: "weightless",
    title: "Weightless / AAC Blocks",
    emoji: "⬜",
    unit: "per block",
    category: "Weightless Blocks",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=300&fit=crop",
    items: [
      {
        id: "aac-4",
        name: '4" Weightless Block',
        price: 60,
        usedFor: "Fast build, thermal insulation, lightweight",
        img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop",
      },
      {
        id: "aac-6",
        name: '6" Weightless Block',
        price: 80,
        usedFor: "Residential & commercial walls, fire-resistant",
        img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop&crop=top",
      },
      {
        id: "aac-8",
        name: '8" Weightless Block',
        price: 105,
        usedFor: "Max insulation, strong walls, minimum dead load",
        img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop&crop=bottom",
      },
    ],
  },
  {
    id: "cement",
    title: "Cement",
    emoji: "🏢",
    unit: "per 50 kg bag",
    category: "Cement",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=300&fit=crop&hue=200",
    items: [
      {
        id: "cem-ultra",
        name: "UltraTech Cement",
        price: 380,
        usedFor: "India's #1 brand — high-strength RCC & structural",
        img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop",
      },
      {
        id: "cem-birla",
        name: "Birla Super 53",
        price: 430,
        usedFor: "OPC 53 grade — premium high-strength concrete",
        img: "https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?w=200&h=200&fit=crop",
      },
      {
        id: "cem-ramco",
        name: "Ramco Cement",
        price: 450,
        usedFor: "Trusted South India brand, consistent quality",
        img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop&crop=center",
      },
      {
        id: "cem-kart",
        name: "Karthika Cement",
        price: 400,
        usedFor: "Reliable all-purpose cement for every project",
        img: "https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=200&h=200&fit=crop",
      },
      {
        id: "cem-acc",
        name: "ACC Cement",
        price: 430,
        usedFor: "Established brand, durable performance",
        img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=200&fit=crop",
      },
    ],
  },
];

const TRACTOR_LOADS = {
  "Full Load (Savari)": { "M-Sand": 6000, "P-Sand": 7500, "River Sand": 7500 },
  "Body Level": {
    "M-Sand": 4300,
    "P-Sand": 6000,
    "River Sand": 5500,
    "Cinder Black": 6000,
    "Cinder White": 4500,
  },
  "Half Load": {
    "M-Sand": 2300,
    "P-Sand": 3200,
    "River Sand": 3000,
    "Cinder Black": 3200,
    "Cinder White": 2300,
  },
  "Quarter Load": {
    "M-Sand": 1500,
    "P-Sand": 1800,
    "River Sand": 1800,
    "Cinder Black": 2000,
    "Cinder White": 1700,
  },
};

const AREAS = [
  "Angondhalli",
  "Whitefield",
  "Hoskote",
  "KR Puram",
  "Marathahalli",
  "Koramangala",
  "HSR Layout",
  "Indiranagar",
  "Electronic City",
  "Hebbal",
];
const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop",
    alt: "Jelly aggregate supply",
  },
  {
    src: "https://images.unsplash.com/photo-1544714042-2a1caefc77ce?w=500&h=300&fit=crop",
    alt: "Sand delivery Bangalore",
  },
  {
    src: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=300&fit=crop",
    alt: "Red bricks supplier",
  },
  {
    src: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&h=300&fit=crop",
    alt: "Concrete blocks dealer",
  },
  {
    src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&h=300&fit=crop",
    alt: "Building materials delivery",
  },
  {
    src: "https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?w=500&h=300&fit=crop",
    alt: "Tractor load delivery",
  },
];

/* ── Qty stepper with manual entry ── */
const QtyStep = ({ qty, setQty }) => {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState(String(qty));

  const commit = () => {
    const n = parseInt(raw, 10);
    setQty(isNaN(n) || n < 1 ? 1 : n);
    setRaw(isNaN(n) || n < 1 ? "1" : String(n));
    setEditing(false);
  };

  return (
    <div className="inline-flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => {
          const v = Math.max(1, qty - 1);
          setQty(v);
          setRaw(String(v));
        }}
        disabled={qty <= 1}
        className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 font-bold text-lg transition-colors"
      >
        −
      </button>
      {editing ? (
        <input
          autoFocus
          type="number"
          min="1"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setRaw(String(qty));
              setEditing(false);
            }
          }}
          className="w-14 text-center font-black text-gray-900 text-sm border-x border-gray-200 bg-yellow-50 outline-none py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      ) : (
        <button
          onClick={() => {
            setRaw(String(qty));
            setEditing(true);
          }}
          title="Click to type quantity"
          className="w-14 text-center font-black text-gray-900 text-sm border-x border-gray-200 hover:bg-yellow-50 transition-colors py-1.5 cursor-text"
        >
          {qty}
        </button>
      )}
      <button
        onClick={() => {
          setQty((q) => q + 1);
          setRaw(String(qty + 1));
        }}
        className="w-9 h-9 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold text-lg transition-colors"
      >
        +
      </button>
    </div>
  );
};

/* ── Section heading ── */
const SH = ({ title, subtitle }) => (
  <div className="text-center mb-10 md:mb-14">
    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
      {title}
    </h2>
    {subtitle && (
      <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
        {subtitle}
      </p>
    )}
  </div>
);

/* ── Product card — big image, clean layout ── */
const ProductRow = ({ item, unit, category }) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const doAdd = () => {
    addToCart(
      {
        id: item.id,
        name: item.name,
        category,
        basePrice: item.price,
        unit,
        image: item.img || "",
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  const doWA = () =>
    wa(
      "Hi! I want to order " +
        qty +
        " (" +
        unit +
        ") of " +
        item.name +
        " at ₹" +
        item.price.toLocaleString("en-IN") +
        ". Total: ₹" +
        (item.price * qty).toLocaleString("en-IN") +
        ". Please confirm.",
    );

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0 items-start">
      {/* ── Image — larger, square ── */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100 shadow-sm">
        {item.img ? (
          <img
            src={item.img}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-50">
            📦
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        {/* Name + price row */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h4 className="font-bold text-gray-900 text-base leading-snug">
              {item.name}
            </h4>
            <p className="text-gray-500 text-xs mt-0.5 leading-relaxed max-w-xs">
              {item.usedFor}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-black text-gray-900 leading-none">
              ₹{item.price.toLocaleString("en-IN")}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">{unit}</p>
            {qty > 1 && (
              <p className="text-orange-600 font-bold text-xs mt-0.5">
                = ₹{(item.price * qty).toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <QtyStep qty={qty} setQty={setQty} />
          <button
            onClick={doAdd}
            className={
              "flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all " +
              (added
                ? "bg-green-500 text-white"
                : "bg-gray-900 hover:bg-gray-700 text-white")
            }
          >
            {added ? (
              <>
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Added!
              </>
            ) : (
              <>
                <CartIcon cls="w-4 h-4 flex-shrink-0" />
                Add to Cart
              </>
            )}
          </button>
          <button
            onClick={doWA}
            title="WhatsApp Order"
            className="w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center shadow-sm transition-all"
          >
            <WAIcon cls="w-4 h-4" />
          </button>
          <button
            onClick={call}
            title="Call to Order"
            className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm transition-all"
          >
            <CallIcon cls="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Tractor Wizard ── */
/* ── Tractor load visual data ── */
const LOAD_TYPES_META = [
  {
    key: "Full Load (Savari)",
    label: "Full Load",
    sublabel: "Savari — max capacity",
    /* Heaped sand/gravel on a tractor trolley */
    img: "https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?w=400&h=240&fit=crop",
    fill: "75%",
  },
  {
    key: "Body Level",
    label: "Body Level",
    sublabel: "Flush with side walls",
    /* Loaded tractor trolley level */
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=240&fit=crop",
    fill: "55%",
  },
  {
    key: "Half Load",
    label: "Half Load",
    sublabel: "~50% capacity",
    /* Construction sand partial load */
    img: "https://images.unsplash.com/photo-1544714042-2a1caefc77ce?w=400&h=240&fit=crop",
    fill: "35%",
  },
  {
    key: "Quarter Load",
    label: "Quarter Load",
    sublabel: "~25% capacity",
    /* Small amount of material */
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=240&fit=crop",
    fill: "18%",
  },
];

const TractorWizard = () => {
  const { addToCart } = useCart();
  const loadTypes = Object.keys(TRACTOR_LOADS);
  const [selLoad, setSelLoad] = useState("");
  const [selMat, setSelMat] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const materials = selLoad ? Object.keys(TRACTOR_LOADS[selLoad]) : [];
  const price = selLoad && selMat ? TRACTOR_LOADS[selLoad][selMat] : null;

  const doAdd = () => {
    if (!price) return;
    const id =
      "tractor-" +
      selLoad.replace(/\s+/g, "-").toLowerCase() +
      "-" +
      selMat.replace(/\s+/g, "-").toLowerCase();
    addToCart(
      {
        id,
        name: selMat + " (" + selLoad + ")",
        category: "Tractor Loads",
        basePrice: price,
        unit: "load",
        image: "",
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setSelLoad("");
      setSelMat("");
      setQty(1);
    }, 1800);
  };
  const doWA = () => {
    if (!price) return;
    wa(
      "Hi! I want " +
        qty +
        " " +
        selLoad +
        " of " +
        selMat +
        " at ₹" +
        price.toLocaleString("en-IN") +
        " each. Total: ₹" +
        (price * qty).toLocaleString("en-IN") +
        ". Please confirm.",
    );
  };

  return (
    <div
      id="tractor"
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 bg-gray-50/60 border-b border-gray-100">
        <span className="text-2xl">🚜</span>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-base md:text-lg">
            Tractor Loads
          </h3>
          <p className="text-gray-400 text-xs">
            Choose load type and material, then add to cart
          </p>
        </div>
        <button
          onClick={() =>
            wa("Hi! I need a tractor load delivery. Please share details.")
          }
          className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all flex-shrink-0"
        >
          <WAIcon cls="w-3 h-3" /> Request
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1 — visual load cards */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            ① Select Load Type
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {LOAD_TYPES_META.map(({ key, label, sublabel, img, fill }) => (
              <button
                key={key}
                onClick={() => {
                  setSelLoad(key);
                  setSelMat("");
                }}
                className={
                  "group relative rounded-2xl border-2 overflow-hidden transition-all duration-200 text-left " +
                  (selLoad === key
                    ? "border-orange-500 ring-2 ring-orange-200 shadow-md"
                    : "border-gray-200 hover:border-orange-300 hover:shadow-sm bg-white")
                }
              >
                {/* Image */}
                <div className="relative h-28 sm:h-32 overflow-hidden bg-amber-50">
                  <img
                    src={img}
                    alt={label + " tractor load"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Fill level overlay */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-amber-600/30"
                    style={{ height: fill }}
                  />
                  {/* Selected tick */}
                  {selLoad === key && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Label */}
                <div
                  className={
                    "px-3 py-2.5 " +
                    (selLoad === key ? "bg-orange-50" : "bg-white")
                  }
                >
                  <p
                    className={
                      "font-black text-sm leading-tight " +
                      (selLoad === key ? "text-orange-700" : "text-gray-900")
                    }
                  >
                    {label}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">{sublabel}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 */}
        {selLoad && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              ② Select Material
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {materials.map((mat) => (
                <button
                  key={mat}
                  onClick={() => setSelMat(mat)}
                  className={
                    "py-3 px-3 rounded-xl border-2 text-sm font-bold text-left transition-all " +
                    (selMat === mat
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-700 hover:border-orange-300 bg-white")
                  }
                >
                  <span className="block text-xs font-semibold">{mat}</span>
                  <span
                    className={
                      "block text-sm font-black mt-0.5 " +
                      (selMat === mat ? "text-orange-600" : "text-gray-900")
                    }
                  >
                    ₹{TRACTOR_LOADS[selLoad][mat].toLocaleString("en-IN")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {selLoad && selMat && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              ③ Quantity & Order
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <QtyStep qty={qty} setQty={setQty} />
                <div>
                  <p className="text-2xl font-black text-gray-900">
                    ₹{(price * qty).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{price.toLocaleString("en-IN")} × {qty} load
                    {qty > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={doAdd}
                  disabled={added}
                  className={
                    "flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all " +
                    (added
                      ? "bg-green-500 text-white"
                      : "bg-gray-900 hover:bg-gray-700 text-white")
                  }
                >
                  {added ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Added!
                    </>
                  ) : (
                    <>
                      <CartIcon cls="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={doWA}
                  className="flex items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all"
                >
                  <WAIcon cls="w-4 h-4" /> WA
                </button>
                <button
                  onClick={call}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all"
                >
                  <CallIcon cls="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick ref table when nothing selected */}
        {!selLoad && (
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Quick Price Reference
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {loadTypes.map((lt) => (
                <div
                  key={lt}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-orange-200 transition-all cursor-pointer"
                  onClick={() => setSelLoad(lt)}
                >
                  <p className="text-xs font-bold text-orange-600 mb-2">{lt}</p>
                  {Object.entries(TRACTOR_LOADS[lt]).map(([mat, p]) => (
                    <div
                      key={mat}
                      className="flex justify-between items-center py-0.5"
                    >
                      <span className="text-xs text-gray-600">{mat}</span>
                      <span className="text-xs font-black text-gray-900">
                        ₹{p.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ════ MAIN ═════════════════════════════════════════════════════════════════ */
const Products = () => {
  const { cartCount } = useCart();

  return (
    <>
      <Helmet>
        <title>
          Building Materials Supplier Bangalore — M-Sand, Bricks, Blocks, Cement
          | BuildMart
        </title>
        <meta
          name="description"
          content="Trusted building materials supplier in Bangalore. M-Sand, River Sand, Red Bricks, Concrete Blocks, Weightless Blocks, Tractor Loads, Cement. Fast delivery to Angondhalli, Whitefield, Hoskote, KR Puram, Marathahalli. Order online, WhatsApp or call."
        />
        <link rel="canonical" href={SITE.url + "/products"} />
      </Helmet>

      <div className="bg-white">
        {/* ── HERO ── */}
        <section className="relative min-h-[480px] md:min-h-[580px] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1400&h=700&fit=crop"
              alt="Building materials supplier Bangalore"
              loading="eager"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/92 via-gray-900/70 to-gray-900/25" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                Trusted Supplier · {GEO.city}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                Reliable Building
                <br />
                <span className="text-orange-400">Materials Supplier</span>
              </h1>
              <p className="text-gray-300 text-base md:text-lg mb-2 font-medium">
                M-Sand · River Sand · Red Bricks · Concrete Blocks · Cement
              </p>
              <p className="text-gray-400 text-sm mb-8">
                Angondhalli · Whitefield · Hoskote · KR Puram · Marathahalli
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    wa(
                      "Hi! Please share your complete price list for building materials in Bangalore.",
                    )
                  }
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Get Price List
                </button>
                <button
                  onClick={() =>
                    wa("Hi! I want to place a building materials order.")
                  }
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg text-sm"
                >
                  <WAIcon cls="w-4 h-4" /> WhatsApp Order
                </button>
                {cartCount > 0 && (
                  <Link
                    to="/cart"
                    className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 font-bold px-6 py-3 rounded-xl transition-all shadow-lg text-sm"
                  >
                    <CartIcon cls="w-4 h-4" /> Cart ({cartCount})
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST ── */}
        <section className="bg-gray-50 border-y border-gray-100 py-10 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  icon: "✅",
                  title: "Quality Checked",
                  sub: "Every batch verified",
                },
                {
                  icon: "⚖️",
                  title: "Accurate Measurement",
                  sub: "Honest load weights",
                },
                {
                  icon: "🚚",
                  title: "On-Time Delivery",
                  sub: "24–48 hours to site",
                },
                {
                  icon: "💰",
                  title: "Best Market Price",
                  sub: "Transparent pricing",
                },
              ].map((b, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100"
                >
                  <div className="text-3xl mb-2">{b.icon}</div>
                  <p className="font-bold text-gray-900 text-sm">{b.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SH
              title="Our Product Categories"
              subtitle="Everything you need — sourced directly and delivered to your site"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat.id}
                  href={"#" + cat.id}
                  className="group relative overflow-hidden rounded-2xl aspect-square shadow-sm hover:shadow-xl transition-all duration-300 block"
                >
                  <img
                    src={cat.img}
                    alt={cat.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-2 left-2 bg-white/90 w-8 h-8 rounded-full flex items-center justify-center text-base shadow-sm">
                    {cat.emoji}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white font-bold text-xs leading-tight">
                      {cat.title}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICE LIST ── */}
        <section id="price-list" className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SH
              title="Current Price List"
              subtitle="Select quantity and add to cart, or order directly via WhatsApp or Call"
            />

            <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
              {PRICE_SECTIONS.map((sec) => (
                <div
                  key={sec.id}
                  id={sec.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* ── Card header with banner image ── */}
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={sec.img}
                      alt={sec.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-between px-5">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl drop-shadow-lg">
                          {sec.emoji}
                        </span>
                        <div>
                          <h3 className="font-black text-white text-lg leading-tight drop-shadow">
                            {sec.title}
                          </h3>
                          <p className="text-white/70 text-xs font-medium">
                            {sec.unit}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          wa(
                            "Hi! I want to order " +
                              sec.title +
                              ". Please share availability and pricing.",
                          )
                        }
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-full transition-all shadow flex-shrink-0"
                      >
                        <WAIcon cls="w-3 h-3" /> Order
                      </button>
                    </div>
                  </div>

                  {/* ── Product list ── */}
                  <div className="px-5 pb-3 divide-y divide-gray-50">
                    {sec.items.map((item) => (
                      <ProductRow
                        key={item.id}
                        item={item}
                        unit={sec.unit}
                        category={sec.category}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Tractor Wizard — spans both columns */}
              <div className="md:col-span-2">
                <TractorWizard />
              </div>
            </div>

            <p className="text-center text-gray-400 text-xs mt-6 italic">
              * Prices are indicative. Contact us for latest rates before
              ordering.
            </p>
          </div>
        </section>

        {/* ── BULK CTA ── */}
        <section className="py-16 md:py-20 bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">
              For Contractors &amp; Builders
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
              Bulk Supply &amp; Long-Term Contracts
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-8">
              Special pricing for bulk orders. Call or WhatsApp to discuss
              requirements.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() =>
                  wa("Hi! I need a bulk quotation for my construction project.")
                }
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg text-sm"
              >
                <WAIcon cls="w-4 h-4" /> Request Bulk Quote
              </button>
              <button
                onClick={call}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 font-bold px-7 py-3.5 rounded-xl transition-all text-sm"
              >
                <CallIcon cls="w-4 h-4" /> Call Sales Team
              </button>
            </div>
          </div>
        </section>

        {/* ── GALLERY ── */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SH
              title="Delivery in Action"
              subtitle="Real deliveries across Bangalore — reliable, on time, every time"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {GALLERY.map((img, i) => (
                <div
                  key={i}
                  className={
                    "overflow-hidden rounded-2xl shadow-sm" +
                    (i === 0 ? " row-span-2" : "")
                  }
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    style={{ minHeight: i === 0 ? "320px" : "150px" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AREAS ── */}
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SH
              title="Areas We Serve"
              subtitle="Fast delivery to construction sites across Bangalore and surrounding areas"
            />
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {AREAS.map((area, i) => (
                <button
                  key={i}
                  onClick={() =>
                    wa(
                      "Hi! I need building materials delivery in " +
                        area +
                        ". Please share pricing.",
                    )
                  }
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 hover:text-orange-700 font-semibold text-sm px-4 py-2.5 rounded-full transition-all shadow-sm"
                >
                  <svg
                    className="w-3.5 h-3.5 text-orange-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {area}
                </button>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm h-52 md:h-64 flex items-center justify-center">
              <a
                href="https://maps.google.com/?q=Peenya+Industrial+Area+Bangalore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center px-6"
              >
                <div className="text-5xl mb-3">🗺️</div>
                <p className="font-bold text-gray-700 mb-1">
                  BuildMart — Peenya, Bangalore
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  12 Industrial Layout, Peenya Industrial Area
                </p>
                <span className="inline-flex items-center gap-1.5 bg-orange-500 text-white font-bold text-sm px-5 py-2.5 rounded-full">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  Open in Google Maps
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* ── STRONG CTA ── */}
        <section className="py-16 md:py-20 bg-orange-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3">
              Need Materials Today?
            </h2>
            <p className="text-orange-100 text-base md:text-lg mb-8">
              Call or WhatsApp for fast delivery anywhere in Bangalore
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={call}
                className="inline-flex items-center gap-2.5 bg-white text-orange-600 hover:bg-gray-50 font-black px-8 py-4 rounded-xl transition-all shadow-lg text-sm md:text-base"
              >
                <CallIcon cls="w-5 h-5" /> Call Now
              </button>
              <button
                onClick={() =>
                  wa(
                    "Hi! I need building materials urgently in Bangalore. Please help.",
                  )
                }
                className="inline-flex items-center gap-2.5 bg-green-500 hover:bg-green-600 text-white font-black px-8 py-4 rounded-xl transition-all shadow-lg text-sm md:text-base"
              >
                <WAIcon cls="w-5 h-5" /> WhatsApp Order
              </button>
              {cartCount > 0 && (
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2.5 bg-white/20 border-2 border-white text-white hover:bg-white/30 font-black px-8 py-4 rounded-xl transition-all shadow-lg text-sm md:text-base"
                >
                  <CartIcon cls="w-5 h-5" /> View Cart ({cartCount})
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── MOBILE STICKY BAR ── */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-2xl">
          <div className="grid grid-cols-3">
            <button
              onClick={call}
              className="flex flex-col items-center justify-center gap-0.5 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <CallIcon cls="w-5 h-5" />
              <span className="text-xs font-semibold">Call</span>
            </button>
            <button
              onClick={() => wa("Hi! I want to order building materials.")}
              className="flex flex-col items-center justify-center gap-0.5 py-3 bg-green-500 text-white"
            >
              <WAIcon cls="w-5 h-5" />
              <span className="text-xs font-bold">WhatsApp</span>
            </button>
            <Link
              to="/cart"
              className="flex flex-col items-center justify-center gap-0.5 py-3 text-orange-500 hover:bg-orange-50 transition-colors relative"
            >
              <CartIcon cls="w-5 h-5" />
              <span className="text-xs font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-3 bg-red-500 text-white text-xs font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="h-16 md:hidden" />
      </div>
    </>
  );
};

export default Products;
