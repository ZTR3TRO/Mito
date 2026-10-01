const W = (id,name,cost,k)=>({id,name,cost,k});
const A = (id,name,cost,k,swatch)=>({id,name,cost,k,swatch});
const H = (id,name,k,swatch)=>({id,name,k,swatch,cost:500,seasonal:true});

// Ventana anual, según la hora local del dispositivo: [30 septiembre, 1 noviembre).
export function isSeasonalOpen(date = new Date()){
  return (date.getMonth() === 8 && date.getDate() === 30) || date.getMonth() === 9;
}

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
      // Pieles animadas (fx = efecto definido en mitoSkins.js)
      { id:'c-aurora', name:'Aurora', icon:'🌌', cost:120, fx:'aurora', swatch:'#4cc9f0', defaults:{ body:'#34d6c0', stroke:'#0e8f9c', highlight:'#9dffe6' } },
      { id:'c-lava', name:'Lava', icon:'🌋', cost:150, fx:'lava', swatch:'#ff6a00', defaults:{ body:'#2b0f0b', stroke:'#120504', highlight:'#7a2413' } },
      { id:'c-gold', name:'Oro líquido', icon:'🥇', cost:180, fx:'gold', swatch:'#ffc93c', defaults:{ body:'#ffc93c', stroke:'#c98a0a', highlight:'#fff3a6' } },
      { id:'c-prism', name:'Prisma', icon:'🔮', cost:200, fx:'prism', swatch:'#b8a0ff', defaults:{ body:'#d9ecff', stroke:'#8fa8ff', highlight:'#ffffff' } },
      { id:'c-dark', name:'Materia oscura', icon:'🕳️', cost:300, fx:'dark', swatch:'#1a1233', defaults:{ body:'#1a1233', stroke:'#0a0616', highlight:'#4a2b8c' } },
    ],
  },
  { id:'ropa', label:'Ropa', items:[
    W('r-none','Sin ropa',0), W('r-gafas','Gafas',50,'glasses'), W('r-bata','Bata',70,'coat'), W('r-delantal','Delantal',55,'apron'),
    W('r-sueter','Suéter',60,'sweater'), W('r-mono','Moño',40,'bow'), W('r-bufanda','Bufanda',60,'scarf'), W('r-corbata','Corbata',50,'tie'),
    W('r-sudadera','Sudadera',65,'hoodie'), W('r-capa','Capa',90,'cape'), W('r-armadura','Armadura',120,'armor'),
    H('r-pumpkin','Disfraz de calabaza','pumpkincos'), H('r-vampire','Capa de vampiro','vampcape') ] },
  { id:'accesorio', label:'Accesorios', items:[
    W('ac-none','Ninguno',0), W('ac-phone','Teléfono',55,'phone'), W('ac-headphones','Audífonos',65,'headphones'), W('ac-backpack','Mochila',75,'bag'),
    W('ac-libro','Libro',55,'book'), W('ac-estetoscopio','Estetoscopio',70,'stetho'), W('ac-alas','Alas',130,'wings'), W('ac-carro','Carro',200,'car'),
    H('ac-candy','Cubeta de dulces','candy'), H('ac-fangs','Colmillos','fangs') ] },
  { id:'sombrero', label:'Sombreros', items:[
    W('s-none','Ninguno',0), W('ac-crown','Corona',80,'crown'), W('s-birrete','Birrete',85,'grad'), W('s-chef','Gorro de chef',65,'chef'), W('s-mago','Sombrero de mago',100,'wizard'),
    H('s-pumpkin','Sombrero calabaza','pumpkinhat'), H('s-vampire','Cabello de vampiro','vamphair') ] },
  { id:'aura', label:'Aura', items:[
    W('a-none','Sin aura',0),
    A('a-mint','Menta',40,'mint','radial-gradient(circle,#c9ffe9,#16c98d 60%,#0b7d57)'),
    A('a-gold','Dorada',70,'gold','radial-gradient(circle,#fff2a8,#ffc93c 60%,#c98a0a)'),
    A('a-rainbow','Arcoíris',110,'rainbow','conic-gradient(#ff5da2,#ffc93c,#16c98d,#5db2ff,#b98af6,#ff5da2)'),
    A('a-sakura','Sakura',100,'sakura','radial-gradient(circle at 40% 35%,#fff,#ffb3d1 50%,#ff7fb2)'),
    A('a-ice','Escarcha',120,'ice','radial-gradient(circle at 40% 35%,#fff,#a8e4ff 45%,#4b8dff)'),
    A('a-fire','Fuego',130,'fire','radial-gradient(circle at 50% 70%,#fff3a6,#ffb02e 40%,#ff4a1c 80%)'),
    A('a-storm','Rayo',140,'storm','radial-gradient(circle,#fff7a8,#ffd21e 35%,#4650dc 85%)'),
    A('a-cosmic','Cósmica',150,'cosmic','radial-gradient(circle at 35% 35%,#c8b8ff,#7c5cff 45%,#ff5cbe 90%)'),
    H('a-haunt','Embrujada','haunt','radial-gradient(circle,#ffd27a,#ff8a1c 50%,#b36bff)') ] },
  { id:'pet', label:'Mascota compañera', items:[
    W('p-none','Ninguna',0), W('p-chick','Pollito',70,'chick'), W('p-turtle','Tortuguita',90,'turtle'), W('p-fox','Zorrito',110,'fox'),
    W('p-ufo','Platillo',220,'ufo'), W('p-dragon','Dragón',250,'dragon'), W('p-unicorn','Unicornio',280,'unicorn'), W('p-nutria','Nutria',300,'otter'),
    H('p-pumpkin','Calabacita','pumpkin'), H('p-bat','Murciélago','bat') ] },
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
