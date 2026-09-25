import { COURSE_ATP } from './data.js';

export const COURSES = [
  COURSE_ATP,
  {
    id:'calculo-dietetico',
    label:'Cálculo Dietético',
    notes:[
      { id:'get', label:'Gasto Energético Total (GET)', items:[
        { q:'¿Qué es el Gasto Energético Total (GET)?', a:`Es el gasto o promedio de gasto de energía en un periodo de <strong>24 horas</strong> por parte de un individuo. Es el resultado de la suma de tres componentes principales: el <strong>Gasto Energético Basal (GEB)</strong>, el <strong>Efecto Termogénico de los Alimentos (ETA)</strong> y la <strong>Actividad Física (AF)</strong>. En situaciones específicas también se suma el <strong>factor de estrés fisiológico</strong>.` },
        { q:'¿Qué es el Efecto Termogénico de los Alimentos (ETA)?', a:`Es el incremento en el gasto energético ocasionado por los costos metabólicos necesarios para los procesos de <strong>digestión, absorción y almacenamiento</strong> de los nutrientes ingeridos. Se calcula comúnmente utilizando un factor de ajuste del <strong>10% del GEB</strong>.` },
        { q:'¿En qué momento es máximo el efecto termogénico de los alimentos?', a:`El efecto termogénico de los alimentos es máximo entre <strong>30 minutos y dos horas</strong> después de ingerir alimentos.` },
        { q:'¿Cómo influyen los diferentes macronutrientes sobre el ETA?', a:`<ul>
          <li><strong>Proteínas:</strong> incrementan un <strong>12%</strong> la producción de calor.</li>
          <li><strong>Carbohidratos:</strong> incrementan un <strong>6%</strong>.</li>
          <li><strong>Lípidos:</strong> incrementan un <strong>2%</strong>.</li>
          <li><strong>Dieta mixta:</strong> incrementa un <strong>6%</strong>, pero por promedio se utiliza el <strong>10%</strong>.</li>
        </ul>` },
        { q:'¿Cómo se clasifica la Actividad Física (AF) y qué porcentaje de gasto energético le corresponde?', a:`Se clasifica en varios niveles:
          <ul>
            <li><strong>Sedentario:</strong> 10% (actividades de descanso, dormir, sentarse, ver TV).</li>
            <li><strong>Actividad muy ligera:</strong> 15% (conducir, estudiar, cocinar, higiene personal).</li>
            <li><strong>Actividad ligera:</strong> 20% (tareas del hogar, caminar, golf).</li>
            <li><strong>Actividad moderada:</strong> 30% (baile, natación moderada, peones, albañiles).</li>
            <li><strong>Actividad intensa:</strong> 40% (fútbol, básquetbol, natación fuerte, subir escaleras constantemente).</li>
          </ul>` },
      ]},
      { id:'factores', label:'Factores que modifican el GET', items:[
        { q:'¿Cuáles son los principales factores que aumentan el Gasto Energético Total (GET)?', a:`<ul>
          <li><strong>Sexo masculino</strong> (aumenta de 10 a 15%).</li>
          <li><strong>Menor edad.</strong></li>
          <li><strong>Mayor composición de masa magra.</strong></li>
          <li><strong>Aumento de temperatura</strong> (puede incrementar del 7 al 13%).</li>
          <li>Estados emocionales como <strong>estrés y ansiedad</strong>.</li>
          <li><strong>Inicio de la menstruación</strong>, embarazo y lactancia.</li>
          <li>Enfermedades como el <strong>hipertiroidismo</strong>.</li>
        </ul>` },
        { q:'¿Cuáles son los principales factores que disminuyen el Gasto Energético Total (GET)?', a:`<ul>
          <li><strong>Sexo femenino.</strong></li>
          <li><strong>Edad avanzada</strong> (disminuye 1 a 2% por década de los 20 a los 70 años).</li>
          <li><strong>Menopausia.</strong></li>
          <li>Mayor <strong>composición de masa grasa corporal</strong>.</li>
          <li>Enfermedades como el <strong>hipotiroidismo</strong>.</li>
        </ul>` },
        { q:'¿Qué valores se asignan al "Factor de lesión" o estrés fisiológico en situaciones clínicas?', a:`<ul>
          <li><strong>Inanición simple:</strong> 0.85.</li>
          <li><strong>Operación programada sin complicación:</strong> 1.05 a 1.15.</li>
          <li><strong>Lesión cefálica cerrada:</strong> 1.3.</li>
          <li><strong>Traumatismo múltiple:</strong> 1.4.</li>
          <li><strong>Quemaduras mayores:</strong> 1.8 a 2.5.</li>
        </ul>` },
      ]},
      { id:'peso', label:'Fórmulas de peso ideal y GEB', items:[
        { q:'¿Qué métodos o fórmulas se utilizan para calcular el Peso Ideal (PI)?', a:`Se utilizan las fórmulas de <strong>Lorentz</strong>, <strong>Barrier</strong>, la fórmula <strong>derivada del IMC</strong> y la fórmula <strong>mediante talla</strong>.` },
        { q:'¿Cuál es la fórmula general para obtener el Peso Corregido por Obesidad?', a:`<strong>Peso corregido = [(Peso actual − peso ideal) × 0.25] + peso ideal</strong>.` },
        { q:'¿Cómo se calcula el Peso Corregido por Amputación?', a:`Se calcula con la fórmula: <strong>[(100 − % amputación) ÷ 100] × peso ideal</strong>.` },
        { q:'¿Cuáles son los porcentajes correspondientes a los diferentes miembros amputados para el peso teórico ideal?', a:`<ul>
          <li><strong>Mano:</strong> 0.7%.</li>
          <li><strong>Mano y antebrazo:</strong> 2.3%.</li>
          <li><strong>Brazo completo:</strong> 5.0%.</li>
          <li><strong>Pie:</strong> 1.5%.</li>
          <li><strong>Pie y pierna debajo de la rodilla:</strong> 5.9%.</li>
          <li><strong>Pierna completa:</strong> 16%.</li>
        </ul>` },
        { q:'¿Cuáles son las fórmulas predictivas más comunes para calcular el Gasto Energético Basal (GEB)?', a:`Las fórmulas de <strong>Harris-Benedict</strong>, <strong>Mifflin</strong>, <strong>Owen</strong> y la de <strong>FAO/OMS</strong>. Usualmente han sido desarrolladas con personas sanas basándose en el <strong>peso, altura, sexo y edad</strong>.` },
      ]},
    ],
    cheats:[
      {n:'10%', l:'ETA · efecto termogénico promedio'},
      {n:'0.85', l:'factor de estrés · inanición simple'},
      {n:'1.8–2.5', l:'factor de estrés · quemaduras mayores'},
    ],
    keypoints:[
      'La fórmula básica para un paciente sano es: <strong>GET = GEB + ETA + AF</strong>.',
      'Para pacientes hospitalizados se usa: <strong>GET = GEB + ETA + Factor de estrés fisiológico</strong>.',
      'A menor edad y mayor masa magra, se produce un <strong>mayor</strong> gasto energético.',
      'A mayor edad y mayor masa grasa, se produce un <strong>menor</strong> gasto energético.',
    ],
    questions:[
      {cat:'Gasto Energético Total (GET)', q:'De acuerdo a la clasificación de la actividad física, ¿qué porcentaje de gasto energético extra se aplica a una persona que realiza "Actividad moderada" (como bailar o andar en bicicleta)?', opts:['10%','15%','30%','40%'], correct:2, exp:'La actividad moderada, que incluye bailar, natación moderada o albañilería, requiere un 30% del gasto energético.'},
      {cat:'Gasto Energético Total (GET)', q:'¿Cuál es el incremento en la producción de calor (ETA) que generan exclusivamente las proteínas?', opts:['2%','6%','10%','12%'], correct:3, exp:'Las proteínas incrementan un 12% la producción de calor; los carbohidratos un 6% y los lípidos un 2%.'},
      {cat:'Factores que modifican el GET', q:'¿Cómo afecta la edad al gasto energético total en adultos de entre 20 y 70 años?', opts:['Aumenta un 10% por década','Disminuye de 1 a 2% por década','Se mantiene estático','Disminuye un 5% cada año'], correct:1, exp:'La edad es un factor que disminuye el GET; específicamente, disminuye entre 1 a 2% por cada década de vida desde los 20 hasta los 70 años.'},
      {cat:'Factores que modifican el GET', q:'En el cálculo del factor de lesión por estrés fisiológico, ¿cuál de las siguientes situaciones representa el mayor incremento en el gasto energético?', opts:['Inanición simple','Operación programada sin complicación','Quemaduras mayores','Lesión cefálica cerrada'], correct:2, exp:'Las quemaduras mayores tienen un factor de 1.8 a 2.5, siendo el más alto de la lista proporcionada.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'¿Qué porcentaje de peso teórico ideal se resta (o aplica) en caso de que un paciente tenga una amputación de pierna completa?', opts:['5.0%','5.9%','16%','2.3%'], correct:2, exp:'En la tabla de miembros amputados, la "Pierna completa" equivale al 16% del peso teórico ideal.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'Las fórmulas predictivas para calcular el gasto energético suelen utilizar variables independientes. ¿Cuáles son estas variables?', opts:['Peso, porcentaje de grasa, edad y raza','Peso, altura, sexo y edad','IMC, talla, sexo y estrés','Altura, nivel socioeconómico, peso y sexo'], correct:1, exp:'Las fórmulas predictivas usualmente incluyen el peso, altura, sexo y edad como variables independientes para su cálculo.'},
      {cat:'Gasto Energético Total (GET)', q:'¿En qué momento alcanza su punto máximo el efecto termogénico de los alimentos (ETA) después de ingerirlos?', opts:['Inmediatamente al comer','Entre 30 minutos y dos horas después','Después de 4 horas','A las 24 horas'], correct:1, exp:'El efecto termogénico de los alimentos es máximo entre 30 minutos y dos horas después de ingerir alimentos.'},
      {cat:'Gasto Energético Total (GET)', q:'Si una persona consume puros carbohidratos, ¿cuánto incrementaría la producción de calor (ETA) específicamente por este macronutriente?', opts:['2%','6%','10%','12%'], correct:1, exp:'Los carbohidratos incrementan un 6% la producción de calor, mientras que los lípidos un 2% y las proteínas un 12%.'},
      {cat:'Gasto Energético Total (GET)', q:'En la fórmula para un paciente hospitalizado, ¿qué componente sustituye a la Actividad Física (AF) para calcular el GET?', opts:['Efecto Termogénico (ETA)','Gasto Energético Basal (GEB)','Factor de estrés fisiológico','Índice de Masa Corporal (IMC)'], correct:2, exp:'Para un paciente hospitalizado, la fórmula es GET = GEB + ETA + Factor de estrés, reemplazando así a la Actividad Física (AF) de un paciente sano.'},
      {cat:'Gasto Energético Total (GET)', q:'¿Qué porcentaje de gasto energético se aplica a una persona con una "Actividad muy ligera", como conducir, estudiar o hacer trabajo de escritorio?', opts:['10%','15%','20%','30%'], correct:1, exp:'La actividad muy ligera corresponde al 15% del gasto energético.'},
      {cat:'Gasto Energético Total (GET)', q:'De las siguientes opciones, ¿cuál se clasifica como "Actividad ligera" (20% del GET)?', opts:['Jugar básquetbol','Estar acostado viendo TV','Tareas del hogar y caminar','Trabajar como albañil'], correct:2, exp:'Las tareas del hogar, caminar y deportes como el golf pertenecen a la actividad ligera (20%).'},
      {cat:'Gasto Energético Total (GET)', q:'¿Qué porcentaje se le asigna a un paciente que es totalmente sedentario (dormir, estar sentado)?', opts:['0%','5%','10%','15%'], correct:2, exp:'El nivel sedentario corresponde a un 10% del gasto energético.'},
      {cat:'Factores que modifican el GET', q:'¿En qué etapa del ciclo menstrual de la mujer es mayor el gasto energético?', opts:['A la mitad del ciclo (ovulación)','Una semana después de la menstruación','Durante la menopausia','Al inicio de la menstruación'], correct:3, exp:'El mayor gasto se da al inicio de la menstruación, mientras que disminuye una semana después y en la menopausia.'},
      {cat:'Factores que modifican el GET', q:'¿Cuánto puede llegar a incrementar el gasto energético total (GET) si una persona presenta hipertermia (aumento de temperatura)?', opts:['Del 1 al 2%','Del 7 al 13%','Del 10 al 15%','Del 20 al 25%'], correct:1, exp:'A mayor temperatura, el gasto se puede incrementar del 7 al 13%.'},
      {cat:'Factores que modifican el GET', q:'De acuerdo a la tabla de factores de estrés fisiológico por lesión, ¿qué valor le corresponde a un paciente con septicemia?', opts:['0.85','1.05 a 1.15','1.2 a 1.4','1.5'], correct:2, exp:'La septicemia tiene un factor de estrés de 1.2 a 1.4.'},
      {cat:'Factores que modifican el GET', q:'¿Qué factor de estrés fisiológico se le aplica a una operación programada sin complicaciones?', opts:['1.05 a 1.15','1.3','1.4','1.8 a 2.5'], correct:0, exp:'Una operación programada sin complicación tiene un factor de 1.05 a 1.15.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'Si un paciente tiene amputado un pie (solo el pie, sin la pierna), ¿qué porcentaje del peso teórico ideal se debe descontar en la fórmula?', opts:['0.7%','1.5%','5.0%','5.9%'], correct:1, exp:'En la tabla de miembros amputados, el pie corresponde al 1.5%.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'En la fórmula para calcular el "Peso corregido por obesidad", ¿qué constante se multiplica por la diferencia entre el peso actual y el peso ideal?', opts:['0.10','0.25','0.50','0.75'], correct:1, exp:'La fórmula es: [(Peso actual − peso ideal) × 0.25] + peso ideal.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'En la fórmula del peso ideal "Derivado del IMC" para Hombres, ¿qué valor fijo se multiplica por la (talla en metros) al cuadrado?', opts:['21.5','22','23','24'], correct:2, exp:'Para hombres, la fórmula es 23 × (talla m)², mientras que para mujeres es 21.5.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'De las siguientes opciones, ¿cuál NO es una fórmula utilizada para calcular el Peso Ideal (PI)?', opts:['Lorentz','Barrier','Mediante talla','Mifflin'], correct:3, exp:'Mifflin es una fórmula predictiva para calcular el Gasto Energético Basal (GEB), no para el Peso Ideal.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'Según las fórmulas de la FAO/OMS para calcular el GEB, ¿cuál de los siguientes rangos de edad es un grupo de clasificación válido en su tabla?', opts:['10 a 18 años','18 a 30 años','40 a 50 años','Mayores de 75 años'], correct:1, exp:'Los grupos de edad que maneja la fórmula de la FAO/OMS son: 18-30 años, 31-60 años y > 61 años.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'En la fórmula de Lorentz para calcular el Peso Ideal, ¿cuál es la principal diferencia matemática entre la ecuación para hombres y la ecuación para mujeres en la sección que ajusta la edad del paciente?', opts:['En mujeres la edad se multiplica por 0.17 y en hombres por 0.25','En mujeres el factor de la edad se divide entre 2.5 y en hombres se divide entre 4','En hombres se resta 150 a la edad y en mujeres 100','La constante a restar a la edad es 25 en mujeres y 20 en hombres'], correct:1, exp:'En la fórmula de Lorentz, en los hombres la porción de la edad es (Edad − 20) / 4, mientras que en las mujeres el divisor cambia y es (Edad − 20) / 2.5.'},
      {cat:'Gasto Energético Total (GET)', q:'Fisiológicamente, los macronutrientes incrementan la producción de calor de forma distinta. Una dieta mixta produce un incremento teórico específico, pero en el cálculo del GET se estandariza otro valor por convención. ¿Cuáles son estos valores (teórico de dieta mixta vs. promedio utilizado) respectivamente?', opts:['Teórico 12% / Promedio 10%','Teórico 2% / Promedio 6%','Teórico 6% / Promedio 10%','Teórico 10% / Promedio 6%'], correct:2, exp:'Una dieta mixta incrementa la producción de calor en 6%, pero como promedio se utiliza 10%.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'Tienes una paciente femenina cuyo Peso Ideal (PI) calculado es de 60 kg. Sufre un accidente y requiere una amputación de brazo completo. Según la fórmula de peso corregido por amputación, ¿cuál es la estructura matemática correcta para obtener su nuevo peso?', opts:['[(100 - 16) ÷ 100] x 60','[(100 - 5.0) ÷ 100] x 60','[(60 - 5.0) x 0.25] + 60','[(100 - 2.3) ÷ 100] x 60'], correct:1, exp:'La fórmula es [(100 − % amputación) ÷ 100] × peso ideal. El porcentaje para brazo completo es 5.0%, por lo que la estructura es [(100 − 5.0) ÷ 100] × 60.'},
      {cat:'Factores que modifican el GET', q:'Si analizas los factores que modifican el Gasto Energético Total (GET), ¿cuál de los siguientes perfiles clínicos tendría teóricamente una conjunción de factores que, en su totalidad, DISMINUYEN su gasto energético?', opts:['Sexo femenino, mayor masa grasa, hipotiroidismo y etapa de menopausia.','Sexo masculino, mayor masa magra, edad avanzada (70 años).','Sexo femenino, hipertiroidismo, inicio de la menstruación.','Menor edad, hipertermia, embarazo.'], correct:0, exp:'Se clasifican como "Factores que disminuyen el GET" el sexo femenino, la mayor masa grasa, el hipotiroidismo y la menopausia. Las otras opciones mezclan factores que aumentan el GET.'},
      {cat:'Factores que modifican el GET', q:'Un paciente hospitalizado presenta un Síndrome de Reacción Inflamatoria Sistémica severo y úlceras por decúbito en etapa 4. Casualmente, ambas condiciones comparten el mismo valor de factor de estrés en tu tabla. ¿Cuál es este valor que sumarás a su GET?', opts:['1.3','1.4','1.5','1.8'], correct:2, exp:'El Síndrome de reacción inflamatoria sistémica tiene un valor de 1.5, y las úlceras por decúbito en etapa 4 también tienen un valor de 1.5.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'Observas la siguiente ecuación parcial utilizada para calcular el Gasto Energético Basal (GEB) en una paciente mujer: ... + (6.25 x talla cm) - (4.92 x edad) - 161. ¿A qué autor(es) corresponde esta fórmula predictiva?', opts:['Harris-Benedict','Mifflin','Owen','FAO/OMS'], correct:1, exp:'Las constantes 6.25 × talla, 4.92 × edad y la resta final de −161 en mujeres son exclusivas de la fórmula de Mifflin.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'Necesitas calcular el GEB usando la fórmula de la FAO/OMS para una mujer sedentaria de 34 años que pesa 85 kg. Según tus tablas, ¿cuál es la ecuación exacta que debes plantear?', opts:['(14.7 x 85) + 496','(11.6 x 85) + 879','(10.5 x 85) + 596','(8.7 x 85) + 829'], correct:3, exp:'Para una mujer de 34 años corresponde el rango "31-60 años" de mujeres. La ecuación de la FAO/OMS para este grupo es (8.7 × peso) + 829.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'Al utilizar la fórmula de Barrier para calcular el Peso Ideal, ¿cuál es la constante final que se debe restar al final de la ecuación en el caso de un hombre?', opts:['7.71','6.78','100','0.25'], correct:1, exp:'La fórmula de Barrier para hombre es Edad × 0.17 + (talla cm − 100) − 6.78; el 7.71 se utiliza para mujeres.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'En un cálculo de Peso Corregido por Obesidad, la fórmula indica sacar una diferencia de pesos. ¿Qué pesos se restan dentro del paréntesis antes de multiplicar por 0.25?', opts:['(Peso ideal - Peso actual)','(Peso actual - Peso magro)','(Peso actual - Peso ideal)','(Peso corregido - Peso ideal)'], correct:2, exp:'El orden correcto de la ecuación es [(Peso actual − peso ideal) × 0.25] + peso ideal.'},
      {cat:'Gasto Energético Total (GET)', q:'La OMS define el trabajo físico realizado por el músculo esquelético y lo divide en dos condiciones distintas. ¿Cuál de los siguientes ejemplos pertenece estrictamente a la "Condición 1: Actividad física no relacionada con el ejercicio"?', opts:['Resistencia en natación.','Actividad muscular de fuerza al levantar pesas.','Bañarse, peinarse o conducir.','Cualquier actividad deportiva de fin de semana.'], correct:2, exp:'El trabajo físico se divide en 1) actividad física no relacionada con el ejercicio (caminar, bañarse, peinarse, ver TV o conducir) y 2) actividad muscular de resistencia, elasticidad y fuerza (deportiva).'},
      {cat:'Fórmulas de peso ideal y GEB', q:'En la ecuación predictiva de Harris-Benedict para mujeres, ¿cuál es el valor exacto que multiplica a la variable de la edad (y que se resta al final de la fórmula)?', opts:['6.75','4.92','4.676','7.18'], correct:2, exp:'En Harris-Benedict para mujeres la parte final resta (4.676 × edad); el valor 6.75 corresponde a los hombres.'},
      {cat:'Factores que modifican el GET', q:'En el cálculo del factor de estrés fisiológico, las úlceras por decúbito tienen diferentes valores según su etapa. ¿Qué valor corresponde específicamente a una úlcera en etapa 3?', opts:['1.1','1.2','1.3 a 1.4','1.5'], correct:2, exp:'La tabla de factor de lesión indica que las úlceras por decúbito en etapa 3 tienen un valor de 1.3 a 1.4.'},
      {cat:'Fórmulas de peso ideal y GEB', q:'Para obtener el peso ideal utilizando la fórmula "Mediante talla", se suma una constante de 50 al resultado de multiplicar 0.75 por la diferencia de la talla (en cm) menos una segunda constante. ¿Cuál es esta segunda constante que se le resta a la talla?', opts:['100','150','161','20'], correct:1, exp:'La fórmula exacta es 50 + [0.75 × (talla − 150)].'},
      {cat:'Fórmulas de peso ideal y GEB', q:'A diferencia de las ecuaciones de Harris-Benedict y Mifflin que requieren peso, talla y edad, ¿cuál es la única variable antropométrica (además de la constante fija) que utiliza la fórmula de Owen para calcular el GEB?', opts:['Talla en centímetros','Edad en años','Peso en kilogramos','Índice de Masa Corporal'], correct:2, exp:'La fórmula de Owen solo utiliza el peso: para hombres 879 + (10.2 × peso kg) y para mujeres 795 + (7.18 × peso kg).'},
      {cat:'Fórmulas de peso ideal y GEB', q:'Un paciente requiere cálculo de peso corregido tras perder su "Mano y antebrazo". Según la tabla de porcentajes de peso teórico ideal, ¿qué valor porcentual debes utilizar en la fórmula para este miembro amputado?', opts:['0.7%','1.5%','2.3%','5.0%'], correct:2, exp:'La "Mano y antebrazo" equivale a un 2.3% del peso teórico ideal (0.7% es solo la mano y 5.0% el brazo completo).'},
    ],
  },
];