// Frases con las que Mito y la mascota compañera reaccionan durante el quiz (datos puros).
// Una por evento y solo habla uno de los dos (se alternan). Reglas: ninguna da pistas de la respuesta
// (hablan del ánimo, la racha y las vidas, nunca del contenido) y los fallos se animan, no se regañan.
// `{n}` se sustituye por el número de aciertos seguidos. Clave de mascota = `k` en wardrobe.js.
//
// Eventos: correct, streak (3+ seguidas), wrong, lastLife (queda 1 vida), lastQuestion.
// Al terminar, Mito usa resultMessage() de messages.js y las mascotas finishGreat / finishOk / finishLow.

import { USER_NAME as Z } from './messages.js';

export const MITO_QUIZ = {
  correct: [`¡Eso, ${Z}! ✨`, '¡Bien ahí! 🎉', '¡Correcto! Sigue así 💪', '¡Qué crack! 🌟', '¡Eso estuvo genial! 🙌'],
  streak: ['¡Llevas {n} seguidas! 🔥', `¡{n} seguidas, ${Z}! Imparable ⚡`, '¡Racha de {n}! No pares 🔥', '¡{n} aciertos al hilo! 🚀'],
  wrong: ['Tranqui, la que sigue es tuya 💪', 'Pasa a cualquiera, ¡a la siguiente! 🌈', 'Cada fallo enseña algo, vamos 📖', 'Respira hondo, tú puedes 🍃', `Sin drama, ${Z}: ¡sigue! ✨`],
  lastLife: ['Te queda una vida, pero tú puedes 💛', '¡Última vida! Con calma y a pensar 🧠', 'Una vida basta si vas con cabeza 💪', `Estoy contigo, ${Z}: respira y sigue 🤗`],
  lastQuestion: ['¡Última pregunta! Cierra con todo 🏁', `¡Ya casi, ${Z}! Una más y listo 🎯`, '¡La recta final! Tú puedes 🚀', '¡Última! Hazla brillar ✨'],
};

