// Casa de Mito: frases y reacciones (datos puros).
// Reglas de las frases: cortas (≤ 34 caracteres, para que el globo quepa junto a Mito en un teléfono de 360 px)
// y cariñosas. Clave de mascota = `k` en wardrobe.js.

import { USER_NAME as Z } from './messages.js';

// Lo que dice Mito según la interacción.
//   poke: lo picaste · tickle: cosquillas · pet: caricia · grab: lo levantaste · throw: lo lanzaste
//   land: cayó tras rebotar · drop: lo bajaste con cuidado (se queda donde lo dejas) · welcome: al entrar a la Casa
export const MITO_HOUSE = {
  poke: ['¡Eh! 😳', '¡Boop! 👉', '¿Me llamabas? 👀', '¡Oye, aquí estoy!', '¡Ay! Eso hizo cosquillitas'],
  tickle: ['¡Jajaja, para, para! 🤭', '¡Jijiji, cosquillas no!', '¡Jajaja, me rindo! 😆', '¡Ahí no, jajaja!'],
  pet: ['Mmm… qué rico 🥰', 'Más, más… 💕', 'Me encanta 😌', `Te quiero, ${Z} 💖`],
  grab: ['¡Uy, me levantas! 😮', '¡Bájame con cuidado! 🙈', '¡Qué alto estoy!'],
  throw: ['¡Wiiiii! 🚀', '¡Allá voooy!', '¡Weee! ✨'],
  land: ['¡Boing! ¡Otra vez! 😄', '¡Qué divertido!', 'Uf, aterricé 😅', '¡Otra, otra! 🎉'],
  drop: ['Gracias por bajarme 😊', '¡Aquí me quedo! 😊'],
  welcome: [`¡Bienvenida a mi casa! 🏠`, `¡Hola, ${Z}! Ponte cómoda 😊`, '¡Qué bueno que viniste! 💕'],
};

// Cómo reacciona cada mascota a lo que le pasa a Mito. `act` es la animación (clase .pr-<act> en style.css):
//   hop salta · approach se acerca a Mito · wiggle se menea · flutter aletea y sube · hide se esconde
//   spin gira · glow brilla · tilt ladea la cabeza · pounce se lanza hacia donde cayó Mito
// `say` son sus frases para la caricia y el aterrizaje (habla una de cada dos veces, para no tapar a Mito).
const pet = (poke, tickle, grab, land, sayPet, sayLand) =>
  ({ act: { poke, tickle, pet: 'approach', grab, land }, say: { pet: sayPet, land: sayLand } });

export const PET_HOUSE = {
  chick: pet('tilt', 'flutter', 'hop', 'hop', ['¡Pío! Yo también quiero 🐤', 'Pío pío, qué tiernos 💛'], ['¡Pío! ¡Qué salto! 🐥', '¡Piii! ¡Otra vez! 🎉']),
  turtle: pet('hide', 'wiggle', 'hide', 'hide', ['Qué calma tan bonita 🐢', 'Despacito, así me gusta 🍃'], ['¡Uy! Me escondo 🐢', 'Muy rápido para mí 😅']),
  fox: pet('tilt', 'wiggle', 'hop', 'pounce', ['¡Yip! ¿Y a mí? 🦊', 'Yip yip, qué suave 💕'], ['¡Yip! ¡Te atrapo! 🦊', '¡Yip yip! ¡Otra! 🎉']),
  otter: pet('tilt', 'wiggle', 'hop', 'wiggle', ['¡Chii! Abrazo de nutria 🦦', 'Chii chii, qué lindo 💕'], ['¡Chii! ¡Splash! 🌊', '¡Chii chii! ¡Bravo! 👏']),
  dragon: pet('tilt', 'glow', 'flutter', 'hop', ['Grrr… qué tierno 🐉', 'Un dragón también quiere 💕'], ['¡Rooaar! ¡Qué vuelo! 🔥', '¡Grrr! ¡Otra vez! 🐉']),
  unicorn: pet('tilt', 'glow', 'hop', 'glow', ['Qué momento mágico ✨', 'Brillan de cariño 🦄'], ['¡Aterrizaje mágico! 🌈', '¡Qué brillo de salto! ✨']),
  ufo: pet('spin', 'spin', 'flutter', 'spin', ['Bip bop: nivel de amor alto 🛸', 'Detecto mucho cariño 💕'], ['Bip: aterrizaje exitoso 🛸', '¡Bip bop! ¡Despegue! 🚀']),
  pumpkin: pet('tilt', 'glow', 'hop', 'glow', ['Jijiji, qué dulce 🎃', 'Brillo de calabaza 🧡'], ['¡Buuu! ¡Qué salto! 🎃', 'Jijiji, ¡otra! 👻']),
  bat: pet('flutter', 'flutter', 'flutter', 'flutter', ['Iii, qué tiernos 🦇', 'Me cuelgo aquí a mirar 💜'], ['¡Iii! ¡Vuela conmigo! 🦇', '¡Qué acrobacia! 🌙']),
  bee: pet('spin', 'spin', 'flutter', 'spin', ['Bzzz, más dulce que la miel 🍯', 'Bzz bzz 💛'], ['¡Bzzz! ¡Qué vuelo! 🐝', '¡Bzz! ¡Otra vez! 🎉']),
  ajolote: pet('wiggle', 'wiggle', 'hop', 'hop', ['¡Glub! Qué suavecito 🫧', 'Glub glub, abrazo 🌸'], ['¡Glub! ¡Qué chapuzón! 🫧', '¡Glub glub! ¡Bravo! 💖']),
};

