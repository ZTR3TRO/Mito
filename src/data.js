const NOTES = [
  { id:'intro', label:'Introducción', items:[
    { q:'Nutrición celular vs. nutrición del organismo', a:`La célula y el ser vivo son sistemas que, gracias a un aporte constante de materia y energía, realizan trabajo químico y mecánico para mantener su equilibrio interno (homeostasis).<br><br>La nutrición ocurre en dos niveles: el del <strong>organismo completo</strong> y el <strong>celular</strong>. Se relacionan por sistemas de transporte (aparato circulatorio, haces vasculares), pero pueden ser independientes: el tipo de nutrición de una célula puede diferir del de todo el organismo.` },
    { q:'¿Qué es el metabolismo?', a:`Conjunto de reacciones químicas, catalizadas por enzimas, que ocurren dentro de las células y transforman unas biomoléculas en otras, para obtener materia y energía destinadas a tres funciones vitales: <strong>nutrición, relación y reproducción</strong>.<br><br>Esa materia no solo sirve para crecer: también renueva estructuras propias (el cuerpo humano renueva casi todas sus células cada siete años).` },
    { q:'Tipos de rutas metabólicas', a:`<ul>
      <li><strong>Convergentes:</strong> varios sustratos → un producto común.</li>
      <li><strong>Divergentes:</strong> un precursor → múltiples productos.</li>
      <li><strong>Cíclicas:</strong> el punto de partida se regenera al final del ciclo.</li>
    </ul>` },
    { q:'Trabajo químico y mecánico de la célula', a:`La energía metabólica no solo se transforma en calor: puede convertirse en <strong>energía mecánica</strong> (movimiento), <strong>eléctrica</strong> (impulso nervioso), <strong>luminosa</strong> (bioluminiscencia) o mantenerse como <strong>energía química</strong> almacenada en enlaces. Esta versatilidad es la base de por qué el metabolismo sostiene todas las funciones vitales.` },
  ]},
  { id:'anacata', label:'Anabolismo / Catabolismo', items:[
    { q:'Anabolismo: definición y ejemplos', a:`Procesos que construyen sustancias orgánicas complejas a partir de otras más simples. <strong>Consumen energía</strong> (ATP) y poder reductor (NADH, FADH₂).<br><br>Ejemplos: fotosíntesis, síntesis de proteínas a partir de aminoácidos, replicación del ADN.` },
    { q:'Catabolismo: definición y ejemplos', a:`Procesos de oxidación que degradan biomoléculas grandes en otras más pequeñas. <strong>Liberan energía</strong>, parte de la cual se almacena en ATP.<br><br>Ejemplos: contracción muscular, mantenimiento de la temperatura corporal.` },
    { q:'¿Por qué se separan físicamente?', a:`Aunque funcionan en paralelo, anabolismo y catabolismo no son simplemente procesos inversos. Suelen ocurrir en compartimentos distintos para <strong>evitar interferencias</strong> entre rutas incompatibles (por ejemplo, síntesis y degradación de ácidos grasos).` },
    { q:'Tabla comparativa rápida', a:`<ul>
      <li><strong>Catabolismo:</strong> fase degradativa y oxidativa · degrada nutrientes complejos · produce poder reductor (NADH, FADH₂) · genera ATP.</li>
      <li><strong>Anabolismo:</strong> fase sintética y reductiva · construye componentes celulares · consume ATP y poder reductor · genera macromoléculas complejas.</li>
    </ul>` },
  ]},
  { id:'bioenerg', label:'Bioenergética', items:[
    { q:'Energía libre de Gibbs (ΔG)', a:`Indica si una reacción es espontánea o no:
      <ul>
        <li><strong>Exergónica (ΔG &lt; 0):</strong> libera energía para el trabajo celular a partir de la degradación de nutrientes — propia del catabolismo.</li>
        <li><strong>Endergónica (ΔG &gt; 0):</strong> absorbe energía aplicada al funcionamiento celular, produciendo nuevos componentes — propia del anabolismo.</li>
      </ul>` },
    { q:'Acoplamiento energético', a:`Las células acoplan reacciones desfavorables (endergónicas) a reacciones favorables (exergónicas) para hacer posibles procesos que no ocurrirían solos.<br><br>Los transportadores <strong>NAD⁺/NADH</strong> y <strong>FAD/FADH₂</strong> capturan energía en oxidaciones y la entregan donde se necesita. La termodinámica no es una barrera, es una herramienta de control celular.` },
    { q:'Enlaces de "alta energía" del ATP', a:`Romper el enlace covalente oxígeno-fosfato requiere ~100 kcal, pero lo que importa en bioquímica es la energía libre liberada al <strong>transferir</strong> un fosfato a otra molécula:
      <ul>
        <li>ATP + H₂O → ADP + Pi: ΔG ≈ <strong>−7.5 kcal/mol</strong></li>
        <li>Glucosa-6-fosfato + H₂O: ΔG ≈ <strong>−3 kcal/mol</strong></li>
      </ul>
      Como el ΔG del ATP es más negativo, se dice que tiene un enlace de mayor energía. La hidrólisis de ATP en enzimas suele rendir entre −5 y −9 kcal/mol de energía útil, usada para movimiento mecánico de proteínas o para activar otras reacciones.` },
    { q:'Energía de unión vs. energía de hidrólisis <span class="tag">artículo</span>', a:`En la ATP-sintasa, la <strong>energía de unión</strong> (ΔG unión) del ATP al sitio activo aporta cerca de −6 kcal/mol y se traduce en trabajo mecánico. En cambio, la <strong>energía de hidrólisis</strong> en esa misma enzima es cercana a cero: la transferencia del fosfato al agua solo facilita arreglos moleculares locales y el movimiento rotacional.` },
  ]},
  { id:'atp', label:'El ATP', items:[
    { q:'¿Qué es y cuánta energía almacena?', a:`El ATP (adenosín trifosfato) es la <strong>"moneda energética"</strong> de la célula: energía de uso inmediato, 7.3 kcal/mol por molécula. También puede usarse GTP como moneda alterna en biosíntesis.<br><br>Comparación con reservas de largo plazo: almidón 4 kcal/g, glucógeno 4 kcal/g, triglicéridos <strong>9 kcal/g</strong> (la más densa).` },
    { q:'Estructura del ATP', a:`Base nitrogenada de purina (<strong>adenina</strong>) unida al carbono 1' de una pentosa (<strong>ribosa</strong>), con tres grupos <strong>fosfato</strong> unidos al carbono 5'. Suele estar coordinado a un catión divalente (Mg²⁺ o Ca²⁺), necesario para el ataque nucleofílico en las hidrolasas de ATP.<br><br>La concentración celular se mantiene homeostáticamente entre <strong>1 y 10 mM</strong>, dependiendo del estado metabólico.` },
    { q:'Tres vías de síntesis de ATP', a:`<ul>
        <li><strong>Fosforilación oxidativa</strong> (mitocondria): el paso de e⁻ del NADH/FADH₂ por la cadena respiratoria bombea H⁺ generando una fuerza protón-motriz que impulsa a la ATP-sintasa.</li>
        <li><strong>Fotofosforilación</strong> (cloroplastos/bacterias fotosintéticas): la luz bombea protones de forma análoga.</li>
        <li><strong>Fosforilación a nivel de sustrato:</strong> transferencia directa de un fosfato de un sustrato al ADP (ej. glucólisis, fermentación).</li>
      </ul>
      Una glucosa puede rendir hasta <strong>38 ATP</strong> por respiración celular completa (glucólisis + ciclo de Krebs + fosforilación oxidativa).` },
    { q:'Glucólisis en detalle <span class="tag">artículo</span>', a:`Ocurre en el citosol (o en el glicosoma en protozoos quinetoplástidos). La glucosa se metaboliza anaeróbicamente en piruvato: se generan <strong>2 ATP</strong> por fosforilación a nivel de sustrato (enzimas fosfoglucocinasa y piruvato quinasa) y <strong>2 NADH/FADH₂</strong>, cuyo poder reductor se aprovecha después en la cadena de transporte de electrones. La oxidación de un FADH₂ rinde entre 1 y 2 ATP adicionales, y la de NADH entre 2 y 3.` },
    { q:'Lípidos como fuente de ATP', a:`Se degradan a ácidos grasos y luego a acetil-CoA por <strong>beta-oxidación</strong>, generando NADH y FADH₂ que alimentan la fosforilación oxidativa. Por su alto rendimiento energético (9 kcal/g) y almacenamiento compacto, la grasa es la fuente más importante de calorías en la dieta.` },
    { q:'La ATP-sintasa', a:`Motor molecular con dos sectores: <strong>F₀</strong> (embebido en la membrana, con estator y rotor) y <strong>F₁</strong> (expuesto al solvente, con tres sitios activos). El gradiente de H⁺ genera un movimiento tipo rotor sobre un estator estático. Se estima que trabaja con una eficiencia cercana al <strong>100%</strong>.` },
    { q:'Ciclo ATP/ADP y homeostasis', a:`La mayoría del ATP corporal no se sintetiza de novo: se regenera continuamente desde ADP. El cuerpo recicla aproximadamente <strong>su propio peso en ATP cada día</strong>, regulado por retroalimentación y por la disponibilidad de sustratos de la glucólisis y la fosforilación oxidativa. La membrana mitocondrial interna usa la <strong>ADP/ATP translocasa</strong> para exportar el ATP recién sintetizado al citosol.` },
    { q:'P-loop y evolución de proteínas que unen ATP <span class="tag">artículo</span>', a:`Patrones comunes en proteínas que usan ATP:
      <ul>
        <li>El ATP y un catión divalente se unen entre dos dominios, generando cambios conformacionales tipo "bisagra".</li>
        <li>Motivo <strong>rizo-P (P-loop)</strong>, rico en glicinas, forma puentes de hidrógeno con los fosfatos.</li>
        <li>Un residuo ácido conservado activa el agua para transferir el fosfato γ.</li>
        <li>La proteína distingue ATP de sus productos de fosforilación por cargas positivas o por un catión divalente (Mg²⁺).</li>
      </ul>
      Se estima que ~<strong>70% de las enzimas primitivas</strong> usaban ATP como cofactor — apoya la hipótesis del mundo prebiótico de ARN.` },
    { q:'El ATP más allá de la energía', a:`El ATP también es <strong>unidad estructural de ácidos nucleicos</strong> (ADN y ARN), actúa como <strong>efector alostérico</strong> de vías metabólicas, participa como componente de coenzimas, y funciona como <strong>mensajero intra y extracelular</strong>. Por eso se le considera mucho más que una simple "batería" celular.` },
  ]},
  { id:'compart', label:'Compartimentalización y tejidos', items:[
    { q:'Compartimentos celulares', a:`<ul>
        <li><strong>Mitocondria:</strong> ciclo de Krebs + fosforilación oxidativa — principal fuente de ATP.</li>
        <li><strong>Citosol:</strong> glucólisis y síntesis de ácidos grasos.</li>
        <li><strong>Retículo endoplásmico:</strong> síntesis lipídica, plegamiento de proteínas, transporte.</li>
      </ul>
      Esta organización evita interferencias entre rutas incompatibles.` },
    { q:'Integración entre órganos', a:`<ul>
        <li><strong>Hígado:</strong> centro de procesamiento — gluconeogénesis, glucogenólisis, síntesis de lípidos.</li>
        <li><strong>Músculo:</strong> principal consumidor de glucosa y productor de lactato en ejercicio.</li>
        <li><strong>Cerebro:</strong> depende fundamentalmente de la glucosa.</li>
        <li><strong>Tejido adiposo:</strong> almacena y libera energía según demanda.</li>
      </ul>
      El organismo mantiene la homeostasis metabólica mediante el intercambio constante de metabolitos y señales hormonales entre estos órganos.` },
    { q:'Regulación hormonal: ayuno, ejercicio y realimentación', a:`<ul>
        <li><strong>Ayuno:</strong> glucogenólisis hepática + lipólisis para mantener la glucemia.</li>
        <li><strong>Ejercicio intenso:</strong> glucólisis anaeróbica, producción de lactato, oxidación de ácidos grasos.</li>
        <li><strong>Realimentación:</strong> la insulina promueve captación de glucosa, glucogénesis y lipogénesis.</li>
      </ul>
      Las hormonas <strong>insulina, glucagón y adrenalina</strong> son las principales reguladoras de estos cambios.` },
    { q:'Diabetes mellitus', a:`Alteración del metabolismo intermedio por deficiencia de insulina o resistencia periférica a ella. Es el ejemplo clásico de cómo una falla hormonal desregula por completo la integración metabólica entre tejidos.` },
  ]},
  { id:'senal', label:'Señalización y enfermedades <span class="tag">artículo</span>', items:[
    { q:'AMPc y señalización intracelular', a:`Las cinasas usan ATP para fosforilar lípidos, carbohidratos, aminoácidos y nucleótidos. El <strong>AMPc</strong> (segundo mensajero clave) se sintetiza desde ATP por la <strong>adenilato ciclasa</strong> y se degrada a AMP por la AMPc fosfodiesterasa.<br><br>Vía: AMPc → <strong>PKA</strong> entra al núcleo → fosforila <strong>CREB</strong> → activa genes que regulan proliferación, supervivencia y diferenciación celular. El AMPc también puede regular canales iónicos de forma independiente a la fosforilación, vía calcio intracelular.` },
    { q:'Receptores purinérgicos P2X y P2Y', a:`El ATP, ADP y adenosina son reconocidos por receptores purinérgicos:
      <ul>
        <li><strong>P2X:</strong> canales iónicos activados por ligando (Na⁺, K⁺, Ca²⁺).</li>
        <li><strong>P2Y:</strong> acoplados a proteínas G, activan fosfolipasa C, modulan Ca²⁺ y AMPc.</li>
      </ul>
      Participan en neurotransmisión, función pulmonar, nocicepción, audición, apoptosis y agregación plaquetaria.` },
    { q:'Neuromodulación por ATP', a:`Las señales de ATP y adenosina modulan la liberación de neurotransmisores como acetilcolina, noradrenalina, serotonina, dopamina y glutamato, mediante receptores P2X (entrada directa de Ca²⁺) y P2Y (segundos mensajeros vía proteínas G, IP3, PKC, PLA2, entre otras vías).` },
    { q:'ATP y daño neuronal (P2X7)', a:`Tras isquemia o traumatismo, el ATP se libera al espacio extracelular y activa receptores purinérgicos, elevando el Ca²⁺ intracelular y pudiendo desencadenar muerte celular.<br><br>El receptor <strong>P2X7</strong> aumenta su expresión tras lesión medular; bloquearlo favorece la recuperación funcional — potencial neuroprotector en isquemia cerebral.` },
    { q:'Enfermedades mitocondriales', a:`Se deben a defectos en la regulación de la síntesis de ATP; afectan sobre todo tejidos de alta demanda energética (músculo, sistema nervioso) y suelen ser multisistémicas.<br><br>Ejemplos: síndrome de <strong>Leigh</strong>, <strong>Kearns-Sayre</strong>, Pearson, atrofia óptica de <strong>Leber (LHON)</strong>, <strong>NARP</strong>, <strong>MERRF</strong>, <strong>MELAS</strong>. También se asocian a Alzheimer, Huntington y Parkinson.` },
  ]},
];