export const PET_QUIZ = {
  chick: {
    correct: ['¡Pío pío! ¡Muy bien! 🐤', `¡Piii! ¡Esa fue tuya, ${Z}! 💛`],
    streak: ['¡Pío! ¡{n} seguidas! 🐥', '¡Piii piii! ¡{n} al hilo! 🌟'],
    wrong: ['Pío… no pasa nada, otra vez 🐤', `¡Pío! Tú puedes con la que sigue, ${Z} 💛`],
    lastLife: ['Pío, solo una vida… ¡yo creo en ti! 🐣', '¡Piii! Quédate cerca de mí, vamos con calma 🤗'],
    lastQuestion: ['¡Pío! ¡Última pregunta, ya casi! 🏁', '¡Piii! Una más y nos vamos a celebrar 🎉'],
    finishGreat: ['¡Pío pío pío! ¡Qué ronda! 🏆', '¡Piii! ¡Eres increíble! 🌟'],
    finishOk: ['¡Pío! Muy buen trabajo, ¡otra ronda! 💛', 'Pío pío, vas por buen camino 🌱'],
    finishLow: ['Pío… la próxima sale mejor, ¡ánimo! 🤗', '¡Piii! Un repasito y a intentarlo otra vez 💪'],
  },
  turtle: {
    correct: ['Bien hecho, con calma y buena letra 🐢', 'Paso firme, ¡correcto! 🍃'],
    streak: ['Despacio pero seguro: ¡{n} seguidas! 🐢', '¡{n} seguidas! Así se llega a la meta 🏁'],
    wrong: ['Sin prisa, la siguiente sale mejor 🍃', 'Respira hondo: un paso a la vez 🐢'],
    lastLife: ['Una vida… respiremos y vayamos despacio 🍃', 'Con calma, que una vida alcanza para pensar 🐢'],
    lastQuestion: ['Último tramo: paso a paso hasta la meta 🏁', `Ya casi, ${Z}. Una más y llegamos 🐢`],
    finishGreat: ['¡Llegaste a la meta con estilo! 🏆', 'Lenta y brillante: ¡así se hace! 🌟'],
    finishOk: [`Buen paso, ${Z}. La meta se acerca 🐢`, 'Vas bien, un repaso más y listo 🍃'],
    finishLow: ['Hasta mi caparazón se abolla: a repasar con calma 🐢', 'Sin prisa, ya llegarás. ¡Otra ronda! 🍃'],
  },
  fox: {
    correct: ['¡Yip! Eso fue astuto 🦊', '¡Yip yip! ¡Bien jugado! ✨'],
    streak: ['¡Yip! ¡{n} seguidas! Qué olfato 🦊', '¡{n} al hilo! Eres un zorro de la ronda 🔥'],
    wrong: ['Yip, un tropiezo no es nada. ¡A la siguiente! 🦊', 'Hasta el zorro más listo falla: ¡sigue! 💪'],
    lastLife: ['Una vida, pero astucia de sobra 🦊', 'Yip… ahora toca ir con ingenio, yo te aplaudo 👏'],
    lastQuestion: ['¡Yip! ¡Última pregunta, remata la jugada! 🏁', '¡Una más y lo logras, astuta! 🦊'],
    finishGreat: ['¡Yip yip yip! ¡Ronda de campeona! 🏆', '¡Qué astucia, Zare! 🌟'],
    finishOk: ['¡Yip! Buen olfato, otra ronda y brillas 🦊', 'Yip, vas muy bien ✨'],
    finishLow: ['Yip… el zorro dice: ¡repasa y vuelve! 🦊', 'Los trucos se aprenden: ¡otra ronda! 💪'],
  },
  ufo: {
    correct: ['Bip bop: ¡acierto detectado! 🛸', 'Transmisión: ¡correcto! ✨'],
    streak: ['Bip: ¡racha de {n} en órbita! 🌌', '¡{n} aciertos seguidos! Señal fuerte 📡'],
    wrong: ['Bip… señal perdida. Recalculando ruta 🛸', 'Sin drama: la siguiente señal es tuya 📡'],
    lastLife: ['Alerta: queda 1 vida. Escudos al máximo, ¡tú puedes! 🛡️', 'Bip bop, una vida restante. Cuento contigo 🛸'],
    lastQuestion: ['Aterrizaje a la vista: ¡última pregunta! 🌍', 'Bip: pregunta final detectada. ¡A por ella! 🚀'],
    finishGreat: ['¡Misión cumplida con honores! 🏆', 'Bip bop: ¡ronda galáctica! 🌟'],
    finishOk: ['Misión casi perfecta, ¡otra órbita! 🛸', 'Bip: buenos datos, vas bien 🌌'],
    finishLow: ['Misión por mejorar. Recalculemos juntos 🛸', 'Bip… datos guardados, la próxima despega 🚀'],
  },
  dragon: {
    correct: ['¡Rooaar! ¡Acierto en llamas! 🔥', '¡Grrr! ¡Así se hace! 🐉'],
    streak: ['¡Rooaar! ¡{n} seguidas! ¡Fuego puro! 🔥', '¡{n} al hilo! El tesoro crece ⚡'],
    wrong: ['Grrr… una chispa que falla, la próxima enciende 🐉', 'Ni los dragones aciertan siempre: ¡sigue! 🔥'],
    lastLife: ['¡Última vida! Los dragones brillan en lo difícil 🐉', 'Grrr, una vida y mucho fuego: ¡tú puedes! 🔥'],
    lastQuestion: ['¡Rooaar! ¡Última pregunta, con todo el fuego! 🏁', '¡Una más y la quemas, Zare! 🐉'],
    finishGreat: ['¡ROOAAR! ¡Ronda legendaria! 🏆', '¡Digna de mi tesoro! 🌟'],
    finishOk: ['¡Grrr! Buena ronda, a pulir ese fuego 🐉', 'Vas bien, Zare: ¡otra y rugimos! 🔥'],
    finishLow: ['Grrr… el fuego regresa, ¡a repasar! 🐉', 'Un dragón siempre vuelve: ¡otra ronda! 💪'],
  },
  unicorn: {
    correct: ['¡Magia pura! ✨', 'Cada acierto deja un arcoíris 🌈'],
    streak: ['¡{n} seguidas! ¡Qué brillo! 🦄', '¡Arcoíris de {n} aciertos! 🌈'],
    wrong: ['La magia también se toma su tiempo 💫', 'Un tropiezo no apaga tu brillo 🌈'],
    lastLife: ['Queda una vida y mucha magia, ¡confía! 🦄', 'Una vida basta para brillar 💫'],
    lastQuestion: ['¡Última pregunta! Cierra con magia ✨', 'Un último hechizo y listo 🦄'],
    finishGreat: ['¡Ronda mágica, qué brillo! 🏆', '¡Un arcoíris de aciertos! 🌈'],
    finishOk: ['¡Bien! Tu magia va creciendo 🦄', 'Con un poquito más de brillo, la dominas ✨'],
    finishLow: ['La magia se entrena: ¡otra vez, con confianza! 💫', 'Cada ronda te hace más fuerte 🌈'],
  },
  otter: {
    correct: ['¡Chii! ¡Bien nadado! 🦦', '¡Chii chii! ¡Qué buena! 🌊'],
    streak: ['¡Chii! ¡{n} seguidas, a flote! 🌊', '¡{n} al hilo! Eres una nutria de campeonato 🦦'],
    wrong: ['Chii… las olas suben y bajan, ¡sigue! 🌊', 'No pasa nada, flotemos a la siguiente 🦦'],
    lastLife: ['Una vida: ¡yo te cuido la piedrita de la suerte! 🪨', 'Chii, vamos con calma, ¡tú puedes! 🌊'],
    lastQuestion: ['¡Chii! ¡Última pregunta, a la orilla! 🏁', 'Una más y nadamos a celebrar 🦦'],
    finishGreat: ['¡Chii chii chii! ¡Qué ronda! 🏆', '¡Nadaste perfecto! 🌟'],
    finishOk: ['¡Chii! Buen nado, otra ronda y brillas 🦦', 'Vas bien, Zare, sigue flotando 🌊'],
    finishLow: ['Chii… hasta las nutrias se hunden un poquito, ¡otra vez! 🌊', 'Un repaso y volvemos a nadar 🦦'],
  },
  ajolote: {
    correct: ['¡Glub glub! ¡Bien! 🫧', '¡Qué acierto tan lindo! 🌸'],
    streak: ['¡Glub! ¡{n} seguidas! 🫧', '¡{n} aciertos, eso sí es raro! 💖'],
    wrong: ['Glub… todo se regenera, ¡hasta los fallos! 🌸', 'Sin pena, la siguiente es tuya 🫧'],
    lastLife: ['Una vida, ¡y yo regenero esperanzas! 💖', 'Glub, calma: una vida es suficiente 🫧'],
    lastQuestion: ['¡Glub glub! ¡Última pregunta! 🌸', 'La última, Zare: ¡a flote! 🫧'],
    finishGreat: ['¡GLUB! ¡Ronda rarísima de buena! 🏆', '¡Brillas como en Xochimilco! 🌟'],
    finishOk: ['¡Glub! Muy bien, sigue así 🌸', 'Vas por buen camino, ¡glub! 🫧'],
    finishLow: ['Glub… los ajolotes se regeneran, tú también: ¡otra vez! 🌸', 'Un repasito y vuelves más fuerte 💖'],
  },
  bee: {
    correct: ['¡Bzzz! ¡Dulce acierto! 🍯', '¡Bzz bzz! ¡Muy bien! 🐝'],
    streak: ['¡Bzzz! ¡{n} seguidas, qué zumbido! 🐝', '¡{n} al hilo! La miel se acumula 🍯'],
    wrong: ['Bzz… poquito a poco se hace la miel 🍯', 'Una abejita se levanta siempre: ¡sigue! 🐝'],
    lastLife: ['Una vida, ¡pero zumbamos juntas! 🐝', 'Bzzz, calma y miel: tú puedes 🍯'],
    lastQuestion: ['¡Bzzz! ¡Última pregunta, a la colmena! 🏁', 'Una más y la miel está lista 🍯'],
    finishGreat: ['¡BZZZ! ¡Ronda de reina! 🏆', '¡Cosecha de miel perfecta! 🌟'],
    finishOk: ['¡Bzz! Buena cosecha, a por más 🍯', 'Vas muy bien, Zare 🐝'],
    finishLow: ['Bzz… la miel de la próxima será más dulce 🍯', 'Repasa un poquito y volvemos a zumbar 🐝'],
  },
  pumpkin: {
    correct: ['¡Dulce acierto! 🎃', '¡Buuu-en trabajo! 👻'],
    streak: ['¡{n} seguidas! ¡Embrujada! 🎃', '¡{n} aciertos al hilo! Qué susto de bueno 👻'],
    wrong: ['Buuu… un fallo no asusta, ¡sigue! 🎃', 'Hasta las calabazas se tropiezan 👻'],
    lastLife: ['Una vida… ¡yo te doy valor! 🎃', 'Buu, calma, que tú puedes 👻'],
    lastQuestion: ['¡Última pregunta, dulce o repaso! 🎃', 'Una más y nos vamos por dulces 🍬'],
    finishGreat: ['¡Ronda de miedo, de buena! 🏆', '¡Brillas más que una calabaza encendida! 🎃'],
    finishOk: ['¡Buu! Buena ronda, ¡otra! 🎃', 'Vas bien, ¡sigue el hechizo! 👻'],
    finishLow: ['Buuu… la próxima sale de miedo (de buena) 🎃', 'Repaso y volvemos a la carga 👻'],
  },
  bat: {
    correct: ['¡Aleteando de gusto! 🦇', '¡Ese vuelo fue perfecto! 🌙'],
    streak: ['¡{n} seguidas, vuelo en picada! 🦇', '¡{n} al hilo! Qué noche brillante 🌙'],
    wrong: ['Un tropiezo en la noche no es nada 🦇', 'Sigue volando, Zare, tú puedes 🌙'],
    lastLife: ['Una vida: ¡vuela con calma! 🦇', 'Yo vigilo contigo, ¡tú puedes! 🌙'],
    lastQuestion: ['¡Última pregunta! Aterriza con todo 🦇', 'Un último aleteo y listo 🌙'],
    finishGreat: ['¡Ronda de leyenda nocturna! 🏆', '¡Brillas en la oscuridad! 🌟'],
    finishOk: ['¡Buen vuelo! Otra ronda y dominas 🦇', 'Vas bien, sigue volando 🌙'],
    finishLow: ['Mañana el vuelo sale mejor, ¡ánimo! 🦇', 'A repasar de noche y volver 🌙'],
  },
};

// Elige una frase de la bolsa (sin repetir la anterior si hay más de una) y pone el número de la racha.
export function quizMessage(pool, last, n){
  const all = pool.map(m => m.replace('{n}', n));
  const opts = all.filter(m => m !== last);
  const from = opts.length ? opts : all;
  return from[Math.floor(Math.random() * from.length)];
}
