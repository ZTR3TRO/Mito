// Dibujos de la comida de la Casa (datos puros: SVG en un viewBox 64 × 64, con el contorno de color de la app).
// La clave es el id del alimento en content/food.js. Se usan en la Tienda, en la charola y mientras Mito come.

export const FOOD_ART = {
  'f-apple': `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 21c-4-4-14-5-18 3s-2 21 4 27 9 6 14 4c5 2 8 2 14-4s8-19 4-27-14-7-18-3z" fill="#ff6b7d" stroke="#d6435a" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M32 22c0-5 1-8 4-11" stroke="#8b5a3c" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M35 15c4-6 11-6 14-4-2 6-9 8-14 4z" fill="#4fd18b" stroke="#22a466" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="21" cy="31" rx="3" ry="6.5" fill="#fff" opacity=".5" transform="rotate(18 21 31)"/></svg>`,
  'f-carrot': `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M45 17q-4-9 0-13M47 19q8-6 13-4M44 18q-8-5-9-11" stroke="#22a466" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M40 17q10-2 11 9L21 55q-6 5-10 1t1-10z" fill="#ff9a3c" stroke="#e06a10" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M31 31l5 3M24 40l4 3M38 24l4 2" stroke="#e06a10" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M38 22q-6 6-12 14" stroke="#fff" stroke-width="2" opacity=".45" fill="none" stroke-linecap="round"/></svg>`,
  'f-banana': `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M14 15q-6 25 12 35t30-5q-4-3-9-1-14 5-23-5t-6-23q-2-3-4-1z" fill="#ffd23c" stroke="#e0a516" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M13 15l1-7 4 1-1 7z" fill="#8b5a3c" stroke="#6b4228" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M19 22q1 15 13 22" stroke="#fff" stroke-width="2.2" opacity=".55" fill="none" stroke-linecap="round"/></svg>`,
  'f-yogurt': `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M16 25h32l-4 27q-1 4-5 4H25q-4 0-5-4z" fill="#fff" stroke="#b98af6" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M18 34h28l-1.2 9H19.2z" fill="#e4d4ff"/>
    <path d="M22 20q2-8 10-8t10 8z" fill="#fff" stroke="#b98af6" stroke-width="2" stroke-linejoin="round"/>
    <rect x="13" y="19" width="38" height="7" rx="3.5" fill="#f2e8ff" stroke="#b98af6" stroke-width="2.4"/>
    <circle cx="37" cy="13" r="3.6" fill="#5b6ee8" stroke="#3a4bc0" stroke-width="1.4"/><circle cx="36" cy="12" r="1" fill="#fff" opacity=".7"/></svg>`,
  'f-egg': `<svg viewBox="0 0 64 64" aria-hidden="true">
    <ellipse cx="32" cy="35" rx="18" ry="22" fill="#fffaf0" stroke="#e0b860" stroke-width="2.4"/>
    <circle cx="32" cy="38" r="10" fill="#ffc93c" stroke="#e0a516" stroke-width="2"/>
    <circle cx="28.5" cy="34.5" r="2.8" fill="#fff" opacity=".6"/>
    <path d="M20 22q4-6 9-7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
  'f-oats': `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M8 33h48q-2 20-24 22Q10 53 8 33z" fill="#ff8fc0" stroke="#e8619c" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M14 42q8 7 18 7" stroke="#fff" stroke-width="2" opacity=".5" fill="none" stroke-linecap="round"/>
    <path d="M10 33q4-9 22-9t22 9z" fill="#f3dcae" stroke="#cfa564" stroke-width="2" stroke-linejoin="round"/>
    <g fill="#e7c386"><ellipse cx="17" cy="30" rx="2" ry="1.2"/><ellipse cx="46" cy="30" rx="2" ry="1.2"/><ellipse cx="40" cy="31.5" rx="1.6" ry="1"/></g>
    <circle cx="24" cy="26" r="4.4" fill="#ff5d73" stroke="#d6435a" stroke-width="1.5"/><circle cx="23" cy="25" r="1" fill="#fff" opacity=".7"/>
    <circle cx="32" cy="23.5" r="3.8" fill="#fff3b0" stroke="#e0c25a" stroke-width="1.4"/>
    <circle cx="39.5" cy="26" r="3.2" fill="#5b6ee8" stroke="#3a4bc0" stroke-width="1.3"/></svg>`,
  'f-rice': `<svg viewBox="0 0 64 64" aria-hidden="true">
    <ellipse cx="32" cy="40" rx="28" ry="14" fill="#fff" stroke="#c9b8e8" stroke-width="2.4"/>
    <ellipse cx="32" cy="38.5" rx="20" ry="8.5" fill="#f4eefc"/>
    <path d="M11 39q1-14 15-14t13 11q-7 7-28 3z" fill="#fff" stroke="#d6cde4" stroke-width="1.8" stroke-linejoin="round"/>
    <g fill="#e9e3f1"><ellipse cx="20" cy="31" rx="2" ry=".9"/><ellipse cx="27" cy="29" rx="2" ry=".9" transform="rotate(25 27 29)"/><ellipse cx="17" cy="36" rx="2" ry=".9" transform="rotate(-20 17 36)"/></g>
    <path d="M31 39q2-11 12-11t12 10q-11 6-24 1z" fill="#8a4a32" stroke="#5e2e1e" stroke-width="1.8" stroke-linejoin="round"/>
    <g fill="#b06a4c"><ellipse cx="39" cy="33" rx="2.4" ry="1.4"/><ellipse cx="46" cy="33.5" rx="2.4" ry="1.4" transform="rotate(20 46 33.5)"/><ellipse cx="43" cy="37" rx="2.4" ry="1.4"/></g></svg>`,
  'f-plate': `<svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="34" r="25" fill="#fff" stroke="#c9b8e8" stroke-width="2.4"/>
    <circle cx="32" cy="34" r="18.5" fill="#f4eefc"/>
    <path d="M32 34V15.5M32 34l16 9.3M32 34 16 43.3" stroke="#c9b8e8" stroke-width="1.6"/>
    <g transform="translate(22 27)"><circle r="4" fill="#4fd18b" stroke="#22a466" stroke-width="1.4"/><circle cx="4" cy="2" r="3.2" fill="#4fd18b" stroke="#22a466" stroke-width="1.4"/><path d="M1 3l1 6" stroke="#22a466" stroke-width="2.2" stroke-linecap="round"/></g>
    <circle cx="25" cy="38" r="3" fill="#ff6b7d" stroke="#d6435a" stroke-width="1.3"/>
    <path d="M36 22q8 0 10 9-5 2-10 0z" fill="#ffd98a" stroke="#e0a516" stroke-width="1.5" stroke-linejoin="round"/>
    <ellipse cx="32" cy="45" rx="6" ry="4.2" fill="#fffaf0" stroke="#e0b860" stroke-width="1.4"/><circle cx="32" cy="45.3" r="2.4" fill="#ffc93c"/>
    <g fill="#8a4a32"><ellipse cx="40" cy="41" rx="2.2" ry="1.3"/><ellipse cx="43.5" cy="38.5" rx="2.2" ry="1.3" transform="rotate(25 43.5 38.5)"/></g></svg>`,
};