const CHEATS = [
  {n:'7.3', l:'kcal/mol · ATP'},
  {n:'9', l:'kcal/g · triglicéridos'},
  {n:'4', l:'kcal/g · almidón / glucógeno'},
  {n:'−7.5', l:'kcal/mol · ΔG hidrólisis ATP'},
  {n:'−3', l:'kcal/mol · ΔG glucosa-6-P'},
  {n:'1–10', l:'mM · ATP intracelular'},
  {n:'38', l:'ATP · por glucosa oxidada'},
  {n:'~100%', l:'eficiencia · ATP-sintasa'},
  {n:'~70%', l:'enzimas primitivas con ATP'},
];

const KEYPOINTS = [
  'El metabolismo = <strong>anabolismo</strong> (construye, gasta energía) + <strong>catabolismo</strong> (degrada, libera energía).',
  'El ATP es la "moneda energética" de la célula: <strong>7.3 kcal/mol</strong>, uso inmediato.',
  'Almidón y glucógeno rinden <strong>4 kcal/g</strong>; los triglicéridos rinden <strong>9 kcal/g</strong> (reserva de largo plazo).',
  '<strong>ΔG &lt; 0</strong> = exergónica/espontánea (catabolismo); <strong>ΔG &gt; 0</strong> = endergónica (anabolismo).',
  'La hidrólisis del ATP libera entre <strong>−5 y −9 kcal/mol</strong> de energía útil.',
  'Tres vías de síntesis de ATP: <strong>fosforilación oxidativa, fotofosforilación</strong> y <strong>fosforilación a nivel de sustrato</strong>.',
  'Una molécula de glucosa puede rendir hasta <strong>38 ATP</strong> por respiración celular completa.',
  'La ATP-sintasa (F₀/F₁) es un motor rotatorio con eficiencia cercana al <strong>100%</strong>.',
  'La concentración celular de ATP se mantiene homeostáticamente entre <strong>1 y 10 mM</strong>.',
  'El ATP no solo da energía: es unidad de ácidos nucleicos, precursor del <strong>AMPc</strong> y ligando de receptores purinérgicos.',
  'Las enfermedades mitocondriales derivan de fallas en la síntesis de ATP y afectan principalmente <strong>músculo y sistema nervioso</strong>.',
  'El ATP suele estar coordinado a <strong>Mg²⁺ o Ca²⁺</strong>, esenciales para el ataque nucleofílico en su hidrólisis.',
  'El motivo <strong>rizo-P (P-loop)</strong> es la firma estructural de casi toda proteína que une ATP.',
  'Hormonas como <strong>insulina, glucagón y adrenalina</strong> deciden si el cuerpo está en modo anabólico o catabólico.',
  'El receptor <strong>P2X7</strong> vincula al ATP extracelular con la muerte neuronal en isquemia cerebral.',
];

