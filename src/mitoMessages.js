// Mensajes de Mito. Todo el texto de la mascota vive aquí para no ensuciar main.js.
// Para agregar mensajes de una materia nueva: añade una clave con su `id` en BY_COURSE.

export const USER_NAME = 'Zare';

/* ---------- Mensajes generales (sirven para cualquier materia) ---------- */
const GENERAL = [
  `¡Hola, ${USER_NAME}! ¿Lista para estudiar? 📚`,
  `¿Un repasito rápido, ${USER_NAME}? Con 10 minutos ya avanzas ✨`,
  'Repasar un poco cada día rinde más que una sola noche de desvelo 🌙',
  'Explicar en voz alta lo que aprendiste te ayuda a recordarlo 🗣️',
  'Los fallos del quiz son oro: repásalos y se vuelven aciertos 🎯',
  'Toma agua y estírate un poco, tu cerebro también se cansa 💧',
  `¡Vamos, ${USER_NAME}! Una racha más en el quiz 🔥`,
  'Junta chispas en el quiz y ven a cambiarme de look 🎨',
  'Antes del examen completo, repasa los puntos clave 🔑',
  'Un descanso corto entre temas ayuda a que se te queden 🧠',
  `${USER_NAME}, tú puedes con esta materia 💪`,
  'Cambia de materia cuando quieras, arriba están todas 🔄',
];

/* ---------- Mensajes por materia (clave = id del curso) ---------- */
const BY_COURSE = {
  atp: [
    'El ATP guarda 7.3 kcal/mol, listas para usarse ⚡',
    'La ATP-sintasa gira como una turbina diminuta 🌀',
    'Una glucosa puede rendir hasta 38 ATP 🔋',
    'Tu cuerpo recicla casi su peso en ATP cada día ♻️',
    'Los triglicéridos rinden 9 kcal/g; el almidón, 4 kcal/g 🥑',
    'ΔG negativa = exergónica: pasa sola 🌊',
    'El P-loop es la firma de las proteínas que se unen al ATP 🧬',
    'Anabolismo construye y gasta; catabolismo degrada y libera 🏗️',
  ],
  'calculo-dietetico': [
    'GET = GEB + ETA + AF. ¿Te la sabes de memoria? 🧮',
    'El efecto termogénico (ETA) ronda el 10% 🍽️',
    'Más masa magra, más gasto energético 💪',
    'En pacientes hospitalizados, el factor de estrés reemplaza a la actividad física 🏥',
    'Quemaduras mayores: factor de estrés de 1.8 a 2.5 🔥',
    'Inanición simple: factor de estrés de 0.85 📉',
    'A mayor edad y masa grasa, menor gasto energético ⏳',
  ],
  'fisiopatologia-gi': [
    'En la acalasia, el EEI no se relaja al tragar 🫁',
    'El tabaquismo es el factor de riesgo más controlable del Crohn 🚭',
    'Crohn es transmural; la colitis ulcerosa, mucosa y submucosa 🔬',
    'Gastritis autoinmune → sin factor intrínseco → sin B12 🩸',
    'Ya no se restringe la fibra en la EII: cuida tu microbioma 🌾',
    'En EII, la carne roja se limita a unos 114 g por semana 🥩',
    'Cascanueces = contracciones fuertes; hipocontráctil = contracciones débiles 🌰',
  ],
  'epidemiologia-y-nutricion': [
    'Liposolubles: A, D, E y K 🧈',
    'La B12 (cobalamina) vive en alimentos de origen animal 🐟',
    'La fibra soluble forma un gel que baja colesterol y glucosa 🥣',
    'La fibra insoluble acelera el tránsito intestinal 🚀',
    'La vitamina C abunda en cítricos, kiwi, fresas y pimientos 🍓',
    'Edad, sexo e historia familiar: factores de riesgo no modificables 🧬',
    'Las enfermedades crónicas son multifactoriales y de larga duración 📈',
  ],
};

/* ---------- Reacciones a eventos ---------- */
const FIRST_ROUND = [
  `¡Vamos, ${USER_NAME}! Primera ronda del quiz 🔥`,
  'Empieza con una ronda rápida para calentar motores 🚀',
];
const GREAT = ['¡Wow, vas increíble! 🌟', '¡Ronda de campeona! 🏆', '¡Así se hace, casi perfecta! 🎉'];
const OK = ['¡Bien! Un repaso más y la dominas 👏', 'Vas por buen camino, sigue así 🌱'];
const LOW = ['¡Buen intento! Repasemos un poco más 💪', 'Los fallos enseñan: mira tus apuntes y vuelve a intentar 📖'];

