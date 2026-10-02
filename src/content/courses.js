import { COURSE_ATP } from './atp.js';

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
  {
    id:'fisiopatologia-gi',
    label:'Fisiopatología Gastrointestinal y Nutrición',
    notes:[
      { id:'conceptos', label:'Conceptos Básicos de Patología', items:[
        { q:'¿Cuál es la diferencia entre Fisiología, Patología y Fisiopatología?', a:`La <strong>fisiología</strong> estudia el funcionamiento <strong>normal</strong> de los seres vivos, sus órganos y células para mantener el equilibrio interno. La <strong>patología</strong> estudia las <strong>enfermedades</strong> y sus alteraciones estructurales. La <strong>fisiopatología</strong> estudia las <strong>alteraciones de las funciones normales</strong> causadas por una enfermedad y explica los mecanismos por los que progresa.` },
        { q:'¿Qué se entiende por patogénesis?', a:`Es el proceso mediante el cual se origina y desarrolla una enfermedad, abarcando la secuencia de acontecimientos desde la acción del <strong>agente causal</strong> hasta la aparición de <strong>signos y síntomas</strong>.` },
        { q:'¿Qué son el agente patógeno y el factor de riesgo?', a:`<ul>
          <li><strong>Agente patógeno:</strong> cualquier organismo (bacterias, virus, hongos, parásitos) o sustancia capaz de causar una enfermedad al invadir un ser vivo y alterar su funcionamiento normal.</li>
          <li><strong>Factor de riesgo:</strong> característica, condición o hábito que aumenta la probabilidad de desarrollar una enfermedad sin ser necesariamente su causa directa.</li>
        </ul>` },
        { q:'¿Cómo se relacionan el cuadro clínico, el diagnóstico y el tratamiento?', a:`<ul>
          <li><strong>Cuadro clínico:</strong> conjunto de <strong>signos</strong> (alteraciones observables por el médico) y <strong>síntomas</strong> (manifestaciones percibidas solo por el paciente).</li>
          <li><strong>Diagnóstico:</strong> proceso de identificar la enfermedad evaluando signos, síntomas, antecedentes e interpretando datos clínicos, de laboratorio y gabinete.</li>
          <li><strong>Tratamiento:</strong> conjunto de medidas (médicas, nutricionales, quirúrgicas) destinadas a curar, aliviar síntomas, prevenir complicaciones y restaurar el funcionamiento normal.</li>
        </ul>` },
      ]},
      { id:'acalasia', label:'Acalasia y Espasmos Esofágicos', items:[
        { q:'¿Qué es la acalasia y qué la produce?', a:`Es un trastorno de la motilidad esofágica donde el <strong>EEI no se relaja</strong> adecuadamente al tragar. Se produce por daño o pérdida de neuronas del <strong>plexo mientérico</strong>, lo que provoca pérdida del peristaltismo, acumulación de alimento y dilatación esofágica. Sus síntomas principales: disfagia, regurgitación, dolor torácico, pirosis, tos nocturna y pérdida de peso.` },
        { q:'¿Cómo se diagnostica y trata la acalasia?', a:`La <strong>manometría esofágica de alta resolución</strong> es el estándar de oro (evalúa presiones y peristaltismo del EEI). Los tratamientos no farmacológicos buscan disminuir la presión del EEI:
        <ul>
          <li>Dilatación neumática con balón.</li>
          <li>Miotomía de Heller (cirugía).</li>
          <li>Miotomía endoscópica peroral (POEM).</li>
          <li>Aplicación de toxina botulínica.</li>
        </ul>
        La <strong>enfermedad de Chagas</strong> puede producir un cuadro similar por daño directo a los nervios del esófago.` },
        { q:'¿En qué consiste el espasmo esofágico difuso?', a:`Es una falla nerviosa por <strong>déficit de óxido nítrico (NO)</strong>: al perderse la inhibición del NO, la estimulación colinérgica (acetilcolina) actúa sin oposición y causa contracciones <strong>rápidas, simultáneas y descoordinadas</strong>. A diferencia de la acalasia, el <strong>EEI sí logra relajarse</strong> normalmente. En el trago de bario se ven contracciones terciarias y escasa progresión del bolo.` },
        { q:'¿Cómo se tratan los espasmos esofágicos?', a:`<ul>
          <li><strong>Medidas generales:</strong> comer despacio, evitar alimentos muy fríos o calientes y tratar el reflujo asociado.</li>
          <li><strong>Medicamentos:</strong> bloqueadores de los canales de calcio (diltiazem, nifedipino) y nitratos para relajar el músculo liso; inhibidores de bomba de protones y, en ocasiones, antidepresivos a dosis bajas para el dolor.</li>
        </ul>` },
        { q:'¿Cómo se comporta el EEI en la acalasia, el espasmo esofágico difuso y el EEI hipertenso?', a:`<ul>
          <li><strong>Acalasia:</strong> el EEI <strong>NO se relaja</strong> al tragar por pérdida de neuronas del plexo mientérico.</li>
          <li><strong>Espasmo Esofágico Difuso:</strong> el EEI <strong>SÍ logra relajarse normalmente</strong>; la alteración son contracciones simultáneas del cuerpo esofágico por déficit de óxido nítrico.</li>
          <li><strong>EEI Hipertenso:</strong> mantiene una presión de reposo elevada, pero <strong>SÍ conserva la relajación completa</strong> al deglutir.</li>
        </ul>` },
      ]},
      { id:'motilidad', label:'Motilidad Esofágica Hiper e Hipocontráctil', items:[
        { q:'¿Cuáles son las características del esófago en cascanueces?', a:`Neuropatía entérica leve con déficit de NO que produce contracciones <strong>muy fuertes, de gran amplitud y prolongadas</strong>, con aumento de la presión intraesofágica. Causa <strong>dolor torácico intenso no cardíaco</strong> que puede confundirse con un problema del corazón.` },
        { q:'¿Qué es el EEI hipertenso?', a:`Alteración donde el EEI mantiene una <strong>presión de reposo más alta</strong> de lo normal, por un desequilibrio autonómico local con predominio de la actividad excitatoria. Dificulta el paso del bolo, pero <strong>conserva la relajación al tragar</strong>, y también provoca dolor torácico intenso no cardíaco.` },
        { q:'¿Qué provoca el esófago hipocontráctil?', a:`Contracciones peristálticas <strong>demasiado débiles, fragmentadas o ausentes</strong> que no propulsan el bolo hacia el estómago. Se asocia a ERGE y a enfermedades neuromusculares. Aquí el <strong>EEI sí mantiene su relajación normal</strong>: el problema es la fuerza del esófago, no el esfínter.` },
        { q:'¿Cuándo se diagnostica motilidad esofágica ineficaz (Clasificación de Chicago v4.0)?', a:`Se requiere que más del <strong>70% de las degluciones sean ineficaces</strong> o al menos el <strong>50% sean degluciones fallidas</strong>.` },
        { q:'¿Qué atención nutricional se recomienda en los trastornos hipocontráctiles?', a:`Comer <strong>lentamente, masticando muy bien</strong>, en comidas pequeñas, hidratándose y adaptando la textura de los alimentos para facilitar el paso del bolo ante la debilidad peristáltica.` },
        { q:'¿En qué se diferencia la fuerza de contracción entre el esófago en cascanueces y el esófago hipocontráctil?', a:`<ul>
          <li><strong>Esófago en Cascanueces:</strong> contracciones de <strong>gran intensidad y amplitud</strong> (hipertensivas) pero coordinadas, que generan dolor torácico intenso simulando origen cardíaco.</li>
          <li><strong>Esófago Hipocontráctil (Motilidad Ineficaz):</strong> contracciones <strong>demasiado débiles, fragmentadas o ausentes</strong>, que provocan un tránsito del alimento lento o incompleto.</li>
        </ul>` },
      ]},
      { id:'erge', label:'Enfermedad por Reflujo Gastroesofágico (ERGE)', items:[
        { q:'¿Cuál es la etiología de la ERGE?', a:`Se origina por la <strong>pérdida de los mecanismos de barrera antirreflujo</strong>, lo que permite el contacto prolongado del ácido con la mucosa:
        <ul>
          <li>Hipotensión del esfínter esofágico inferior (EEI).</li>
          <li>Relajaciones transitorias inapropiadas del EEI.</li>
          <li>Hernia hiatal.</li>
          <li>Aumento de la presión intraabdominal.</li>
        </ul>` },
        { q:'¿Cómo se diagnostica la ERGE?', a:`Además de la <strong>endoscopia</strong> (donde se observan esofagitis erosiva, úlceras o estenosis péptica), se usan la <strong>pH-metría de 24 horas</strong> y la <strong>manometría esofágica</strong>.` },
        { q:'¿Cuáles son los síntomas extraesofágicos de la ERGE?', a:`Además de pirosis y regurgitación, puede provocar síntomas respiratorios como <strong>tos crónica o laringitis</strong> por el contacto del ácido con la vía aérea.` },
      ]},
      { id:'gastritis', label:'Gastritis', items:[
        { q:'¿Qué es la gastritis y cómo se clasifica según su causa?', a:`Es la <strong>inflamación del revestimiento de la capa mucosa</strong> del estómago:
        <ul>
          <li><strong>Aguda:</strong> por AINEs, alcohol, café y dieta rica en irritantes.</li>
          <li><strong>Crónica:</strong> frecuentemente por <em>Helicobacter pylori</em> (a través de alimentos contaminados o saliva).</li>
          <li><strong>Autoinmune:</strong> descontrol del sistema inmune (idiopática).</li>
        </ul>
        La aguda y la crónica comparten síntomas: dolor en epigastrio, pirosis, inapetencia, náuseas y vómito.` },
        { q:'¿Cuál es la patogénesis de la gastritis autoinmune y su relación con la anemia?', a:`El sistema inmune ataca las <strong>células parietales</strong> y al <strong>factor intrínseco</strong> del estómago. Sin factor intrínseco no se absorbe la <strong>vitamina B12</strong> en el intestino delgado, lo que provoca <strong>anemia perniciosa</strong> (mareo, palidez, fatiga) más que los dolores de estómago clásicos.` },
        { q:'¿Cómo se diagnostica y trata la gastritis crónica por H. pylori?', a:`<ul>
          <li><strong>Diagnóstico:</strong> endoscopia con biopsia gástrica y prueba de aliento.</li>
          <li><strong>Tratamiento:</strong> antibióticos y dieta libre de irritantes, condimentos, picantes y grasas.</li>
        </ul>` },
        { q:'¿Cuál es el tratamiento de la gastritis aguda?', a:`Es el ejemplo clásico de tratamiento causal: <strong>retirar el agente</strong> (medicamentos como AINEs o alcohol) y dar una dieta libre de irritantes.` },
        { q:'¿Cuáles son las diferencias en etiología y tratamiento entre la gastritis aguda, por H. pylori y autoinmune?', a:`<ul>
          <li><strong>Aguda:</strong> causada por <strong>AINEs, alcohol y dieta irritante</strong> → retirar el factor causal y dieta blanda.</li>
          <li><strong>Por H. pylori:</strong> infección bacteriana por alimentos contaminados → esquema obligatorio con <strong>antibióticos</strong>.</li>
          <li><strong>Autoinmune:</strong> fallo del sistema inmune que ataca las células parietales → sustitución con <strong>Vitamina B12</strong>.</li>
        </ul>
        La autoinmune se manifiesta principalmente como <strong>anemia perniciosa</strong> (fatiga, debilidad, mareo, palidez), a diferencia de la aguda o bacteriana que provocan dolor epigástrico y náuseas.` },
      ]},
      { id:'eii', label:'Enfermedad Inflamatoria Intestinal (EII)', items:[
        { q:'¿Cuáles son las diferencias anatómicas clave entre Enfermedad de Crohn y Colitis Ulcerosa?', a:`<ul>
          <li><strong>Ubicación:</strong> Crohn afecta cualquier parte (de la boca al ano); la CU solo el colon, comenzando en el recto.</li>
          <li><strong>Profundidad:</strong> Crohn es <strong>transmural</strong> (todas las capas); la CU se limita a mucosa y submucosa.</li>
          <li><strong>Patrón:</strong> Crohn es segmentario (en parches con áreas sanas); la CU es continuo.</li>
        </ul>` },
        { q:'¿Qué hallazgos endoscópicos son típicos de la Enfermedad de Crohn?', a:`Fístulas, engrosamiento mural, úlceras transmurales, estenosis, granulomas y patrón en <strong>"empedrado"</strong>. Por eso la complicación que la distingue de la CU es la inflamación transmural con fístulas y empedrado, no las lesiones superficiales.` },
        { q:'¿Cuáles son las cuatro fases evolutivas de la pared intestinal en el Crohn?', a:`<ol>
          <li>Fase inflamatoria (engrosamiento y úlceras).</li>
          <li>Fase penetrante (fístulas y abscesos).</li>
          <li>Fase fibroestenosante (estenosis de la luz).</li>
          <li>Fase reparativa (pólipos de regeneración).</li>
        </ol>` },
        { q:'¿Cuáles son las manifestaciones clínicas y extraintestinales de la Colitis Ulcerosa?', a:`Diarrea frecuente con sangre, moco o pus; dolor en fosa iliaca izquierda, <strong>tenesmo</strong> y síntomas extraintestinales: artritis o artralgias, lesiones cutáneas (eritema nodoso, pioderma gangrenoso), oculares (epiescleritis, uveítis) y alteraciones hepatobiliares. Una mucosa <strong>friable</strong> (que sangra al mínimo roce) es un hallazgo endoscópico típico.` },
        { q:'¿Cuáles son las diferencias en el cuadro clínico predominante entre la Enfermedad de Crohn y la Colitis Ulcerosa?', a:`<ul>
          <li><strong>Enfermedad de Crohn:</strong> predomina el <strong>dolor abdominal, pérdida de peso y fiebre</strong>, con complicaciones fistulizantes.</li>
          <li><strong>Colitis Ulcerosa:</strong> predomina la <strong>diarrea con sangre, tenesmo</strong> (urgencia de evacuar) y dolor en <strong>fosa ilíaca izquierda</strong>.</li>
        </ul>` },
        { q:'¿Cuáles son los factores de riesgo de la Enfermedad de Crohn?', a:`Edad (<strong>25 a 30 años</strong>), origen étnico (mayor en blancos), herencia familiar, uso de AINEs, residencia urbana/industrializada y el <strong>tabaquismo</strong>, que es el factor más controlable.` },
        { q:'¿Cuándo se indica la cirugía en el Crohn y cuándo aumenta el riesgo de cáncer en la CU?', a:`<ul>
          <li><strong>Cirugía en Crohn:</strong> cuando falla el tratamiento médico (inmunosupresores y biológicos) o hay complicaciones como perforación, obstrucciones o abscesos.</li>
          <li><strong>Cáncer colorrectal en CU:</strong> el riesgo aumenta en <strong>pancolitis</strong> y colitis izquierda de larga evolución.</li>
        </ul>` },
      ]},
      { id:'nutricion-eii', label:'Nutrición en la EII', items:[
        { q:'¿Qué alimentos se deben promover en la EII para reducir la inflamación?', a:`<ul>
          <li><strong>Almidón resistente:</strong> plátanos verdes, lentejas cocidas y enfriadas.</li>
          <li><strong>Polifenoles:</strong> bayas, té verde, nueces, manzanas y verduras oscuras.</li>
          <li><strong>Fibra:</strong> ya no se recomienda restringirla; una fibra variada favorece el microbioma.</li>
          <li><strong>Omega-3:</strong> pescados grasos y chía.</li>
          <li><strong>Prebióticos y probióticos.</strong></li>
        </ul>` },
        { q:'¿Qué alimentos y nutrientes se deben evitar en la EII?', a:`<ul>
          <li>Exceso de <strong>Omega-6</strong> (aceite de maíz, soya) — proinflamatorio.</li>
          <li><strong>Alcohol.</strong></li>
          <li>Altos consumos de <strong>carne roja</strong> (límite ~114 g/semana por riesgo de recaídas).</li>
          <li><strong>Aditivos</strong> de ultraprocesados: emulsionantes (polisorbato 80, carboximetilcelulosa), carbohidratos refinados y grasas trans.</li>
        </ul>` },
        { q:'¿Por qué combinar proteínas magras con vitamina C en la EII?', a:`Por la <strong>carencia de hierro</strong> común en la EII: las proteínas magras (pavo, pollo, pescado) aportan hierro y la vitamina C (cítricos, tomates) mejora su absorción. Para la colitis ulcerosa, la <strong>colonoscopia con biopsia</strong> es el estándar de oro diagnóstico.` },
      ]},
    ],
    cheats:[
      {n:'<4.5 s', l:'latencia distal · espasmo esofágico difuso'},
      {n:'>70%', l:'degluciones ineficaces · motilidad esofágica ineficaz'},
      {n:'>50%', l:'degluciones fallidas · motilidad ineficaz'},
      {n:'114 g/sem', l:'carne roja · límite en EII'},
      {n:'25–30 años', l:'riesgo · Enfermedad de Crohn'},
      {n:'Transmural', l:'afectación exclusiva de la Enfermedad de Crohn · todas las capas de la pared'},
      {n:'EEI no se relaja', l:'criterio definitorio de la Acalasia'},
      {n:'Anemia perniciosa', l:'complicación directa de la gastritis autoinmune · destrucción de células parietales'},
    ],
    keypoints:[
      'En la <strong>acalasia</strong> el EEI <strong>no se relaja</strong> al tragar; en el espasmo esofágico difuso y en la motilidad ineficaz (hipocontráctil), el EEI <strong>sí se relaja normalmente</strong>.',
      'La <strong>gastritis autoinmune</strong> destruye el factor intrínseco, impide la absorción de vitamina B12 y causa <strong>anemia perniciosa</strong> (mareo, palidez, fatiga).',
      'Ya <strong>no se recomienda restringir la fibra</strong> en la EII: una dieta con fibra variada, almidón resistente y polifenoles protege el microbioma.',
      'El <strong>tabaquismo</strong> es el factor de riesgo más controlable para la Enfermedad de Crohn.',
      'El Crohn es <strong>transmural</strong> (empedrado, fístulas, estenosis); la colitis ulcerosa afecta <strong>mucosa y submucosa</strong> con patrón continuo desde el recto.',
      'Cascanueces = contracciones <strong>excesivamente fuertes y de gran amplitud</strong> (dolor torácico); hipocontráctil = contracciones <strong>demasiado débiles o ausentes</strong> (propulsión ineficaz).',
      'Gastritis aguda = AINEs/alcohol (retirar la causa); H. pylori = bacteria (antibióticos); autoinmune = destrucción de células parietales y factor intrínseco (Vitamina B12).',
    ],
    questions:[
      {cat:'Conceptos Básicos de Patología', q:'Característica, condición o hábito que aumenta la probabilidad de desarrollar una enfermedad, aunque no necesariamente sea su causa directa:', opts:['Agente patógeno','Cuadro clínico','Factor de riesgo','Manifestación clínica'], correct:2, exp:'El factor de riesgo es el elemento ambiental, conductual o biológico que favorece la progresión de una enfermedad sin ser la causa obligada.'},
      {cat:'Conceptos Básicos de Patología', q:'¿Qué concepto define a cualquier microorganismo (bacteria, virus, hongo) capaz de provocar alteraciones en la salud al invadir un ser vivo?', opts:['Factor de riesgo','Agente patógeno','Cuadro clínico','Patogénesis'], correct:1, exp:'El agente patógeno es el organismo o factor biológico responsable de iniciar una enfermedad al afectar el funcionamiento normal.'},
      {cat:'Conceptos Básicos de Patología', q:'De acuerdo a la definición de patogénesis, ¿qué abarca este estudio?', opts:['Únicamente los síntomas finales','Las características conductuales del paciente','La secuencia de acontecimientos desde el agente causal hasta la aparición de signos y síntomas','Los tratamientos quirúrgicos'], correct:2, exp:'La patogénesis es el conjunto de mecanismos y la secuencia de eventos biológicos que explican cómo una causa original produce el desarrollo de la enfermedad.'},
      {cat:'Conceptos Básicos de Patología', q:'¿Qué comprende la "Fisiopatología" a diferencia de la "Patología" general?', opts:['Estudia solo las bacterias','Estudia las alteraciones de las funciones normales causadas por una enfermedad','Es el proceso de recetar fármacos','Identifica enfermedades por laboratorio'], correct:1, exp:'La patología estudia las alteraciones estructurales; la fisiopatología se enfoca en las alteraciones funcionales y los mecanismos biológicos por los que progresa la enfermedad.'},
      {cat:'Acalasia y Espasmos Esofágicos', q:'¿Cuál es la prueba diagnóstica principal (el estándar) para confirmar la acalasia y evaluar el funcionamiento del EEI?', opts:['Endoscopia digestiva alta','Manometría esofágica de alta resolución','Tránsito con bario','pH-metría de 24 horas'], correct:1, exp:'La manometría de alta resolución es la prueba principal que confirma la acalasia al evaluar directamente las presiones y el peristaltismo del esfínter.'},
      {cat:'Acalasia y Espasmos Esofágicos', q:'En el espasmo esofágico difuso, a diferencia de la acalasia, ¿qué estructura sí logra relajarse normalmente?', opts:['Esfínter esofágico superior','Cuerpo del esófago','Esfínter esofágico inferior (EEI)','Plexo mientérico'], correct:2, exp:'A diferencia de la acalasia donde el EEI no se relaja, en el espasmo esofágico difuso el esfínter funcional (EEI) sí logra relajarse de manera normal.'},
      {cat:'Acalasia y Espasmos Esofágicos', q:'La acalasia puede tener etiología desconocida, pero, ¿qué enfermedad infecciosa puede producir un cuadro similar por daño a los nervios del esófago?', opts:['Infección por H. pylori','Candidiasis esofágica','Enfermedad de Chagas','Tuberculosis'], correct:2, exp:'La enfermedad de Chagas puede producir un cuadro similar a la acalasia por el daño directo a los nervios que controlan el esófago.'},
      {cat:'Acalasia y Espasmos Esofágicos', q:'En el tratamiento médico de los espasmos esofágicos, ¿qué tipo de fármacos se utilizan para ayudar a relajar el músculo liso del esófago?', opts:['Antibióticos','Bloqueadores de los canales de calcio y nitratos','Inmunosupresores','Vitamina B12'], correct:1, exp:'Los bloqueadores de canales de calcio (diltiazem, nifedipino) y los nitratos relajan el músculo liso y disminuyen las contracciones anormales.'},
      {cat:'Motilidad Esofágica Hiper e Hipocontráctil', q:'¿Cuál es el síntoma principal tanto del esófago en cascanueces como del EEI hipertenso, que puede confundirse con un problema cardíaco?', opts:['Pirosis intensa','Tos nocturna','Dolor torácico intenso no cardíaco','Sangrado'], correct:2, exp:'En ambas alteraciones hipertensivas el aumento de presión provoca dolor torácico intenso y opresivo que suele confundirse con origen cardíaco.'},
      {cat:'Motilidad Esofágica Hiper e Hipocontráctil', q:'¿Qué medida de atención nutricional es clave para un paciente con trastornos hipocontráctiles del esófago?', opts:['Comer rápido para forzar el paso del bolo','Tomar suplementos de potasio','Comer lentamente, masticar muy bien y adaptar la textura de los alimentos','Consumir dieta rica en grasas'], correct:2, exp:'Ante la debilidad peristáltica se facilita el paso del bolo comiendo lento, con comidas pequeñas, hidratación y texturas adaptadas.'},
      {cat:'Motilidad Esofágica Hiper e Hipocontráctil', q:'¿Cuál es la etiología del Esófago en Cascanueces?', opts:['Hernia hiatal','Neuropatía entérica leve con déficit en la liberación de óxido nítrico','Daño transmural por isquemia','Infección viral'], correct:1, exp:'El esófago en cascanueces se debe a una neuropatía entérica leve con déficit de NO, que genera una respuesta de gran amplitud en el músculo liso.'},
      {cat:'Enfermedad por Reflujo Gastroesofágico (ERGE)', q:'En la ERGE, ¿cuáles son los síntomas extraesofágicos clásicos que puede presentar el paciente?', opts:['Pirosis y regurgitación','Disfagia a líquidos','Tos crónica o laringitis','Diarrea y dolor cólico'], correct:2, exp:'Además de los síntomas esofágicos, la ERGE puede provocar síntomas de vías respiratorias como tos crónica y laringitis.'},
      {cat:'Enfermedad por Reflujo Gastroesofágico (ERGE)', q:'En un paciente con sospecha de ERGE, se observan lesiones en el esófago. ¿Cuáles son los signos típicos encontrados por endoscopia?', opts:['Úlceras transmurales y granulomas','Esofagitis erosiva, úlceras o estenosis péptica','Empedrado mucoso','Várices esofágicas'], correct:1, exp:'Los signos endoscópicos de la ERGE incluyen esofagitis erosiva, úlceras y estenosis péptica por el contacto prolongado con el ácido.'},
      {cat:'Gastritis', q:'En un paciente con gastritis crónica por Helicobacter pylori, ¿cuál de los siguientes elementos de diagnóstico y tratamiento es el correcto?', opts:['Vitamina B12 y endoscopia sin biopsia','Retirar ingesta de AINEs y dar antiácidos','Endoscopia con biopsia, prueba de aliento y antibióticos','Cirugía gástrica y dieta líquida'], correct:2, exp:'El diagnóstico se apoya en endoscopia con biopsia y prueba de aliento, y el tratamiento principal son los antibióticos.'},
      {cat:'Gastritis', q:'¿Qué tipo de gastritis tiene como factor de riesgo característico estar asociado frecuentemente al género femenino y requerir tratamiento con vitamina B12?', opts:['Gastritis Aguda','Gastritis Crónica por H. pylori','Gastritis Autoinmune','Enfermedad de Crohn'], correct:2, exp:'La gastritis autoinmune tiene mayor riesgo en mujeres y exige suplementación de vitamina B12 al perderse el factor intrínseco.'},
      {cat:'Gastritis', q:'¿Cuál es un factor de riesgo específico para desarrollar Gastritis Crónica por Helicobacter pylori?', opts:['Consumo excesivo de AINEs','Ser de género femenino','Ingesta de alimentos contaminados','Exposición al sol'], correct:2, exp:'La bacteria se adquiere principalmente por la ingesta de alimentos contaminados; también está presente en la saliva.'},
      {cat:'Gastritis', q:'¿En cuál de las siguientes patologías estomacales el tratamiento principal es retirar el agente causal (como medicamentos o alcohol) y dar una dieta libre de irritantes?', opts:['Gastritis Aguda','Cáncer gástrico','Gastritis Crónica','Hernia Hiatal'], correct:0, exp:'Para la gastritis aguda ocasionada por AINEs o alcohol, el tratamiento primario es retirar la causa y ajustar la dieta.'},
      {cat:'Enfermedad Inflamatoria Intestinal (EII)', q:'Manifestación clínica o lesión característica de la Colitis Ulcerosa, que la distingue estructuralmente de la Enfermedad de Crohn:', opts:['Fístulas y abscesos profundos','Úlceras superficiales, pérdida de patrón vascular y pseudopolipos','Afectación segmentaria en "parches"','Granulomas y patrón de "empedrado"'], correct:1, exp:'La CU se limita a lesiones superficiales de la mucosa (úlceras superficiales, friabilidad difusa y pseudopolipos), mientras que fístulas y empedrado son del Crohn.'},
      {cat:'Enfermedad Inflamatoria Intestinal (EII)', q:'¿Qué complicación endoscópica y anatómica es característica de la Enfermedad de Crohn y no de la Colitis Ulcerosa?', opts:['Úlceras superficiales y pseudopolipos','Sangrado difuso de la mucosa','Úlceras transmurales, patrón de empedrado y fístulas','Pérdida del patrón vascular'], correct:2, exp:'Al ser transmural, el Crohn produce úlceras profundas, estenosis, "empedrado" y fístulas, a diferencia de la afección mucosa de la CU.'},
      {cat:'Enfermedad Inflamatoria Intestinal (EII)', q:'¿Cuál es el "estándar de oro" para diagnosticar la Colitis Ulcerosa?', opts:['Examen de sangre y heces','Radiografía con bario','Colonoscopia con biopsia','Prueba de aliento'], correct:2, exp:'La colonoscopia con biopsia es la prueba definitiva para observar la afectación continua desde el recto y confirmar los hallazgos histológicos.'},
      {cat:'Enfermedad Inflamatoria Intestinal (EII)', q:'El riesgo de padecer cáncer colorrectal aumenta en la EII. ¿En qué situación es más riesgoso para un paciente con Colitis Ulcerosa?', opts:['En pacientes con proctitis leve','En casos de pancolitis y colitis izquierda de larga evolución','Solo si hay úlceras aftoides','Si presentan patrón de empedrado'], correct:1, exp:'El riesgo aumenta especialmente en la afectación extensa (pancolitis) o colitis izquierda de larga evolución.'},
      {cat:'Enfermedad Inflamatoria Intestinal (EII)', q:'En la Enfermedad de Crohn, si el tratamiento médico con inmunosupresores y biológicos falla, ¿en qué casos se indica la cirugía?', opts:['Para prevenir dolor de cabeza','En todos los pacientes como primer paso','En caso de complicaciones como perforación, obstrucciones o abscesos','Para revertir la fase reparativa'], correct:2, exp:'La cirugía en Crohn se reserva para cuando falla el tratamiento médico o hay complicaciones graves como perforaciones, obstrucciones o abscesos.'},
      {cat:'Nutrición en la EII', q:'¿Cuál es el límite máximo recomendado de ingesta de carne roja a la semana para pacientes con EII, debido al riesgo de recaídas?', opts:['500 gramos/semana','114 gramos/semana','300 gramos/semana','No hay límite si es carne magra'], correct:1, exp:'El alto consumo de carne roja se asocia a recaídas en EII, por lo que su ingesta debe limitarse a 114 gramos/semana.'},
      {cat:'Nutrición en la EII', q:'De los siguientes tipos de grasas, ¿cuál está asociada a un aumento de la inflamación intestinal en la EII y por tanto conviene limitar?', opts:['Ácidos grasos monoinsaturados (aceite de oliva)','Poliinsaturados Omega-3 (salmón)','Poliinsaturados Omega-6 (aceite de maíz, soya)','Grasas de los frutos secos'], correct:2, exp:'El exceso de Omega-6 (aceite de maíz, soya) aumenta la inflamación; el Omega-3 y las monoinsaturadas son antiinflamatorias.'},
      {cat:'Nutrición en la EII', q:'En relación a la fibra alimentaria en pacientes con EII, ¿cuál es la recomendación nutricional actual?', opts:['Restringir toda la fibra permanentemente','Ya no se recomienda restringir la fibra; se debe consumir fibra variada','Consumir únicamente fibra insoluble','Suplementar solo en caso de cirugía'], correct:1, exp:'Actualmente ya no se recomienda restringir la fibra; una dieta rica en fuentes variadas es crucial para el microbioma y la mucosa.'},
    ],
  },
  {
    id:'epidemiologia-y-nutricion',
    label:'Epidemiología y Nutrición',
    notes:[
      { id:'conceptos-epidemiologia', label:'Conceptos Básicos de Epidemiología', items:[
        { q:'¿Qué es la Epidemiología?', a:`Ciencia que estudia la <strong>distribución, frecuencia y factores</strong> que influyen en la aparición de enfermedades y otros eventos de salud en las poblaciones para prevenirlos y controlarlos.` },
        { q:'¿Qué diferencia hay entre Epidemia y Pandemia?', a:`<ul>
          <li><strong>Epidemia:</strong> aumento inusual o inesperado del número de casos en una población, lugar y período determinado.</li>
          <li><strong>Pandemia:</strong> epidemia que se extiende a varios países o continentes y afecta a un gran número de personas con transmisión sostenida.</li>
        </ul>` },
        { q:'¿Qué son el Agente y el Huésped?', a:`<ul>
          <li><strong>Agente:</strong> factor biológico, químico o físico capaz de causar una enfermedad o daño.</li>
          <li><strong>Huésped:</strong> organismo que alberga a un agente causal de enfermedad y en el que este puede vivir, multiplicarse o desarrollarse.</li>
        </ul>` },
        { q:'¿Qué diferencian a la Enfermedad y a la Salud?', a:`<ul>
          <li><strong>Enfermedad:</strong> alteración del estado normal de salud de un organismo que afecta su funcionamiento (manifestada por signos y síntomas).</li>
          <li><strong>Salud:</strong> estado de bienestar físico, mental y social, y no solamente la ausencia de enfermedades o padecimientos.</li>
        </ul>` },
        { q:'¿Qué papel juegan la Estadística y las Variables?', a:`La <strong>estadística</strong> recopila, analiza e interpreta datos para identificar patrones de riesgo. Las <strong>variables</strong> son características que cambian entre personas, lugares o períodos de tiempo.` },
      ]},
      { id:'usos-aplicaciones-epidemiologia', label:'Usos y Campos de la Epidemiología', items:[
        { q:'¿Cuáles son los usos principales de la epidemiología?', a:`Identificar factores de riesgo y causas de enfermedades, evaluar programas de salud, planificar servicios, prevenir enfermedades y promover la salud.` },
        { q:'¿Cuáles son los 4 grandes campos de acción epidemiológica?', a:`<ul>
          <li>Estudios de la situación de salud en diferentes grupos de población y determinantes.</li>
          <li>Vigilancia epidemiológica de enfermedades y problemas de salud.</li>
          <li>Investigación de determinantes de la salud y explicación de problemas prioritarios.</li>
          <li>Evaluación de servicios de salud, intervenciones, tecnología y calidad de vida.</li>
        </ul>` },
        { q:'¿Cómo se aplica en la nutrición?', a:`Los estudios epidemiológicos permiten determinar el <strong>papel de la dieta</strong> en la aparición y desarrollo de enfermedades en la población.` },
      ]},
      { id:'enfermedades-cronicas', label:'Enfermedades Crónicas y Factores de Riesgo', items:[
        { q:'¿Qué características tienen las enfermedades crónicas?', a:`Tienen origen <strong>multifactorial</strong>, acumulación de exposición durante años, larga duración y <strong>NO son fácilmente reversibles ni curables</strong>.` },
        { q:'¿Cuáles son los factores de riesgo NO modificables en ECV?', a:`<strong>Edad</strong>, <strong>sexo</strong>, <strong>historia familiar</strong> y <strong>estado menopáusico</strong>.` },
        { q:'¿Cuáles son los factores de riesgo modificables en ECV?', a:`Peso/calorías, presión arterial, colesterol sanguíneo, grado de oxidación lipoproteica, niveles de homocisteína/vitaminas grupo B, consumo de alcohol, tabaco y actividad física.` },
      ]},
      { id:'vitaminas-liposolubles', label:'Vitaminas Liposolubles (A, D, E, K)', items:[
        { q:'¿Qué son las vitaminas liposolubles?', a:`Vitaminas solubles en grasas y aceites (A, D, E, K).` },
        { q:'¿Cuáles son los nombres químicos y fuentes de las Vitaminas A y D?', a:`<ul>
          <li><strong>Vitamina A (Retinol, Carotenoides):</strong> hígado, zanahoria, camote, espinaca, mango, melón, huevo, leche.</li>
          <li><strong>Vitamina D (Calciferol / D2 y D3):</strong> salmón, atún, sardina, yema de huevo, leche fortificada, exposición solar.</li>
        </ul>` },
        { q:'¿Cuáles son los nombres químicos y fuentes de las Vitaminas E y K?', a:`<ul>
          <li><strong>Vitamina E (Tocoferoles, Tocotrienoles):</strong> aceites vegetales, almendras, semillas de girasol, espinaca, brócoli.</li>
          <li><strong>Vitamina K (Filoquinona, Menaquinona):</strong> espinaca, acelga, col rizada, brócoli, lechuga.</li>
        </ul>` },
      ]},
      { id:'vitaminas-hidrosolubles', label:'Vitaminas Hidrosolubles (Grupo B y C)', items:[
        { q:'¿Cuáles son las vitaminas B1, B2 y B3?', a:`<ul>
          <li><strong>Vitamina B1 (Tiamina):</strong> granos integrales, legumbres, nueces, semillas, carne magra, huevo.</li>
          <li><strong>Vitamina B2 (Riboflavina):</strong> leche, yogurt, queso, huevo, hígado, vegetales verdes.</li>
          <li><strong>Vitamina B3 (Niacina):</strong> pollo, pescado, carne de res, cacahuate, cereales integrales.</li>
        </ul>` },
        { q:'¿Cuáles son las vitaminas B5, B6 y B7?', a:`<ul>
          <li><strong>Vitamina B5 (Ácido Pantoténico):</strong> carne, pollo, pescado, huevo, champiñones, aguacate.</li>
          <li><strong>Vitamina B6 (Piridoxina):</strong> plátano, aguacate, legumbres, carne de res, pollo, nueces.</li>
          <li><strong>Vitamina B7 (Biotina):</strong> yema de huevo, nueces, semillas, hígado, pescado.</li>
        </ul>` },
        { q:'¿Cuáles son las vitaminas B9, B12 y C?', a:`<ul>
          <li><strong>Vitamina B9 (Folato / Ácido Fólico):</strong> espinaca, acelga, lentejas, frijoles, espárragos, cítricos.</li>
          <li><strong>Vitamina B12 (Cobalamina):</strong> carne, pescado, mariscos, leche, huevo, alimentos fortificados.</li>
          <li><strong>Vitamina C (Ácido Ascórbico):</strong> naranja, limón, kiwi, fresa, pimiento, brócoli, tomate.</li>
        </ul>` },
      ]},
      { id:'fibra-dietetica', label:'Tipos de Fibra Dietética', items:[
        { q:'¿Qué características y funciones tiene la Fibra Soluble?', a:`Absorbe agua y forma un <strong>gel durante la digestión</strong>. Ayuda a <strong>disminuir el colesterol</strong> y controlar la glucosa. Fuentes: avena, cebada, nueces, semillas, frijoles, lentejas, manzanas, cítricos.` },
        { q:'¿Qué características y funciones tiene la Fibra Insoluble?', a:`<strong>Aumenta el volumen de las heces</strong> y acelera el tránsito intestinal. Fuentes: salvado de trigo, cereales integrales, verduras, granos enteros, arroz integral.` },
      ]},
    ],
    cheats:[
      {n:'A, D, E, K', l:'vitaminas liposolubles · solubles en grasas'},
      {n:'B1 a B12 y C', l:'vitaminas hidrosolubles · solubles en agua'},
      {n:'Retinol', l:'nombre químico de la Vitamina A'},
      {n:'Calciferol', l:'nombre químico de la Vitamina D'},
      {n:'Tocoferol', l:'nombre químico de la Vitamina E'},
      {n:'Filoquinona', l:'nombre químico de la Vitamina K'},
      {n:'Cobalamina', l:'Vitamina B12 · presente en alimentos origen animal'},
      {n:'Gel digestivo', l:'efecto de la fibra soluble · reduce colesterol y glucosa'},
    ],
    keypoints:[
      'La <strong>epidemiología</strong> estudia la distribución y determinantes de la salud para prevenir enfermedades.',
      'Las <strong>enfermedades crónicas</strong> son multifactoriales, de larga duración y no curables fácilmente.',
      'La <strong>edad, sexo e historia familiar</strong> son factores de riesgo no modificables en enfermedades cardiovasculares.',
      'Las <strong>vitaminas A, D, E y K</strong> son de tipo liposoluble.',
      'La <strong>Vitamina B12 (Cobalamina)</strong> se encuentra principalmente en carnes, pescados, mariscos, leche y huevo.',
      'La <strong>Vitamina C (Ácido Ascórbico)</strong> abunda en cítricos, kiwi, fresas y pimientos.',
      'La <strong>fibra soluble</strong> forma un gel que disminuye el colesterol y controla la glucosa sanguínea.',
      'La <strong>fibra insoluble</strong> aumenta el volumen fecal y acelera el tránsito intestinal.',
    ],
    questions:[
      {cat:'Conceptos Básicos de Epidemiología', q:'¿Cómo se define la disciplina que estudia la frecuencia, distribución y determinantes de la salud en las poblaciones?', opts:['Estadística','Epidemiología','Etiología','Patología'], correct:1, exp:'La epidemiología es la ciencia enfocada en la distribución, frecuencia y factores determinantes de la salud en poblaciones.'},
      {cat:'Conceptos Básicos de Epidemiología', q:'¿Qué término describe una epidemia que se extiende a varios países o continentes con transmisión sostenida?', opts:['Endemia','Brote','Pandemia','Agente'], correct:2, exp:'Una pandemia es una epidemia de alcance mundial o intercontinental con transmisión comunitaria sostenida.'},
      {cat:'Conceptos Básicos de Epidemiología', q:'¿Qué elemento de la cadena epidemiológica se define como el organismo que alberga al agente causal?', opts:['Vector','Agente','Ambiente','Huésped'], correct:3, exp:'El huésped es el organismo que alberga al agente patógeno y donde este puede desarrollarse o multiplicarse.'},
      {cat:'Usos y Campos de la Epidemiología', q:'¿Cuál de los siguientes NO es un campo principal de acción de la epidemiología?', opts:['Estudios de situación de salud','Vigilancia epidemiológica','Prescripción de fármacos individuales','Evaluación de servicios de salud'], correct:2, exp:'La atención y prescripción clínica individual no es un campo de la epidemiología poblacional.'},
      {cat:'Enfermedades Crónicas y Factores de Riesgo', q:'¿Cuál de las siguientes opciones es un factor de riesgo NO modificable para enfermedades cardiovasculares?', opts:['Presión arterial','Historia familiar','Consumo de alcohol','Nivel de actividad física'], correct:1, exp:'La historia familiar, edad, sexo y estado menopáusico son factores biológicos no modificables.'},
      {cat:'Enfermedades Crónicas y Factores de Riesgo', q:'¿Qué característica define a las enfermedades crónicas como el cáncer o la diabetes?', opts:['Son de fácil curación','Tienen origen multifactorial y larga duración','Se transmiten por bacterias','Aparecen en pocos días'], correct:1, exp:'Tienen un desarrollo prolongado en el tiempo y dependen de múltiples factores genéticos y ambientales.'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'¿Cuál es el nombre químico principal de la Vitamina A?', opts:['Calciferol','Retinol','Tocoferol','Piridoxina'], correct:1, exp:'El retinol (junto con los carotenoides) es la forma química representativa de la Vitamina A.'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'¿Qué fuente de alimentos destaca principalmente por aportar Vitamina A en forma de carotenoides?', opts:['Zanahoria, camote y espinaca','Pollo y res','Salmón y sardina','Arroz e integrales'], correct:0, exp:'Los vegetales anaranjados y de hoja verde como la zanahoria, camote y espinaca son ricos en carotenoides.'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'¿Cuál es la denominación química de la Vitamina D?', opts:['Filoquinona','Niacina','Calciferol','Riboflavina'], correct:2, exp:'La Vitamina D también recibe el nombre químico de Calciferol (D2 / D3).'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'Además de los pescados grasos y la yema de huevo, ¿qué factor estimula la síntesis de Vitamina D?', opts:['Ingesta de fibra','Exposición solar','Consumo de cítricos','Ejercicio aeróbico'], correct:1, exp:'La radiación solar en la piel activa la producción endógena de vitamina D.'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'¿Bajo qué nombre químico se conocen las formas biológicas de la Vitamina E?', opts:['Tocoferoles y tocotrienoles','Menaquinona','Tiamina','Cobalamina'], correct:0, exp:'La Vitamina E está conformada por la familia de los tocoferoles y tocotrienoles.'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'¿Cuáles son las fuentes alimentarias más importantes de Vitamina E?', opts:['Pescados y mariscos','Aceites vegetales, almendras y semillas','Leche y derivados','Cítricos y kiwi'], correct:1, exp:'Los aceites vegetales, las nueces (almendras) y las semillas de girasol son las fuentes principales de Vitamina E.'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'Filoquinona y Menaquinona son nombres químicos asociados a:', opts:['Vitamina A','Vitamina B1','Vitamina K','Vitamina C'], correct:2, exp:'Corresponden a las formas de la Vitamina K (K1 filoquinona y K2 menaquinona).'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'¿En qué grupo de alimentos predomina la Vitamina K?', opts:['Hortalizas de hoja verde (espinaca, acelga, brócoli','Carnes rojas magras','Frutas cítricas','Cereales integrales'], correct:0, exp:'Las verduras verdes como espinaca, acelga, col y brócoli son muy ricas en Vitamina K.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Cuál es el nombre químico de la Vitamina B1?', opts:['Riboflavina','Tiamina','Niacina','Biotina'], correct:1, exp:'La Vitamina B1 es conocida químicamente como Tiamina.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Cuál es la denominación química de la Vitamina B2 y en qué alimentos abunda?', opts:['Tiamina · cítricos','Riboflavina · leche, yogurt, queso y huevo','Niacina · legumbres','Piridoxina · plátano'], correct:1, exp:'La Vitamina B2 es la Riboflavina y se obtiene principalmente de la leche y derivados lácteos.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Qué nombre recibe la Vitamina B3?', opts:['Ácido Fólico','Niacina','Cobalamina','Ácido Pantoténico'], correct:1, exp:'La Vitamina B3 es la Niacina.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'El Ácido Pantoténico corresponde a cuál de las siguientes vitaminas:', opts:['Vitamina B5','Vitamina B6','Vitamina B7','Vitamina B9'], correct:0, exp:'La Vitamina B5 es llamada Ácido Pantoténico.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Cuál es el nombre químico de la Vitamina B6 y cuál es una de sus fuentes principales?', opts:['Piridoxina · plátano y aguacate','Cobalamina · cítricos','Folato · leche','Tiamina · carne de res'], correct:0, exp:'La Vitamina B6 es la Piridoxina, presente en plátano, aguacate, nueces y carnes.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Qué nombre químico recibe la Vitamina B7?', opts:['Biotina','Niacina','Retinol','Calciferol'], correct:0, exp:'La Vitamina B7 se conoce como Biotina.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'Los Folatos o Ácido Fólico corresponden a la Vitamina:', opts:['Vitamina B3','Vitamina B6','Vitamina B9','Vitamina B12'], correct:2, exp:'La Vitamina B9 es el Folate / Ácido Fólico.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Cuál es el nombre químico de la Vitamina B12 y en qué alimentos se encuentra mayoritariamente?', opts:['Piridoxina · vegetales verdes','Cobalamina · origen animal (carne, pescado, huevo, leche)','Ácido Ascórbico · frutas','Niacina · cereales'], correct:1, exp:'La Vitamina B12 es la Cobalamina y se halla casi exclusivamente en alimentos de origen animal.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Cuál es el nombre químico de la Vitamina C?', opts:['Ácido Pantoténico','Ácido Ascórbico','Ácido Fólico','Biotina'], correct:1, exp:'La Vitamina C se denomina químicamente Ácido Ascórbico.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Cuáles alimentos son fuentes de Vitamina C según los apuntes?', opts:['Naranja, kiwi, fresa, pimiento y brócoli','Leche, queso y mantequilla','Carne de res y pollo','Avena y cebada'], correct:0, exp:'Cítricos, fresas, kiwi, pimientos, brócoli y tomates son fuentes principales de Ácido Ascórbico.'},
      {cat:'Tipos de Fibra Dietética', q:'¿Qué acción realiza la fibra soluble en el tracto digestivo?', opts:['Inhibe la absorción de agua','Forma un gel que ayuda a reducir el colesterol y glucosa','Aumenta únicamente la velocidad sin absorber líquidos','Destruye las vitaminas hidrosolubles'], correct:1, exp:'La fibra soluble absorbe agua formando un gel que retarda la absorción de glucosa y reduce el colesterol.'},
      {cat:'Tipos de Fibra Dietética', q:'¿Cuál es la función principal de la fibra insoluble?', opts:['Formar geles con grasa','Aumentar el volumen fecal y acelerar el tránsito intestinal','Reducir los niveles de glucosa directamente','Aportar vitaminas liposolubles'], correct:1, exp:'La fibra insoluble no forma geles; añade volumen a las heces y promueve la motilidad intestinal.'},
      {cat:'Conceptos Básicos de Epidemiología', q:'¿Cómo se le denomina al incremento inusual e inesperado del número de casos en una población y lugar determinado?', opts:['Epidemia','Salud pública','Pandemia','Variable'], correct:0, exp:'Una epidemia es un aumento de casos por encima de lo que normalmente se espera en un período y lugar específico.'},
      {cat:'Conceptos Básicos de Epidemiología', q:'¿Qué es un "agente" según los conceptos básicos de epidemiología?', opts:['Una persona enferma','Un factor biológico, químico o físico capaz de causar daño','Un método de recolección de datos','El estado completo de bienestar'], correct:1, exp:'El agente es el factor biológico, químico o físico que origina la enfermedad o lesión en el organismo.'},
      {cat:'Conceptos Básicos de Epidemiología', q:'¿Qué abarca el concepto de Salud?', opts:['Ausencia total de dolor físico únicamente','Estado de bienestar físico, mental y social','Ausencia de bacterias en el cuerpo','Capacidad para hacer ejercicio diario'], correct:1, exp:'La salud es un estado completo de bienestar físico, mental y social, no solo la ausencia de enfermedades.'},
      {cat:'Conceptos Básicos de Epidemiología', q:'¿Cuál es la función principal de la estadística aplicada a la epidemiología?', opts:['Tratar quirúrgicamente a los pacientes','Recopilar, analizar e interpretar datos para identificar patrones de riesgo','Prescribir medicamentos específicos','Eliminar los agentes biológicos del ambiente'], correct:1, exp:'La estadística aporta los métodos para analizar los datos de salud e identificar factores de riesgo poblacionales.'},
      {cat:'Usos y Campos de la Epidemiología', q:'¿Para qué sirven los estudios epidemiológicos en el ámbito de la nutrición?', opts:['Para vender suplementos alimenticios','Para determinar el papel de la dieta en la aparición y desarrollo de enfermedades','Para crear recetarios de cocina','Para medir únicamente el peso corporal'], correct:1, exp:'Permiten evaluar de qué manera influyen los patrones alimentarios en el desarrollo de patologías a nivel poblacional.'},
      {cat:'Usos y Campos de la Epidemiología', q:'¿Qué actividad epidemiológica se encarga del seguimiento constante de las enfermedades y eventos de salud?', opts:['Vigilancia epidemiológica','Miotomía','Ensayo de laboratorio','Cirugía ambulatoria'], correct:0, exp:'La vigilancia epidemiológica monitorea de forma continua la ocurrencia y tendencias de los eventos de salud.'},
      {cat:'Usos y Campos de la Epidemiología', q:'¿Cuál es uno de los objetivos de la evaluación epidemiológica de servicios de salud?', opts:['Aumentar el costo de las consultas','Valorar intervenciones, tecnología y calidad de vida en las poblaciones','Diagnosticar mutaciones genéticas raras','Diseñar envases de medicamentos'], correct:1, exp:'Busca medir el impacto y la efectividad de las intervenciones, servicios y tecnologías en la salud de la comunidad.'},
      {cat:'Enfermedades Crónicas y Factores de Riesgo', q:'¿Cuál de los siguientes factores de riesgo cardiovasculares SÍ es modificable a través del estilo de vida?', opts:['Edad','Sexo','Consumo de tabaco y dieta','Historia familiar'], correct:2, exp:'El tabaquismo, la alimentación, la actividad física y el peso son factores totalmente modificables.'},
      {cat:'Enfermedades Crónicas y Factores de Riesgo', q:'¿Qué alteración metabólica vinculada a las vitaminas del grupo B influye como factor de riesgo cardiovascular?', opts:['Niveles de homocisteína','Absorción de sodio','Niveles de glucosa en saliva','Acumulación de glucógeno hepático'], correct:0, exp:'Las vitaminas del grupo B participan en el metabolismo de la homocisteína, cuyo aumento es un factor de riesgo cardiovascular.'},
      {cat:'Enfermedades Crónicas y Factores de Riesgo', q:'¿Por qué es fundamental la prevención primaria en las enfermedades crónicas?', opts:['Porque se curan rápidamente con antibióticos','Porque no son fácilmente reversibles ni curables una vez desarrolladas','Porque desaparecen al bajar de peso en un día','Porque no presentan ningún signo ni síntoma'], correct:1, exp:'Al ser patologías irreversibles o no curables del todo, la prevención es la estrategia clave.'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'Además del hígado y el huevo, ¿qué frutas aportan Vitamina A según los apuntes?', opts:['Manzana y pera','Mango y melón','Cítricos y kiwi','Plátano y aguacate'], correct:1, exp:'El mango y el melón son fuentes de carotenoides o vitamina A señaladas en la lista.'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'¿Qué pescados son fuentes destacadas de Vitamina D según la tabla proporcionada?', opts:['Salmón, atún y sardina','Filete de tilapia y mojarra','Marisco y camarón','Bacalao seco exclusivamente'], correct:0, exp:'El salmón, el atún y la sardina son pescados grasos con alto contenido de vitamina D.'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'¿Qué vegetal de hoja verde aporta tanto Vitamina E como Vitamina K y Vitamina A?', opts:['Pimiento rojo','Espinaca','Cebolla','Papa'], correct:1, exp:'La espinaca es una fuente compartida muy importante de vitaminas A, E y K.'},
      {cat:'Vitaminas Liposolubles (A, D, E, K)', q:'¿Qué característica general distingue a las vitaminas A, D, E y K del grupo B y C?', opts:['Se disuelven en agua','Son liposolubles (se disuelven en grasas)','Se eliminan inmediatamente por la orina','No se encuentran en alimentos de origen animal'], correct:1, exp:'Las vitaminas A, D, E y K son solubles en lípidos y grasas.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Cuáles son fuentes representativas de Tiamina (Vitamina B1)?', opts:['Cítricos y tomates','Granos integrales y legumbres','Pescados grasos únicamente','Aceites de cocina'], correct:1, exp:'Los granos integrales, semillas, legumbres y frutos secos son fuentes clave de B1.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'Además de los lácteos, ¿qué víscera aporta una cantidad destacada de Riboflavina (B2)?', opts:['Corazón','Hígado','Pulmón','Riñón de cerdo'], correct:1, exp:'El hígado es una fuente sobresaliente de vitamina B2 y de muchas otras del grupo B.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Cuál de las siguientes fuentes de origen vegetal destaca en el aporte de Niacina (B3)?', opts:['Cacahuate (maní)','Naranja','Camote','Brócoli'], correct:0, exp:'El cacahuate y los cereales integrales son buenas fuentes de niacina.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Qué alimento del reino de los hongos destaca por contener Ácido Pantoténico (B5)?', opts:['Champiñones','Levadura salada','Algas','Cacao en polvo'], correct:0, exp:'Los champiñones están listados específicamente como fuente de vitamina B5.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Qué frutas frescas destacan en el aporte de Piridoxina (B6)?', opts:['Plátano y aguacate','Manzana y uva','Sandía y melón','Fresa y limón'], correct:0, exp:'El plátano y el aguacate son fuentes vegetales representativas de vitamina B6.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Cuál de las siguientes es una fuente de Biotina (B7) señalada en los apuntes?', opts:['Yema de huevo, nueces e hígado','Aceite de oliva puro','Zumo de limón','Arroz blanco refinado'], correct:0, exp:'La yema de huevo, las nueces, las semillas y el hígado son ricos en B7.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Qué legumbres son especialmente ricas en Folato (Vitamina B9)?', opts:['Lentejas y frijoles','Maíz y trigo','Cacahuates y almendras','Arroz entero'], correct:0, exp:'Las lentejas, los frijoles y las verduras de hoja verde son excelentes fuentes de folatos.'},
      {cat:'Vitaminas Hidrosolubles (Grupo B y C)', q:'¿Por qué la Vitamina B12 requiere especial atención en dietas estrictamente vegetarianas o veganas?', opts:['Porque se destruye con la luz','Porque se encuentra de forma natural en alimentos de origen animal','Porque abunda en todas las frutas','Porque es una vitamina liposoluble'], correct:1, exp:'Al estar presente en carnes, mariscos, huevos y lácteos, se requiere suplementación o alimentos fortificados en dietas veganas.'},
      {cat:'Tipos de Fibra Dietética', q:'¿Cuáles son fuentes típicas de fibra soluble?', opts:['Avena, cebada y legumbres','Manzana y cítricos','Salvado de trigo únicamente','Carnes rojas y pescado'], correct:0, exp:'La avena, la cebada, las semillas, los frijoles, las lentejas y frutas como la manzana contienen fibra soluble.'},
      {cat:'Tipos de Fibra Dietética', q:'¿Qué alimentos son buenas fuentes de fibra insoluble según la tabla?', opts:['Salvado de trigo, cereales integrales, verduras y arroz integral','Aceite de girasol y nueces','Leche y yogurt','Naranja y fresa'], correct:0, exp:'El salvado de trigo, los granos enteros y las verduras aportan fibra de tipo insoluble.'},
    ],
  },
];