/* ---------- Fase 2: necesidades, dormir y bañar ---------- */

// Lo que pide Mito cuando una necesidad está baja (siempre con cariño, nunca como queja).
export const MITO_NEEDS = {
  sleepy: ['Uaaah… qué sueño 😪', '¿Apagamos la luz un ratito?', 'Se me cierran los ojitos… 😴'],
  dirty: ['¿Me bañas? Tengo polvito 🫧', 'Creo que necesito un bañito', 'Tengo manchitas… ¿burbujas? 🛁'],
  sad: ['¿Me haces un cariñito? 🥺', 'Me siento solito… ¿jugamos?', 'Un abrazo me vendría bien 💕'],
  hungry: ['¿Comemos algo rico? 🍎', 'Mi pancita hace grrr…', 'Se me antoja una fruta 🍌', 'Tengo un poquito de hambre 🍓'],
};

// Cuando se cubre una necesidad.
export const MITO_THANKS = {
  mood: ['¡Eso me alegró el día! 💖', 'Ya me siento mejor 😊', '¡Gracias por los mimos! 🥰'],
};

export const MITO_SLEEP = {
  goodnight: ['Buenas noches 🌙', 'A dormir… 💤', 'Que sueñes bonito 🌙'],
  woke: ['¡Qué bien dormí! ☀️', '¡Buenos días! Qué rico descanso', '¡Lleno de energía! ⚡'],
  peek: ['Mmm… ¿ya es de día? 😴', '¿Eh? Cinco minutitos más…', 'Mmm… ¿me llamabas? 💤'],
  notSleepy: ['¡Todavía no tengo sueño!', 'Aún tengo mucha energía ⚡', '¿Dormir? ¡Pero si quiero jugar!'],
};

export const MITO_BATH = {
  start: ['¡Burbujas! 🫧', '¡A bañarnos! 🛁', 'Frota, frota… 🧽'],
  rub: ['¡Jiji, hace cosquillas! 🫧', 'Mmm, qué espumita', '¡Ahí, ahí! ✨'],
  done: ['¡Qué rico baño! ✨', '¡Rechinando de limpio! 🌟', '¡Gracias! Huelo a flores 🌸'],
};

/* ---------- Fase 3: la comida ---------- */

export const MITO_FOOD = {
  full: ['¡Estoy llenito! Gracias 💕', 'Ya no me cabe nada 😊', 'Guárdalo para luego, ¿sí?'],
  empty: ['¡Vamos por comida a la Tienda!', 'Mi charola está vacía 🥺'],
  hungryEmpty: ['¿Vamos por fruta a la Tienda?', 'Tengo hambre… ¿vamos a la Tienda?'],
};

// Lo que dice la mascota cuando Mito come (una de cada dos veces). Clave de mascota = `k` en wardrobe.js.
export const PET_EAT = {
  chick: '¡Pío! ¿Me das un granito? 🐤', turtle: '¿Hay una hojita para mí? 🍃', fox: 'Yip, ¡huele riquísimo! 🦊',
  otter: '¡Chii! ¿Compartimos? 🦦', dragon: 'Grrr… ¿te lo caliento? 🔥', unicorn: 'Comer rico da brillo ✨',
  ufo: 'Bip: nutrientes detectados 🛸', pumpkin: 'Jiji, ¡qué rico se ve! 🎃', bat: 'Iii, ¿hay fruta para mí? 🦇',
  bee: 'Bzz, ¿y un poco de miel? 🍯', ajolote: 'Glub, ¡buen provecho! 🫧',
};

/* ---------- Fase 4: muebles y decoración ---------- */

// Lo que dice Mito la primera vez que se coloca cada mueble (clave = id en content/furniture.js), y con el regalo.
export const MITO_DECOR = {
  placed: {
    'm-rug': '¡Qué alfombra tan suavecita! 💜', 'm-cushion': '¡Un cojín para apapacharme!', 'm-plant': '¡Una plantita! La cuidaré 🌱',
    'm-lamp': '¡De noche se ve preciosa! ✨', 'm-bookcase': '¡Cuántos libros! 📚', 'm-sofa': '¡Qué sillón tan cómodo! 💙',
    'm-desk': '¡Aquí estudiaremos juntos! ✏️', 'm-bed': '¡Una camita! Qué bonita 😴', 'm-picture': '¡Qué cuadro tan bonito! 🏔️',
    'm-clock': '¡Tic, tac! Ya sé la hora ⏰', 'm-shelf': '¡Mi repisa quedó genial!', 'm-lights': '¡Lucecitas! Me encantan 🌟',
  },
  gift: ['¡Mira! Un regalo para mi cuarto 🎁', '¡Una alfombra nueva! Gracias 💜'],
};