/* ---------- Mascotas compañeras (clave = `k` en wardrobe.js) ---------- */
const PET_MESSAGES = {
  pumpkin: [
    '¡Dulce o repaso! 🎃',
    'Una chispa más para la colección ✨',
    '¡Buuu! Que las dudas salgan corriendo 👻',
  ],
  bat: [
    '¡Aleteando hacia el siguiente acierto! 🦇',
    'Yo vigilo mientras tú repasas 🌙',
    '¡Ni los exámenes me dan miedo! 🧛',
  ],
  chick: [
    '¡Pío pío! ¡A estudiar! 🐤',
    `¡Pío! Tú puedes, ${USER_NAME} 💛`,
    'Pío… ¿me das un granito de chispas? 🌾',
    '¡Piii! Una ronda más 🔥',
  ],
  turtle: [
    'Despacito y con buena letra 🐢',
    'Sin prisa, pero sin pausa 📚',
    `Hasta yo llego a la meta, ${USER_NAME} 🏁`,
    'Respira hondo y repasa con calma 🍃',
  ],
  fox: [
    '¡Yip! Mi truco: repasa tus fallos 🦊',
    'El zorrito astuto dice: ¡quiz ya! 🎮',
    'Yip yip, vas muy bien ✨',
    'Yo vigilo tus apuntes 👀',
  ],
  ufo: [
    'Bip bop… detecto una mente brillante 🛸',
    'Transmisión recibida: hora de repasar 📡',
    'Escaneando… ¡tu racha está en órbita! 🌌',
    'Bip: datos guardados en tu cerebro 🧠',
  ],
  dragon: [
    '¡Grrr! Quemando dudas, una por una 🔥',
    'Un dragón cuida su tesoro: tus chispas ⚡',
    '¡Rooaar! Cero miedo al examen 🐉',
    'Grrr… ¿jugamos otra ronda?',
  ],
  unicorn: [
    'La magia empieza con un buen repaso ✨',
    `Brilla, ${USER_NAME}, brilla 🌈`,
    'Cada acierto deja un arcoíris 🦄',
    'Confía en ti, tienes magia de sobra 💫',
  ],
  otter: [
    '¡Chii! Flotemos con calma y repasemos 🦦',
    'Te guardo una piedrita de la suerte 🪨',
    `¡Nada mal, ${USER_NAME}! 🌊`,
    'Chii chii, ¿otro quiz? 🎮',
  ],
};

/* ---------- Helpers ---------- */
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];

// Elige un mensaje distinto al anterior (si hay más de uno donde escoger)
function pickFrom(pool, last){
  const opts = pool.filter(m => m !== last);
  return rnd(opts.length ? opts : pool);
}

export function greeting(date = new Date()){
  const h = date.getHours();
  if(h < 5)  return `Ya es tarde, ${USER_NAME} 😴 Un repaso cortito y a descansar.`;
  if(h < 12) return `¡Buenos días, ${USER_NAME}! ☀️ ¿Lista para estudiar?`;
  if(h < 19) return `¡Buenas tardes, ${USER_NAME}! 📚 ¿Repasamos un ratito?`;
  return `¡Buenas noches, ${USER_NAME}! 🌙 ¿Un repaso antes de dormir?`;
}

// Mezcla generales y de la materia activa (mitad y mitad aprox.)
export function idleMessage(courseId, last){
  const own = BY_COURSE[courseId] || [];
  const useCourse = own.length > 0 && Math.random() < 0.6;
  return pickFrom(useCourse ? own : GENERAL, last);
}

export function courseSwitchMessage(label){
  return `Cambiamos a ${label} 📚 ¡Vamos con todo, ${USER_NAME}!`;
}

// Mensaje de la mascota compañera (null si esa mascota no tiene frases)
export function petMessage(petKey, last){
  const pool = PET_MESSAGES[petKey];
  return pool ? pickFrom(pool, last) : null;
}

export function firstRoundMessage(){ return rnd(FIRST_ROUND); }

export function resultMessage(pct){
  if(pct >= 80) return rnd(GREAT);
  if(pct >= 60) return rnd(OK);
  return rnd(LOW);
}