const QUESTIONS = [
  {cat:'Introducción', q:'¿Qué proceso se define como el conjunto de reacciones químicas catalizadas por enzimas que transforman biomoléculas dentro de la célula?', opts:['La nutrición','El metabolismo','La homeostasis','La fotosíntesis'], correct:1, exp:'El metabolismo transforma biomoléculas para obtener materia y energía destinadas a nutrición, relación y reproducción.'},
  {cat:'Introducción', q:'En una ruta metabólica cíclica...', opts:['Un precursor genera múltiples productos','Varios sustratos convergen en un producto','El punto de partida se regenera al final','La reacción nunca se repite'], correct:2, exp:'Las rutas cíclicas regeneran su punto de partida al finalizar (como el ciclo de Krebs).'},
  {cat:'Introducción', q:'¿En cuántos niveles ocurre la nutrición según los apuntes?', opts:['Uno','Dos: organismo y célula','Tres: célula, tejido y órgano','Cuatro'], correct:1, exp:'Ocurre a nivel del organismo completo y a nivel celular; están relacionados pero pueden ser parcialmente independientes.'},
  {cat:'Introducción', q:'¿Cada cuánto tiempo el cuerpo humano renueva casi todas sus células?', opts:['Cada año','Cada siete años','Cada mes','Nunca se renuevan'], correct:1, exp:'La materia obtenida del metabolismo no solo sirve para crecer: el cuerpo humano renueva casi todas sus células cada siete años.'},
  {cat:'Introducción', q:'La energía metabólica, además de calor, puede transformarse en...', opts:['Solo energía química','Energía mecánica, eléctrica y luminosa, entre otras','Únicamente energía nuclear','No se transforma, solo se libera como calor'], correct:1, exp:'La versatilidad del metabolismo permite transformar la energía en movimiento, impulso nervioso, bioluminiscencia o mantenerla en enlaces químicos.'},
  {cat:'Anabolismo/Catabolismo', q:'¿Cuál de estas opciones es un proceso anabólico?', opts:['Beta-oxidación de ácidos grasos','Glucólisis','Síntesis de proteínas a partir de aminoácidos','Ciclo de Krebs'], correct:2, exp:'El anabolismo construye moléculas complejas desde otras simples, como la síntesis de proteínas.'},
  {cat:'Anabolismo/Catabolismo', q:'El catabolismo se caracteriza por...', opts:['Consumir ATP y poder reductor','Ser una fase sintética y reductiva','Liberar energía y producir poder reductor','Construir macromoléculas'], correct:2, exp:'El catabolismo degrada nutrientes, libera energía y genera NADH/FADH₂ (poder reductor).'},
  {cat:'Anabolismo/Catabolismo', q:'¿Por qué anabolismo y catabolismo suelen estar separados físicamente en la célula?', opts:['Por falta de espacio','Para evitar interferencias entre rutas incompatibles','Porque usan enzimas idénticas','No están separados'], correct:1, exp:'Aunque son complementarios, no son simplemente inversos, así que se compartimentalizan para no interferir entre sí.'},
  {cat:'Anabolismo/Catabolismo', q:'¿Cuál de estos es un ejemplo típico de catabolismo?', opts:['Replicación del ADN','Contracción muscular','Síntesis de proteínas','Fotosíntesis'], correct:1, exp:'La contracción muscular usa el ATP generado al degradar nutrientes: es un proceso catabólico en acción.'},
  {cat:'Anabolismo/Catabolismo', q:'El anabolismo, además de ATP, también consume...', opts:['Oxígeno puro','Poder reductor como NADH y FADH₂','Solo agua','Dióxido de carbono'], correct:1, exp:'Las rutas anabólicas son reductivas: además de ATP, requieren poder reductor (NADH, FADH₂) para construir macromoléculas.'},
  {cat:'Bioenergética', q:'Una reacción con ΔG negativo se llama...', opts:['Endergónica','Exergónica','Isotérmica','Anabólica'], correct:1, exp:'ΔG < 0 indica una reacción espontánea que libera energía: exergónica.'},
  {cat:'Bioenergética', q:'¿Qué papel cumplen el NAD⁺/NADH y el FAD/FADH₂?', opts:['Transportan oxígeno','Capturan y entregan energía de las oxidaciones','Son enzimas digestivas','Forman parte de la membrana celular'], correct:1, exp:'Son transportadores electrónicos que capturan energía en oxidaciones y la entregan donde se necesita, permitiendo el acoplamiento energético.'},
  {cat:'Bioenergética', q:'La transferencia del fosfato terminal del ATP al agua tiene un ΔG aproximado de...', opts:['−3 kcal/mol','−7.5 kcal/mol','+7.5 kcal/mol','−100 kcal/mol'], correct:1, exp:'ATP + H2O → ADP + Pi libera aproximadamente −7.5 kcal/mol, más negativo que la glucosa-6-fosfato (−3 kcal/mol).'},
  {cat:'Bioenergética', q:'Romper el enlace covalente oxígeno-fosfato del ATP requiere aproximadamente...', opts:['7.5 kcal/mol','100 kcal/mol','1 kcal/mol','38 kcal/mol'], correct:1, exp:'Ese es el valor de energía de enlace covalente puro, distinto del ΔG de transferencia de grupo (−7.5 kcal/mol).'},
  {cat:'Bioenergética', q:'En la ATP-sintasa, la energía de unión del ATP (ΔG unión) aporta aproximadamente...', opts:['−6 kcal/mol, traducida en trabajo mecánico','+50 kcal/mol','0 kcal/mol siempre','−100 kcal/mol'], correct:0, exp:'La energía de unión del ATP en el sitio activo aporta cerca de −6 kcal/mol y se traduce en cambios conformacionales (trabajo mecánico).'},
  {cat:'El ATP', q:'¿Cuántas kcal/mol almacena cada molécula de ATP?', opts:['4','7.3','9','38'], correct:1, exp:'El ATP almacena 7.3 kcal/mol, energía de uso inmediato para la célula.'},
  {cat:'El ATP', q:'¿Cuál de estas reservas energéticas rinde más kcal por gramo?', opts:['Almidón','Glucógeno','Triglicéridos','ATP'], correct:2, exp:'Los triglicéridos rinden 9 kcal/g, más del doble que almidón o glucógeno (4 kcal/g cada uno).'},
  {cat:'El ATP', q:'La estructura del ATP está formada por...', opts:['Adenina + ribosa + 3 fosfatos','Guanina + desoxirribosa + 2 fosfatos','Timina + ribosa + 1 fosfato','Citosina + ribosa + 3 fosfatos'], correct:0, exp:'Adenina (base púrica) unida a ribosa, con tres grupos fosfato en el carbono 5\' de la pentosa.'},
  {cat:'El ATP', q:'¿En qué rango se mantiene homeostáticamente la concentración de ATP dentro de una célula?', opts:['0.01–0.1 mM','1–10 mM','50–100 mM','100–500 mM'], correct:1, exp:'La concentración se mantiene entre 1 y 10 mM según el estado metabólico.'},
  {cat:'El ATP', q:'La fosforilación a nivel de sustrato ocurre, por ejemplo, en...', opts:['La cadena de transporte de electrones','La fotofosforilación','La glucólisis','La replicación del ADN'], correct:2, exp:'En la glucólisis, enzimas como la piruvato quinasa transfieren un fosfato directamente al ADP.'},
  {cat:'El ATP', q:'¿Cuántos ATP se producen directamente en la glucólisis por fosforilación a nivel de sustrato?', opts:['1','2','4','38'], correct:1, exp:'Se generan 2 ATP netos por esta vía, gracias a la fosfoglucocinasa y la piruvato quinasa.'},
  {cat:'El ATP', q:'¿Cuántos ATP puede rendir como máximo la oxidación completa de una molécula de glucosa?', opts:['2','10','24','38'], correct:3, exp:'La respiración celular completa (glucólisis + Krebs + fosforilación oxidativa) puede rendir hasta 38 ATP.'},
  {cat:'El ATP', q:'La ATP-sintasa está compuesta por los sectores...', opts:['F0 y F1','A y B','Alfa y beta únicamente','P y Q'], correct:0, exp:'F0 está embebido en la membrana (rotor/estator) y F1 está expuesto al solvente, donde se sintetiza el ATP.'},
  {cat:'El ATP', q:'¿Aproximadamente con qué eficiencia trabaja la ATP-sintasa?', opts:['30%','50%','70%','cercana al 100%'], correct:3, exp:'Gracias al acoplamiento entre el gradiente de H+, la unión de sustrato y el movimiento mecánico, su eficiencia es cercana al 100%.'},
  {cat:'El ATP', q:'El motivo estructural rico en glicinas que une los fosfatos del ATP en muchas proteínas se llama...', opts:['Hélice alfa','Rizo-P (P-loop)','Dominio SH2','Lámina beta antiparalela'], correct:1, exp:'El P-loop forma puentes de hidrógeno con los fosfatos del ATP a través de las amidas del esqueleto peptídico.'},
  {cat:'El ATP', q:'Se estima que qué porcentaje de las enzimas primitivas usaban ATP como cofactor', opts:['10%','30%','70%','95%'], correct:2, exp:'~70%, lo que refuerza la hipótesis del mundo prebiótico de ARN.'},
  {cat:'El ATP', q:'¿Qué catión divalente suele coordinar al ATP para su hidrólisis?', opts:['Na⁺','K⁺','Mg²⁺','Cl⁻'], correct:2, exp:'El Mg²⁺ (o Ca²⁺) es necesario para el ataque nucleofílico en los sitios activos de las hidrolasas de ATP.'},
  {cat:'El ATP', q:'Además de dar energía, ¿qué otro papel estructural cumple el ATP?', opts:['Es una vitamina','Es unidad de ácidos nucleicos (ADN/ARN)','Forma parte de la membrana plasmática','Es un aminoácido esencial'], correct:1, exp:'El ATP es una de las unidades principales de los ácidos nucleicos, además de mensajero y regulador alostérico.'},
  {cat:'El ATP', q:'La proteína ADP/ATP translocasa se encuentra en...', opts:['El núcleo','La membrana mitocondrial interna','El retículo endoplásmico','El citosol libre'], correct:1, exp:'Intercambia el ATP de la matriz mitocondrial por ADP del espacio intermembranal.'},
  {cat:'Compartimentalización', q:'¿Dónde ocurre principalmente la glucólisis?', opts:['Mitocondria','Citosol','Retículo endoplásmico','Núcleo'], correct:1, exp:'La glucólisis ocurre en el citosol (excepto en protozoos quinetoplástidos, donde ocurre en el glicosoma).'},
  {cat:'Compartimentalización', q:'El ciclo de Krebs y la fosforilación oxidativa ocurren en...', opts:['El citosol','El retículo endoplásmico','La mitocondria','El aparato de Golgi'], correct:2, exp:'La mitocondria es la central energética celular, sede del ciclo de Krebs y la fosforilación oxidativa.'},
  {cat:'Compartimentalización', q:'¿Qué compartimento es el centro de síntesis lipídica y plegamiento de proteínas?', opts:['Retículo endoplásmico','Lisosoma','Peroxisoma','Citosol'], correct:0, exp:'El retículo endoplásmico se encarga de la síntesis lipídica, el plegamiento de proteínas y el transporte intracelular.'},
  {cat:'Compartimentalización', q:'Durante el ayuno, el cuerpo prioriza...', opts:['Síntesis de glucógeno','Glucogenólisis hepática y lipólisis','Lipogénesis','Glucólisis anaeróbica acelerada'], correct:1, exp:'En ayuno se moviliza glucógeno hepático y se activa la lipólisis para mantener la glucemia.'},
  {cat:'Compartimentalización', q:'¿Qué tejido es el principal productor de lactato durante el ejercicio intenso?', opts:['Hígado','Cerebro','Músculo','Tejido adiposo'], correct:2, exp:'El músculo consume mucha glucosa y produce lactato vía glucólisis anaeróbica durante el ejercicio intenso.'},
  {cat:'Compartimentalización', q:'¿Cuáles son las tres hormonas clave que regulan estos cambios metabólicos?', opts:['Insulina, glucagón y adrenalina','Estrógeno, testosterona y cortisol','Tiroxina, melatonina y prolactina','Renina, aldosterona y ADH'], correct:0, exp:'Insulina, glucagón y adrenalina coordinan las respuestas metabólicas ante ayuno, ejercicio y realimentación.'},
  {cat:'Señalización', q:'El AMP cíclico (AMPc) se sintetiza a partir de ATP gracias a la enzima...', opts:['Piruvato quinasa','Adenilato ciclasa','ATP-sintasa','Fosfoglucocinasa'], correct:1, exp:'La adenilato ciclasa convierte ATP en AMPc, un segundo mensajero clave en señalización celular.'},
  {cat:'Señalización', q:'¿Qué factor de transcripción activa la PKA tras entrar al núcleo por señalización de AMPc?', opts:['CREB','p53','NF-κB','MYC'], correct:0, exp:'La subunidad catalítica de PKA fosforila a CREB, activando genes relacionados con proliferación y diferenciación.'},
  {cat:'Señalización', q:'Los receptores P2X son...', opts:['Acoplados a proteínas G','Canales iónicos activados por ligando','Enzimas hidrolíticas','Transportadores de glucosa'], correct:1, exp:'P2X son canales iónicos permeables a Na+, K+ y Ca2+, activados por ATP.'},
  {cat:'Señalización', q:'Los receptores P2Y están acoplados a...', opts:['Canales de sodio directos','Proteínas G (metabotrópicos)','Microtúbulos','Ribosomas'], correct:1, exp:'Los P2Y son metabotrópicos, activan fosfolipasa C y modulan calcio intracelular y AMPc.'},
  {cat:'Enfermedades', q:'El receptor P2X7 está implicado en...', opts:['Síntesis de glucógeno','Daño y muerte neuronal tras isquemia','Digestión de lípidos','Fotosíntesis'], correct:1, exp:'Su bloqueo favorece la recuperación funcional y reduce la muerte celular tras lesión, sugiriendo un rol neuroprotector.'},
  {cat:'Enfermedades', q:'¿Cuál de estas NO es una enfermedad mitocondrial mencionada en el artículo?', opts:['Síndrome de Leigh','MELAS','Fenilcetonuria','Kearns-Sayre'], correct:2, exp:'La fenilcetonuria es un trastorno del metabolismo de aminoácidos, no una enfermedad mitocondrial de síntesis de ATP.'},
  {cat:'Enfermedades', q:'Las enfermedades mitocondriales afectan principalmente a...', opts:['Piel y uñas','Tejidos de alta demanda energética, como músculo y sistema nervioso','Solo al sistema digestivo','Ningún tejido en particular'], correct:1, exp:'Se deben a fallas en la síntesis de ATP, por lo que afectan sobre todo a los tejidos que más energía necesitan.'},
  {cat:'Enfermedades', q:'¿Con qué otras enfermedades neurodegenerativas se ha asociado la disfunción mitocondrial?', opts:['Alzheimer, Huntington y Parkinson','Gripe y resfriado común','Apendicitis','Anemia'], correct:0, exp:'La disfunción mitocondrial también se ha asociado a entidades neurodegenerativas de alta incidencia como Alzheimer, Huntington y Parkinson.'},
];

export const COURSE_ATP = {
  id:'atp',
  label:'Bioquímica del ATP',
  notes: NOTES,
  cheats: CHEATS,
  keypoints: KEYPOINTS,
  questions: QUESTIONS,
};