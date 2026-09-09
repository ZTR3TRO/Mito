export const WARDROBE = [
  {
    id: 'color', label: 'Colores de piel', key: 'color',
    items: [
      { id:'c-mint', name:'Menta', icon:'🌿', cost:0, swatch:'#1fd79a', defaults:{ body:'#1fd79a', stroke:'#0da876', highlight:'#38e6ac' } },
      { id:'c-sky', name:'Cielo', icon:'🩵', cost:30, swatch:'#5db2ff', defaults:{ body:'#5db2ff', stroke:'#3a86d8', highlight:'#8ed0ff' } },
      { id:'c-strawberry', name:'Fresa', icon:'🍓', cost:30, swatch:'#ff7a9e', defaults:{ body:'#ff7a9e', stroke:'#e04e6f', highlight:'#ffb0c4' } },
      { id:'c-grape', name:'Uva', icon:'🍇', cost:45, swatch:'#a678f2', defaults:{ body:'#a678f2', stroke:'#7b4fd4', highlight:'#c8a8ff' } },
      { id:'c-sunset', name:'Atardecer', icon:'🌅', cost:45, swatch:'#ff9f5a', defaults:{ body:'#ff9f5a', stroke:'#f07a3f', highlight:'#ffc49a' } },
      { id:'c-cocoa', name:'Chocolate', icon:'🤎', cost:60, swatch:'#8a5a3b', defaults:{ body:'#8a5a3b', stroke:'#6b4127', highlight:'#b98a68' } },
    ],
  },
  {
    id: 'ropa', label: 'Ropa', key: 'ropa',
    items: [
      { id:'r-none', name:'Sin ropa', icon:'➖', cost:0 },
      { id:'r-gafas', name:'Gafas', icon:'🕶️', cost:50, overlay:'cloth-glasses' },
      { id:'r-bufanda', name:'Bufanda', icon:'🧣', cost:60, overlay:'cloth-scarf' },
      { id:'r-capa', name:'Capa', icon:'🧥', cost:90, overlay:'cloth-cape', overlayZ:'back' },
    ],
  },
  {
    id: 'accesorio', label: 'Accesorios', key: 'accesorio',
    items: [
      { id:'ac-none', name:'Ninguno', icon:'➖', cost:0 },
      { id:'ac-crown', name:'Corona', icon:'👑', cost:80, overlay:'acc-crown' },
      { id:'ac-phone', name:'Teléfono', icon:'📱', cost:55, overlay:'acc-phone' },
      { id:'ac-headphones', name:'Audífonos', icon:'🎧', cost:65, overlay:'acc-headphones' },
      { id:'ac-backpack', name:'Mochila', icon:'🎒', cost:75, overlay:'acc-backpack', overlayZ:'back' },
    ],
  },
  {
    id: 'aura', label: 'Aura', key: 'aura',
    items: [
      { id:'a-none', name:'Sin aura', icon:'➖', cost:0 },
      { id:'a-mint', name:'Menta', icon:'💚', cost:40, auraClass:'aura-mint', particleColor:'#16c98d' },
      { id:'a-gold', name:'Dorada', icon:'✨', cost:70, auraClass:'aura-gold', particleColor:'#ffc93c' },
      { id:'a-rainbow', name:'Arcoíris', icon:'🌈', cost:110, auraClass:'aura-rainbow', particleColor:'rainbow' },
    ],
  },
  {
    id: 'pet', label: 'Mascota compañera', key: 'pet',
    items: [
      { id:'p-none', name:'Ninguna', icon:'➖', cost:0 },
      { id:'p-chick', name:'Pollito', icon:'🐣', cost:70 },
      { id:'p-turtle', name:'Tortuguita', icon:'🐢', cost:90 },
      { id:'p-fox', name:'Zorrito', icon:'🦊', cost:110 },
    ],
  },
];

export function findItem(catId, itemId){
  const cat = WARDROBE.find(c=>c.id===catId);
  return cat ? cat.items.find(i=>i.id===itemId) : undefined;
}

export function findItemById(id){
  for(const cat of WARDROBE){
    const item = cat.items.find(i=>i.id===id);
    if(item) return item;
  }
  return undefined;
}

export function categoryOf(id){
  const cat = WARDROBE.find(c=>c.items.some(i=>i.id===id));
  return cat ? cat.id : undefined;
}