/* =====================================================================
   PLAN COMUNICACIONAL INTEGRADO · PLANTILLA REUTILIZABLE
   Copia de trabajo de Marca Gestión — los 3 TODO de la sección 0 ya están completos
   (el firebaseConfig de más abajo YA está listo, es el mismo proyecto
   compartido "marcas-generales" — no hace falta tocarlo)
   Dashboard de una sola página · HTML + CSS + JS vanilla
   Datos editables en Firebase Firestore (proyecto "MARCAS GENERALES")

   Cómo funciona la carga de datos
   -------------------------------
   1. El dashboard arranca SIEMPRE con el contenido incluido más abajo
      (DEFAULT_DATA). Así nunca se ve una pantalla en blanco, ni "undefined",
      ni se rompe si Firestore todavía no tiene nada cargado.
   2. Si hay configuración de Firebase, se suscribe a Firestore con
      onSnapshot: cualquier edición hecha desde la Consola de Firebase se
      refleja en vivo, sin recargar y sin tocar código.
   3. Los botones Bien / Proceso / Atención y las casillas del checklist
      escriben de vuelta a Firestore (setDoc con merge). Sin conexión,
      se guardan en localStorage de este equipo.
   4. El dashboard queda detrás de una pantalla de contraseña (filtro
      visual, no seguridad real — ver DASHBOARD_PASSWORD más abajo). Justo
      al pasarla se dispara una sesión anónima de Firebase Auth
      (signInAnonymously); solo después de esa sesión se marca la
      conexión como "en vivo" y se permite escribir en Firestore. Las
      reglas del proyecto exigen esa sesión (request.auth != null) para
      cualquier escritura — ver firestore.rules en el repositorio.
   ===================================================================== */
'use strict';

/* ============ 0 · CONFIGURACIÓN DE ESTA INSTANCIA ============ */
// TODO 1/4: nombre visible de esta marca, ej. 'Marca Territorio' o 'Marca Gestión'
const BRAND_NAME  = 'Marca Gestión';
// TODO 2/4: nombre EXACTO de la colección raíz en Firestore — molde
// compartido con los otros dashboards de marca y con el dashboard general
// (solo lectura) que consolida las tres. Usa "marca_" + tu slug, ej.
// 'marca_territorio' o 'marca_gestion'. No lo cambies después de arrancar:
// el dashboard general asume esta misma convención para las tres marcas.
const BRAND_SLUG  = 'marca_gestion';
const DOC_TITLE   = 'Plan Comunicacional Integrado · ' + BRAND_NAME;
const FIREBASE_PROJECT = 'MARCAS GENERALES';

/* ---------------------------------------------------------------------
   TODO: reemplaza esta contraseña por la real antes de compartir el
   link con el equipo. Es solo un filtro visual (el HTML es público, así
   que el texto es legible en el código fuente) — la protección real de
   los datos la da la regla de Firestore, que exige sesión anónima activa
   antes de escribir (ver firestore.rules). La sesión anónima se crea
   automáticamente justo después de pasar esta pantalla.
   --------------------------------------------------------------------- */
// TODO 3/4: contraseña de acceso a este dashboard (independiente de las otras marcas)
const DASHBOARD_PASSWORD = 'gestion80-2026';

/* ---------------------------------------------------------------------
   Pega aquí el firebaseConfig del proyecto "MARCAS GENERALES" para dejar
   la conexión fija en el archivo. Si lo dejas vacío, el dashboard funciona
   igual en modo local y puedes conectarlo desde el botón de estado de la
   barra lateral (la configuración queda guardada en ese navegador).
   La clave web de Firebase no es un secreto: la seguridad la dan las
   reglas de Firestore (ver firestore.rules en el repositorio).
   --------------------------------------------------------------------- */
// Ya está completo — es el mismo proyecto Firebase compartido por las
// tres marcas ("marcas-generales"). No lo cambies ni pidas uno nuevo.
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCvqIOwSix0OgrcYexc0cgR7oW4QJZGK1k",
  authDomain: "marcas-generales.firebaseapp.com",
  projectId: "marcas-generales",
  storageBucket: "marcas-generales.firebasestorage.app",
  messagingSenderId: "506645382164",
  appId: "1:506645382164:web:00d4ec4f03176090c5d301",
  measurementId: "G-P16E84CEKM"
};

const FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/10.12.5/';
const LS_PREFIX = BRAND_SLUG + '_';

/* ============ 1 · CONTENIDO POR DEFECTO (espejo del esquema Firestore) ============ */
const DEFAULT_DATA = {
  "meta": {
    "eyebrow": "Marca Gestión · Equipo de Comunicación Digital",
    "periodStart": "2026-08-24",
    "periodEnd": "2026-11-11",
    "heroSub": "Plan de 80 días para comunicar la gestión con evidencia: obra terminada, servicio que responde y cuentas verificables. Cubre Instagram, Facebook y TikTok. Quedan fuera la vocería en prensa tradicional y la pauta pagada.",
    "introCard": "Este plan integra tres insumos que hoy viven separados: el inventario de obras y servicios, el registro de reportes ciudadanos y el cronograma de ejecución. La regla principal es una sola: ninguna pieza sale sin un dato verificable —fecha, cifra, ubicación o responsable— ni sin material grabado en el sitio. Lo que no se puede mostrar, no se anuncia.",
    "stats": [
      {
        "num": "80",
        "lbl": "Días de plan · 24 ago – 11 nov"
      },
      {
        "num": "4",
        "lbl": "Pilares de gestión"
      },
      {
        "num": "20",
        "lbl": "Ideas en el banco de contenido"
      },
      {
        "num": "56",
        "lbl": "Piezas de grilla fija programadas"
      }
    ],
    "quote": "La gestión no se defiende, se muestra. Cada semana entregamos una prueba: algo que la gente pueda ver, tocar o verificar por su cuenta.",
    "diag1": "Las cuentas oficiales publican anuncios, no resultados: siete de cada diez piezas del último trimestre son actos y no obra terminada. El público ya no distingue qué se prometió de qué realmente se hizo.",
    "diag2": "Los reportes ciudadanos entran por comentarios y mensajes directos y no reciben ninguna respuesta pública. No queda rastro visible de qué pasó con cada reclamo, y ese silencio alimenta la idea de que nada se resuelve.",
    "diag3": "No hay cifras propias circulando. Cuando alguien pregunta cuánto costó una obra o cuándo se entrega, el equipo no tiene una pieza a mano para responder, y el vacío lo termina llenando la versión de terceros.",
    "diag4": "8 de los 42 entes del ecosistema (19%) no tienen ninguna cuenta oficial identificada: Procuraduría General, FAEJ, IAPRET, MAFET, Agroinsumos del Táchira, INAPCET, FUNDACETA y la Fundación Escuela de Gobierno. No hay canal propio que mostrar ni fortalecer.",
    "diag5": "4 entes operan con cuenta candidata sin verificar todavía. Conviene gestionar su verificación oficial antes de amplificarlas o etiquetarlas como canal oficial en cualquier pieza.",
    "diag6": "13 oficinas y direcciones internas (31% del ecosistema, concentradas en Gestión Social y Educación) no tienen ni necesitan cuenta propia — dependen de la cuenta central, pero hoy no están diferenciadas dentro de ella.",
    "resumenNote": "Pendientes antes de escalar el plan: cerrar el inventario verificado de obras por parroquia (fecha de entrega, monto e imágenes del antes), designar al enlace técnico que valida cada cifra antes de publicar, y fijar el tiempo de respuesta que el canal de reportes se compromete a cumplir.",
    "symbolDiff": "La cinta métrica habla del rigor antes de prometer; el casco, del trabajo mientras se ejecuta; la llave, del momento en que el servicio queda funcionando. Los tres cuentan la misma historia en tres tiempos distintos: medir, hacer, entregar.",
    "symbolReflection": "Ninguno de los tres es un logotipo ni se dibuja: aparecen como objetos reales dentro del material grabado. Si en una pieza no hay ni medición, ni ejecución, ni entrega visible, esa pieza todavía no es Marca Gestión.",
    "pilaresNote": "Formatos transversales a los cuatro pilares: el antes / después con la misma toma y el mismo encuadre, el rótulo de datos en pantalla (ubicación, fecha, monto) y el cierre con el nombre del responsable técnico de la obra.",
    "semanalNote": "Producción en bloque: lunes y martes se graba todo lo de la semana en dos rutas de terreno. Ninguna pieza se publica sin el visto bueno del enlace técnico sobre las cifras que aparecen en pantalla.",
    "metricHero": "Menciones ciudadanas espontáneas que citan un resultado concreto de la gestión —una obra, un servicio o una cifra— sin que la cuenta oficial haya iniciado la conversación. Meta: pasar de 12 a 60 menciones mensuales al día 80.",
    "footer": "MARCA GESTIÓN — PLAN COMUNICACIONAL INTEGRADO<br><b>Confidencial</b> · Para evaluación del equipo estratégico"
  },
  "pillars": [
    {
      "id": "1",
      "order": 1,
      "num": 1,
      "name": "Obra que se toca",
      "sub": "Resultados terminados, con ubicación, fecha y costo. Nada en tiempo futuro.",
      "phase": "Fase 1",
      "symbol": "Símbolo: la llave — la obra solo existe cuando ya está en uso.",
      "extra": "",
      "ideas": [
        {
          "code": "C01",
          "txt": "Antes / después de una obra entregada: misma toma, mismo encuadre, con rótulo de fecha de inicio y de entrega.",
          "note": "Solo obras recibidas y en uso; nunca avances."
        },
        {
          "code": "C02",
          "txt": "Recorrido en primera persona por la obra terminada, grabado por quien la usa a diario y no por el equipo.",
          "note": "Autorización de imagen firmada antes de grabar."
        },
        {
          "code": "C03",
          "txt": "Ficha de obra en pantalla: qué era, qué es, cuánto costó y quién la ejecutó.",
          "note": "Cifras validadas por el enlace técnico."
        },
        {
          "code": "C04",
          "txt": "Mapa de las obras entregadas en la semana, parroquia por parroquia.",
          "note": "Se publica solo si hay dos o más entregas."
        },
        {
          "code": "C05",
          "txt": "La obra más pequeña de la semana: un bache tapado, una luminaria repuesta, un pupitre reparado.",
          "note": "Contrapeso a las obras grandes; sostiene la credibilidad."
        },
        {
          "code": "C06",
          "txt": "Obra que se retrasó: qué pasó, quién responde y cuál es la nueva fecha.",
          "note": "Se publica el mismo día en que se conoce el retraso."
        }
      ]
    },
    {
      "id": "2",
      "order": 2,
      "num": 2,
      "name": "Servicio que responde",
      "sub": "El reclamo entra, se rastrea y se cierra en público. El tiempo de respuesta es la promesa.",
      "phase": "Fase 2",
      "symbol": "Símbolo: el casco — alguien salió a atenderlo.",
      "extra": "",
      "ideas": [
        {
          "code": "C01",
          "txt": "Reporte ciudadano resuelto: el mensaje original, la cuadrilla trabajando y el cierre del caso.",
          "note": "Con permiso explícito de quien reportó."
        },
        {
          "code": "C02",
          "txt": "Cómo se reporta, paso a paso: dónde escribir y qué datos hacen falta.",
          "note": "Pieza fija; se republica cada 15 días."
        },
        {
          "code": "C03",
          "txt": "Tiempo de respuesta de la semana: cuántos casos entraron, cuántos se cerraron y en cuántos días.",
          "note": "Se publica aunque el número sea malo."
        },
        {
          "code": "C04",
          "txt": "Un día del equipo de atención: quién lee los mensajes y cómo los clasifica.",
          "note": "Humaniza el canal sin prometer inmediatez."
        },
        {
          "code": "C05",
          "txt": "Caso que no se pudo resolver: por qué y a qué instancia se derivó.",
          "note": "Sin culpar al ciudadano ni a otro organismo."
        }
      ]
    },
    {
      "id": "3",
      "order": 3,
      "num": 3,
      "name": "Cuentas claras",
      "sub": "En qué se invierte, con qué cronograma y qué falta. Transparencia como formato, no como discurso.",
      "phase": "Fase 3",
      "symbol": "Símbolo: la cinta métrica — se mide antes de prometer y después de entregar.",
      "extra": "",
      "ideas": [
        {
          "code": "C01",
          "txt": "Cifra de la semana explicada en 40 segundos, con la fuente visible en pantalla.",
          "note": "Una sola cifra por pieza."
        },
        {
          "code": "C02",
          "txt": "En qué se fue cada bolívar de una obra concreta: desglose simple en carrusel.",
          "note": "Requiere cierre administrativo de la obra."
        },
        {
          "code": "C03",
          "txt": "Cronograma público: qué se entrega este mes y qué se corrió de fecha.",
          "note": "Se actualiza el primer domingo de cada mes."
        },
        {
          "code": "C04",
          "txt": "Lo que no se logró en el trimestre y por qué.",
          "note": "Se aprueba con el Director Estratégico antes de publicar."
        },
        {
          "code": "C05",
          "txt": "Respuesta directa a la pregunta sobre gasto más repetida en comentarios.",
          "note": "Se elige del reporte semanal de comentarios."
        }
      ]
    },
    {
      "id": "4",
      "order": 4,
      "num": 4,
      "name": "Equipo que sostiene",
      "sub": "Las personas que ejecutan: cuadrillas, técnicos y operadores con nombre y oficio.",
      "phase": "Fase 4",
      "symbol": "Símbolo: el casco y la llave juntos — la gestión tiene cara y tiene turno.",
      "extra": "",
      "ideas": [
        {
          "code": "C01",
          "txt": "Perfil de un trabajador de cuadrilla: su oficio, su ruta y su horario.",
          "note": "Uno por semana, rotando entre servicios."
        },
        {
          "code": "C02",
          "txt": "Turno nocturno: lo que se repara mientras la ciudad duerme.",
          "note": "Grabación con luz y seguridad garantizadas."
        },
        {
          "code": "C03",
          "txt": "Oficios que sostienen el servicio: soldador, plomero, operador de maquinaria.",
          "note": "Formato serie: mismo encuadre para todos."
        },
        {
          "code": "C04",
          "txt": "El relevo: quien entrena a quien acaba de entrar.",
          "note": "Refuerza continuidad, no personalismo."
        }
      ]
    }
  ],
  "symbols": [
    {
      "id": "1",
      "order": 1,
      "tag": "Pilar 3 · Cuentas claras",
      "name": "La cinta métrica",
      "description": "Medir antes de prometer y volver a medir al entregar. Es el símbolo del rigor: ninguna cifra sale al aire sin que alguien la haya verificado en el sitio.",
      "imageUrl": ""
    },
    {
      "id": "2",
      "order": 2,
      "tag": "Pilar 2 · Servicio que responde",
      "name": "El casco",
      "description": "El trabajo mientras ocurre: la cuadrilla en la calle, el turno cumplido, la reparación a mitad de camino. Representa la gestión que se ve trabajando, no solo inaugurando.",
      "imageUrl": ""
    },
    {
      "id": "3",
      "order": 3,
      "tag": "Pilar 1 · Obra que se toca",
      "name": "La llave",
      "description": "El momento en que el servicio queda funcionando y pasa a manos de la gente. Cierra el ciclo: lo que se midió y se ejecutó ahora se usa.",
      "imageUrl": ""
    }
  ],
  "weekly": [
    {
      "id": "miercoles",
      "order": 1,
      "day": "Miércoles",
      "title": "Obra de la semana",
      "format": "Reel 45-60 s · 9:16",
      "objective": "Mostrar una obra terminada con antes/después y ficha de datos en pantalla.",
      "time": "7:30 p.m."
    },
    {
      "id": "jueves",
      "order": 2,
      "day": "Jueves",
      "title": "¿Cómo va?",
      "format": "Carrusel · 5-6 láminas",
      "objective": "Estado de avance de lo que está en ejecución, con porcentaje y fecha comprometida.",
      "time": "12:30 p.m."
    },
    {
      "id": "viernes",
      "order": 3,
      "day": "Viernes",
      "title": "Resuelto",
      "format": "Reel 30-40 s · 9:16",
      "objective": "Cerrar en público un reporte ciudadano: mensaje, cuadrilla y resultado.",
      "time": "7:00 p.m."
    },
    {
      "id": "sabado",
      "order": 4,
      "day": "Sábado",
      "title": "La cuadrilla",
      "format": "Reel documental · 60-75 s",
      "objective": "Poner cara y oficio al equipo que ejecuta, en su ruta real de trabajo.",
      "time": "11:00 a.m."
    },
    {
      "id": "domingo",
      "order": 5,
      "day": "Domingo",
      "title": "Cuentas de la semana",
      "format": "Carrusel 4 láminas + Stories",
      "objective": "Cerrar con tres cifras verificables de la semana y la fuente de cada una.",
      "time": "6:00 p.m."
    }
  ],
  "specials": [
    {
      "id": "1",
      "order": 1,
      "title": "Lo que cambió en tu calle",
      "phase": "Fase 1 · 12 sep 2026",
      "format": "Reel documental · 90 s",
      "theme": "Recorrido de una misma calle grabado con dron y a pie: el material de archivo del deterioro contra la toma actual, en el mismo orden de planos.",
      "hook": "Primeros 3 segundos: la toma de archivo del bache y el corte seco a la calle asfaltada, sin locución.",
      "development": "Tres vecinos cuentan qué hacían antes para poder pasar por ahí. Entre testimonio y testimonio, rótulos con fecha de inicio, fecha de entrega y monto ejecutado.",
      "cta": "«¿Cuál es la calle que falta en tu sector? Escríbela en los comentarios» — se responde con el cronograma real."
    },
    {
      "id": "2",
      "order": 2,
      "title": "Un día con la cuadrilla",
      "phase": "Fase 2 · 3 oct 2026",
      "format": "Mini-documental · 2-3 min",
      "theme": "Jornada completa de una cuadrilla de servicios desde las 5 a.m.: el galpón, la ruta, la avería y el cierre del turno.",
      "hook": "El despertador de un operador a las 4:30 a.m. y su casco sobre la mesa.",
      "development": "Se sigue una sola avería de principio a fin, con el tiempo transcurrido en pantalla. Sin música épica: sonido ambiente y las voces del equipo.",
      "cta": "«Así se atiende un reporte. El tuyo entra por aquí» — enlace al canal de reportes fijado en el perfil."
    },
    {
      "id": "3",
      "order": 3,
      "title": "Cuentas en la mano",
      "phase": "Fase 4 · 7 nov 2026",
      "format": "Reel de rendición · 90 s",
      "theme": "Balance de los 80 días grabado en las obras entregadas y no en oficina: cada cifra se dice parado en el lugar que la produjo.",
      "hook": "«Hace 80 días dijimos que íbamos a entregar esto. Esto fue lo que pasó.»",
      "development": "Tres bloques: lo entregado, lo que sigue en ejecución con nueva fecha, y lo que no se logró. Cada bloque con su cifra y su fuente en pantalla.",
      "cta": "«El detalle completo, parroquia por parroquia, en el informe fijado» — carrusel de soporte publicado el mismo día."
    }
  ],
  "phases": [
    {
      "id": "1",
      "order": 1,
      "name": "Fase 1",
      "pillar": "Obra que se toca",
      "start": "2026-08-24",
      "end": "2026-09-12",
      "days": "días 1-20",
      "milestone": "Seis obras entregadas documentadas con antes/después y ficha de datos verificada."
    },
    {
      "id": "2",
      "order": 2,
      "name": "Fase 2",
      "pillar": "Servicio que responde",
      "start": "2026-09-15",
      "end": "2026-10-07",
      "days": "días 21-45",
      "milestone": "Canal de reportes en operación, con tiempo de respuesta publicado cada semana."
    },
    {
      "id": "3",
      "order": 3,
      "name": "Fase 3",
      "pillar": "Cuentas claras",
      "start": "2026-10-08",
      "end": "2026-10-12",
      "days": "días 46-50",
      "milestone": "Primer informe público de inversión por parroquia, con desglose y fuentes."
    },
    {
      "id": "4",
      "order": 4,
      "name": "Fase 4",
      "pillar": "Equipo que sostiene",
      "start": "2026-10-13",
      "end": "2026-11-11",
      "days": "días 51-80",
      "milestone": "Serie de oficios completa y rendición de los 80 días publicada el 7 de noviembre."
    }
  ],
  "kpiWeekly": [
    {
      "id": "1",
      "order": 1,
      "piece": "Obra de la semana · miércoles",
      "metric": "Alcance en no seguidores",
      "goal": "8.000 por pieza",
      "status": null
    },
    {
      "id": "2",
      "order": 2,
      "piece": "¿Cómo va? · jueves",
      "metric": "Guardados",
      "goal": "250 por carrusel",
      "status": null
    },
    {
      "id": "3",
      "order": 3,
      "piece": "Resuelto · viernes",
      "metric": "Comentarios con un reporte nuevo",
      "goal": "30 por pieza",
      "status": null
    },
    {
      "id": "4",
      "order": 4,
      "piece": "La cuadrilla · sábado",
      "metric": "Retención a los 15 segundos",
      "goal": "55%",
      "status": null
    },
    {
      "id": "5",
      "order": 5,
      "piece": "Cuentas de la semana · domingo",
      "metric": "Compartidos",
      "goal": "120 por pieza",
      "status": null
    }
  ],
  "kpiSpecial": [
    {
      "id": "1",
      "order": 1,
      "piece": "Lo que cambió en tu calle",
      "metric": "Reproducciones a 72 h",
      "goal": "45.000",
      "status": null
    },
    {
      "id": "2",
      "order": 2,
      "piece": "Un día con la cuadrilla",
      "metric": "Visualización completa",
      "goal": "35%",
      "status": null
    },
    {
      "id": "3",
      "order": 3,
      "piece": "Cuentas en la mano",
      "metric": "Menciones espontáneas a 72 h",
      "goal": "60",
      "status": null
    }
  ],
  "checklist": [
    {
      "id": "grupo1",
      "order": 1,
      "title": "Verificación de marca",
      "items": [
        {
          "text": "¿La pieza sostiene un solo pilar? Si toca dos, se divide en dos piezas.",
          "checked": false
        },
        {
          "text": "¿Hay un dato verificable en pantalla: fecha, monto, ubicación o responsable?",
          "checked": false
        },
        {
          "text": "¿El enlace técnico validó las cifras antes de montar la pieza?",
          "checked": false
        },
        {
          "text": "¿Se muestra algo ya terminado o en ejecución real, y no un anuncio?",
          "checked": false
        },
        {
          "text": "¿Aparece alguno de los tres símbolos —medición, ejecución o entrega— dentro del material grabado?",
          "checked": false
        },
        {
          "text": "¿El material es propio y grabado en el sitio, sin banco de imágenes?",
          "checked": false
        },
        {
          "text": "¿Las personas que aparecen firmaron la autorización de imagen?",
          "checked": false
        },
        {
          "text": "¿La pieza resistiría que alguien vaya mañana al lugar a comprobarla?",
          "checked": false
        }
      ]
    },
    {
      "id": "grupo2",
      "order": 2,
      "title": "Producción semanal y especiales",
      "items": [
        {
          "text": "¿Las cinco piezas de la semana quedaron grabadas en el bloque de lunes y martes?",
          "checked": false
        },
        {
          "text": "¿Cada pieza tiene subtítulos quemados y se entiende sin audio?",
          "checked": false
        },
        {
          "text": "¿El antes/después usa el mismo encuadre y la misma altura de cámara?",
          "checked": false
        },
        {
          "text": "¿El rótulo de datos respeta la plantilla y no tapa rostros ni carteles?",
          "checked": false
        },
        {
          "text": "¿La versión de TikTok se recortó y reeditó, en vez de reciclar la de Instagram?",
          "checked": false
        },
        {
          "text": "¿El especial de la fase tiene fecha de grabación y de publicación confirmadas?",
          "checked": false
        },
        {
          "text": "¿Hay al menos una pieza de reserva grabada por si se cae la agenda de terreno?",
          "checked": false
        },
        {
          "text": "¿El copy evita mensajes de campaña electoral, siglas de partido o llamados al voto, incluso siendo contenido de gestión?",
          "checked": false
        },
        {
          "text": "¿La música de fondo está libre de derechos de autor?",
          "checked": false
        }
      ]
    },
    {
      "id": "grupo3",
      "order": 3,
      "title": "Calendario y coordinación",
      "items": [
        {
          "text": "¿El cronograma de obras del mes está cruzado con la grilla de publicación?",
          "checked": false
        },
        {
          "text": "¿Se avisó a la cuadrilla y al enlace de la parroquia con 48 horas de anticipación?",
          "checked": false
        },
        {
          "text": "¿Los reportes ciudadanos de la semana están clasificados y con responsable asignado?",
          "checked": false
        },
        {
          "text": "¿El informe del lunes salió con los KPIs de las cinco piezas y las menciones detectadas?",
          "checked": false
        },
        {
          "text": "¿Hay contenido de respaldo para al menos 2 semanas ante cambios de agenda?",
          "checked": false
        }
      ]
    },
    {
      "id": "grupo4",
      "order": 4,
      "title": "Verificación de cuentas del ecosistema",
      "items": [
        {
          "text": "¿Se confirmó que la cuenta citada o etiquetada es la oficial verificada y no una cuenta candidata sin verificar?",
          "checked": false
        },
        {
          "text": "¿La pieza indica con claridad a qué segmento institucional pertenece?",
          "checked": false
        },
        {
          "text": "¿Se evitó atribuir contenido a un ente sin cuenta oficial propia como si tuviera una?",
          "checked": false
        },
        {
          "text": "¿Las oficinas y direcciones internas se comunican solo a través de la cuenta central, sin perfiles paralelos no autorizados?",
          "checked": false
        },
        {
          "text": "¿Toda afirmación tiene evidencia real detrás?",
          "checked": false
        },
        {
          "text": "¿Fue validada por el enlace técnico antes de salir al aire?",
          "checked": false
        }
      ]
    }
  ],
  "accountSegments": [
    {
      "id": "1", "order": 1, "num": 1, "name": "Seguridad y Paz", "phase": "Fase 1", "symbol": "",
      "accounts": [
        { "code": "SEG-01", "name": "Comisión de Seguridad Ciudadana", "status": "candidato", "note": "IG (candidato, sin verificar): @seguridadciudadanatachira" },
        { "code": "SEG-02", "name": "Procuraduría General del Estado", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" },
        { "code": "SEG-03", "name": "Instituto Autónomo de Policía del Estado Táchira", "status": "verificado", "note": "IG: @politachira | X: @policiatachira — verificado" },
        { "code": "SEG-04", "name": "INAPROCET (Protección Civil Táchira)", "status": "verificado", "note": "IG: @pciviltachira (96K seg.) | X: @PCivilTachira (17.1K seg.) — verificado" },
        { "code": "SEG-05", "name": "Fundación de Altos Estudios Jurídicos de la Procuraduría (FAEJ)", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" }
      ]
    },
    {
      "id": "2", "order": 2, "num": 2, "name": "Economía y Desarrollo Productivo", "phase": "Fase 2", "symbol": "",
      "accounts": [
        { "code": "ECO-01", "name": "FUNDESTA — Instituto Autónomo para el Desarrollo de la Economía Social", "status": "verificado", "note": "IG: @fundestaoficial | X: @Fundesta_inst — verificado" },
        { "code": "ECO-02", "name": "IAPRET", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" },
        { "code": "ECO-03", "name": "Lotería de Táchira", "status": "verificado", "note": "IG: @lotdeltachira (185K seg.) | X: @LotDelTachira — verificado" },
        { "code": "ECO-04", "name": "I.V.T", "status": "parcial", "note": "IG (candidato, sin verificar): @ivt_tachira | Facebook: /ivtgbt — verificado" },
        { "code": "ECO-05", "name": "CORPOTACHIRA", "status": "verificado", "note": "X: @corpotachira — verificado. Sin Instagram propio confirmado." },
        { "code": "ECO-06", "name": "CORPOINTA", "status": "candidato", "note": "IG (candidato, sin verificar): @corpointa.gobtachira" },
        { "code": "ECO-07", "name": "COTATUR", "status": "verificado", "note": "IG: @cotaturve (15K seg.) — verificado" },
        { "code": "ECO-08", "name": "COIMTA", "status": "verificado", "note": "IG: @coimtaoficial (2,156 seg.) — verificado" },
        { "code": "ECO-09", "name": "MAFET, C.A.", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia (sitio web: mafet.net)" },
        { "code": "ECO-10", "name": "Agroinsumos del Táchira, C.A", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" },
        { "code": "ECO-11", "name": "SEDEBAT", "status": "verificado", "note": "IG: @sedebat_ (6,811 seg.) | X: @Sedebat_ — verificado" }
      ]
    },
    {
      "id": "3", "order": 3, "num": 3, "name": "Gestión Social y Servicios", "phase": "Fase 3", "symbol": "",
      "extra": "Incluye 12 oficinas y direcciones internas de la Gobernación que se comunican únicamente a través de @gobernaciondeltachira (no requieren cuenta propia) y 1 empresa inactiva (DESOTA, C.A.).",
      "accounts": [
        { "code": "SOC-01", "name": "Secretaría General de Gobierno", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-02", "name": "Consejo Estadal de Planificación y Coordinación de Políticas Públicas", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-03", "name": "Consejo de Gobierno del Estado", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-04", "name": "Gabinetes Sectoriales", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-05", "name": "Dirección de la Secretaría del Despacho del Gobernador", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-06", "name": "Dirección de Comunicación e Información", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-07", "name": "Dirección de Política y Participación Ciudadana", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-08", "name": "Dirección de Sistemas e Informática (DISI)", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-09", "name": "Dirección de Cooperación, Protocolo y Relaciones Institucionales", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-10", "name": "Oficina de Atención Comunitaria y Solidaridad Social (ODACYSS)", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-11", "name": "Oficina Estadal de Archivo", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-12", "name": "Oficina de la Imprenta Social del Estado", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "SOC-13", "name": "CORPOSALUD", "status": "verificado", "note": "IG: @corposalud_tachira (28K seg.) — verificado" },
        { "code": "SOC-14", "name": "INAPCET", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" },
        { "code": "SOC-15", "name": "INTAMUJER", "status": "verificado", "note": "IG: @intamujer | X: @INTAMUJERTACH — verificado" },
        { "code": "SOC-16", "name": "INTAVI", "status": "candidato", "note": "IG (candidato, sin verificar): @intavienlinea (5,278 seg.)" },
        { "code": "SOC-17", "name": "Fundación de la Familia Tachirense", "status": "verificado", "note": "IG/X: @famitachirense (27K seg.) — verificado" },
        { "code": "SOC-18", "name": "FUNDES", "status": "verificado", "note": "IG: @fundes.tachira (1,624 seg.) — verificado" },
        { "code": "SOC-19", "name": "FUNDACETA", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" },
        { "code": "SOC-20", "name": "DESOTA, C.A. (INACTIVA)", "status": "inactiva", "note": "Empresa inactiva — sin red social" }
      ]
    },
    {
      "id": "4", "order": 4, "num": 4, "name": "Educación y Desarrollo Humano", "phase": "Fase 4", "symbol": "",
      "accounts": [
        { "code": "EDU-01", "name": "Dirección de Talento Humano", "status": "interno", "note": "Oficina/dirección interna — usa @gobernaciondeltachira" },
        { "code": "EDU-02", "name": "Dirección de Educación", "status": "verificado", "note": "IG: @diredutachira (4,975 seg.) | X: @DirEduTachira — verificado" },
        { "code": "EDU-03", "name": "Dirección de Cultura del Estado Táchira", "status": "verificado", "note": "Facebook: /direcciondeculturadelestadotachira (30,605 seg.) — verificado. Sin Instagram propio confirmado." },
        { "code": "EDU-04", "name": "INTEDUCA", "status": "candidato", "note": "IG (candidato, sin verificar): @inteduca_tachira" },
        { "code": "EDU-05", "name": "I.D.T (Instituto del Deporte Tachirense)", "status": "verificado", "note": "IG: @idtachirense (2,956 seg.) — verificado" },
        { "code": "EDU-06", "name": "Fundación Escuela de Gobierno del Estado Táchira", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" }
      ]
    }
  ],
  "newsSources": [
    { "id": "1", "order": 1, "scope": "regional", "name": "La Nación (Táchira)", "description": "Diario regional de San Cristóbal — la referencia impresa y digital del estado.", "url": "https://www.lanacion.com.ve" },
    { "id": "2", "order": 2, "scope": "regional", "name": "Diario Los Andes", "description": "Cobertura de toda la región andina venezolana: Táchira, Mérida y Trujillo.", "url": "https://www.diariolosandes.com.ve" },
    { "id": "3", "order": 3, "scope": "regional", "name": "Google Noticias · Táchira", "description": "Agregador en vivo: reúne en un solo lugar lo último publicado sobre el estado por cualquier medio.", "url": "https://news.google.com/search?q=T%C3%A1chira&hl=es-419&gl=VE" },
    { "id": "4", "order": 1, "scope": "nacional", "name": "El Nacional", "description": "Uno de los diarios nacionales de mayor circulación digital.", "url": "https://www.elnacional.com" },
    { "id": "5", "order": 2, "scope": "nacional", "name": "El Universal", "description": "Diario nacional de referencia, fundado en 1909.", "url": "https://www.eluniversal.com" },
    { "id": "6", "order": 3, "scope": "nacional", "name": "Efecto Cocuyo", "description": "Medio digital independiente especializado en verificación y datos.", "url": "https://efectococuyo.com" },
    { "id": "7", "order": 4, "scope": "nacional", "name": "Venezolana de Televisión (VTV)", "description": "Canal oficial del Estado venezolano — la vocería institucional.", "url": "https://www.vtv.gob.ve" },
    { "id": "8", "order": 5, "scope": "nacional", "name": "Google Noticias · Venezuela", "description": "Agregador en vivo de la conversación nacional del momento.", "url": "https://news.google.com/search?q=Venezuela&hl=es-419&gl=VE" },
    { "id": "9", "order": 1, "scope": "internacional", "name": "BBC Mundo", "description": "Cobertura internacional en español del servicio mundial de la BBC.", "url": "https://www.bbc.com/mundo" },
    { "id": "10", "order": 2, "scope": "internacional", "name": "CNN en Español", "description": "Cobertura internacional 24/7 en español.", "url": "https://cnnespanol.cnn.com" },
    { "id": "11", "order": 3, "scope": "internacional", "name": "DW Español", "description": "Deutsche Welle — perspectiva europea de la agenda internacional.", "url": "https://www.dw.com/es" },
    { "id": "12", "order": 4, "scope": "internacional", "name": "Reuters", "description": "Agencia de noticias internacional, fuente primaria de gran parte de la prensa mundial.", "url": "https://www.reuters.com" },
    { "id": "13", "order": 5, "scope": "internacional", "name": "Google Noticias · Mundo", "description": "Portada de titulares internacionales en español, siempre actualizada.", "url": "https://news.google.com/topstories?hl=es-419&gl=VE&ceid=VE:es-419" }
  ]
};

/* Tablas iguales para las tres marcas — se quedan fijas en el código. */
const platformRows = [
  ['Formato principal','Reels (9:16), Carrusel, Stories 24h','Reel, video, fotos, carrusel, Stories','Video vertical (9:16), Dueto, Stitch'],
  ['Duración óptima de video','7-90 seg (Reels) · 1-7 min (IGTV)','30 seg-3 min — mejor alcance orgánico','15-60 seg — mayor rendimiento'],
  ['Hashtags','5-10, mezcla nicho + general','2-5, más naturales, sin saturar','3-5 trending + identidad regional'],
  ['Tono del copy','Visual + emocional. Primer renglón clave','Narrativo, admite storytelling largo','Ultra corto, directo, coloquial'],
  ['CTA ideal','Comenta / Guarda / Etiqueta a alguien','Comparte / Comentarios / ¿Qué opinas?','Dueto con esto / Comentario fijado'],
  ['Horarios óptimos (Venezuela)','7-9 a.m. · 12-2 p.m. · 7-9 p.m.','8-9 a.m. · 1-3 p.m. · 6-8 p.m.','6-9 a.m. · 7-11 p.m.'],
  ['Subtitulado','Obligatorio — 80% del consumo es sin audio','Recomendado / auto-subtítulos de Meta','Obligatorio — se penaliza sin subtítulos']
];

const reportRows = [
  ['Semanal (lunes)','KPIs de las 5 piezas + menciones orgánicas detectadas','Director Estratégico + Equipo de Comunicación Digital'],
  ['Mensual (por fase)','KPIs de especiales + crecimiento de seguidores','Director Estratégico — informe ejecutivo de 1 página'],
  ['Cierre del plan (día 80)','Resumen de los 4 pilares + recomendación para la siguiente fase','Equipo estratégico completo']
];

/* ============ 2 · UTILIDADES ============ */
const $ = function (id) { return document.getElementById(id); };

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}
/* Devuelve siempre una cadena: nunca "undefined" ni "null" en pantalla. */
function txt(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
}
function setHTML(id, v) { const n = $(id); if (n) n.innerHTML = txt(v); }
/* Solo se aceptan http(s) e imágenes en data: — nada de javascript: */
function safeUrl(u) {
  const s = txt(u).trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s) || /^data:image\//i.test(s)) return s.replace(/"/g, '&quot;');
  return '';
}
function parseISO(s) {
  const t = txt(s).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = new Date(t + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}
function fmtDay(d) {
  if (!d) return '';
  try { return d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' }); }
  catch (e) { return d.toISOString().slice(0, 10); }
}
function sortDocs(arr) {
  return arr.slice().sort(function (a, b) {
    const oa = Number(a && a.order), ob = Number(b && b.order);
    const va = Number.isFinite(oa) ? oa : 9999;
    const vb = Number.isFinite(ob) ? ob : 9999;
    if (va !== vb) return va - vb;
    return String(a && a.id).localeCompare(String(b && b.id), 'es', { numeric: true });
  });
}
function clone(v) { return JSON.parse(JSON.stringify(v)); }
function normStatus(s) { return (s === 'g' || s === 'y' || s === 'r') ? s : null; }
function pctOf(part, total) {
  const t = Number(total);
  if (!Number.isFinite(t) || t <= 0) return 0;
  const p = Number(part);
  if (!Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(100, (p / t) * 100));
}

/* localStorage tolerante: si el navegador lo bloquea, sigue en memoria. */
const safeStorage = {
  get: function (key) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
    catch (e) { return null; }
  },
  set: function (key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  },
  remove: function (key) {
    try { localStorage.removeItem(key); } catch (e) { /* sin storage disponible */ }
  }
};

let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = txt(msg);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
}

/* ============ 3 · ESTADO ============ */
const state = {
  meta: clone(DEFAULT_DATA.meta),
  pillars: clone(DEFAULT_DATA.pillars),
  symbols: clone(DEFAULT_DATA.symbols),
  weekly: clone(DEFAULT_DATA.weekly),
  specials: clone(DEFAULT_DATA.specials),
  phases: clone(DEFAULT_DATA.phases),
  kpiWeekly: clone(DEFAULT_DATA.kpiWeekly),
  kpiSpecial: clone(DEFAULT_DATA.kpiSpecial),
  checklist: clone(DEFAULT_DATA.checklist),
  accountSegments: clone(DEFAULT_DATA.accountSegments),
  newsSources: clone(DEFAULT_DATA.newsSources)
};

/* Estado local (se usa mientras no haya conexión con Firestore). */
let localStatus = safeStorage.get(LS_PREFIX + 'status_v1') || {};
let localChecks = safeStorage.get(LS_PREFIX + 'checklist_v1') || {};

const openPillars = new Set(['1']); // primer pilar abierto por defecto

function kpiStatus(kind, item) {
  if (fb.live) return normStatus(item.status);
  return normStatus(localStatus[kind + ':' + item.id]);
}
function itemChecked(group, idx) {
  if (fb.live) {
    const it = group.items && group.items[idx];
    return !!(it && it.checked);
  }
  return !!localChecks[group.id + ':' + idx];
}

/* ============ 4 · RENDER ============ */
function renderMeta() {
  const m = state.meta || {};
  document.title = DOC_TITLE;
  setHTML('brandEyebrow', m.eyebrow || BRAND_NAME);

  const s = parseISO(m.periodStart), e = parseISO(m.periodEnd);
  let period = '';
  if (s && e) {
    period = fmtDay(s) + ' — ' + fmtDay(e) + ' ' + e.getFullYear();
  }
  setHTML('brandPeriod', period);

  setHTML('heroSub', m.heroSub);
  setHTML('introCard', m.introCard);
  setHTML('quoteTxt', m.quote);
  setHTML('metricHero', m.metricHero);
  setHTML('resumenNote', m.resumenNote);
  setHTML('pilaresNote', m.pilaresNote);
  setHTML('semanalNote', m.semanalNote);
  setHTML('symbolDiff', m.symbolDiff);
  setHTML('symbolReflection', m.symbolReflection);
  setHTML('docFoot', m.footer);

  // Tarjetas de estadísticas
  const grid = $('statGrid');
  grid.innerHTML = '';
  const stats = Array.isArray(m.stats) ? m.stats : [];
  stats.forEach(function (st) {
    grid.appendChild(el('div', 'card stat-card',
      '<div class="num">' + txt(st && st.num) + '</div>' +
      '<div class="lbl">' + txt(st && st.lbl) + '</div>'));
  });

  // Diagnóstico
  const diag = $('diagGrid');
  diag.innerHTML = '';
  const found = [m.diag1, m.diag2, m.diag3, m.diag4, m.diag5, m.diag6].filter(function (d) { return txt(d).trim() !== ''; });
  found.forEach(function (d) {
    diag.appendChild(el('div', 'card diag-card',
      '<span class="urg">Urgencia alta</span><p>' + txt(d) + '</p>'));
  });
  setHTML('diagCount', found.length + (found.length === 1 ? ' hallazgo' : ' hallazgos'));
  $('diagCount').style.display = found.length ? '' : 'none';
  $('resumenNote').style.display = txt(m.resumenNote).trim() ? '' : 'none';
  $('pilaresNote').style.display = txt(m.pilaresNote).trim() ? '' : 'none';
  $('semanalNote').style.display = txt(m.semanalNote).trim() ? '' : 'none';
}

function renderPillars() {
  const list = $('pillarList');
  const chart = $('pilarChart');
  list.innerHTML = '';
  chart.innerHTML = '';

  const pillars = sortDocs(state.pillars);

  if (!pillars.length) {
    list.appendChild(el('div', 'empty', 'Sin pilares cargados todavía.'));
    chart.appendChild(el('div', 'empty', 'Sin datos para el gráfico de cobertura.'));
    return;
  }

  // ---- Gráfico de cobertura: Math.max(1, ...) evita NaN% con 0 ideas ----
  const counts = pillars.map(function (p) { return Array.isArray(p.ideas) ? p.ideas.length : 0; });
  const maxIdeas = Math.max.apply(null, [1].concat(counts));
  pillars.forEach(function (p, i) {
    const n = counts[i];
    const pct = Math.round(pctOf(n, maxIdeas));
    chart.appendChild(el('div', 'bar-chart-row',
      '<span class="bar-chart-lbl">' + String(txt(p.num) || (i + 1)).padStart(2, '0') + ' · ' + txt(p.name) + '</span>' +
      '<div class="bar-chart-track"><div class="bar-chart-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="bar-chart-val">' + n + '</span>'));
  });

  // ---- Acordeón (animación 100% CSS con grid-template-rows) ----
  pillars.forEach(function (p) {
    const isOpen = openPillars.has(String(p.id));
    const card = el('div', 'pillar-card' + (isOpen ? ' open' : ''));

    const head = el('div', 'pillar-head');
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');
    head.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    head.innerHTML =
      '<div class="pillar-num">' + String(txt(p.num) || '').padStart(2, '0') + '</div>' +
      '<div class="pillar-head-txt"><h4>' + txt(p.name) + '</h4><p>' + txt(p.sub) + '</p></div>' +
      '<div class="pillar-meta">' +
        (txt(p.phase) ? '<span>' + txt(p.phase) + '</span>' : '') +
        '<button type="button" class="pillar-icon-btn" data-pillar-id="' + txt(p.id) + '" aria-label="Ver símbolo de ' + txt(p.name).replace(/"/g, '&quot;') + '" title="Ver símbolo del pilar">' +
          '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' +
        '</button>' +
      '</div>' +
      '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

    function toggle() {
      const nowOpen = !card.classList.contains('open');
      card.classList.toggle('open', nowOpen);
      head.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
      if (nowOpen) openPillars.add(String(p.id)); else openPillars.delete(String(p.id));
    }
    head.addEventListener('click', toggle);
    head.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); }
    });
    head.querySelector('.pillar-icon-btn').addEventListener('click', function (ev) {
      ev.stopPropagation();
      openSymbolModal(p.id);
    });

    const ideas = Array.isArray(p.ideas) ? p.ideas : [];
    let inner = '<div class="pillar-body-inner">';
    if (txt(p.symbol).trim()) inner += '<p class="pillar-symbol">' + txt(p.symbol) + '</p>';
    if (ideas.length) {
      ideas.forEach(function (idea) {
        inner += '<div class="idea-row">' +
          '<div class="idea-code">' + txt(idea && idea.code) + '</div>' +
          '<div class="idea-txt">' + txt(idea && idea.txt) + '</div>' +
          '<div class="idea-note">' + txt(idea && idea.note) + '</div>' +
          '</div>';
      });
    } else {
      inner += '<div class="empty">Este pilar todavía no tiene ideas cargadas.</div>';
    }
    if (txt(p.extra).trim()) inner += '<div class="note" style="margin-top:14px;">' + txt(p.extra) + '</div>';
    inner += '</div>';

    const body = el('div', 'pillar-body', inner);
    card.appendChild(head);
    card.appendChild(body);
    list.appendChild(card);
  });
}

function renderSymbols() {
  const grid = $('symbolGrid');
  grid.innerHTML = '';
  const symbols = sortDocs(state.symbols);
  if (!symbols.length) {
    grid.appendChild(el('div', 'empty', 'Sin símbolos cargados todavía.'));
    return;
  }
  symbols.forEach(function (s) {
    const url = safeUrl(s.imageUrl);
    const media = url
      ? '<div class="symbol-img-box"><img src="' + url + '" alt="' + txt(s.name).replace(/"/g, '&quot;') + '" loading="lazy"></div>'
      : '<div class="symbol-ph"><span>[Imagen del símbolo]</span></div>';
    grid.appendChild(el('div', 'symbol-item',
      media +
      '<div class="symbol-txt">' +
        '<span class="symbol-tag">' + txt(s.tag) + '</span>' +
        '<h5>' + txt(s.name) + '</h5>' +
        '<p>' + txt(s.description) + '</p>' +
      '</div>'));
  });
}

/* Genera 2 letras a partir del nombre, para el símbolo genérico de los
   pilares que todavía no tienen un símbolo cargado en Firestore. */
function initialsFor(name) {
  const words = txt(name).replace(/[().,]/g, '').split(' ').filter(function (w) { return w.length > 0; });
  const capWords = words.filter(function (w) { return /^[A-ZÁÉÍÓÚÑ]/.test(w); });
  const pick = capWords.length >= 2 ? capWords : words;
  if (pick.length === 0) return txt(name).slice(0, 2).toUpperCase();
  if (pick.length === 1) return pick[0].slice(0, 2).toUpperCase();
  return (pick[0][0] + pick[1][0]).toUpperCase();
}

/* Un símbolo se asocia a un pilar por su "tag" (ej. "Pilar 3 · Cuentas
   claras"), así el vínculo vive en el contenido y no hay que duplicar
   el id del pilar dentro de cada símbolo. */
function findSymbolForPillar(p) {
  const num = txt(p && p.num).trim();
  if (!num) return null;
  const re = new RegExp('\\bPilar\\s+' + num + '\\b', 'i');
  return sortDocs(state.symbols).find(function (s) { return re.test(txt(s.tag)); }) || null;
}

function openSymbolModal(pillarId) {
  const p = state.pillars.find(function (pp) { return String(pp.id) === String(pillarId); });
  if (!p) return;
  setHTML('symbolModalEyebrow', 'Pilar ' + String(txt(p.num) || '').padStart(2, '0'));
  setHTML('symbolModalTitle', p.name);
  const sym = findSymbolForPillar(p);
  const body = $('symbolModalBody');
  if (!sym) {
    body.innerHTML = '<div class="empty">Este pilar todavía no tiene un símbolo asociado.</div>';
  } else {
    const url = safeUrl(sym.imageUrl);
    body.innerHTML =
      (url
        ? '<div class="symbol-tile-img-wrap"><img src="' + url + '" alt="' + txt(sym.name).replace(/"/g, '&quot;') + '"></div>'
        : '<div class="symbol-tile-img-wrap"><div class="symbol-tile-placeholder">' + initialsFor(sym.name) + '</div></div>') +
      '<p class="symbol-tile-name">' + txt(sym.name) + '</p>' +
      '<p class="symbol-tile-desc">' + txt(sym.description) + '</p>' +
      (url ? '' : '<span class="symbol-tile-pending">Imagen pendiente</span>');
  }
  const dialog = $('symbolModal');
  if (typeof dialog.showModal === 'function') dialog.showModal();
}

function wireSymbolModal() {
  const dialog = $('symbolModal');
  $('symbolModalClose').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
}

/* ============ ECOSISTEMA DE CUENTAS ============
   Mismo patrón visual y de datos que "Pilares de marca" (acordeón +
   gráfico de cobertura), aplicado a un inventario distinto: no son ideas
   de contenido sino cuentas institucionales reales, cada una con su
   estado de verificación en redes sociales. */
const accountStatusMeta = {
  verificado: { label: 'Verificado', cls: 'v' },
  candidato:  { label: 'Candidato sin verificar', cls: 'c' },
  parcial:    { label: 'Verificado parcial', cls: 'p' },
  sin_cuenta: { label: 'Sin cuenta propia', cls: 's' },
  interno:    { label: 'Usa cuenta central', cls: 'i' },
  inactiva:   { label: 'Inactiva', cls: 'x' }
};
const accountStatusColors = { v: '#0a7052', c: '#b45309', p: '#0e7490', s: '#948ca3', i: '#2f5488', x: '#b91c1c' };
const openSegments = new Set(['1']); // primer segmento abierto por defecto

function renderAccountSegments() {
  const list = $('accountsList');
  const chart = $('accountsChart');
  const legend = $('accountsStatusLegend');
  if (!list || !chart) return;
  list.innerHTML = '';
  chart.innerHTML = '';
  if (legend) legend.innerHTML = '';

  const segments = sortDocs(state.accountSegments);
  const allAccounts = segments.reduce(function (acc, s) { return acc.concat(Array.isArray(s.accounts) ? s.accounts : []); }, []);
  const total = allAccounts.length;
  const verifiedCount = allAccounts.filter(function (a) { return a.status === 'verificado'; }).length;
  setHTML('chipAccountsTotal', total + (total === 1 ? ' ente' : ' entes'));
  setHTML('chipAccountsVerified', verifiedCount + (verifiedCount === 1 ? ' verificada' : ' verificadas'));
  setHTML('chipResumenEntes', total + (total === 1 ? ' ente' : ' entes'));
  setHTML('chipResumenVerificadas', verifiedCount + (verifiedCount === 1 ? ' verificada' : ' verificadas'));

  if (!segments.length) {
    list.appendChild(el('div', 'empty', 'Sin segmentos cargados todavía.'));
    chart.appendChild(el('div', 'empty', 'Sin datos para el gráfico de cobertura.'));
    return;
  }

  // ---- Gráfico de cobertura, un color de la paleta por segmento ----
  const counts = segments.map(function (s) { return Array.isArray(s.accounts) ? s.accounts.length : 0; });
  const maxAccounts = Math.max.apply(null, [1].concat(counts));
  segments.forEach(function (s, i) {
    const n = counts[i];
    const pct = Math.round(pctOf(n, maxAccounts));
    const shade = PHASE_SHADES[i % PHASE_SHADES.length];
    chart.appendChild(el('div', 'bar-chart-row',
      '<span class="bar-chart-lbl">' + String(txt(s.num) || (i + 1)).padStart(2, '0') + ' · ' + txt(s.name) + '</span>' +
      '<div class="bar-chart-track"><div class="bar-chart-fill" style="width:' + pct + '%;background:' + shade + '"></div></div>' +
      '<span class="bar-chart-val">' + n + '</span>'));
  });

  // ---- Leyenda de estado (reutiliza el mismo componente que la línea de tiempo) ----
  if (legend) {
    const counts2 = {};
    allAccounts.forEach(function (a) { counts2[a.status] = (counts2[a.status] || 0) + 1; });
    Object.keys(accountStatusMeta).forEach(function (key) {
      const n = counts2[key] || 0;
      const m = accountStatusMeta[key];
      legend.appendChild(el('div', 'tl-leg-item',
        '<span class="sw" style="background:' + accountStatusColors[m.cls] + '"></span>' + m.label + ' · <b>' + n + '</b>'));
    });
  }

  // ---- Acordeón (mismas clases que pillar-card/idea-row) ----
  segments.forEach(function (s, i) {
    const isOpen = openSegments.has(String(s.id));
    const card = el('div', 'pillar-card' + (isOpen ? ' open' : ''));

    const head = el('div', 'pillar-head');
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');
    head.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    const accounts = Array.isArray(s.accounts) ? s.accounts : [];
    head.innerHTML =
      '<div class="pillar-num" style="color:' + PHASE_SHADES[i % PHASE_SHADES.length] + '">' + String(txt(s.num) || '').padStart(2, '0') + '</div>' +
      '<div class="pillar-head-txt"><h4>' + txt(s.name) + '</h4><p>' + accounts.length + (accounts.length === 1 ? ' ente' : ' entes') + '</p></div>' +
      '<div class="pillar-meta">' +
        (txt(s.phase) ? '<span>' + txt(s.phase) + '</span>' : '') +
        '<button type="button" class="pillar-icon-btn" data-seg="' + txt(s.num) + '" aria-label="Ver logos de ' + txt(s.name).replace(/"/g, '&quot;') + '" title="Ver logos de los entes de este segmento">' +
          '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>' +
        '</button>' +
      '</div>' +
      '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

    function toggle() {
      const nowOpen = !card.classList.contains('open');
      card.classList.toggle('open', nowOpen);
      head.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
      if (nowOpen) openSegments.add(String(s.id)); else openSegments.delete(String(s.id));
    }
    head.addEventListener('click', toggle);
    head.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); }
    });
    head.querySelector('.pillar-icon-btn').addEventListener('click', function (ev) {
      ev.stopPropagation();
      openLogoModal(s.num, PHASE_SHADES[i % PHASE_SHADES.length]);
    });

    let inner = '<div class="pillar-body-inner">';
    if (txt(s.symbol).trim()) inner += '<p class="pillar-symbol">' + txt(s.symbol) + '</p>';
    if (accounts.length) {
      accounts.forEach(function (a) {
        const meta = accountStatusMeta[a.status] || { label: txt(a.status), cls: 's' };
        inner += '<div class="idea-row">' +
          '<div class="idea-code">' + txt(a.code) + '</div>' +
          '<div class="idea-txt">' + txt(a.name) + '<span class="acct-badge ' + meta.cls + '">' + meta.label + '</span></div>' +
          '<div class="idea-note">' + txt(a.note) + '</div>' +
          '</div>';
      });
    } else {
      inner += '<div class="empty">Este segmento todavía no tiene cuentas cargadas.</div>';
    }
    if (txt(s.extra).trim()) inner += '<div class="note" style="margin-top:14px;">' + txt(s.extra) + '</div>';
    inner += '</div>';

    const body = el('div', 'pillar-body', inner);
    card.appendChild(head);
    card.appendChild(body);
    list.appendChild(card);
  });
}

/* Modal de logos por segmento — igual que el dashboard de referencia:
   una cuenta con logo real (JPEG en base64, ver logoImages más abajo)
   muestra su logo; sin logo, muestra un círculo con sus iniciales sobre
   el color del segmento. Las cuentas "interno" no tienen logo propio
   (usan la cuenta central), así que no se listan aquí. */
function openLogoModal(segNum, color) {
  const seg = state.accountSegments.find(function (s) { return Number(s.num) === Number(segNum); });
  if (!seg) return;
  const shown = (Array.isArray(seg.accounts) ? seg.accounts : []).filter(function (a) { return a.status !== 'interno'; });
  const haveCount = shown.filter(function (a) { return !!logoImages[a.code]; }).length;
  setHTML('logoModalEyebrow', 'Segmento ' + String(txt(seg.num) || '').padStart(2, '0'));
  $('logoModalEyebrow').style.color = color || '';
  setHTML('logoModalTitle', seg.name);
  setHTML('logoModalSub', haveCount + ' de ' + shown.length + ' entes con logo cargado. Los que faltan muestran un ícono con iniciales hasta que se reciban.');
  const grid = $('logoModalGrid');
  grid.innerHTML = '';
  if (!shown.length) {
    grid.appendChild(el('div', 'empty', 'Este segmento no tiene cuentas propias que mostrar aquí.'));
  } else {
    shown.forEach(function (a) {
      const b64 = logoImages[a.code];
      const media = b64
        ? '<div class="logo-img-wrap"><img src="data:image/jpeg;base64,' + b64 + '" alt="Logo de ' + txt(a.name).replace(/"/g, '&quot;') + '"></div>'
        : '<div class="logo-img-wrap"><div class="logo-placeholder" style="background:' + (color || 'var(--brand-core)') + '">' + initialsFor(a.name) + '</div></div>';
      grid.appendChild(el('div', 'logo-tile',
        media +
        '<div class="logo-name">' + txt(a.name) + '</div>' +
        (b64 ? '' : '<span class="logo-pending">Logo pendiente</span>')));
    });
  }
  const dialog = $('logoModal');
  if (typeof dialog.showModal === 'function') dialog.showModal();
}

function wireLogoModal() {
  const dialog = $('logoModal');
  $('logoModalClose').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
}

/* ============ MATRICES DE NOTICIAS ============
   Directorio curado de enlaces (no un feed embebido: la mayoría de los
   medios bloquea que su contenido se muestre dentro de otra página vía
   X-Frame-Options/CSP). Cada tarjeta abre la fuente en una pestaña nueva. */
function newsInitials(name) {
  const words = txt(name).split(/[\s·(]+/).filter(function (w) { return w.length > 0; });
  if (!words.length) return 'news'.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function renderNews() {
  const scopes = [
    { key: 'regional', gridId: 'newsRegional', countId: 'newsRegionalCount' },
    { key: 'nacional', gridId: 'newsNacional', countId: 'newsNacionalCount' },
    { key: 'internacional', gridId: 'newsInternacional', countId: 'newsInternacionalCount' }
  ];
  const sources = sortDocs(state.newsSources);
  scopes.forEach(function (scope) {
    const grid = $(scope.gridId);
    if (!grid) return;
    grid.innerHTML = '';
    const items = sources.filter(function (s) { return txt(s.scope) === scope.key; });
    setHTML(scope.countId, items.length + (items.length === 1 ? ' fuente' : ' fuentes'));
    if (!items.length) {
      grid.appendChild(el('div', 'empty', 'Sin fuentes cargadas todavía.'));
      return;
    }
    items.forEach(function (s) {
      const url = safeUrl(s.url);
      grid.appendChild(el('div', 'news-card',
        '<div class="news-card-top">' +
          '<div class="news-card-badge">' + newsInitials(s.name) + '</div>' +
          '<h5>' + txt(s.name) + '</h5>' +
        '</div>' +
        '<p>' + txt(s.description) + '</p>' +
        (url
          ? '<a class="news-card-link" href="' + url + '" target="_blank" rel="noopener noreferrer">Abrir sitio <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></a>'
          : '<span class="acct-badge s">Sin enlace</span>')));
    });
  });
}

function renderWeekly() {
  const strip = $('weekStrip');
  strip.innerHTML = '';
  const weekly = sortDocs(state.weekly);
  if (!weekly.length) {
    strip.appendChild(el('div', 'empty', 'Sin piezas semanales cargadas todavía.'));
    return;
  }
  weekly.forEach(function (w) {
    strip.appendChild(el('div', 'week-card',
      '<span class="week-day">' + txt(w.day) + '</span>' +
      '<h4>' + txt(w.title) + '</h4>' +
      '<span class="week-fmt">' + txt(w.format) + '</span>' +
      '<p class="week-obj">' + txt(w.objective) + '</p>' +
      (txt(w.time).trim() ? '<span class="week-time">' + txt(w.time) + '</span>' : '')));
  });
}

function renderSpecials() {
  const list = $('specialsList');
  list.innerHTML = '';
  const specials = sortDocs(state.specials);
  if (!specials.length) {
    list.appendChild(el('div', 'empty', 'Sin publicaciones especiales cargadas todavía.'));
    return;
  }
  specials.forEach(function (s) {
    list.appendChild(el('div', 'special-card',
      '<div class="special-top">' +
        '<div><h4>' + txt(s.title) + '</h4><p class="theme">' + txt(s.theme) + '</p></div>' +
        '<div class="special-badges">' +
          (txt(s.format).trim() ? '<span class="badge fmt">' + txt(s.format) + '</span>' : '') +
          (txt(s.phase).trim() ? '<span class="badge phase">' + txt(s.phase) + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="special-script">' +
        '<div class="script-part"><span class="k">Gancho</span><p>' + txt(s.hook) + '</p></div>' +
        '<div class="script-part"><span class="k">Desarrollo</span><p>' + txt(s.development) + '</p></div>' +
        '<div class="script-part"><span class="k">CTA</span><p>' + txt(s.cta) + '</p></div>' +
      '</div>'));
  });
}

const PHASE_SHADES = ['#7a26f7', '#a626f7', '#e226f7', '#f726a3'];

/* Logos institucionales reales (JPEG comprimido en base64), tomados
   del inventario de cuentas del cliente -- 18 de 29 entes con logo
   propio (excluye las cuentas 'interno', que usan la cuenta central).
   Los que faltan muestran un icono generico con iniciales hasta que
   se reciba el logo real. */
const logoImages = {
  "ECO-02": "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",
  "ECO-03": "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",
  "ECO-04": "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",
  "ECO-05": "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",
  "ECO-07": "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",
  "ECO-08": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCABqASwDASIAAhEBAxEB/8QAHQAAAgMBAQEBAQAAAAAAAAAAAAcFBggEAwkBAv/EAEoQAAEDAwIDBQUCCAwEBwAAAAECAwQABREGBxIhMQgTQVFhFCJxgZEVoRYYMkKxssLSFyMzUlZicoKSlMHRJDRDVSVEVHOj4fH/xAAbAQEAAwEBAQEAAAAAAAAAAAAABAUGBwEDAv/EADQRAAIBAwICBggHAQEAAAAAAAABAgMEEQUhBjESEyJBUWEUFVSBkqHB0SMyUlNxkfCx8f/aAAwDAQACEQMRAD8A1TRRRQBRRmigCqvuRrmDtzo+fqKcQRHRhlonBedPJCB8T18gCfCrRWJO07uW/uJrhnSdkUuRb7Y97O2hrn7TKJ4SQB1wfdHz86AuXZf3xnXXVNy01qaaXXbu+ubDdWeSX1HK2x5AjmB4EEeNapr5/bnbR3/ZKTp67CUtSpDSHhIb5ezy04Km8jy5EHxwfKtk7P7jxtz9EQr22pCZiR3M1pP/AEngBnl5HkR6GgLxRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQH4KhtT6mhaYtypUteVHIbaSfeWryFTOKSW7ttuLN9TLkOrdiPABk/mt46p/wBfXNVuq3c7Wg6kFl/88y10Wxp3l1GlUlhf98iNG5N/RenLkmUcLOPZzzbCR0GP9etTl43kny4aGrbFEN4j+MdUQsg/1RjHzNLo5qS0/a27lOPtLiWIMdCn5byjhLTSRlRJ+Ax86xFvqF5KXVU5vMn/AL+Do91pWn049fVppKC/2fE6NwN2L7ojbaRNlXRxy63vii21pQSFNoxhx7kM8geXqRVP7I21irzeHNeXZkriwVluCHOfeP8Ai5z6hIOAfM+lUG+zbn2gd249vtTa24a1iJBbx7sWIjqsjw5ZUfU48q3NpfTkDSNgg2K1tBuHCaDTY8TjqT5knJJ8zXQbWi6NJQk233tnLL24VetKpGKSb2S7kRO5+goW5OjLhp+ZwpW8jjjukZLLyeaFD58j5gkVkHYvXc/ZncuTp++qVFhSnvYZ7a+jDoJCHMeQJ5nxST6VrbVGu2Yjv2fbnk96ThyR1S0PHA8TWZu0FttKuNqVuHbo6u4bcEaZnJWodA8o+PM4J9R5VIIyHwrdK7WC8PwL5DZfQ2rHGyCkkdQoZJBBGD4Vzai3ikv4asbJjo5EvOgFXwA5gfPNKvbfVQ3I2/S1IXx6g042Gns/lSYnRDnqU/kn5HxrpPLpWG1O9vbSo6Lns90+86No2m6dfUo3PQ7S2a7s+OB/aH1xF1XDCHClqe2B3rWev9YeYq11mrTDc92+w27Y4puUpwBKk+A8SfTGc+laSbCg2kLOVYGT61f6Jfzu6P4i3Xf4mZ4i0ynY10qT2lvjwPSiiiroz4UUUUAUUUUAUUUUAUUUUAUUUUAUUUUAUUUUAUUUUAUUUUAUUUUAUUUUAUUUUB+VQN4rgxH063EWhCnpDo7vPVIHMkfcPnV+UtKQSSBjzpCbmX77a1K6htYUxFHdIIOQSOaj9eXyql126VG1ce+Wxf8ADVnK4vYy7o7sqYBJwBknoKr++erPwM0q1oeC5w3S7JTJuqknm0z1QyfInqR5Y86u1leh2aHc9T3NIXBskcylIPRxzohHzVikztfYHt4dzZeodUPcVuYd9vuTiui8n3GUj+sRgAdEg+VVXDenrDuZr+PuXfF2pvKs6b839EPrsq7Wt6L0kvV94bS1cbs2FNlwYLEbqOvQq/KPpirlq3Xq53HCta1Nxui3h+U56DyH3monUurZF7PszA9mgN4CGE8sgdCrH6OgqArXZMKe0KI7PltRmUlTjywkD1J605l6ct7+nV6fksJfgusGO62rotJGFZ9TkmlrpaW1YHEXmXEdebUsstKTgBKsDJ5+ODgfOmi7d4wQe7ebU6Gg+WlKCVcGM5wenzogYUnxLt2ct4sYW9EZcykK6TIS+RB8CcZHopNOW/worLrE+2OB61XFoSobo6KQoZx8QeRHpVo7Rm3LG6O3/wBuWhsuXW0pU+x7vvOtj8tsjzwMgeY9aTnZ/wBUq1Lp+4aBmqK5EJC7halE+8Mc3Wh6H8oDzzVPrdirmg2l2o7ov+HtTdncpSfZls/v7hpbZXJi26rj+0JTwvAspWfzVHGPrjHzp+jmKywha21pWhRStJCgR1BHQ1orRt/RqKwRpvGnveHgdGeYWOR/3+dVfDN2ujK3lzW6LjjCxanG6jyez+hPVTNzN09PbV2ZNwvjy1OPFSY0VkAuvqA5gA8gBkZJ5DPyq51jPtqTy/r+zQgo8Me2hWPAKU4rJ+gH0rWmIO65dtu/uSF/ZulrYyxn3RIeW4rHqRwj7qjz21dbeFjsI/uO/v1W+y7omza43EfiX63s3CDHgOPFl3PCVcSUg8iOmTWrn+z7ti4y4hGjrY2pSSkLCVZSccj18KASelu2xLM1DWqNNx/ZVHCn7etQWgefAokH6itNWvU1ovGnWdRw5rS7W8x7QJKjwpDYGSTnpjBznpg1m1XYeSSSNbEDPIfZ/T/5KvWutMJ2p7Mt2083PXL9liFj2go7srLrwzgZOPyyMZNAVLW/bPhW+4OxNJWNNyZbJT7bLcKELI8UoAyR6kj4VTl9tbWhVlFhsKR5FLp/brPKUlagkdScV9BLJsBtsLNAEnSFudf9nb7xxQVlSuEZJ59Sc0Agmu2rrNLiVO2CxLQOoSHEkj48RxTy2b7Qtk3YdVbVRV2q9to7wxFr40upHVTasDOPEEAj1rPXaw0jpnRep7JbtN2eLbEOQlPPBgEcZKyBnJPQJP1qP7JcNUreWA4M4jxZDp+HBw/pUKAdG/PaNv212tG7BZ7bbZTXsjcha5KVlQUoqGBggYwB9a99gO0BqTdnVky03S22yNGjQlSeOMlYVxBaUgc1EY94/SkR2qp3tm9V4SDkR2o7I9MNpJ+8mr92IYHHe9UTyP5KMwyD/aUo/s0BI7mdrDVGjteXrT9ttNneiQJBYQ48lwrVgDOcKA658Kndku1DI19qoae1PDgW92Un/gno/EErcH/TVxE8yOh8xjxFZb3LnfaW4epZfFkO3OSoHzHeKx91QEWS/BktSYzqmn2lpcbWg4UlQOQQfAgigPqbWet7e1H+AeoE6f0tFhXOZHJ9tdfKi20rwbTwkZUPE5wOnXOKlf8AtcOSNq4ka3Bber5LZjynQnCY4AALyT0KlA5A8DnyGcxOurfcW66srcWSpSlHJJJyST4mgNRbf9q/WOsNbWSwP2eyts3CW2w4ppDnElJPMjKiMgZq6doPf+97Tahttps9vt0sSYpkuGUFkpPGUgDhI/mms69miD7fvVpwEZDK3Xj/AHWlEffittao2w0brScifqHT8O4ym2w0h14HKUAk45Ecsk/WgMtfjq63/wCx2H/A5+/R+Orrf/sdh/wOfv1J9rPQGjtD2KwDTthh22TLkud44yDxKQlA5HJPLKgflSZ2esETVG5unLROYTIiSZiQ80rotABUQfQgUA0/x1db/wDY7D/gc/frT1s15FibawNZ6nej25py3tTJBSDwoK0g8KQckkkgAcyTUf8AwAbXf0Ltf0V/vS87YTjFn2ntdphoSwwu4MtIaQMBLaG1kADyGBQFV1N22n0zVt6a0uwuKkkJenvHiWPPgTjH1NV9XbW1qVZTYbCB5cLp/bpN7eWhm/670/apDQdYl3Bhl1s9FoKwCD8Rmt4/i/7X/wBC7X9Ff70Bny29tnUzUlJuWmrTIj595LC3G149CSofdWgNFb6aJ1pYWrqi7sW1ZUW3IsxwIcbWACR1wRzHMcjWJd57dbLPujqK3WaI1DgRZRZaYazwo4UgEDPqCfnXdt5ol3UdkeloSSESVNZ+CUn/AFoB73DUl3uh/wCMuUl0HqnjIH0HKo6vSTFkRHO7kMOMqHLC0kH768utclqynJ9tv3ncqEKUI4pJJeWCJ3pnrtOzEWK0eFV5u2HD5tsozj/Fg1z9n60LGk1OstqW/OlqwlIyVBOEgfXi+tem+sRc/Z2xzGxlNuuzjTuPzQ4gkE/NOPnXbtDf4mmOz7eNVxErk3ayvraS0FFKWytSeFRxzI9/J8+EiulaUl6JTS8Ech1pyd9VcueWNzUEW1aJsARclwkzpA4lyJTqUNsDyBUQCf8A98qqlllQ9RPpZtE6HcFlQSRFfS5wknAzgnA9TWS9U6tvetLq5db9cZE6U4SeJxWQkeSR0SB5CuayX25acuTNztM16FMYPEh5pRCh6eoPiDyNT8FWfR9iEuNDj2eFAZkMNJ4XHnscCV9cgY945yT9Kjbnop9vgkwHWUOxxxErSVKkHxCvDHLASBikDtB2tzb4ybRuB3z6UnDVzZQCpIJ6OIGMgeChz8wetOtfaM2sRFMk6vhlOM8AbcK/hw8Oc16C02m4z1OPC7WxMFC8YcCwUKOACD5fH5VjKAwnb3tQoiRR3cdq+dwEjoGnjjHww5j5Vfta9oB/dnWNg0Xo1uTHtUi5Me0yHBwuSgHAojh/NQACTnmcc8DkV7cZKdbdqEPQT3jT2oGwhQ5gobWkE/DCCa8fI9XMa9+iJg3udFSMJafWkD0BOPurxgXObbXQ7ClPR1+baiM/HHWuvVMhMnUdyeSRwqkLwR4jJqLCVKUEpBJPQAZJrlVVuNaTpvG7xg7XQSqW0FWWcpZz/BoHbu7zL3pliXOc714qUkrwASAcDpWOe1nO9r3knNA5EWLHZ+HucR/WrX210Z+LpGO2+0tpZWtQStJBwTyODWI+0PLVN3m1QtQIKJKWh8EtpSP0V0qwlJ29Ny54WTkGpRhG7qKHJN4/saHYihcepNSziP5KG00D/aWT+xWvKxh2Wt0dG7bQtQHUtzVCfmuMhkBhbnElIVk5SDjmrxpu6w7WOhrbp+VK01PTdbqgJ7mK6w62lZKgDlRSMYGT8qmEIeVJftcT/Y9nJbQPOVMjs/EBRUf1aVkXtp6mmSWo7WkbWtx1YbSkPOEqJOAB9at/bPmPp26sTCkFPf3FKnAOgIaUcfUn6UBknTsM3DUFshgZL8tprHnlYH+tfUBCAhCUjoAB9K+aG3s+32rXNhuF1d7mDFnsvvucJVwoSsEnABJ6eFbZ/Gl2o/pGv/Jvfu0BnftiTvat2kxwciLbmW8eRJUr9oVJ9iuD324V3mEco9sKQfIqcT/oDS6321fbtc7n3e+WiQZEB4NIYcKCniCW0pPIgEcweopzdiC3KC9VXJSDwYjx0rI5E++ojP0+tAJTfed9o7v6qfzkCetofBACf2afvYsjph6P1VdVDAVKbRn0bbKj+vWYdbTvtPWV9nZyJFwkOg+hcUR91al7Ov8A4F2cdSXU+6Vmc+D/AGWQB94oDJFzkmZcpcknJeeW4T8ST/rV/ve0cyJtDYdwoQcdYkqcanI691hxSW3B/VIGD5HHnS2r6F7RabhzdjNPWS4xkvRJlrSH2lDkpLgKj+t1oD5/2u2TLzcI9ut8dyTLkrDTTTYypaicAAVdd3dthtbOstmkPh65PW9MqaUn3UOKWoBCfQAAZ8Tk1rLZzs72ja28XC8vPJuU9x1aITqk/wDLME8hz/PI5E/IdTWde1vOMveWa0DkRYcdoenu8R+9VAdXY9he1bvB8jIi259zPkSUp/aNbirHvYlg95q7UM4jkzAQ0D5FTgP7FbCoDJPbfncV30tAB/IjvvEf2lJA/VNL7srQfbd6rMojIjtSHj6YaUB95FWDtmzvaNz4MUHIi2xsY8ipaz+jFHYyge0bnzZRGRGtjhB8ipaB+jNAbXrL/bfn8Nr0tAB/LffeI/spSB+sa1BWPe23O7zV2nYIOQzAcdI8itwj9igEZofVB0Xq216jTERMVbng+lhaykLIBwCQDjnz6eFP/wDHhuX9DIf+dV+7Sz7OWh7RuBuS1ar7D9rt6Irz7jXGpGSAAOaSD1I8a1PM7M+1EWG++dMgBptSyfa3vAE/zvSgMO6qvzuqdS3S+PtpacuElySptJyEFSicA+OM4rVnZQ0w3O2velOt5LtzeKTjwCGx+kGsgyCgvu92OFHGeEeQzyrenZahexbK2Q8POQt94/N1QH3AUA0pUCNNaLchhp1J8FoCh99Z/wBeWIae1JJjNo4WFkOtY6BJ8B8DkfKtEGlvvJaEP2mNdE4Dkdfdq81JV/sR95qh1+zjVtnUit47mk4Yv5ULyNOT7Mtvf3CzhWtnWGmr3ouUtCDdWQqItXIIko5oPzIxSL201YnQF9vOldVsPIsl3bXbbsxj32FAkB0D+cgkn1GfSnE26thxLqFKQtBBSoHmCOhFcu422sPeCOLvZixD1i0gB+OshDdyAGAQegcwPn99QOHtTj0PRqjw1yLTirSJ9P0yksp8/LzEXr/be66DloU7wzbRK9+DdI/vR5TZ5gpUOQOOoPMVUKv9i13rDa56Xp2fDS9BKimVZLuwXGVHxPAeaT6pI+ddUi+bS3897M0xf9OyFfl/ZMtD7OfMIdAIHpxVrTDi2r1ZZckOpaabU44sgJQkElRPQADqavQjbSRllxdw1nMSDyZTGjsk+hUVqx9K6UbrwNNNqa0HpaFYnlAp+05KzLnAHxStQCWz/ZSPjQErbIw2Ssz92uXCnWtyjlm3wcgrtjKxhT7o/NcKSQlPUZJNT3Zu0u5bzctxrgkhmEhcS3cY/lpKxhSh5hKScnzV6VXNvdnb/uLLVqTUsh+3WIr72TcpZJdleYbCuayenF0Hr0pz3e5RFxolotEYQrLb0d1Fjjy8Vq81HqT61UavqULWk4p9prZF7oWk1L2um12Fu39CMIW+74qUo/Ekk1oDR2kYVgtUYLismYUAuuFIKio88ZPPl0+VKjbWyovOqmA9gtxgX1A+JBGB9SD8qfvhVRw3ZpxlcTWe5F3xdftShaQeEll/Q/aUW7XZy0zuhNVdvaHbReVABcplIWl4AYHGgkZIAAyCD8abtQNzuVsauiIEi8Qo8taCtEdx5IcKACSeEnOMAnPkD5Vf6hcVqFLp29Ppy8M4MTFJvDeDMjnYju/Ge71nbynwKoiwfpxGvxPYju/EOPWVuCfEiIsn9atEq1FppLDMg6otHcvrU0057UjhWsEAgHOCRkZHqPOvQ3vT6Vy21altYXC/5lJkoBY5494Z93ny5+PKqH11q3sT+JH16un+ooW2PZf0poC4MXedKdvl0YUFsuPJCGmVDoUoBOSPAkn0Apka40TY9wtPv2O/R+/iuELSUqwtpY6KSfAjJ+uOlczV3skibGgs6htrkqUgOsMpkJK3UkEhSQDkggEgjyNf1IuNoitsOyL9b2W33VMNKXISEuLCuEpBJ5kHkQPHlXnrvVvYn8SHV0/1Gfrp2IwZC1WvWaUMEngTJh8S0jwBKVAH44FcC+xHd8+5rO3H4xFj9o1ouTerPGmQ4arzDVImLUhptDqSVcPFxEjPIDhIJ8xiutl63vxlSGrvDcYQwmSpxLySkNEEhwkHASeE4PTkfKnrvVvYn8SHV0/1Ge7F2Jmm5KV33V/esA82oUbhUoeXEpRx9DWhNK6RsGg7Amw2BlmDGQCcFeVKWR+WonmT051wHUem/Z2JP4T2nuJC1NtOe1I4XFJxkA55kZGR6jzpGa77Ol+1ZrSbcJu4Vnjy5rw7qKorCkJIJQgDPP3UHw54Jq00y/vbmbVzQ6tJbb5yz8TjFLZ5Il/sYXV99x1Wt7TlxRUf4hXUnP8AOp0af2qXYdlJW3jd8iKlyI77Rm8GEAuKJzw5zgA46+FIUdmJ8yDGG6uny8GvaC33quLu8cXHji6Y558udesnssToLoalbnWJlZcDQS4tQJWUghOCrrhQOPIjzq6PmdP4lVz/AKb2n/Lq/erVGmYEfT2nLXZxKZcEGI1G4wQAvgQBkDPLOM1kD8XRjgUs7v6Z4Ur7skvnAVz5E8XXkeXpUqnslXhbiEJ3FtClOOlhKRxkqcAyUD3uagBkjrigNd+3RR/5lj/GP96znun2Yntw9bXPU7OsoEX25SClhxgq4AlASBkK5/k+VUhjsozJbEuSxuVYnmYWTJcQpSks4BJ4iFYTyB6+Roe7KMuMpaH9yrC0ptIWsLUpJSClSwTlXIFKSr4AnoKAc+wuzqdnUXhUvUEG5O3EtAFpPdhARxcjknOeL7qbYmxSOUlk/wB8GscTOy27bkIXM3N0/HSspSkurUkElIUAMq8QQR6EGrJprYBq3sS4bOv7JJkROJyYW3M9yAcEqHFyAxgk9DmvlVnKMcwWX4E3T7ehXq9C4qdCOOeM/Ise8HZxkboa3k6ka1dAgtutNNIYcYKygISB1Ch1OT08amth9jjs/dbpPl6ig3JU1hDKA02W+ABRJJyTnPL6VWv4DHTcG7d+GlrM11HeNx+I94tJGQQniyRgE58q53Nno7LkxtzX9kQuD/zSVO4LHMD3hxe7zIHPxOKi+k3H7XzRoPU2k+3L4H9zSntsb/1DP+MUid7Oz8/u1q1q+sarg29tqIiMGXGSs8lKJOQodeLyqLtuxMi8I47drG2zEcKV8TGVgAkgHkehKSB8DXCdpIykTCzryzyFwyEvtsL41oUTgJICs5JIAHUkgU9JuP2vmh6l0n25fA/uWfY/YD+CTU8u9ytTQrn30QxkNttFsoJUlROSo55Jx86cl6DV0s8+C1OZZckx3GUuEg8BUkgHGeeM5rPp2U4ZjsJWuLOmWyEl2OV4cb4lBI4k8WRkkDn4kDxr+JmzDduQ4uZryyx0NK4Vl1zhCTxFODlXI5BHxBHhT0m4/a+aHqXSfbl8D+5W/wAS2WemvLZ/lFfv1pfbrSf4DaIs+nDKTJMBjuy8hPCHCSSVAZOOZPjSctOwzkmdCJ1ZAksupEkNsklTrORlSefNJyBnpzFaDYYQwyhpGAlCQkAeAFSKFSpP88ce8ptUtLS3cVa1uszz2awevh5Un95b667cGLOgKS00kOrJ5BajyGPMAZ+Zpv4xVf1fpCHqyCWnQG5KASy8OqT5HzB8RUXVbepXt5U6Tw38/I90W7pWt3GrWWUvl5md+ePM1+tuLQQtJUhYOQQeYPmDU8jQ99dvC7UiE4X0HmvGEAeCuLpg1P3LZ69xI6XYjzMxYGVNj3SPQZ5H7qwFPTrqSbjB7HT6ur2UGozqLcrE68W/UkNEHV1kg6gYQnhQt9PC+2P6ro5iqrL2c2ouSitlzUtoUefdocbeQPhkZx86nJtul214sTYzrDg/NcSQfv61zfCpVHWby37DfLuaIdfh/T7r8SKxnvT/AMiBb2H2zYVxPal1HJSOfA3HbQT6ZOasVl01t1pFaXrLpIT5aeaZV4d78g+YRySD8q88Dxr+2GHZDiWmGluLUcBKAST8AK+k+ILyp2YvH8I+VPhfT6T6ck3jxe30O68X64310OTpCnAkYQhOAhA8gkchUd19avFh2nvNzAcmlNvZIyOMZWf7o6fM1w6j25vWn3CpLKpkYnCXWUkkeWR1H6PWolawvJR6+pFvP9k2hqenwn6NSmljuXL++REabu8iyXmNNjBSloWAUDqsHkR8xWkmV960hwgp4gDgjBGR40v9vNuk2lKLrdWwZh5ttEZDX/3+imH0rXaDZ1rei3VfPkvAwnE1/Qu7hdSvy7N+P/h/VLu87Yz7s5qLivMTu7s8l9vvIIW4yQG08BXxZKOFChgcJw4cmmJRV+ZoVS9jm5Nzaucu9LdfD4feaQ0UMPErKnEqbCsFJIaABJwGhnOTXqvZOLEYtrtruPBc4zxdelTW1SA8SFlRCCsBHvuKWAOWQMg4FNCigFK1sMiFKEiDqGVHX3ZZQooKu5ASltC2wVYDobDieIg83CccsV0af2cmacdQmNfoz8Rth5lDUm3pWUBbynQU+8Eg5KQTjnwDGKaVFAKdOxqw27E+3v8AhCEKbIjfxwcDHckqXxcxguKAAHvOEknHPtg7PGyaSvVgtd1CftKSkoXIaK0sREqBTGwCCUgcSc5HJRpl1X9c6rjaM0vNvMjjUWkcLLaE5W68o8KEJHiSogYoCp2zaWTb9YRtQO3dmRw8S32wy41xOLVlZSEuABJCW0hKgoANjqcmvDV+0jOoLjMuMvUnsU2Q8X4jwQAqO5/FpSRlXPDaFJH/ALij44r81zrHUWktOaZsDM5pzUl6/iV3OU2lDcYIRxvPKSPdyE5wOmR44pcMap083dNSWa22hjWdxQhMKFKlD2qZcJhB7xxRVlLbCMjmAAMHGaAYTuyUh+LIZVe4oQl5T0IJhnCQeBIS4ePK0hpAbAHDyJPU1Ix9qpaNQwbyu9NB5l9cmS6ywtt2QtagVIJ7wp7s8KAElJICBg551TNDbzae0boRVjXcF3OVp6EQ/OkLKI0h5KhxstOYJUUlxIHu4IxzxXfpjfhy2RYFu1owF3+4KD6IsEhbjDLqst96nCQ2AlSR+USeuKAnZ2yjF0RbhJu7h9kKlupQ2UJlLdf7yR3gBHElwAIwegHj0rxa2Wmt3CBcxqbikW91x5hpcNJZ4nAsuKI4gcqU4ckEe6APDNf0x2kduZF0kQG7s6tMUOrelBklhCEAZVxeIJIAwCSeXiM+k7ei2TINuEF12zSbk+Fxl3SKcOREJDjj/CFZCC3kBSsYJGRQHXB2oW1oaXpKVeFrjTXkl1LaFBDUcFOWGwpSlJSQCOajjiOBjlVXlbT6a04sRb1rBhKZruVpnrSHZIPdIIJKh1bbKOQwA4rA6CrZZN5NPam9sTaPaFpQ1xQ3nkBCJyiooHdjPEQVjGSkA88dDSTlRJ+p9HWe2ofS7qzWj7lxvM+UnnAhMOElBB5pQkpSABgEg+dANOybJSrJcbbLb1AJKIIcADrLiVKJKQk5Q4kEBttpGFAghGcc6519n/igTbenVMxLE1CQ84poLcVgZUjKiQG1OFThSBzJAzgUsNJXPXMu8oetN+uEdvVV1C4S5C+NZgxv5WSoHIQgjkAAAScDAABaDvaK0nYY6517vKXWZzrzttjxoiu9EdGUgryTkqWhXCeQII+NAWXS23k6wX9d3evDbpMRMbumGVtpfKUJSlxwKcUCpITgFITkE5zVdkbIz5sKKmXqCM5KYcClLTEWhLie8Lys8LgUVKcKVFQUP5MAAc6khv8AaKcuhtzEiW840wX5ToaAbhgIKylwkjBwMEJBwSAeZrxj7/acVpqzXaQzIE68NuOx7XHUl14NoUoKUo5CUgBJJJIxgjwNAWXSulbrYLzdJUi5RJUWcUKCEsLS6jgQlCUlalnIASo9MkqJzVbvmzL18DaV6icYQieq5qQ1GTh6QXuMKWSSSEoCUADGME554F6g6ltlwtLt1jykqist946oc+7HAFkHHLIBBOM1B7X3i+aksL1/vJ4GrnKXJt8bgCVMRDgNhRHVRA4jn+dQES3tRIfiphXO8tvsJuC53FHjFl9zLinAFOhXET3hQSQQMNgYHWop7YNMiEGF6jlodQjKJDaSHO9CFALUeLKvfdfUQTz7wDPLJbtFAL/Su1qtNarTqA3hT+Ii4SYgjpQ2y1lHdobIJISkI6EnJUTyJNMCiigCiiigDA64FFFFAcVxtUG6MFibFafbPgtINZ21NbkWm/z4TSOFDTyggZz7ucj7iK0oOlI7cJps6unZQk54fD+qKy/E1GHUxqY3zg2HB9eauJQztjOPeik+FPjbbT8e16biSFMNiVIT3q3CkcRB5gZ64xjlSbDLXegd2jGf5orRVtATb4wAwO6TyHwqDwzQjKrOcuaRZcYXM1Rp047JvJ14oIB6iiitsc9CiiigCiiigCiiigCiiigCoTUGlLbqaVaX7iHXPsqWJrDYVhCnAkgFQ8cZyPIgGpuigOSdbY1xbCZLDLpTktqcbCygkEZGRyODVU2t25jbeaQZsa0xH5ILvfymGu7U8FLURxHrkAgdfDlV2ooBSRezPoWHaZ0BLMpa5YSlMlaklyOAoKAQOHGSUjKiCVAYJNSD2wmkpF/Te1mYZC2PZ5QK0n2wEkkrJTkE5weEpBHu9OVMuigFC12YdCNRXIvBOLK4aoZR3gAJK1LDvIc1gq5Z5chy5Cu9/s/6Ynz4s+5zLrcH2YZgu9+8Al9rAASQEgJSMDATgHxzk5Z9FALvReyOntEXhi6xZVxmyI8VEVgS1pUllKeIApCUjBwoj5k9STUnedtbfe7xe7o/LktuXe0C0LDeAWW8qJUg+BPFzHTkKuNFALLUW28yNNtMyxMNSmYllesLsVb3cL7lYThxteFBKgU8wRzB9Kim+zPpB+AwJZnJmphMRVPJeStSeBYVkEpA8AnoBgdBk04qKAXFj2I0jp6+yrpDbkluSpLioi1Atd4BgLJxxKOfeAKiAeeM4IiB2ZtIIhoYZnXhpwR34q30vJ7x1pw5KSSkgAHyAzlWc5NN6igK43oi2M6P/BSM5JjQu67pTrDnA6rnkkqA6nnk+pFT7TSGGkNNgJQgBKQOgA5AV6UUAUUUUAUUUUB//9k=",
  "ECO-09": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCABoAVQDASIAAhEBAxEB/8QAHAABAAICAwEAAAAAAAAAAAAAAAYHBQgBAgQD/8QAURAAAQMDAQQECAoFCAgHAAAAAQIDBAAFEQYHEiExE0FRkxQVIlZhcZHRFhcjMkJUVYGhsTZzdMHTCCQzNFJTcrIYJkNikrPS8CUnNUR1w/H/xAAbAQEAAgMBAQAAAAAAAAAAAAAAAQIDBAUGB//EADERAAIBAgQDBgUEAwAAAAAAAAABAgMRBAUSMRZRoQYTIUFS0RQVMmHhIkNTcUKB8P/aAAwDAQACEQMRAD8A2ppSvPPnxbbCemTH22I7KCtxxZwEpHMmgPso5TwNQrUO023222TZlqQLiIbjbTr2SmOgqXuE7+DvhBxvbmcZFY3X9yn3yxW+86bmOPwI74VLjJQ4lRBICXFpThwhtQ3i3w3h6q4h7Jty8XJx2bH8UXDynWGo+HlhYy40FKz0TRXleEYVk8+FVbfkYpSk/CJFrrr7V2oxCNkkFmQ61KSqFBWjeDzDgO8Q4nfIU2QoNndJ7aykW3ahueoUXFiFeA/IuSJKZ7j62o5txRxZU0VeSrmN0pyFcc1Yjb9kt7ykxFQjMKUoIDiQ67ujAClE8TjtNY2ftCi2qQY822XFh0DOFJTxHaDniKjTzZCpN/UyubNonU9rtb8ZyzTRbfCorkqO1ICZMptIX0qQpC8LGSg73kqX10mTdW2FFrgh68W3flOrjRf6ZXQuOpS0je3VhSm05y2pQG6rIVlNT341LT9Um+xPvrs3tSs6lpC40xCc8VFIOPuBpZE9zyPvqHWy9PajhWhVtkTRNjLcYRFSVuqcStKSMcgnCslROBipOiUw4+qOl5svoSFra3hvpBzgkcwDg+w1jrexabpMTqCIEPvrY8HD4UThG9ndxyHHnwzVVXK06r0lq2ReHHHZaZ3gzj7jKy2mXKLq0NRUE8UNAFG9nqT15qW7Eyk47l19dc1HtI6glXtM9i4xWI063SfBnxHcLjRVupUN1RA6lAEcwRUhyKtcundXFKZpmhIpTNM0ApTNM0ApSlAKUyM4pQClM0zQClM0zQClM0zQClKZoBSmaZFAKUzTIoBSmaZoBSmRTNAKUzTNAKUzSgFKUoDjNVbtH1HJhahbtl6gqGmpDQbK1H5KQoneVlSfKDowEtoGCVHOeQqYa71A3pzT7kyRAlzYy1Bh4RlhBbQvKSsqJG6Bn52RjOaiez6FctRORZ8mTdVafhjpLexcktl11R4AqWlR6VCMEpUQDxB48DVW7+Bim7vQtzM7OtFI00y/cFBbL9wbbKo3R9GWUpyQF4Urfc8ryllRJxivZr7UZslq6BheJkoFKMHihP0lfuHpNSOVIahRnJD6whppBUonqAqkNQXp2/3V6a7kJUd1tGfmIHIe/wBNTayMkY2VjG4HPGeuplZZHwvs7ljmrCrhHSXYL6+JOPoE/wDfD1VDazOkIkyXqGEIR3XG3A4V4yEpHzifuOPvqEy7MQttTa1NqSUqSSkg8wRzBrrUt2kWTxbevDG0YYmjf9AWOY+/nUTowTDZtfPF92VAdc3WJfzc8g4OXtGR7KsKSLNqRmVapHgs9sAB9gkKAHVn7x+FUaCQcg4I7KuDQen/ABJZgt1BTKlYccBHzR9FP3D8SalENEf1VZr5ZoDdr0m3FsVijlD0qWy+hD68qO9u7/AboAUoqOVDgDUh0LrCJqy2FTcxiVLi7rclxlCkNuKI+e2FAEoVxweXA9le7Vem2NU2KTa31dH0oCm3AM9G4k5QrB4HCgDg8DyqrLRfJ+mNcxLUiysRN/o0PNNhT77iHXV53SnKWEBWXQ2eSSePVVdmYG3CX2LqJ6649dEnNYjWD70PS12kx3lsvNRHVocQcFKggkEemk5KMXJ+RsQjqko8zMbw7RTe9Naw/DrVXnDc++NPh1qrzhuffGvP8SUPQ+h6ZdlcQ/HXHr7Gzu8O0VzWsJ11qoj9Ibn3xrYywXIXWwwLgVf1iOh0k9WQM1v4DNKeLbjBNW5nNzLJ6uBUZTaafIyO8PRXO8D1itbLrr/Uj90mux75cGWVPLKG0OkJQneOAPRXk+HeqvOG598a0Zdo6CdtL6HRh2WxEknrXj/fsbO5HaKcD11rH8O9U+cNz741dOya5TbtpFuTcJb0t8vvJLjqt5WArgM1t4HN6eLn3cItGlmOSVcFTVSpJNN28Lk05VwFDqIrD6xuarNpi5T23C24ywooUOYURhP4kVr0Ndaq84bn3xq+PzSlg5KM03cpluT1cdFyg0kuZs9vemmR21rD8O9VecNz740+HeqfOG598a0OJKHofQ6XCmI9cevsbOgjtrmqn2M6qud4n3GDc7hImKDSHmy8veKQCQQPamrXI4V2cLio4mmqsNmcDG4SeEqujPdAKHXXO96aoHX2r9Q2/WF0ixL1PYYbdwhtt0hKRgcAKj/w71V5w3PvjXKq9oKNObhKL8HbyO1R7M16tONSM14q/n7Gz2fTXGQOutYvh3qnzhuffGnw61T5w3PvjWPiOj6H0MvCmI9cevsbOgg8uqmQRzqtNIXy6S9l9yuEi4SXpjXT7j615WnAGOPoqrRrrVWB/rDc++NbWIzmlRjCTi/1K5pYXIa2InOEZL9Lt5mzoIA5iud701rD8OtVecNz740+HeqvOG598a1eJKHofQ3eFMR649fY2dKgD1UCh2itbrNrbUz13gtOX+4rQuQ2lSS8SFAqAINe/WusNRQtW3aNFvdwYYbkFKG0O4SkYHACsvz6l3bqaXa9vIwvs1X71UtavZvz+32Ng97003vTWsPw71V5w3PvjT4d6q84bn3xrFxJQ9D6GbhTEeuPX2Nnt700yO2tYfh1qrzhuffGnw71T5xXPvjTiSh6H0HCmI9cevsbPZFK14tGstSPRlKcvtwWQsjJdPYKVkWf0Wr6H0MT7NV07a119iTa71M7ctaLslu8OVJjtqipRBlo6RxZQHFBxhz5NTOCkFZ45OBVk6Vs6dOadt1rUoAx2UpVx4BXMgdgBJwOQGBVZIj36/39rw/TxnQ3LiFx7gtpl9tDaZClbwWk76QG0pSAevNTjaPY4t3sDj8u4yLeIYU8l1tZCc45KA+dXXqzcISmlc81hKaqVdMna7ttclDq2HEKQ4ppSVDBSoggioDqfZ7HeKpNjcaS4eJilYwf8B6vVVGLlPuHy33l45byyf319bfcpNtnx50dwh+M4HGyT1ivPLtIr2dPqewfZSWm6q9PyS15h2O6pl5tbTqDuqQoYUD2Yq3NA6c8S2sSH0YlysLXkcUJ6k/v++vpAj2XWlvt18VGQ4ohLiVDmCOaFdoB6j2VIwa9NCSkk0eTmnFuL8GtyF67teoL3uxIcCO7DSQsOBxIcKscfnEY+6oO7ozUDXzrVIP+ABX5Vdm9WC1tfZunNNzbrb4KZr0dG8W1KwEp61HtA5kCrWKJleafsQgTvGOo0G3W6EOlWuWOjStX0UjPPtx6K+sn+UBbjqKLGiQ1G0dJuPzHvJUQfpJT1JB48eJHUKp7Ueq7xqyX4Vdpi3yDlDY4Nt/4U8h+dYj09dSDdJLiXWwtBCkKAIUDwIPXVV7WLI8xLROhyZUZib5dxQZYiRFoaSE5ddA3gtQKEJAOOBOOdddhmufGtuVpyc7mXCRvRlKOS4z2Z6ynl6sdlSraVFbcssWYX0tPQprLrCHI3hCHnFHo0oLeQVZ3+GCMHB6qrLYpUV4mQ0NKMvSdrWq4Rrg4iOltyRGc6RC1pGD5XWRX01shTmkbyhCStSoTwCUjiTuGsDspnQZVvubcaUqTJE1b0lwRvB2lqXyU0nJ+T8nAPM4JNSfUmUafuS0qUlSYrpCknBB3TxzVZx1wceZejPS4y5Gr/iyeePgMruVe6uPFc/6jK7lXuqa+M5+f69L79fvrlu4zluJSZ0wBRA4Pq7fXXmuG4/ydD2PFcv4+v4IV4sn/AFGV3SvdVz6KuciPsplFxl9L0JD7SUlBCj1pwOf0/wAKiEqXcYkl6O5Nl77S1IV8uvmDjtr3wdRymLHcoa5cguvLaLai4okAHysHORwxW5gsn+Fk5Kd7q2xz8wzz4yEYSp2s77/9uVv4suBAzBlE/qVe6ufFc/6jK7lXuqZm6TgCTOl8Bn+nX769E6RcoMt2M5Nl7zZwfl1dgPb6a0+G0/3Oh0OK5L9vr+CCeLJ/1GV3SvdV77G2nGNFtoeaW2rwl47qxg43qrvxnO+vS+/X76tbZy44/plDjrjjiy86N5aio/O7TW9l+ULCVO8Ur+FjmZpnbxtJUnC1nfcxe2WQ+nSJix2nHFSX0IUlCSo7oyo8vSBVFeLJ/wBRldyr3Vde1G5vsy4MVh91rCFOK6NZSTk4GceqoP4znfXpffr99Rj8oWLq9452/wBFsszt4Kj3UYX8b7/ghzVnuLpWEwZJ3EFZ+SVyHPHDnXXxZP8AqUrule6rZ0SJlwVdVrlSlhqEsJy6o+URw6+fCoyLlPAGZ0vOOPy6/fWlw3H19DoLtXP+Pr+Dz7L1TbTrWAtyLJQ0/vMLJbUB5Q4Z4duK2F+jVDR7xOjyG3vDZR6NYWQXlHIBBPX2VezLqX2EOpPkrSFD1EZrs5fgvhabp6r+Nzg5pj/jaqq6bO1jXXaNAmO62uy24khaFPcFJbJB8keio54rn/UZXdK91WbrKfMZ1NPbblyUIS5wSl1QA4DqzWFNznfXpffr99cqt2fVSpKevd32Ozh+00qVKNPu9klv+DH6D0QdU3hcGf4bDaSypwOIbwcggY8oY66n/wAQ1o+17j7G/wDprDab1ZIsU5Up8yZiVNlAQp844kceOak3xto+yF98PdW5hslw9OGma1PmaGLz3FVamunJxXI9zulGdKbP7raojz8oKZdWFOAbxJHLAA7KoEW2cUj+YyuX90r3VsvcpypukHp6QppT0LpQArinKc8/vqnBcp2B/PpfL+/X76jHZPDEaNL0qKsWy3PJ4TXqWpyd2yGC2TvqUruVe6rC0RsniamsSbhOl3CI+XFo6NKEgYBwD5Sc14PGc769L79fvqU6f2hqsttER+I9LWFqV0qn+JyeXHNYMNkFKnLVUer/AEbGM7SVq0NNJaXzTPZD2HWmHLYlIu1wUplxLgSpLeCQcjPk197zsatl6usq5O3Se05Jc6RSEBGEnA5ZGeqvZZtpKbvdI8AW1TReXub/AEud3h2Yqb44V0vlmF06dCscn5ri9WvvHcojXuy+NpS2MyrfJnzXXHQ2UKQkgDGc+SM1BPFc/wCpSu5V7qv/AGnPOxrNHUy840oyACULKTjB7KrPxnO+vS+/X765uJyClUnqg9K5WOvg+0tWlT0VI6nzbIWq2z0pJ8BknA62le6rgj7CrS8w24btcgVJCiMN8Mj/AA1El3OfuK/n0vkf9uvs9dX3GHyDZ7UD8qyYTI6NK/efquYsd2ir1tPdfotye5AIexa1w2y2m6T1Aq3skI/6fRSrEpW8sswq/wAEc15ri3+4ylNCS7YNbRrNazclrhuPuSX5k9xhLigVAhEUKxzV1gAgZHKvXtzvzyXIVjbJSytHhD3+/wAcJHq5msRddTXX42Y8GXcIN2RCnDdajxS0uGlRwElfRqUtW4riAUj04qYbY9KG72ZN2jIKpMAEqCRxW0eY9Y5+2sOZxnPCzVP/AJFcgqU4YuPe7J9fIouuK54cMHP76kOhdLK1VfG4zmUQ2h0spzkEoB5Z7TyrwlGlKpNQjuz6hXrxo03Vnsia7F9QSIExWn5qHENTEGVEK0kZ4ZVjPMEcfuNeaRc9sLV6n9HDmOQErk+D4aayRurDX3BQSfvq3kOWpvod1cMFlO60d5PkDGMA9XDhX2Nwhj/3bHeJr6Bg6HcUlSlO9j5bmc3jKzqxi433sUuZm2R+2OOBqazJjRz5PRNbz7nSgDHVncJPUOHbUz0S3q2ReZyNROy3baYbPRIkMtpQtah8oDjjwxyPbU7CgsBQII5jHKoRdtpLEHaBB0yhcREcNrVNkPLCejVukpSCTgHhxz2it1RObGlZ3uyj9pOjlaM1M9EQlXgT+Xoqj/YJ+b60nh7DUVrZTaLbtPa7sYiJv1oYmMLDkd9clBCDyIOFZwR+OKq53ZE2yjfXrfTIH60n99XMxEtJyp0TU1qetu94WJLYbCeZyoAj0gjOa2T2nOR2dE3FUqK1Ja8gEOqUlDRKwA4pSfKAQfKJHHhVd7PLXp20X5iFYpQv18WN56d0ZEeE0PnFOeajyHpI5ddjbQ03N2wIYtJ3nnJLYcaEhLC3m85UhK1cMnAz2jNQ9is/pZidlC2GjeLdGbtDzcNxlsTrUD0L/wAmMJOVK8pIxnBxxHXmpdqb9HLp+yO/5DWC2aWy/Wm0SY9+DKXBIJZS0022kJ3RvYSgABO/vbueOMZrL6xlKhaTvMlLbbimYL7gQ4CUqwgnBwQceoii2Ip/Sij67sf0zZ7FD86jXxhS/sWx909/FrvH2gS1yWk+JbJxWkcGnu39bUWMtyf68heBaomADCXil5PqUOJ9oNR+pbttukmwPWuczb7fJRIStla5KHFEKTggDdWnHAmqw+MKX9i2Punv4tLC5LLXEVOuUWKkZLryEY7ePH99e/WAxqe4gDgHiPwFeTZTqKTqPWLDDlqtTLTDS31rZbdC0kDAwS4RzI5jlWO1/raTbtZ3aIm1Wl1LT5AW626VK5cThwDPqAqbC53q3dmn6LN/rnf81UB8YUv7FsfdPfxavHZHeV3XRKJrrEWNh98FMcKCMJVz8pSj+NEiGyJ7QJfheqZYB4MhLQ+4ZP51HKwlw2lypk+TIFosyw66pYUtp7eIJOM4dAzjFfD4wpf2LY+6e/i0sLl3bKog8VzpChkOvBv7kjl+NV1OjqiTZEdXzmnFIP3GoyjaRcGxhFpsyRnOEtvj/wC6uh2hzCSTZrGSeZ6J7+LSwuSKrq0TN8O0vBcJyptHRK9aTj91a5/GFL+xbH3T38Wrb2JauXqCDc4j0aJGXFcQ4lMdKkpKVgjPlKVxyk9fWKJBswWtv0quP6z9wrB02ia0k23Wl1iJtVpeS06AHHm3SpXAc8OAewVHfjCl/Ytj7p7+LUWJuTGz2SZfZSosJCFOJSVkLVujA/8A2s18Wuov7iN3491eDYxqt+96qejOW+2x0iIte/HQ4FHyk8PKWodfZV3YqbEXI/NjOQtDrivBIcZgBtYByAQgA1S/Z6qu/WMkw9L3SQlDay3GcUEOAlKsDkcEHHqNa2jaFLwP/BbHy/unv4tGgmSOs5adG3e9whMhNsqaKlJBU5unIPGoD8YUv7FsfdPfxavHZJePG2jGpTzUSKoyHU9GxlKRhXYpRP41Fhcxem9CXu23yHMfaYDLLm8rddCiBjqqza6dM0P9oj/iFchW8MgjBqxBC9qn/okb9oH5GqtqxNtV6csenYj7cWJJKpQRuyUqUkeSeI3VJOfvqmfjCl/Ytj7p7+LUWJuSFfzFeo/lWwsb+rtf4B+VarubQ5YbWfEti4JPNp7s/W1tNDWVxWVEAZbScDq4USDZ9qUpUkFU7XpesoFytx0y3MRHcSStcJoKUt3IwFnHLHIHgasi3CTJtEUXNtvwpyOgSUDinfKfKHqzmvJqy5XG0adnT7VDTMmMNFaGVE4VjnwHE4GTgc8YqB6O1upvUqmbrqN2dGuLbaGHJEUxWzK3iC2wggHc3cZJ68ccnAh22ZRzUWkV7r7Sq9LakehtoUYz56WMQOaSfm+sHh7KyupVjRmmo2mI6v5/OSmVcnEniAfmtZ7P++ura1xpdGo4cR5DQXKgyEPtZ+kAobyfvA9oFUptPK1a6uvSb2d9ON7+zuDH4V47MMH8HrqQX1Oy+ye57zLMd8e6VKp/im392rW9/wCyMFSifnK4+k11UpW6rylcu2lFfNVx6jXn1J33PU6Y8jY2dqaPpHZ7Guz+FKahMpabJ/pHCgBKfbx9QNavzpb9ylvy5ay6++tTjilfSUTk1ee0/TMy+bN7RNhrWo2yM2+5HHJxBbSFK9aQM+rNUNy519OpfRH+j5DV+t/2ddxH9hPsFc7iR9FPsrmpXsz0irWGqo8VxCjCjkPySBw3AeCc/wC8cD1ZrIYy49iej/g9prxnJb3Ztzw6QocUNfQT6M/OPrHZXm2t7O77rWbbpFqkMhthtTa2nXCgIJOd8dvZ28BU/vDcpy2SIlsmNQZzjKkxnVICg2oDgd08wOFQXZ+vVl9uL51TNa6SzSOjMUMdG4XS2PlN5BCVNneVjKTnGeBqGyrl42J/aIjsC2xIjzxedYZQ2tw81kAAmsdrz9CNQf8Ax0j/AJaqzaedfKdDYuEN6HKbDseQ2ppxs8lJUMEfeKksaY4Oa+sUHwpn9Yn8xW0Q2T6K834vtV765Tsp0UhQUmwRgpJyDlXA+2gMPtztfh+hFyUoBXBebez2JPkq/Otb8Y4YNbl3C2xbrBegzWEPxnk7jjSuSh2VG/im0V5vxfar30BX38nW17z95uikkbiG4yD25JUr8k1Adpw/1/vn7SfyFbNWLTlq01Gci2iE1DZcWXFJRnirAGfYBWMuGzfSd2nPTptljvyXlbzjiirKj7aA1Qx6KvHRFz8UbCrnMzhSfC0IPYpa91P4qFTb4p9Feb8X2q99ZJOi7AixKsKba0LYpfSKjgndKs72efbxoDUYD0Uweytpxsn0T5vxvvKvfQ7J9Feb8b2q99ARTYzoyyXHRSJl0s9vmvPyHFJckR0rUEjAAyRyyD7arLaxaI9k13cYsKM1Gi4acaaaQEpSC2nOAOA45rZu02mFY7e1b7dHRGis53Gkck5JJ/EmsVetB6a1DO8OutpYlSCkI6Rec4HIcD6aA1KwasbYTdDA1v4IokJnRnGsHlvJ8sfgkj76uH4p9Feb8b2q99em3bN9KWmczOg2ZhiSwrebcSVZSfbQGve1Uf8AmDe/14/yCong1thctnOlLxOdnz7NHflPHeccUVZUceuvN8U+ifN+L7Ve+gKl/k//AKaSP2Jf+ZNbEVgbHobTum5apdptbMV9SC2VoJyUnjjifQKz1AYHXn6G3n9kc/KtSADuj1VudOhMXGI7ElNh1h5BQ4g8lJPMVGBsm0Tjhp+L7Ve+gNWMGuwW4kYStYHYFEVtL8U+ivN+L7Ve+nxT6K834vtV76A1ZW47uK+Uc5H6RrcDS3HTVpzz8DY/5aawp2TaJIIOnovH0q99SiNGaiR2ozCAhppAbQkckpAwB7KArH+UL+isL9tH+U1r9g1uFfNOWrUsZEW7Qm5bKF9IlCycBWOfCsJ8U+ivN+L7Ve+gNVnAeiXw+ifyrdCB/UmP1afyFRdWybRJBB09FwRjmr31LW0BtAQkYSkAAeigO1KUoDjGapvWmlEWi+yZkllVzfvckR4S33iEnfTxYfWeCGkFIW2UkKzwHbVy4ry3C2xbpGVGnRmpDCiklt1IUkkHIOPQQDUNXKThqVjwxJbdmh2y33m7R3Lg+kMIcXutGU6Bk7qfu5Vg9W7MbXq+4JnvPyIkgICFrZ3flAOWQQeI7ajeuNMSnNSTr/qEOy7JHjbzfQJStDTCcb7SmyQoLUSFh1ByN3qwK+Wmdo1+t9mXMucdu9MC4otraYa0h7pMHeDQAw8nG4UnOcFWTkVgrUadaOiqroyUMZUw9TXTdnzPZ8Qtq+2J/wDwo91cK2C2ogjxxcOIx81Huqd2vVNpuqHyzMbQuMpDchp07imFqGQheeAVx5Z51lQoEcDnPZWqspwfoR0/nmNf7r6HmhQkQbexCBLjbLSWsq5qASE8fXitddd7OhYtcwoDO8za7vJbTHcSM9FvrCVJ9JTnh6COytlKwlwuunHoCLtcZEHwKI+dyRJwEtupUU5SVdYUCOHZXRSSVkctu7uyuf8ARzt4P6QSvV0CffUstlo0zsf069IdedQwtxAkS3EFa3FE7qchI4AZ7OHGvHqTavBitpYsK4k2c7IEVtDrwSCpTYcbUkDitC8hII4ZUKgVka1JrCVckFTt0anRdx1Tk0tqUh1WWn0tkbiehKd0pSQd5KudVcuRhlVWy3Jtebdd7leHtSaVTbruJ8JMWJNMhKVW1Y3gVoyCFIIVlQHlZFTu021u1xuhbQlKlqLrpSThbiuKlce054VitGaLt+jrehmJHbbkuNo8LdQpRD7gHFZyeZJJzzP3VI6si8V5s4HOuaUqS4pSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUAoRSlAdVIC0lKgCCMEHkajt40VFmMxTblItr8BL3gfQtJDLLrid3pOjGAVAZx2EmlKhohpPcr1/ZpdtOpVDahu6itC58WU63loPPIbQ4VBYUUpVlZRxJ48axy7HqezR24TsW/Imtw2hZUW9xamIzqnVKcQ4oHd8lJSny+G6CBSlQ4owSgo7E81BYy5rqwzym5ONLQ8uQluQ90CHGkpU2ooB3RxyOXlZ66hml9H638GirfhMNBMoXuMmW7vIbfJV0jTgI3kbyV5GAd1STSlRa5bu02TSHs1bnrVP1AYq5kqIIslmI2ENpCXeka6NXzklA8nIxnGeyplDgRre10USO0w2VqWUtpCQVKOSeHWSSaUq1kZFFLY9FKUqSwpSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAf//Z",
  "ECO-11": "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",
  "EDU-05": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFUAVQDASIAAhEBAxEB/8QAHQABAAEFAQEBAAAAAAAAAAAAAAcCBAUGCAEDCf/EAFYQAAEDAwEEBAcLBwcJCQEAAAEAAgMEBREGBxIhMQgTQVEUGCJhcYGRFRYjMkJSgpKUodIkVFZyscHRFyVDU1VikzNERWN0laKy8DU2ZHWDhIWz4fH/xAAcAQEAAQUBAQAAAAAAAAAAAAAABQEDBAYHAgj/xAA1EQEAAgECAwUGBAYDAQAAAAAAAQIDBBEFITEGEhNB0RQiUWFxkRZTgcEyQ1KhsfAHJOHx/9oADAMBAAIRAxEAPwDqdERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMIg9REQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEVL3tY0ucQAOZKxk9/gY4tiY6TzjgFga7iml0Md7U3iu/+9Or3THa/wDDDKosH74nfm4+t/8Aie+J35uPrKGjtlwn83+0+i97Jl+DOIsMNRN7ad31l6NRM7ad/wBYK5Ha7hM/zo+0+insuX4Mwit6KrFZF1gY5oJwN7tVwp/BnpmpGTHO8T0WJiYn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U36/0tX6m1ZobZzbql8Qt1ih8Nmc/wAmAP8AKlkeeHINHPmSB2rBeK9tM/s63fb2fwXviw7TTn8gt/Hgf5wbxQSRT1+ktX0V/wBFaY1XT1dsOn3Ulss7KKaMxyQnfMxkcA17nP4kjmMefOp3fTOotebJNC0eg4zXUFJA9l0oqaobG+OsJGXStJGeO/xPLOe0LBjowbTAci324HzV7FXF0ZtqMBcYaOiiLxuuMdya3eHcccwgz2g4Ztnlj2i3XWA92ZaGnpbIYI7iXda2TnE2UEloAe3IHEYPLBVxP7gXjZNZ7dpvTnvfj1bqWnpHUxq3VBkjid5Ty5w4DycY5fetVHRf2mAYFut2OePD2L3xYNpox/N9v4cvy9qqJKrrtaRqPa9qS51tVRW6mp6bTkU1E0SSxgt3X9W3OCd4j/rKtqG2UNtuezzQFlfW3WzV1e3UrrvWPa4Ttja53VsA+Ju4bvA45jvKj7xYNph4e59u+3sQdGDaaMYt9vGOX84NQZjbBp253Oe418uze52ee43JkIu8l4dLHIZJAxvwAOBvjHDsypErrjp3W20OXZddDFGywSUNVZ6hoAJkhYx00JPDm37s9wUR+LBtNP8Ao+3/AO8Gp4sG03Ofc+357/D2IN2o59TakumtZ49E++7SmobvJHIymuDYKiIwHq2uzvDDcMGM8OHPB43ujNFUGldY69dpiCr1BDb7NDRQUJrAZBNOS59O2UcAWho4j4u93qP4ejNtRpy4w0dFEXjdd1dya3eHcccwqB0X9pjeAt1uHor2BBr21KyS2Ktt8L9F1ukxJE9wgqbm6tM+CBvgk+TjljtypL6HX/eTUn+xQf8A2OWq+K/tMJ42+3euvap42BbGqvZfRV9Zd6mCa63DcY9lOS6OCNuSGhxA3iSSScY4AedUEtoiKoIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiDzITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrIRUogIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIg//2Q==",
  "SEG-02": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFUAVQDASIAAhEBAxEB/8QAHQABAAAHAQEAAAAAAAAAAAAAAAECBAUGBwgDCf/EAFEQAAEDAwEEAwsIBwUGBQUAAAEAAgMEBREGBxIhMRNBUQgUFRgiYXGBkZShFzJCUlXR0tMjU1RWk7HBFmJjcqQzorLC4fAkNGVzgiU2dYWV/8QAHAEBAAEFAQEAAAAAAAAAAAAAAAUCAwQGBwEI/8QAPREAAgECAgUHCgYCAgMAAAAAAAECAwQFEQYSITFRExRBYYGR0RUXIjJSU3GhsdIHI5LB4fAzQhY1JHLx/9oADAMBAAIRAxEAPwDqlERAEREAREQBERAEVu1FLd4LJWS2Gnp6m6NiJpoqh27G9/UCcj+YXOWrNqm0y33OqtNzuEdpqYSBJDSwRt3Q4Ag753+GCDkHt7EB09lFoDW2yfWVFpqe91OtK+9VFLH009KZJWNDAMuMZ3+JAycFoyB1FVPc96yu1Zd6zTtdWz1tJ3qaqB07zI6Etc1paHHjukPBwTwI4c0BvZERAEREBhm03aVRbPLWx5jFXc6kEUtLnAOOb3kcQ0ZHLiSQBz4YZS7Ndd68pW3DV+r621icb7LZRM3BC08g4AgA+Y7xHW7KxKauGstv1OasiSmhufe0TDxAZTteQPQZGF3rXSY5IDmvW+zLU2zKmF6tOo6+poWva2WWGWSGWAuOAXAOLXNJIGeokZGOK3Jsju1ffNntpr7nUyVVXI2Vsk0mN5+7K9ozgDjgBZLdbXRXy3VFtuNO2ppKlhjlifnD2nq4KSy2W36etkFrtdM2lo4ARHE0khuSSeJJJ4kn1oCuREQBeVXA6ppZoGTPhdIxzBIz5zCRjI845r1RAcpa2r9Y6B1FVWNmtb3W97xRvZMamRu+HtyA5pcQDkdSzHV2ntqui7NJeI9b1VypIGB9QGYbJE3rduuDt5o6yDkDjhYjtvPT7TL01rsFrKeMHsPQtP8AMradr21aQ1RYBatQPqaCorYe9KmIwPcwl43DuyNBGDngTgjPFAVXc+1tdX6JqZq+tqqyXwjM1slRK6RwAazhkknGcn1lbNVk0fpG26JszbTaun73Ej5SZ5N95c48clXtAEREATKLRu1LaNqew7S6W3aeqHyCKCNvePR9IyolkJwC0YJPAYwQgN5ItKXHbbrDSFRTU+q9G00L6mMyRiGr3S5oIB4eXg8eRKuVJ3Rlh6OJ1zst7oDM3fjcYWyMkb2tOQXDzgIDbKLHdDa3odfWmW52+mq6eGOd1OW1LWtcXAA5GCeGHBZEgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAubu6LtQg1pTVTQWtr7eAT2uY5zT8HtXSK0d3VLobXp2zX+Zkjo6WqfTP6NuTiRmR6sxj2oCtg286bGimxV0debmKMQSU5gO7JJubpxJ83dJ6yc46s8F77ANn1Xpy2y366wvgrK6FkMMLwQ+KAccuHUXnBx1ANzxyFQdzXQ6Y1NoeDUEdkojcYKyeF1TLE10oIfvNOTnB3XN5LdiAIiIAhREBxPrDW8+y7bRVxVNtkPg+799h4fxkhe/f4DHWx5HPmuzLTdqG+2yludtqY6mjqo2zQzRnLXsIyCFq/brsCodrVNFcKKojt+oKWPo4qh7cxzszkRyY44BJw4cRk8CFozSWje6N2ZTvtGnaKtbSueSIxJBPSkn6Q3zhufUe1AZnt40sdldki1FS6iutcKuu6A0lTVOa7Lw5+WuaRwGOII5Ece3K+5egmvenajWE9dWl1W99GykkndJHG1jgd7yjxcT6MBY/X9zlrTaRbJrrtL1nUT3lkL+8aKjawwUzsZAdwDTkgA7oH+YrOO5h09d9MbLILfe7bVW6sFZUPMFTGWPDS4YOD1HCA2yiIgCHkUVo1dVX2i07W1GmbfT3G8MYDTUtRJ0ccjt4ZBdkY4ZPMckBybtU1PDPt5uWnpKR8vfNzpKYv3hjDmwtIxjsyF1H8neiqV7av+zNlidA7pRIKVjdwt472cdWMrky67KNs1ZtJbru4aJbU1fhCO4Ogp6uERksc0hg8skDDQOsrM9rG0fbdedK11CNnlVp23SxFtZUwONRL0R4OaHD5oIOCQM46wgN/bP8AaNYtpdqqLpp91S+kp6h1M580Jj3ngAndzzGHDisoWte500w/SuyGw000LoampjdWzNe3dIdK4uGR1EN3R6lspAEREAWKt2cWhmu3az6WqdXmMs6JzgYmnd3d4DGQd3I544lZUiA5l7oO4d868dC05FDQsbjsLiXH+QW0dUaFkumxymsdJRCpuFHQwGmZkBwlY1ud0ngCfKHnytI6vuFJqnbDcLayrhdPUXWKjEW+N7GWM5ejK63A4YQGFbHtPVWmtCUdJX0z6WsfJNNNE/G8wukOAcf3Q1ZqiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiALQ3dWXuev0w3Q1u03ebtcrl0VVFNSUxkihDJOOSMne4EYxydnK3yiA5T7nWzbZtBzttjdHtZp+trI5qt1ycIZIBwa97BvB2d0DgWniAurE4KDntaCXEADrPBeZgiittVqay0P/mLpRxkdRlBPsCtc+0jTMPK4GU/4cTz/RY1S9t6fr1Eu1Hqi2ZMix+y65s19qnU1LNIJGgH9KzcDuPVlZArtGtTrR16bzXUGst4QgdnwRco92TqO9WXUmnorZeLjQRyUUrnspql8QcRJwJDSMlXTw6uz/3hOC+ZY19q9owNVX4DzXCb8SmG0PWTTkat1ACP/UZvxID6ZZTK+Z42ka1by1fqH/8AozfiXo3afrpgw3WWogP/AMjL+JAfSxF81htV163GNaaiGP8A1CX8SnG1vaC3lrXUQ/8A2Ev3oD6TYHYmB2L5uDa/tDHLW+ovf5PvXaXc7ajuepdn9LVXWtnragMjzLM7ecct45J58QgNooipKi7W+jl6GprqWCTG9uSSta7HbglG8j1RcnkkVaKnjuNHMMxVUEg/uyA/1XuHA8kzDTW8isU2jbRrTs0s0d0vEVdJDLIYmd6U5lIduk+VjkOHMrK8hCA4YPEIeHz72X6rtMu3m3am1BVsoqCW4zVT5pj5MTnNeY949Q3i3j1L6AU88VVBHPBKyWKRoeyRhBa9pGQQRzBCsl30BpK/B3hTTNmrS7m6ejjc724yr3S00NFTRU1PG2KGFgjjjYMBjQMAAdgAQHoiIgCIiAIiIAiIgCIiAIiIAiIgCIiAKkuF1obVG2Suqoqdrjhpe7G8fN2qrWvNqJc+qoIvotje71kgf0Ubi987K1lcRWbWXzeRXTjrSyL1WbSLDTZEUk9Sf8KI49rsKw1u1ec5FFa2t7HTyZ+A+9YV0CdAue19LL6psi1H4LxzMtUIou1br7UdZkCtFO09UEYb8eJ+KsdVV1lc4uq6qpqCf1khd/Ne3QJ0CiK2JXFb/JNvtLihFbkUAhA5Nx6FHoR2FV3QJ0CxeVKhZXOprlC9hLfKC31E7fja7tAK0TBH0c8Tv74W8qE71FAe2Nv8l07RKpr2Pwk/2MGuvSPZce921IDrDTsfW23Pd7ZT9y7CXGHdqVIk2j2iAH/ZWhhI85mk+5bOWTnxEV/0XpB+trwy0wXi0WyqlwITcpnRMld9UODSA7sBxnq4oCwLMdabOK3R2mNJXyp39zUNE+pw4cI3B5w31xujd6ytmUXcaa+NbAKyvsDaYyNEzo6mQuDMjeIHR8TjOF0Ftz2Pv2kbP6Ww2QUlNW22aKSi6dxbG1jW7jmEgEgbh7ObQgOAEW6b13KOs9OW2e53i96UoKKAb0k89bI1rR/D4nsA4nqWmZ42xTPjZK2ZrXECRoIDx2jIBwfOAgJF3Z3K4xs5h/yRf8JXCa717mKAw7N6XI5tj/4B96A26uUNvVUavX8z3AHdhbGMjqDnLq9cibaJOk1zUn+4P+Jyj8T/AMHabjoL/wBov/VmERzSRHMb3MPa0kK5Ueqr9byDSXq5QEcujqXj+qtWUWupyW5nZ50aVRZTin8UZvb9s+urcRuagqJmj6NQxko+Iz8VlVq7pXUlMWi4W631ress3onfDIWnkV6F3WhukyLuNHcMr+vQj2LL6ZHTFm7pPTVaWsuVFXW555u3RKwetvH4LYVh1pp/UzN603akqj1sbIA8elp4ribeXpFM+GRskT3RyN4hzThw9YWXTxaovXWZrd7+H1nUWdtNwfXtXj8zvAEHkUXJ2lNt+q9NObFNVeFKUYBiquLgPM/n7croXZ/tDt+vbb3zTRSU8zCWyQyYyCOeCOY4qWt72nX2R38Dn+M6NXmFrXrJOG7WW7xRliIiyzXwiIgCIiAIiIAiIgCIiAIiIAsB2kxF1ZQv6ujePiFnyxHX9OHw0cuPmvc32gH+i17SmLlhlXLoyfzRdoeujX3QlOhKruiHYnRDsK45yhIFD0JToSq7oh2FOiHYU5QFD0JToSq7oh2FOiHYU5QFvdGWujP+I1bqt/8A5Gn/APab/ILUE8eHwADnKP6rcVK3cpom9jGj4Lq+hn/X58ZP9jBuPXPRcNd19V987X5I8573t9NF6M7z/wDmXcp5L5+d0vX+ENtmpX5y2KSGAf8AwhYD8crbSwawREQHX/cf651hqamutqu9Wa6zWqKIQTT5dNG9xOIw/wCk0Na44OSOGDjgukRIxxc1r2ktOHAHi04zx9RyuD9J7c37MtmbdN6QhDb5cJZKqvucrMinJ8lrImn5zgxo8o8AScA81iWi9r2sNDajlv1uu881RUv36yOqeZY6z/3ATxP97gR1FAXbbtrnWGptcXO2anqyG2qrlghooctghDXEBzW9ZIwd45Jz2cFrZZ5tj1raNoup4tVW6lkoauupoxcKR3ER1DBu5a76TXNDePA5ByO3A0AX0M2B0feezqibjGcD2NaF8+aOE1FXBCOckjWe0gL6Q7LqTvPRFuZjG80u+JQGVOO60nsGVxxtWm6bWdW7PJrR/NdhVz+io53/AFY3H4LizX9R3xqy4O7HhvwCjsTf5PabpoJHPEnLhF/VFgyU3lLlMrXzsesT5UcqRRyvMipMnRSgqbK8aK1ImBW7u5wbIa+c5O4C7h6lo8Lobub6LdoqioI5g/EqTwmP5jfUaF+IVbKxp0+Mvon4m70RFsByAIiIAiIgCIiAIiIAiIgCIiAKy6up+ntBdjjHI139P6q9KlukHfFvqIutzDj081gYrQ5ezq0uMX9CqDykma36A9idAewKs6EHjxUehHnXz1yhLZFF0B7AnQHsCrehHnToR505QZFF0B7AnQHsCrehHnUOhHnTlBkWuWLeuFBF9aUn4f8AVbaAwAOxazooRNqyghHEMbvH1n/otmLuGiVLUwul15vvbI24fpsHkvmrtRugvW0fU9wa4OZPdKlzCOtvSEN+AC+hut7+zTembhcS4NfFA8x/5g0nPqwSvmbNI6aV8rzlzyXE+c8VPxqxlN01vWXz/wDhay2ZkiIiungREQBERAXrRdJ39qq1QYzmpY4+gHP9F9JdL0veWnbdB9SnZ/LP9V8/diNqN12g0MYbncBd6yQ3/mX0TiYIo2xt5NAaPUgLfqWfvexVsmcYiI9vBcT6hn75vlfLnO9O7+eF2BtMrhQ6UqXk43uHwJXF08pmmkkJ4vcXe0qJxV+jGJ0DQCn+fWq8El3v+CKKTeKiHKEyOoqRMmVDOVFCpMiohylTKFaZ6ArqfYJQd66V6QjBcGj+q5ZgYZJWMH0nBvxXZOzChFDpKlbjBdx+GFNYTHZKRzD8Q7jOpRo8E335L9jLERFLnOAiIgCIiAIiIAiIgCIiAIiIAoO5KKIwYJVQmCpli+o8heWCrrqCn6K4ueOUjQ718lbcL51xi25re1aHCT7uj5ExTlrRTJMFMFT4TCjsyskwVDBXphQOBxPIcSi2vJAk0nF31q2pmxlsDdz2D7ys/kkbExz3uDWtGSScABYPoCSKClrbnUPaxsrycnrySU1BfpLnmGLejph9Hrf5z9y7nc4rb4JY06U3nNRSUelvL5LrIqNN1JNowDugNWF+h77UMcWwNpzTQDtMjgze9JyfUuJl0x3TF1700hQ25rgHVtYHOHa2NpP83NXM6q0VqVK9rK6rPOVSTfds/YV8lLVXQAMnATrUWPdG8PY4tc05BBwQV053PG3673i/W3ROpLZHejVu6Knr2xt6eLDSf0nDD2gAku+cMfSWzFkx3Umxnwb3M1m1MKbF0jqvCdSd3yu9p8MaO3ADYnebLloTmcDiV9T3Rxvi6NzGuYRjcI4Y7MLi7bt3Qd7ud2uek7Fbxp6hpJpKSpfuNFVOWktcC4fMbw5N4kczxwgNAoiIDfPck2Pv/WT6xzctic0Z/wAoLj/yrtlc3dx7p7vaxz3N7MGQFwOPrOwPg1dIoDVHdB3jvHTPQB2HPaT7eAXK5ct190lfhPdIbex2Q12CM9TR95WkMqDxOWdRR4HVNB6HJ2c6r/2fyX9Z6AplSZUcqNyN2UyfOFMHdqkBUVS0VpnoikBwpua8LqkXTTVKa2+UcAGcyA+xdr6epe87JRQ4xuxDPr4rkvZHazc9XQADIZj2krsNjQxjWjk0YC2PDoatFdZxfTK55bE5pbopL9/qyKIizjVQiIgCIiAIiIAiIgCIiAIiIAiIgLNqWDegjmA4sdun0FY9hZjcYO+aOWPGSW5HpHJYjgdi43p/Z8lfRrrdNfNbPpkSNpLOOXAkwmFPgJgLRMzKJMK26jrDbrJWVAxvhm63zudwH81dcBYtrqbfZQW9nOebpHD+60cPifgsuxjrV49Tz7tpTPce2nRK63sMrs8OA6h6Aq6VvNTW+AQUrGAcgp5Wg+YHhlXri4nXryqTebbPFFJZHK/dOXgVesaG1sdltBSAu8z5DvH/AHQ1acWRbRL9/abW96urXb0c9U/oj/htO6z/AHWhY6u+4Ta81sqVF70ln8d7+ZFVJa0mws/2QbRaHZbc7hqM283G7tpjTW+F53Yo3PPlyPI48GjAA4nePEc1gCKRKDZlB3Rm0ai1c/Urr7JUSyYbJRyjNK6MHIYIxwaBngRh3n5qy7V9YWzX2rH6nt9DJb5rhDG+tpXHebHUAbrix3W1wDTxAOSVhqIApoonTSsiYMve4NaO0ngpVk+zazuves7dThm+1knSuH+Xl8cIDujYVp9tg0FSRhu6ZMesNAaP5FZ7W1TKKkmqHnDY2Fx9Sp7Hb22qz0dC0Y6CJrD6ccfjlYftk1VFpzSs+XgPe0nGeoch6yvG8trKoxcmox3s5h2mXw3zV9ZLvbzYj0YPn5n+ixXKg+WSd75pDmSRxe4+cnKhvFa1Wnrzcjt2F26tbWnQXQvn0k4OFEO7VJvKKtEipHoCpgV5A4UwKpaLsZHopgSFICphz4LzVzeSLrqKMXJ7kbv7nGzme5SVzm8GkkH0Lo9au2CWPwbpnp3Nw6QAZ+J/otora6cNSKiug+fb24dxcTrv/Zt97CIirMYIiIAiIgCIiAIiIAiIgCIiAIiIAeRWJVtN3vVSR9QPD0dSy1WO/wBPuyxzjk4bp9I5LStO7HnGHcrFbabz7Hsf7PsMm1nlPLiWfc85Tc85U2EwuJZkmS7nnKwmrd4V1lKAd6Oka2BvpHF3xPwWZVtUygo56uQ+RCwyHz4HJYjoyke9klZNxkmcXuPaSclSVl6FOdZ/BdpbntaRkwZutA7FiW1XUX9ldn96ujX7szacwwn/ABJPIb7N7PqWYOGFzx3V+qAyC0aXhf5Tya+oAPUMsjB/3z7FI6N2XPcRpUmtmeb+C2vwKa0tWDZzieaIqm222svFbFQ2+lmq6qZ27HDC0ue89gA5nzLv5ElMovY5ji1zS1w4EEYIWyNEbDdaXvV9ot110nfKG3z1UbaqoqKKSNkcQOXkuIAHkgj04WYd0RsY1JHtOuFdprTN0uFuuLGVYdQ0j5GRSEYew7o4HeaXY7HBAaGRXG+acvOmaptJe7XWWypc0PENXEY37p5HdPHCtyALfncnaS8K6odcpY8xxvABI6meUfjuhaDAycAZXdPcw6P/ALPaNbVSx7ssjQzOOv5zvicepAbmmlZTwvlkcGsYC5xPUFyVt51w7UV7NvhfmGN2XAH2D+q29tq2lQ2C2SUFJIHTv8kgHm7s9AXKFXUyVdVJNK8ve4lznHrJWBe19Vai3s23RfCnVqc7qL0Y7ut/x9STeTeUqKHOjqR6AqIK8wVMCqWi7GZ6A5UwK8wVOFSXoyPQK42KidcbtS0rRnfkGfQrY054LY2xXT7rzqqN5blsZAz/ADWTZ09esuraQ+kt7zbDqjT2y9Fdv8ZnUmjraLXp2jpw3B3A4j0/9hXpQY0MYGtGABgKK2I4wEREAREQBERAEREAREQBERAEREAREQBUl0g6ejeAMub5Q9Sq0IyrNzQjXpSoz3STT7T2LyeaMSwmFUVcPe9TJHjAByPR1LxXzVe2s7W4nbz3xbRMxlrJNGJ69qyKKmtkZ8usky4D6jeJ9pwrjZqMUlDGzGDhY6H/ANotWT1LfKp6c9DEerDeZ9Zyssq6mmtlI+pqpo4IIxl0jzgD/vsWbWhKFOFtFZve/iylbW5CZzIo3SSPbGxgLnPccBoHMk9gXCm1HVp1trq63lri6nklMdMCeULPJZ7QM+tb4277Q6x2jpu82y0dBXSd6QFw3ZKo4y9x7GhvV2uGexcuLquhujtTD4SublZTkskuC6+t/Iwbisp7I7gose5jg5pLXA5BHMFQRbyYp2j3KO0LVWqtM3f+09dHU2uz9HFBXVJxLndLnNe8nDmtaGnJ4+VxJWV7bNo1ztGyWo1XoKvoKtpkjY6tiImbFE47pezHAuDi0cc4yeC4kk13fDpCDSMFUaWzslfPLBB5PfUriPKlP0sANAHIbo4Z4ppvXd80vQXK2UVUX2y6QvgrKGXyoZg4Y3t3qeOYcMEEDq4ICzXG41l3rp6+4VU1XVzvL5Z5nl75HHrJPElU6c0QGR7PrG6/6roqbd3o2PEsg8zTwHrOAu1b9ry3bO9GUtvp5B3y2HDiOe8eJA865Q2W18GmmSXKRu/USnLGde63l6OOT6grpe79W3+sdVVspe4nyW54NHmWHc3caSyW82LA9H6uIS15bKa3vj1LxI6j1BV6hr5K6reSTndbng0disOTkntXtUP4bvaqfeUNm5NylvZ0t06dCMaNJZRithNk9qiHLz3lMDle5FKmemcqYFebTgqdUl+LJwVO0rzapwqGZEGejV0x3OmmjSW59xlZhzhnJHWVzrY7e+6XWmpGDJkeM+hdsaGszbJpukpw3DnND3f0+ClsNpZRc30nPdNb7XrQtYvZHa/i93y+pf0RFJmjhERAEREAREQBERAEREAREQBERAEREAREQFqvVPwZOBy8l3r5fH+axHV13Nos8hidipqP0MI6948z6hk+xZ/UQtqIXxPGWvGCtM6w0fqnV2qWUETn0tDA3cMzct8nrOerPm9C0HH9EpX+IwuqOST9bPitz6893YZVK41YarKS26hodN0zaSlifcbo4YFNCc7p/vu6vRxKyGzbPbtqipiuur5yImnehoI/JYz1f1PFZbpDZ9ZtIUzG0sDZKgDyp3jjnzdiw3ukdqDdnOgpoqKfcvV2DqWj3Th0YI/SS/8AxaeB+s5qn8K0ctbCXKpa1R/7P9uBanWlLZ0HLXdG68p9Y6+lobWWNstjBoaNkfzHOB/SSD/M4Yz1hrVqtCcnKKfLQRRYx0jwxjS5zjgAcyVXX+x12mrzWWa5w9DW0UroZmZzhw58etAUCIiAKeGIzStYObjhSK86eoDPN0hHDkFbqzUIuTMuxtZXNeNKPSZLaaYU9K3hgkfBVpPWgAaAByCkmdhuBzK1uUnOTbO2UKUbaiqcdyRTyO3jleZU5GVIVdRgVM28yAOVMFDCiAvWUxJwvTqXmBxXorbMmBFvML0apGr1hifM9kcYy97g1o85Xii5NRRcqVo0acqs9yWZtTYNpU3rUDaqRmY2HAJ7BzK6ya0NaGtGABgDsWttiGk22HTjKhzMSSDdGR7StlLZKcFCKiug4reXUrmvOvPfJ5hERVmMEREAREQBERAEREAREQBERAEREAREQBERAEREBTXO5Ulmt1Tca+oZTUlLG6aaZ5w2NjRkk+pfO7bHtLqtqWt6u9Sb8dEz9BQwOP8AsoGk4yPrOOXHznHUFt/ur9tjbxUyaBsFTmjppP8A6pPGeE0rTwhB62tPF3a4AfR480IAg58URAdGdz/s02Xa8ulBXU13vkd8tb46ye0VZiMcm44Hea4MG/HvYzyIzgjrOY90fsy2aUFyqNbapvN4oq24hrI6G3tjLquRjQCWhzTjhu5JOB6ThaH2XbWH7KLVeqmz0TZtQ3IMpoamcAxUkIyXODfpuLt3geA3QTnkqvVu26v2jbP2ae1bF33daCobU0N0jaGueMFr45WjA4tOQ4dbRkdaA1nUmB1RIaZkjIC49G2Rwc4N6gSAAT58BeaIgJ4InTSNY3rKzmz0YpqcHGCRw9CsWnrcZHiRw58fUssADQAOQURiFfN6iOjaIYXqRd1UW17gvBx3nEr1kOfJC8yFHRNyqvPYeRGCoEZXooFvYq8zFlAk3VHCjuqYNATM8UCDR1qYIogLwvRiTNWb7KdLyak1NDiMujicOrm5YUxrnENYMucd1o7SV1VsC0S2zWdtwmZ+kcOBI4knmVn2FHWlyj6DUdLsR5OirSD2y2v4fy/obYoKOO30cNLEMMiaGhe6Ipc50EREAREQBERAEREAREQBERAEREAREQBERAEREAREQHE/dR7Lauxaqq9UUsANJXyGWbo2YaHH6WB8fPx61oVfTfWGlaLWFjqLXWxsc2RpDS4Z3TjHs6ivnxtQ2fVuzzUs9uqIninLiYXns+rntHxGCgMPREQBERAFVW+kNVOG4O6Ofn8yp4o3SvDGjJKzCxWxsEbZHDlyz1ntWPc11Sjn0kzgmFyvq6jl6K3lxoKUUsAbjyjzVQTgKKhjPHq6lr0pazzZ2KlSjSgqcNyJMdvNQIXoQoELxMOJ5FqhhemEx5lVmW3A88JhemPMmF7meKBKGqYBRAU8UMk8scEQzJK4NaP6pGLnJRRRXqwt6Uq1R5JLMy/ZZpOXVGo4QIy6KJwA4cC5dm2u3xWughpIQA2JoHDrPWVrbYboWPT1kZWSx4leMNJHtK2mtjpU1Tioo4xf3k7uvKvPe/kuhBERXDDCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAtY7c9lNJtF01MWRAV8Dd6N7R5RxyI84+IyFs5EB8ubvaaux3Ke31sRjngcWuHb2EeYqjXXPdP7FRcad2qLJTjp489LGwfO6yPXzHnyOtcjEFpIIwR2oAgBccAZJQAnkFe7PaHSyNc5vlf8IVupUUFmzLsrOpdVFTpoqLFaCTvPHpP9FlDWhoDWjACnt1tmqJYqOip5Z5pDusiiYXPefMBxK2lbNisljscupteVBtdvhAc2hjcDUzuPJnY0ns4n0KDqOpcSbW46naQtcIoxpyfpPoW1t8EjVgjc7jghvIlTYHJXK8XEXOsdLHTRUkA8mGmiHkQs6mjt85PEnJVvIWG2s9hstKEtVOSybPMtUML0IUMJmeuB54CYU5aoYXpb1SXCYCmwgag1CHAAk8AOtbL2JaDl1Leo66aM9C0+RvDk3tWBWKyz6hu0VugaS0uBkI7Oxdm7OtIw6UsUMIjDZntBdw5DsUxh9vqrlJdO45vpfi6qT5lSeyPrfHh2fX4GT01PHSQRwRNDY42hrR5l6IikzRwiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgPGspIa+llpaiMSQytLHtPWCuHe6I2OVOitQvudugfJQVb947jeTieePPyPn9K7oVo1Npeg1XbzRV7CWg7zXt+cw+ZAcBaE2Sar1hVNjtdmqJj1yyDo44x2lzsBdD6N7lJ0DY5NS3hrWji6moBkn0yOH8mrf1lsdBp+hZRW+BsUTB1c3HtJ6yqupqYaSCSoqJWRQxtL3yPcGtY0cySeQVidCM3nPaSdDFa9vHUtvRz6Vv7/AxqzaT0ls3tc1TQ0VLbYIYy+erecv3QOJc88T6FzPtX2lVG0K95hL4rRSktpIHcCe2Rw+sfgOHarvtk2ty62rHWm1SPjscD855GrePpuH1R9Ees8cY1eoe9u1L8qn6p0nRfR6dH/zr3bVe7Pa0uvrfyJC3CgvRSlqjszdHEkIUu6p8EIvcy24kmFDCnwEwF7mU6hIoP38sjibvSyHdY3tP3KaR7IozI/g0c1snYvs3qdT3ZlxrIi2McWgjgxqzbO25aWb3I1jSXGlh1DUpv8yW7q6/DrNibBdmbbdStutdHvOPleUOLnLei8aKjhoKWOmgYGxxt3QF7LYUsjjrbbzYREQ8CIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAubu6A19d6u7yaXh/8Na4g17ix2TVnnkkfRB4bvaMnqXR07XPgkaw4cWkA9hwuMtsUF0s2pnVFWyR8AcWvBHIdo9CxrunOpScYPaTmjl5b2t/Crcxzj9H0Ps/neYuc54qXCnDmyND2EOa4ZBHWFAhaud72NZolRRUMIUtBSloKmRCnIl3VAtxxJAAGSSpwMr1sdlqtX3RlBRtcacOAkeB8/zDzLIt6Eq0tVEPjOK0cNoOtU39C4v+7y56D0hVa3vcLWRPNIx43eHzz2/cuyNJ6ZptL2qOjga0PAG+4dZ7FY9mez+m0faoiYmipc3s4tH3rNlstKnGnFRicPvr2reVpV6zzk/7kERFcMQIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiALXG2HZ9BqqzS1EcQM7G+Vgcx2rY6g5oc0tcAQeBB60B8/hTz2C6SWirBa3ePQk9R+r9yrcLcvdAbKw4OudDEQD5bS0fNP/AEWj7bWOqYnRzeTUwndkHb2O9agsStdV8rHc951fQjH+Wh5Prv0l6r4rh2dHV8CqI8yl3VOiiczojieeO1MZ6lPhU9HTVepa0W62NcYyd2SZvX5h96yKFCVaWrEiMXxa3w2i61d/BdLfUTUNDValr2223NcWF27LI3r8w/qV1bsi2WUulLdDVVELenIBa0jl51R7INkdLpqhhrKyFplIBa0jn5z5ltsDC2WhQjRjqxOG4rilbEa7r1n8F0JcEERFeI0IiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgKK8WqnvNvlo6hoLJBjJHI9q442t6Dq9F399fTwkMDjvtHJzesLtRYdtK0VBq6ySt6MOnY044fOCplFSTi9xdoV50KkatN5STzTOOYJY6qFk0Ryx4yFM8tjaXvcGtaMlxOAAvC722o0XeaijqY5DTPcXNDRktd5vSqvTOj7xryvjZ0D46TeG7GBz857SoDyXN1XH/Xidd/51axsI1ms6r2avXx+BSWy3V+sa1tHb43tpScOkxgyfcF1Lsn2QUemKOKrrIWmXALWEfEq67N9lNBpCjjkmhY6owCGkfNPn862EpyjRjSjqwRyzEsSr4hWde4lm/klwQAwMBERXTACIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAImUygCKBcGjJOB2lRBBGQchAEUA9pzgjhz8ybwwDkYKAiiZQkAZJwgCJlMoAihvNxnIx2qOcoAisWrNWwaUpqWR1vuVyqKydtNT0lBB0kkjz6SGtaBklziAAFfA8EDPAnqQEURQ32kkZGRzHYgIomUygNda22PW3Vda2rAjY4nLmuH8lkWktD2zSdM2OmiY6UDBkxy9CyMEHkmUARMqAcCMg8EBFEBBGRyTKAImULgDglAERCcIAigHNdyOcHHBRygCKAcCMgqOcIAig57WjLiAO0qOUARFYrpq6C3ajtun47dca2rrmukc+nhzFSxDgZJXkgNGeAAySepAX1FAvDRlxA9KjkZx1oAihvN7Qo5QBERAEREBxrXW6pveoddxafsupavWjdUyi2XOhdK2nooxLlwkfvbgGN7gR1jqU20x8MevNptTc7JdbnWUkdAymuVJUvhhtU74GjpX7rhhpfgjgeRHDK6n0roe1aPqb3UW01Jdeq99xqRNJvASv57vAYHm4qgk2V6dmuOq66aOomdquCOnuEb5MsLWMLBuDGWnB55PEBAamFkqdoG03T+hta3SW6Wy1aWguE0UNQ5sVxqiQ10rnNILxx4HzZ6yrBqG+XHZM3avpvSVdVx2y20dDUUTHTOkNuknfGyQMcSSODyRx4YB5rcdw2F6br7bZKZlffaKtsdP3pR3WkrTFWNh44jc8DDmjOACOA9JVfpzY7pPTtiu1nFLUXKO9Z8JVFxmM09ZkY8t/A8MnGMYPHnxQGExbH9MaS2b3LUFpdcDdn6dqnT1nfsju/TJTOJL2klp4nIwBg4WL6tqZfFP0vIJpOkItwDg45yJR1+r4LaWldiVg0pXRzw3TUNfTQQyQU9BcLg6alp43tLXNbHgDG6SOOVb6Huc9IUNbSPNZf6m2UVR31S2aouDpKGCQHILYyOo9RPb2oDSe12SjbtM2l1NfYbvdXUlHRd6VdJVPiZa5XQtAlfuuHk72Oo8jyzlZdtXu7RojZ5oHU+qqeJ94ZFPdrsJvIdTxR53t/6W88twfpFq3G/Zhp+W9amu00dRNLqalZR18UkmY3RtZuDdGMtOD2qh05sZ0zp25UVwHftxmobYLTTC4SNmbFAHl4AG6OOTjPZwQGi7nq92qe5epaaWt74rLTdqa01MsUpPStZKAxwcOJDoy3j14Wc1Vho9km2LRdr0jPW09u1GKmC4Wt9VJNHhjAWzND3EtIJPHzHzrMLvsH0jd4tQQv8I00F+qKeqqYqWcRsjlhzuvjG75JOTnnnzKu0lsf07pO+u1A2e7Xe8mMwtr7vWuqpo2Hm1pdwb7EBp7SVRK7uQ9QOfK8vayvbkuOR+mPDPr+Kx/WrqKbWOmnXnT931LRwaBp6l9JQ1Do3scM/piQ4HA45PE8RwOFue4dznpCvq6o9+X+mtdZUd9VNlp7g5lDNITkkx46zxwD6MYCysbO7G3WUGrGRysrYLb4JZEHDoO997exuY5jlz5IDQ9nfeILNsMdcbybjJUXaV7ZY5y/9C7G5G530i1p3TnlgjqVi2j7QaN+1O662h1DDFUaSuVHb6K2CbDqunaXCrIb15c8j0A9i31bNh+l7TDY4KWW5iGw3GW5UEbqgEQvkxlnzeLMjIHPJPHiqu07HNJWnSFVpYULqqjrGzCeeq3X1DzKTvO6TdzvceB6sBAWnbzrGvsGx+43vT1UYpahsEcVZGeMUcr2jpGnqO67geokFYLR6a0Xs311pSh/szqQ3CuqoY6bUzbiTHXSuaHO329IctOcEFvoW6KLQ9np9Fw6Oqo5LlaY6UURZWO33SRAYAcQBxAxgjGMDsWH2jufdNWi82q5C76mrI7PMJ7fRVlydLT0rhy3GkZxy4Z6kBqzYxp6C9azuVyrND3G6PptTVRZf23Msjoyx+81ph3wXYODyOd7zKzaWvt00PdNSX6rrpnad1HdLtZaoyPJbR1bd50EnmDt4t9vYFvWz7DrNYL4+7WvUGq6MSV5uMlFDcy2lklLt4h0e7hzTyIPMcFXv2PaWl0netLTw1M9tvFbLcJxJLl7JnuDi5jseTgtBHPz5QHOj6V96p9j1DNYazU0ctjqnOtkNaad05aTg75cMbuM8+rCyLaLaLbbdT7NrRPoi71NuZa66R+nKerdLO12N8t3w8b264l2Q7kOHYtrVuwTTVVSaegp7lqG3Safpn0tFU0Nd0MwY4+VvODeJPHljmrxQbLLRR3bTt3luF5r6/T8U8NNUVtX0r5Gy53ulJGXEZwOWMDsQGlbHq6s0x3Mtwr3XhgN5rZaKztlqjI63xTP3OjfIeIMbRI49mF6bNb/AGm2aZ2o6Es17Zdrdb7fUXC2VTJuk3oZKch7Qf7r8etxW1INhWkqeuhqG+EHU8N3kvUdC+YOpm1D24PkFvzeGQM8Pgrjd9kumbvfje3QTUlS+3T2qVtI5sTJoJQQ4PAHEjeJB6jjnhAU2wl75Nj+k3Pc5zjbo+Ljk9a1pQaBsW0PbhtNg1AyskFCKA0ssFXLC6mLoeLm7rgM+SDxBHBbO0Dsjtezqo6S13vUlTAIDTso664GanjbkHLY8ANIxwI7T2qg1BsH05qHUV1vst01HRz3cMbXQUNxdBDUBjQ0BzQMkYHLPWe1AaCr77ddYaJ2e012hrNTGLUVZbhEKnopLnEwN3AZMjiQcbxPVzWd3q0w6dqtktNR6erNMCXUkkkttnrDUOYSAMl+84EEAHGev0rZd62JaUu1ksdmpxcLPTWGQzUD7ZUmGSJ5HF29gkk88889ap7psMsl6s1uttwv+qql9tq31lNXSXMmqje4AYEhbnAwMdnagMl2iuczZ7qdzC5rm2mrIIOCD0LuS0Nse0NVXjQM1RadJ1+n75W2GSKl1LLdDJHUyPAHCMPJjz27vDHbhb4tmh6K36QqNKzXC7XGjqIpoJJ6+qM1Q5koIcOkIzwDjjsWMWTYRZLHQyW6HUWr5re+mdSto5rs4wxNJBBY1oG65pAII5IDXOyvSekaqrrNneq9G3Gx6kdQxy1kbrhM+C6MjkB74Y5r8b28M8OokZPEDHtFU1g0Fsu1lr5kMzb7bLlX2u3TuqpTub27HG3dLt12N/OSM8MrfWjdkdl0dfJ7+Lherzd5oe9hW3esNRLHFnO404GBkBUjdh2lRbIbW51xkoo72b8YXzgtkqD9F43fKj/u/FAam2B3y3aer9T6HodRQ3mlntMd2pp4pt8Nn6ENqGZ7d7BA7BlY/Z9L0Gne5yoNp1qra+2aqpD0zayOsk3ag99GPo3xl264FvDGOr0ro667L9O3TUdq1B3u+jrrayaJhpN2Js0crC17ZAB5QwTjlglYvae5u0ZbBRQzVV/ulBQSdNT26vuDpKSJ+SciIAN5knz54oDEbbZaTbRtd1LSa0jqKi3WOgoTR2oTyRRMdNCHveQ0gk5JGfOOwLJNgVRUUNx1zpJlbUVdp0/dzT2908hkdFG4EmLePEhpb8Ssl1dsesWrL2L8yvvdju5hFPLW2atNNJPGOTX4BDgPRnl2BXnQ+g7Hs9s3gqxU744nyOmmlleZJZ5Hc3vceJJQGj79sh0cdv1p06LbUNtdfZ6iungFbOA6bpHYdnfyPQDhYdV7Q7VR7TflBg1HE0UF+ZZo7UaglzrU2LonTbp5je8rj6V05dtn1pvGq4dUzS1sdygt8ttY6GXdaIpM5OMfOG8cHKtcWxfR0WgjokW/etxhMJmcG98nLt7f6Td+dvcc49SA143TtDtf246vtern1NXatOQU0dBbW1D4o/0jN50pDCCTnr847AqK9VFz2fbebTQaasl01KKXSYp2UffobII++HHec+Tg7d4Djx5di2JethenbvU0NfFcr/arpSUcdC6422uMFRUwsaGgSuAw44A44B9gV1seyqwaf1Db7/SPuDqygtfgmMz1BkDod8vy7IyX7xPHPXyQHNdxulwrNnmuquqgqbdVSa7ie+lfNvOpnFwJYXDgSDwyOHBR2qyUjdou1GqrbHdrjLStom0dwpap8UVpkfC0CWQtcPJLsdR+aeWcroOu2H6Wr7debfM+5CG8XYXmo3ZwC2oBz5J3eDfMc+lXJ+yzTstz1XcJo6iZ+qoGU9wjfJlhYxhYNwYy04PPJ44QFNZtX0Gk9NWK3ap1JSTXXwdA+ao38ioO7gyA9YJB49fNFi977l3ReofB/hC46jk8H0cdBAe/GeTCzO6PmdWSiA3AisPhCq/XH2BPCFV+u+AWgecbDfYn3L7jK5pMvyKw+EKr9d8AnhCq/XH2BPONhvsT7l9w5pMvyKw+EKr9cfYE8IVX64+wJ5xsN9ifcvuHNJl+RWHwhVfrj7AnhCq/XH2BPONhvsT7l9w5pMvyKw+EKr9cfYE8IVX674BPONhvsT7l9w5pMvyLXm0vVF6sGz7UN2tdUYq6ioXzQydG1244EccEEHhnmuRz3Um1nP8A9zt9xp/wLa8Hxajidvzmgmo5tbd+ztZYqU3B5M77RcCeNJtZ/edvuNP+BPGk2s/vO33Gn/ApQoO+0XAnjSbWf3nb7jT/AIE8aTaz+87fcaf8CA77RcCeNJtZ/edvuNP+BPGk2s/vO33Gn/AgO+0XAnjSbWf3nb7jT/gTxpNrP7zt9xp/wIDvtFwJ40m1n952+40/4E8aTaz+87fcaf8AAgO+0XAnjSbWf3nb7jT/AIE8aTaz+87fcaf8CA77RcCeNJtZ/edvuNP+BPGk2s/vO33Gn/AgO+0XAnjSbWf3nb7jT/gTxpNrP7zt9xp/wIDvtFwJ40m1n952+40/4E8aTaz+87fcaf8AAgO+0XAnjSbWf3nb7jT/AIFkmzfuitp+o9faftFdqAVFLWV8MM0QooQXsLhkZDMjh2IDtdFya/bdr9j3N8O4wSMd7RfhUPlw1/8Abv8ApovwqL8rUeD/AL2m+R/DzEpJNSh3v7TrNMrkz5cNffbv+mi/Cny4a++3f9NF+FPK9Hg/72nvm6xP2od7+06zymVyZ8uGvvt3/TRfhT5cNffbv+mi/Cnlejwf97R5usT9qHe/tOs0yuTPlw199u/6aL8KfLhr77d/00X4U8r0eD/vaPN1iftQ739p1nlFyZ8uGvvt3/TRfhT5cNffbv8Apovwp5Xo8H/e0ebrE/ah3v7TrNFyZ8uGvvt3/TRfhRPK9Hg/72jzdYn7UO9/adPeDYvrSe0fcng2L60ntH3Ii5tzC191HuXgahry4jwbD9aT2j7k8GxfWk9o+5ETmFr7qPcvAa8uI8GxfWk9o+5PBsP1pPaPuRE5ha+6j3LwGvLiPBsP1pPaPuTwbD9aT2j7kROYWvuo9y8Bry4jwbF9aT2j7k8Gw/Wk9o+5ETmFr7qPcvAa8uJbdTaUodRabutnq5ahlPX0z6eV0TgHhruZBIIz6itKeKHoL7S1J7zD+UiLoGjtKFOzUaaSWb3bDFqvOW0eKHoL7S1J7zD+Unih6C+0tSe8w/lIinS2PFD0F9pak95h/KTxQ9BfaWpPeYfykRAPFD0F9pak95h/KTxQ9BfaWpPeYfykRAPFD0F9pak95h/KTxQ9BfaWpPeYfykRAPFD0F9pak95h/KTxQ9BfaWpPeYfykRAPFD0F9pak95h/KTxQ9BfaWpPeYfykRAPFD0F9pak95h/KTxQ9BfaWpPeYfykRAPFD0F9pak95h/KTxQ9BfaWpPeYfykRAPFD0F9pak95h/KTxQ9BfaWpPeYfykRAPFD0F9pak95h/KV30h3MmjdKaotd8oa+/SVNDUMnjbNPEWFwPDIEYOPWERAV0mwXTEkjnmtvGXOJOJo+3/IofIFpf9tvP8aP8tEUM6NP2V3HToYjdqK/Nl+p+I+QLS/7bef40f5afIFpf9tvP8aP8tEXnI0/ZXcVeUrv3sv1PxHyBaX/AG28/wAaP8tPkC0v+23n+NH+WiJyNP2V3Dyld+9l+p+I+QLS/wC23n+NH+WnyBaX/bbz/Gj/AC0RORp+yu4eUrv3sv1PxHyBaX/bbz/Gj/LT5AtL/tt5/jR/loicjT9ldw8pXfvZfqfiPkC0v+23n+NH+WiInI0/ZXcPKV372X6n4n//2Q==",
  "SOC-13": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFUAVQDASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAAYHBAUIAQMCCf/EAFIQAAEEAQIEAwQFBwgFCAsAAAEAAgMEBQYRBxIhMRNBURQiYXEIFTKBkRcjUlWUodEWGDNCVmJysUR0gpLSJCU0NkNFk7RGU5aio7O1wtPh8f/EABwBAQACAwEBAQAAAAAAAAAAAAABAgMEBQcGCP/EADgRAAIBAgQDBAgFAwUAAAAAAAABAgMRBAUSIQYTMRRBUXEHFVNhgZLR8CIyUpGxM6HBJEJy4fH/2gAMAwEAAhEDEQA/AOqUREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERACQBuVHshxB0ti7LqtrO0GWGdHRCTmc35hu+33qN8YtSuxOPr44WJqsFiOxauzwO5ZGVIGc8jWHyc8lrAfLmXLGndWcROI2dkxOk8lHp+vHG6ZlSnN7JBCzmDQC8Dme4lzRu4kklb2FwTrRc27JFZStsdtYnUeIzzHPxeSqXAz7fgyBxZ8x3H3rIyGVpYms61kLcFSBn2pZpAxo+8rk3hXqnX7s5PDqOhlH2KcMlmtkrVRzJGui950MknKOeN7Q4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",
  "SOC-14": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFUAVQDASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAEHBggDBAUCCf/EAFcQAAEDAwEEBgQHCQsKBgMAAAEAAgMEBREGBxIhMQgTQVFhcSIygZEUFSNiobHBM0JScnN0grLSFhgkNDVDU5KTorMXJjY3RVRVY8LRJSdEZXXhg+Lx/8QAGwEBAAIDAQEAAAAAAAAAAAAAAAIDAQQFBgf/xAAyEQEAAgECBAMHAwQDAQAAAAAAAQIDBBESITFBBRNRBhQiMmFxoUKR0TOBsfEVI1Ji/9oADAMBAAIRAxEAPwDalERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQERCccSgIvnro/w2+9Ouj/AA2+9B9Ivnro/wANvvUhwcMggjvCCUREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERARFBe0c3AIJRR1jPwh706xn4QQSijrGfhD3p1jPwgglFAc13IgqUBERAXzJ9zd5FfS+Zfub/IoPMCIuang605d6g+lAp6cyHed6nd3rvAADA4BAAAApQQikqEBERARFKCEU4UIJwiIgIiIGEREBERAUYUogYTCIgYREQEwiIGEwijKCcKMKUQQvl8YeOI9q+iiDqlhYcEKF2nsDxgrrOaWnB5oIwoUphGHJT+ufJdhcFP658lzoyIiIC+Zfub/Ir6USAuY4DmQQg8+GEzOxyA5ld9rQ0AAYAXzDEIWBo9p7yvtBPYmVCIJyoREBSFCIJUEopCCFKhSEBERAREygIoTKCUXnXDUNotJxX3SipXfgzTNafcTldSm1vpmskEUF/tkjzwDRUtBPlkqPFHTdZGK8xxRWdvs9xFDXBwyMEHiD3qVJWIiICKEQThFCIJREQMooRBKhMogL4kZvjxHJfaIOryUFc0zPvh7VwlBy0/rHyXOuCn9Y+S50BERAREQQiIgIiICIiAgREE8lCIgKeShTlARMqEE5XyXBoJJAA4k9ylYrrvR37sKRtM+53GkjaDmOmlDWSfjtIO97eCxMzEck8cVm0Redo/d5erts+mtLtfHDOLnVt4dVTOG6D4v5e7JVKaq25ao1EXxU9R8W0p4CKmJaSPF3rH3jyWT3Lo8TN3n013fJ3dfCD9LSPqWF3jY5qi2lzo6RlWwdsEnH+q7H1lcjVe926RtH0e78FjwHFtN7cV/wD6jl+3Rhr6yed5fJM9znHJJPErM9C0rakSumaJWYxuvG8PcVh9Xbau2z9RV08sMo/m5GlrvcefsWe6DZihe7hklczFW0X+J7TW5cc6bfDMTH0ZlZ7tdtMPa+y1RZEOLqGdxdTyDuA5xnxb7QVbek9W0Wq6F08DXwVMJDKmllx1kD+445g8w4cCFTwX3S19ZYrlDeraC6opxuywg4FVDnLoz49rT2O8CV1sGomk7T0eD8R8LpqKzakbX/z9/wCV9ZRdK3XWlu1sp7lRyiWmqIxLG/lkHv7vHuWP6R2kWjVc8tB6VBdYHvjlopz6W8w4duHk8DHZxHaF0+KI237vHRhvMWmI+Xr9GWlERSVIUqEQSoREBERAU9iZUICIiAutIzcd4HkuyvmRm+3Hb2IOOn9c+S51wU/rnyXOgIiICIiCEREBOxEQEREBERAREQERQ94Y0uPIIPmeeKmifLNI2ONg3nOccADvJWN1usS47tupw9v9NOS1p/FaPSPmcLHr5f3XusJa7+BROxCzskIP3Q9/H1R4Z7RjqNnzzOV8/wDHvay+LJOn0fbrb+HSwaLeOK73H3y6T8XV7o89kMbGj6Q4/Svn4wrj/tKtz+O39leWybPaudj8kADJXicvjniN53nNb9257vjj9L0o7ncxyuUrvCSJjh9QK7cd1rpRuyUtHVd+CYnH37wWPS3eipJOrknDpf6KIGR/9VuT712aW5XCQ71FZqp57HVDmxD3cT9C7PhOv8cyXicc2tX6xvH5UZceGI57Oa82mwXyB1PeLc6ma7h/Cog6PPg8ZA88hYDeNmNx04x1bpWpbU0zvSNJM/fY/wDEfzB88+YVhtdq+fh1NqpgRyxJIfrC5LXpauZUipkuEcBeQ57KWnDGS+YJIPnjK+gYL6zJtXUYuXrvETH5U6fWX0074b7fTrEqitV6jr5H000MlHXRcJaWYYe3y7x4heqCs315s0o9QxddDvU1XF6UNTFwfGfA9o8DwKrOlqq611/xLfmNirgCYpmjEdU0dre494V2bBOP7PVaDxLHq44elvT+GfbMrqaatrtNyuxDO11dRg8m8QJox+kQ8D55WJavtkVq13PBKzEF3Z8JjcCWllTHgFzSOLXFu6cjjwR1xfZauivUed63TtmdjtiPoyj+o5x9gWQ7cKRsNqor7D6TrfVRVAeO2Nx3XezDlbWfMwzHeGjlr7t4jTJHy5OU/f8A3tLtac2kVtlLaXUT31lAODbi1uZYR/zmj1h89oz3jtVoU1TDWQRz08sc0MjQ5kkbg5rweRBHMKiA/eGQeHYV3tM6ok0PVb5c51jlfmqgHEUpJ4zRjsHa5o4Y4jiDnODVTHw36MeJeDVvE5NPG0+nr9vqu3CL5ikZLG2SN7XscA5rmnIIPIgqV0XkxERBKhEQERAgFEKICIiD4a3dlJ7CFyKApQEREBERBCIiAiIgIiICIiAiIgLHNd3GShsUzYXFss2IWEcwXHdz9JKyNYDtMqcOoIM+tMXH9Fjj9eFpeJZpw6XJkjrESsw14rxDF2SNYAxgw1ow0dwHJcrJcngujHl7sNHFZBp3TVVd8Tvc+nof6Xk+YfM/Bb87mezA4r47ovDM+uy+Xhjf1ntH3d7LmrirvZ1YDNPMaelgfVVA5xs4CP8AHdyb5cT4LIqHRU1ac3KtJaPWpqZxYweDj6zvaQPBfFXeKSjgNusXV01PFkSVTAMNx6wZ3nnlx4DxK93R1tNBaGyyNLZqtxqHhxy4Z9UEniSG4zntyvceC+EeH4tROGseZesfFaekT6RHq5ufNkmvFPKJdqh0/brbFuU9NFEwdjGgLFLntGndeayy6R0xVaiqqEhlVLHMyGngkPJjnu5kdoHJe1tCvNbYdIXWvtrBJWwUskkLSMgvDSR5968nYxZqO2aDoqulrpbg+7E3KoqZAAXzSAF2AOQBGF7qla1rvs50zMy6P7itW62cJNaXdtutxwfiWzvLWvHdLN6zvEDAR+y26adhlm0dqu60T4nOfTW+qeJ6QA8er3SMgE9uSQrIXkauvbdOaYul3dJFGaOlkmYZXANLw07oye92B7VmMlpnaGNodPQWqm610xT3SSEQVBc6GpgH81Mw4c37favM1/oKj1TbnxvaWSNO/FKzg+J45Oae9fOxm0/Fezq0ySb5qrgw3Cpe/O8+WU7xJz4YHsWbOaHDB5KGSsbzHZPHe1Ji9Z2mGuFJPPFPUafvbQLhC0tcQMNqYjwEjfMcx2FZvKHao2LiKf0546GWkkzz6yLeZn+6D7V3dqGgnXinZcbcGx3OjJlp5O89rD813L3FeNs1urbxozUUHVujdFVvc6Jw4xl8QLm+xwctCmOceSa9ph6TU6yNXpIy/rpMb/z/AHY3Yar4ZZKCpPEyU7HHzwF3X4cCCAQRgg8ivC0TJ/mrbQ7shx7iV7ZeOxc7Z6m3WVibIbo6ew1NnleXvtE/weMk5PUOaHx+4Et/RWeYVV7HXON/1Lj1BHR5/GxJ9mFahXZ087443eB8VxxTV3iv3/eN0IiK5zxERATkiICIpKCEREEhECICIiAiIghERAREQEREBERAREQFW20UmW7UMTRlwbI4AeO6PtVkrDr1paovWpaeaQBtC2FzZXb3pH0gd0eYGCe7Peub4vgvn0l8OPrbaPyuwWiuSLT2ePpDSvxlisrG/wABafRaeVQQef4gP9Y8eQGe5qjUrat8lsoZCynYSyeVhwXntjae7vPsHbjuaz1E21UrLTQuEdRMziWcOoiHDI7j2D39iwWItYwMYN1rRgDuC8b4vrMfhOn/AOP0fzz809/9z+Ib+DHOe3m5OnZ7NpoxcK+loGtAileA8AYAibxcPLADf0laQWE7PqXrJ6uscD8k1sDT4u9N30bizZdz2T0fkaGMk9bzv/DW1t+LJt6PG1ZQtuFkqqZxwJYnMJ7sgj7ViWwC4vrdmVvp5Iwz4ukmoA4DhKI3kBw8/sXPtL1nW0FRRaV07S/C9R3cO+DB4+SgjaRvyvJ7Gjs7VzbItFXjQlgrLbd6ykqXy10lTF8F3txjXYyACBjJycdmV6yI2pzaPdnKqbbDS3us1JY3zafrb3pSgjfW1dNSuaOsmaeHWAn0mtb6QaBx4q2cIeKjS3DO7MxvDztPX23ajtFNc7VOyajmbljm8MfNI7COWF6GMqurhs71JZ7nXVGhb/SWikushkq6Wpp+sZTyHnLABycePA8M+5fWiLzedPanqdFanraq4zy79Xa7hMG5qYGhu812OTmknn/2UppE86yxv6s/mgbNGWOAIKw+8WG26VtmoLpSRmKStiM1QM+i5zGOAdjsJHPvws1WAbbLoLXoC7Pzh0sJhb5vIaPrVF52jeezY09bXyRjr+qYj8tdLFq2oobVSU7WNLY4gB9f2r02a7c3G/CD5LBhIAMDkOAXr6VsVVqq/UdopAetqZA3ex6jfvnHwAyfYvMVve1tqvtWfS6fFjnJkjaIjeWyWw+kfJp2svsjCx11qjJGD/RRtEbfpDj7VZBXTs9sprLbKW20jNynpYmwxt+a0YXcyvT46cFIq+L6vP5+a+X1n/SERFNriIiAiIgIiIBRFPYgBEHNEBERAREQQiIgIiICIiAiIgIiIC6lzrobbRTVUzg2OJhe49wAXbWE7TK7dt0NCDj4TK1rvFoy536uPatfV54wYb5Z/TEynSvFaK+rBaismuVXNXzgiWodvkH7xv3rfYPpykWScd/BfOC48VzxMw5p8QviOpz2zZLZbzvMzu9HWsVjhhZWhIBHp9ko/n5pJP7xaPoaFkKru+6yk2f7PbJdmQCoiElKyojwS4xSH0y35wzkd54dqz2irae40cNZSTMnp542yxSsOWvaRkEeBBX2vQ44x6bHSO1Y/wAPOZJ3vMqn2iRfDtrOgqKjPV1wrZaozd0EbMyN/S4BW+qg1PK2j27aKq6nIikjrKSPHE9a6MY4d2M8Vb63rdKq46ylMKMrjqKmGlhdNUSxwxN4ufI4Na3zJUGXLhVxdz8J28WCEYAo7HVTnPbvyNaB9BWYt1Zp987adt8tbpnnDYxVRlzj4DKw3ah8Kt1+0tq2ioaisprPPP8AGDqNofI2nfFg5GeLQRk+SsxxO+0oysdUP0mL81lFbrMxw3ppjO8fNYOH95w9yui1Xygvlmgu1tqGVFHUR9ZFI3k4fYewhaj7W9Q/uo13X1EL+sp6c/BYTngQzO8fa4u9y5+uvwYpjvPJ6P2Y0nvGvraelPin+3T8sRZl7t1oySto9iezhujrMbzdIwy6VkeSH86eLmG+BPN3sHYsX2J7Hep6nU2oYCHgh9JSyDiD2SPHf3D2nsx4PSB24sqWzaT03U71LxjrquJ33bHAwsI+97HOHP1R2lUaHScH/Zfq6vtR4/Gon3TTz8MdZ9fp9ljaG2sya+2pXS02xzfiC3UDnRyYBNVL1rW9aD2M9YN78E9oVprWXohQmrvWqLi7nHT0tPnGMZdI7A9wWza6bxKEQogIiICIiAiIgIilACKApQEREBERBCIiAiIgIiIGEREBFKhAVc7RcuutvaeXyvv3P/6rGWFbRKJxpI66OMvdTPEu6Bxc3k4e1pK5/iuC2bR5cdOsxK3BaK5ImWFtj8FzRRZcB3lckbGvAcxwcxwDmuHJwPIrsRxYcDjlxXw60zE7S9Du6W1qikuWw+RkQO/HQRStI5gxkH/pKwzot7YWVELdF3mcNkDz8Ce44AeckxeTjkt8d5v4Kt2Ohju+gJLfJxAZPSuB7BvOH1ELQWqdWaX1JUCJz4qilmc04JB4O48RxHEc+YIB7F930WSL6fHeO8R/h5zJG1phuxtOo7vZ9Xae1jarbUXN9smfFNSwMD3vgkGHFoP33AcfFcx2na+ez4UzZ3HFTcxHNcmifHiA3APgupsI2zUW0i0xWy6zMF9p2Yy/ANW0Di4fPA9YDn6w4EgW2aWJzcFgx5Ldi/LaYV7K5t+3zTcs0Md1oLxZGPAZJUV9KWQRS/0Zf9uMLHNe3+l21m36X0rS19dRRXGKesuu4Y6JsbM7zcn7oSDwAHPCt2q0/QVrNyenjkYebXtBHuK7NHb6agjbFTwsiY0Ya1gwB5BZi9YneI5sbT0lgz9iOijA+NlgoGB/3zY8OHkRxHsXkT7B7XTAus9fd7W85DnUta8b4PMEOJBVsrzb1qSzacpjU3i6UdBEBneqJQzPkDxPsUYyXjuzwwpGo0dfNklpqqmg1BX15qQ+lpbayD0ZZpeDXEAni3i7IA5Lt7Pdklr0ZQ/up1rUU8JgaJRHUvHV0573k8HP7hxwe8qNc9KXTFn34tP0r7tUjIbNKDHED3geu73NHitate7VtT6/rOuudfKYmkmOFvoxxfitHBvnxd4lVZaebeL35zDdwa3Jgw2w4uXF1nvMen2Wttp6SMl6jmsGlHy0luILJp+LJqgd3fGw93rHt3RwNAvrXzP3pHZJ9gA7h3BdMtIRjXOcGjmThSabbnobULmaX1DcCDiouEcQPeGRD7XrYcquOj7pKTR+y200tQwx1NUHV0zTzDpDkA+Ibuqx0EKU7UWRCKU5oIREQEREBSoRBIRAiAiIgIiIIREQEwiIJ4JhQpygYRCoQSoKnkoQF166kbWQOieMghdhEFVXK2yabqXMkaTb3OJa8DPwck8j8wn3eXLsxxAgEEEEZBHIjvVhVtBFWxlkjAQQsEuenK6wvdLbGialJy6lccAd5YfvT4cvLmvB+0PspOe06nR/N3r6/Zv6fV8McN3p6WcCblbncn7tSwd4I3XfS0e9af8ASK0i+wa+qqpke7BXfLtIHDJ9b+8D71tXabxTRXClr2PLOqd1FTHJ6L42PwPSHcHbpzy5rEukroJ2o9MurqaIuqaAmUYGSWffD6Af0V2fZfUWyaGMWSNrU+GYn8fhTqq7X3jpLT2yXevsFfFW2+eSCaJwe10by0gg5BBHEEdhHJbkbGukTb9YUsNr1JPFR3UYY2pdhkdQewO7GPP9V3Zg+iNNfg5a4tcMOBwQuenMlO8SROLHAYyO7uPePBejazeHaFrvX+kquaS2aYt9ztg4smikkfM0dz4hg+1uVT9z6UmtpHPjgoLZRubwOKVxc3z3nnHtC8LZx0hLzpmOK3Xpou1sYA0RzuO/EPmScSB812R3Fqumjq9l21qNjQaL4bIOFPWtEVQPxHZ9L9BxQULd9uu0C8hzZdQ1cLHDG5TlsI/uBp+lYJX3GuuEzpqqqmlkfze95Lj5k8T71szfei9aalznW2trKNx5NcRK0f1uP0rDLh0YNRQE/BblQVA7A9r4z/1BBRLqfwXE6nHcrkf0ctag4ENA4d4qf/1XftvRf1RVyAVdVb6Vh5nfdIfcGj61gUOaYuIAGSeQCuTYFsQqtY3qnvl4pnR2OkeH+mMCqcPvG94z6x5Y4czwuHRfRi05ZJmVV3llu0zeO5I0Mhz4tHF3tJHgropKSGip2QQRMijjAa1jGgBoHYAOQQcrAGNAAAA7lOURZBSoUoChSoQSowinKBhQpUICnChSEAIg5ogIiICIiCEREBFKIIRFKCMKURBCKUyghFPNEEL4kibK3dcAV9ogxq76JoLq/fex0b8FokjO64A8+Pd4HgvTqrUJ7W2kleZi2MML3gZdgYyfFemoxlQjHWLTeI5yzNp22aP7Ztl1Ro2/SVVLATbql5MRA4RnmWH7O8cOxVuI1+hGrNI0GqLdNR1tOyaKRuHNcOf/AN+K1f110er5aauSayMNdSkkhhIErffgO8xg+BU2FNCPwXLFJLB9zeWjOSOYPsPBexV6RvlBIYqm010Tx2Op5B9i9CzbNNWX17W0Nir3g/fOhLGjzc7A+lB6WmdtmttLMZFR3eofA0YEMzutjA8Gvzj2EKz9O9KW9VUkVPWWCirZHYaOpEkTnnwA38nyC62jei1X1LmT6krmUzOZgpvTf5Fx9EewFXnpHZjpnRbB8U2yGGbGHTuG/K7zeeP2IO1oy+3LUtvdWXTTVTYSSOqiqJmvdI38LAALfJwB8FkQaByARrQ0YClAREQEREBMoiAilQgIiICIpwghEU4QAiBEBERAREQQiIgIi+JX9WwuxnCD7Rana/2xbWNH36qp6usFJTyTyGlHUREGIOO7g7pzwxz496xuHpG7TKiVsMV5a57yGtAp4uJJwB6i2q6S8xvEwhOSIbqoqHu2otsds2b0lXIwsvorZHVI6qF0gpd30MgZGd7PIZxhVDJ0kdpIcW/HLARwOKeL9hRpprX6TBN4husipLYDtpqtaumsuo6tktz4yU8u61hkAHpR4AAyPWHDiM/grPtqVx1HbtH1sulBm7Dc6khrXHG8N7Adwzu5VVsc1twSlFt43hl6LTGp6Qe02iqX0tRdjHPG4sex1PEC0jsPoK99hN82g6ipKy5aw3nW+oiifb3vjjYZMl284BoB3cbvMeStyae1K8UzCMXiZ2WuijKo7b/tju+iK622jTtTHDVSNdUVLyxryGeqxoyDjJDj7FVjpN7cMJTO0bryRakaO6RGr36rtYvV16y2OqGsqmGNgBjccE8GgjGd72LbcHKllw2xztZitot0FxyQRy+s0FY9tEr73b9JXGbTrc3ZsWab0Q472RyDuBOM81rFXbfNpFDVS01Vc3wzRuLXsMMYLSOwjc5rOLBbJ8rFrxXq22NqpM56toXLHRwx+qwLT1m3vaHUE9VeJ3EDJDI4zj3MXboOkLr2ikDprk2ob2slhjII9jQfpV3uOTtMI+dDb0DdGFKqvZVtzode1QtNwgZQ3UtJjDSernwMkNzxDsccZOQDg8CFYd/1BbNMWue53arjpaSBuXyPPuAHMkngAOJK1rY7Utw2jmsiYmN4eimVrbqzpL3atnfDpykZb6YHDZpmh87h34OWs8sOPiFgk21zWs8znHUlxB7Q2dwx7G4A9y2aaHJMbzyVzlrDc3KLUK2bcNb2whwvUtQ3uqA2Vp94z9KsfXO0fXVNYdPX22kUtHVW1k9a+CNhayZxBGd4EhuD/wB1G+kvWYiZjmzGWJXsi1M/y664BwbvJ/ZxfsL5dt61q04N7IPcWxfsKz3DJ6wj51W2qLUr/Lvrdzd5t5eR3hkRH6izPaDtc1LaLTpKW33DqZq61iqqy2NnykhEfHiDgcXcB3qFtHesxX1SjLExu2CRakf5eNbg4N6cD3FsX7Cl23fXTSQbvICP+XF+wp+4ZPoj51W2yLUQ7etcg4+OnZ7tyL9hZdsj2uat1PtCtloudydNSTtm6yN0bBndjc4cmgjiAoX0WStZtMxyZjLEzs2NUqFK1FoiIgBFCkICIiAiIgFQhRAUOALSCpQ8ig1U6WMbY7pZd0AZbNn3tVK6WGdSWzP+9wf4rVdfS0P/AIrZB8yX62qlNLf6SWv87g/xWrraf+jCi/zN/dTQsfaqjebn0HfUvz3qWk1Uoa0k7xOAv0M1H/JNR+I76l+fccInuwidndklDDg44FwCo0U/Mlljomx3mrsN0p7jRTvgmge2Rj2c2uByCPEH38R2reLQ2tqPaLoyK6R9WKhrerqoWnhHKBxx80jDh4HwK002gaQqNFajqLdMCY94uhfj12E8D9h8Qve2ObR6jQmoGiR73W6qHVVUQ45ZzyB+E0+kP0h2q7PjjLTir1QpbhnZ4+0cAbQb60DAFbIB71uvs5AGgNN8P9mU3+G1aT7Q5Yp9eXqeCRssUtW97HtOQ5p4gjwIW7Ozn/V/pr/4um/wmqjVf06J4+svbrZ201NJK5waGgkk9i0P17qSTWut7ldTvyRzzFkLW8T1TfRYB7Bn2lbT9IPVx0voCsbDIWVNf/A4scxv53j7Ghy152FacpL1qyWrr5II6a3U75/lXtaHPPoMHE+Lj+isaWOGs5ZMnOYqrzG48g9hwcLebY/qgat2e2ivfIH1EcXwWoPb1kfoknzADvatK9S29tqv1dRRuY9kMzmNcxwIIB4cR4YV69E7VIiqbtpiaThM0VsDSfvm4a8DzBYf0StjV148fFHZDHO1tmxVexr6WQOGRgrRnaaMa9vjQOHwt/2Leit/iz/JaM7TP9Pb7+eP+xUaD55+yeboz/ouUMVdqy8xytDgLbwz+VauDpC6ZpLHf6WppYmRfC2PLw0Y3nNI9Lzw76AuLo56ntOkdQXm5XqsbSUvwBsYeWl2XulbgAAEk8CvN216+pNeanjltjZPi+kiMcT3jddK4nLnY7BwAGePBXxW06neOiveOBiGmrpUWa+2+4Uri2anqYpGEd4eFYm3rXc2qNYS2qCVwt1oeYmMB4Pnx6bz5Z3R3el3rFdmGlptUarpIhE51LSvbVVT8cGRtOcE97iAB7e4rwrnO+qudXUSEufNUSyuPi55P2rYmK2zRPpCG8xX7sk2aaNdr3V1JZXPfFTlrp6mRnNkTeeO4kkNHnnsW21q0FYrLQNoqC3U9PCwYDWMA955k+JVG9FWGN+o79OQOsZRQsafAyOJ/VC2VXO12SZycPaF+GI4d2uO13ZFeK++RVGmbSJ2TRlszY3Mjw8Hg45I5g4z4BZltHtL7PsW+A1EYbUUlqihkAOQHtY0HB8wra6tpOcDKr3bp/q8vH5ufrCpjLa3DWeyU1iN5amPPyjuP3xWzuxLTFruWzK1VFTRU0sj3T5c+JpJ+WeOZC1fkd8o7zKz7TW2XUOl9NRaft/VMp4mvDHuhDntLnFxOc95OOC6+rxWy1iKtbHaKzzZxtD2a0usrtCzR1bYnzwteyphZM1pADuBO4DyOQcjtXW2h7KNUXGDTdJa6SGtfbrc2jmPWiNu+N3iN7sOF5/RkcX68rg5znbtrkxvHP8AOxrZzcaTnAyudlvfDeKRO+y+sReN1K6l0HS6S2NzUk1NT/D4LY/4RK1oO9KWkuOcceJPHwWt8zvlXeZW3+2jhs+vX5nL+qVp1OflHeZW1oLTaLTKvNHRsbsV0xQX3ZWfhFHBK+SrqmOc6MEkb2OZXj7JtkWqtN7SKK711JBHbqMTNM3whpc/MbmNw3nxyDx5cVm/Rp47Mos/79U/rq1Qxo5ABaWTLat71juurWJiAKURayYiIgBECICIiAiIghERAUHkVKh3Lig1W6Wn8r2X8Sb62qk9Ln/OO2fncH+K1Wx0ntTWe/ahoKW118NZJRCWOo6o5Ebt4DdJ5Z4Hkqj09M2mvdDO/O5FURyO8mva4/QCuvgiYxRCi3zP0G1F/JNR+I76l+f9H/LsP5wz9cLdvUW0jSJ0dJfG36jdb5XPhZM1xO9IBncDcZ3sdmMrR+knabtFKM7vXNf3cnA/YtfR1mIslk7NvNuGzGLV1lkmp42iugJfA7v72nwP14Wn08EtHUvika6OWJ2CDwLSD9BX6B2TUNj1van1lmr4K+m3jG50efQdgHdcDxBwRwPeta+kHswdbK1+o7fEeqkdipa0cndj/byPjjvKjpM3DPl2Mld+cKSMvXTh+7uk8wOWe0+Hkt+tnZxs/wBNn/2um/wmrQNgw4ea3aotbWXQ+yjTldea1lO19rp2xMOS+Zwhad1oHElW62JmKxCOKeqjek9q3441dT2OF+YbbFvPA5GV/H6Ghv8AWWC2bZ1rK7W6Kttdpq5qSYExyNLQ13EgkZPeCvDvd2qNSagrbrOfl62ofMR3Fx4D2DA9i3g2c1Om6/SlDT6erIaykoYWUhc0EFjmsGQ4EAg8c8e9ZvecGOsRBERe07tLdQ6Uv2m+qN7oZqUyZEfWYOcc+RPeF3tmepjo/XFovJcWxQztE2O2J3ov/uuJ9iuvpO1NjbbobeauH41jkZMymaMv3DlpJxyGM8+5a3t4HiMjuV+G85sfxQhaOGeT9DatwdSPc05BbkEdq0b2mcde3388f9i2S2XbV7HdNntJFdrvTU1xt1Hu1Tah26SyPDRJntBG7nHaVrHre40931feK6keZKeeqe+N+CN5ueBweK1dHSa5JiVmWYmsMg2TaI/d/V3eztnNPIKRs7JN3e3S2VvMZGRxIVl2josnr2m532R8IPFlPThhPtcTj3LDujrquz6R1bX1V7rG0dNPQmFszwS0O32u445DAPHlwW3MUsc8TJontfG9oc1zTkOBGQQsarLkpeYrO0GOsTHNitp0JZtHafkt9mo2QMI3nu9Z8rsc3OPElad6otclnv8AX0UgIMVRI0eW8SPoI963ukaJGFp7Vrxt02aVM1S6+26B0jgMTxsGXOA5OA7SORHaMdyhpM3Dk+LuzlrvHJjPRv1DDZdoJoqh4ZHdaY0zC44HWtIewe3Dh5kLbBaAwySU0zJonFj2ODmuacEEHIII5EFXTpvpMXe30UdPd6CC5PjbuiZzjHI78YtBBPjgLY1elte3HRDHkiI2lsplV3t0P/l5efzc/YqzvHShu8zCy2WmhpMj7pIXzFviAd0e/K9nXmtJK7YrSO1FPTx3y8UBkjp2Nw6UF3ou3Ry9EtJPAAlafu96TE2jus44mOTXp5+Ud5lbAbLNlunNS7NaC51dqpZ62d04fK5uXHErgOPkAtfXOy4nvJVy7Odu1HojR9FYJrT8KfTukcZRUFgO89zuW4eWcc109XS9qxFGvimInezJtl2z2r2U36u1FqW7Wqltz6c0cbjK4Oc50jS3O8AMkN5cTlXNaL3bb/SfDLVXU9bT7xZ1kDw5ocOY8wtVdrO11+0Klo6OmpBRU1PKZntEpe578EN47owBk+1XD0Z4y3Zr1jsky3Codk9vED7FoZ8V+DzMnVfS0b8NXt7av9X16/M5f1StNp3fKO8ytttvOorXbtH3C11FZG2vrKSQQUwyXycN3OByGTzOAtRZZA5xI7Stjw+J4ZQzdW2fRnOdmMX59U/rBWuqM6NOsbHDpSLTU9wjiuz6yd8dM8EGVp9IFpxg8AeGc8CrzWjqImMlt11J+GBERUpCFFCAFK6ENb192kgYfQhj4+LsjK76AiIgIickEIpRBC46hjnxlrTg965UQUbcei/pq4V9RWOnr2uqJXSuAlbgFxJOPR7yuuOinpgnjUXHH5Rv7KvrCK2M2T1R4YVJU9H7T82lINNNkrxSQ1TqwO60F5kc3dOTjGMADGOxeCOilpnPGpuOPyjf2VfKYWIzXjpJwxLFdnmz61bObPLbbT8IdHNMZ5HTybzi7dDe4YGGjgvT1Dp+lv8AQzUlTE2SOVpY5rhwIIwV6+EwoTMzO8pKDb0U7A+qL33O6tiJzutczI9pas21nsetGrrHaLNPLVxU1pY2On6uQb2AwM9IkHPABWNhRhTnLeZiZnoxwwohvRX05njV3LH5Rv7Ks3Z9s+tezqzzW61uqHsnm6+R0795xduhvYAAMNCyvCYS2W9o2tJFYjoqjXWwu1a6v77zW1NZHO+NsZETwG4bnHAg96x8dFzT4/8AW3H+0b+yr3wowsxmvEbRLE1ieymKHo2adooKtnwi4vNTA6nO9K30Q4gkjDefojmuh+9dsJJPw+5f2jP2Ve+FCefk9Thr6KOp+i5pvf8Alq26lh4HdlYDjz3FdVHSR0NJDSwgtihjbGwE5w1owPoC58Io3yWv807sxER0RhcFXRRVkRjlaHArs4UYUGVU6s2C6e1DO+pbC+kqH8TLTO3C4+I5H2hYXL0XXmT5LUNQ1nz6Zjj78hbFYU4Vtc+SsbRKM0ieymNM9GzTttmZPdpam7uYQernIbET4sbjPkSQvb1/sct+u6ykqampqqc0sRgjbTuDRuEg4wQeWFZmEwsTmvM8UzzOGOiif3sNm/4ndf7Rn7Kn97DZf+JXQ/8A5W/sq9UUveMv/qWOCvootnRhsW8N64XXHb8q39lWtonSFBobT8NltpndTxOe/emfvPc5zskk4HaV7yY4qN8t7xtad2YrEdFa7RNj1v2g3SCvramrikgiMLepeAC0uzxBB7Vif71+xdtfc/7Rv7KvbChK5r1jaJOGJVXovYDp7Sd9pL3FPcJaqjcXxCSVu5vFpbkgNGeBParURFG17Wne0sxER0EyiKLIurc61tBSPl4b/Jg73LtLEL7XmsrSxueqiO60d57Sg7mmCXVsznEkmPJJ8wskWNaX/jkv5P7QslQEREBcFw4UFT+Sf9RXOuC4fxCp/JP+ooPN05ePjCAQTO/hEQ4/PHf/AN17KrimmnpJmTw7zXsOQcFZ5bLgy5UrZmDddyew82lB20REBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQMKFKIIRF1blXst1K6Z4Ljya0c3HuQdW83aKiYYA75VzC7A7B/9rFZJ5J3BzznuHcuCaaeqnfPNvOe85JwuRrXY9V3uWR7ulv43L+T+0LJVjWl2kVkuQR8n9oWSrAIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIBREQEREBERAKBEQEREAIiIwIiJDIiIgIiIHaiIgIiICIiAiIgIERAREQQiIsMP/9k=",
  "SOC-15": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFUAVQDASIAAhEBAxEB/8QAHQABAAEEAwEAAAAAAAAAAAAAAAcEBQYIAQIDCf/EAFEQAAEDAwIDBAcFBAMLCwUAAAEAAgMEBREGIQcSMRMiQVEIFDJhcYGhFUKRscEXI1JiFnLRGCQzRlRWY5KU0uElJkNERVNkg6LC4nSEk7Lw/8QAGwEBAAEFAQAAAAAAAAAAAAAAAAECAwQFBgf/xAArEQEAAQQABAUEAwEBAAAAAAAAAQIDBBEFEiExExVBUZEGMlNxFCIjYTP/2gAMAwEAAhEDEQA/ANqUREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQETKZQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQFwuV1ycqJHBf5rh72t2zhU1dcIKCB808ga1gySSov1RxMkq+entRDI+naePyV/Gxbl6eWGDl59vHp3M9fZIl01Na7NGXVlXHGfAE7lYhXcXqVmfVaV8ozgPPslRzBR3O9zEhstQ9xyXHdZNb+GdyqcOqXcrCOjdluKcLFsdL9W5aOc/Oyav8adQqJ+Ll1kd+6o4GM8ySvFnFq8NdtBTP+ZV2bwqZG3LpeUgZzIchW6fR9DCCO3pw4dS1pWJkcQ4bj/fHRcpwOKXauamvqqqTjBVcwFVQxgeJaTlZPZ+I9luTg18xppD0bL4qO5dK0biRBUuMn4BWaps81O97WkO5eod3fqeqWL3DM6P8K9SXJ4piTzXqdw2EirI6hgfE9r2noWnZerTnxWv9k1RctPSB1PK7ss4MUmeU/JStpPXNDf2mN5MNW3YxvPj7lbysCux1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",
  "SOC-16": "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",
  "SOC-17": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFUAVQDASIAAhEBAxEB/8QAHQABAAEFAQEBAAAAAAAAAAAAAAYBAgQFBwMICf/EAFEQAAEDAwIDBAYFBwgIBQQDAAEAAgMEBREGIQcSMRNBUWEIFCJxgZEVMkKh0RYjUldiscEXM0NygpKUoiQ0U1SlsrPhN2N0dfAlNURllaPx/8QAGwEBAAIDAQEAAAAAAAAAAAAAAAMEAQUGAgf/xAAtEQACAgIBAwMEAAcBAQAAAAAAAQIDBBEFEiExE0FRBhQiMhUjM0JhcZGxgf/aAAwDAQACEQMRAD8A+qUREAREQBERAEREAREygCJlULhhAPgqZWDcL1Q2wf6RO1ru5nVx+CjNdrmV5LaKANB6Pk3PyU1WNZb+qIpXRj5ZM3SNYMucAB3layr1JbKQ4dVMc4fZjHMfuUCqrlW17i6oqnv/AGScD5BeAIC2NfFP+9kDyt+CYT62jORTUr3+byAPksOXVVylzy9jCP2W5/etAHZGO5erSArMcCqPsFa2bF13uEx9qsl/s4aPuVnrMzz7c8p97z+KxA8AZwrg5SfbwXhE0X8mUJttnO+LinbEEe2fmsfIOHHAV/KCckb+9OlEsTJbVObu2Vw/tFe7LnUMIIqJP7ywMD9rx6qvJ4lRuqD8osRRt475VsOe1Dh+0MrLj1FICOeNjvMHCj4A23PyXoA7G33qGWLW/YmVSZKYb9TPwHB7D5jZZ0VVDO0FkjHDyKhjcjfOPcr2uePaBwc9eh+YVWeGvZmHjb8E1yD0KqNiotBd6qHYu52+DvxW0pb3C8gS/m3efQ/FVZY8o9yKePJG2RWRyNkGWkEHwV+QofBB4CJlMoAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiplAVJwrS4BUkkDBzOIAHUlRi86tDOaGhw5w2Mp6D3ePvUldMrHqJHZYoLbN5cLvSW2PnqJWsPc3q53uCh121jV1OWUv5iM9CPrn49y0tTUyVDzJLI5zj1c5YvM57g1ntErd43Gwiuqzuau7Mb8F73Pe8ve4ucepO5KN36DC3Vo0pVVoEj/AM20/acP4KS0WjLdDvOH1Du/mOB8gpLc6qrtFHiqiy3uyA9dhufALLprdXVH81RVDx48hA+9dKprZSUgAhp4o8fotCyOUBUp8rJ/qi9DE15Zz6DTF2l60vZj9t4CzotF17vr1EEfzcpoGhVwq0s+5+5OqYoikeiXf0lb/cjH8VkM0XTtzzVUzs+QCkaKF5Nr/uJFFI0bNJULRgvnP9vCv/JWgG47b4yFbnCLx61nyejT/kvQf+d/fVDpei7nzj+2tzhMLHq2fJnqaNEdLw/ZqJR78Feb9MOH83Uf3mqQ4TC9K+xe57VskRh+nqpv1XMd7jheLrTVx9Yicd43UtwFTkBUiy5+5JHJkiICKVmzoyPgqFjf0S0qWugY/qAV4SW2B/2cKRZe/KJ45nyiPQS1FLvC/b9HuW1o70x5DJvYcfkVWWztzljseSxZrY5n1m83uRuuZmTrs/wb1r2uGWlXAqPU8tRQu9kl8Y+ye5bekro6tuWkB3e09Qqs6+nwVLKnHx4MtFTKqCvBEEREAREQBERAEREAREQBERAERUQFT0WJW18FBCZZ3hjR49/uXldrtBaqcvlJc47MY3q8+AUHrrlPcZe2nI7+RgOzArWNiytf+CrfkKHZeTIvF9qLmSzJjgB/mx3+/wDBaaV/TPd0Xo84CxZ37LoaKI19oo1FlkpPbPKWQk4G/kpdpTTOza2rb5sYR3eK1OlLG+61nbzNPq0R3z0cfD8V0ljGsaAAAB3Ba/kczX8uBZxMbrfXINY1o2GyuAVcItIzbpa8BERDIREQBERAEREAREQBERAEREATKIgKEBULQeoVyIDHmpGSg5G6wJbc6N3aRHlcO8dVt8JgHuC9KbRJGxrsYFJWkns5/Zf49xWcFjz0rJN8fEKyJ74Hckhy3ucsPuYaT7ozEVMqoWDwEREAREQBERAEREARFQ9UYHMPFa69Xqns9MZZTzOdsyMdXnyXrcrjDbKSSondhsYzgdT5DzXN6y41F5rHVVQAD0YwHZg8PxVvExnc9vwU8nJVa6V5Perrp7hUunqHZcegHRg8AvIq0e8fNVJA7x81voKEVqJqvyl3Z5vO2VW2Wqa814pogQ3rI/uY38VdBRzXCpZT0zS57j8GjxK6FZLLDZqMQxDLju9/e8+Kr5mYq49MfLLGPjuctvwZFBQRUFNHTwMDWMGBj96ysKo6Iufbbe2beMVFaQREWD0EREAREQBERAEREAREQBERAEREAREQBERAEREBTGOitfGHjcK9DuEC7Hgx3ZbE5Z3Er2BXnI3AJI2PVWxO5fZJ2RmdbPdFTuVQhgIiIAiIgCHZEPRAUz5KyaVsTC9xAaBkknornHlChGu9QFrRa6d+HPGZnDub3N+P7lLRTK2SjEr5F6qhtmk1Jf3X2vIjLvVITiMdOc/pfgvCnjIaFgUrOYhbVgwF1CqjTDpic/Gbsl1SJtpiip5rRE6SGNzuZ27mgnqVtvo2kP8A+ND/AHAtfpTazxD9p/8AzFblcvbJ9b7nRVRj0LseEVFTwOLooY2E7EtaBlewbhVRRPv3ZKkl4CIiGQiIgCIiAIiIAiIgGVTnwcK17+XdQ3U+vIqAyUluLZ6no5+csi9/ifJVsjKhTHcmeXJLySC9alt9hh7SslAJ+rG3d7vcFm0NayvpYamNrmslYHgOGCARkZXJ7BaKrVV756uSSZjSH1ErznI7mjwz4eC65FGI2taMADuCgw8md+5a7GIScu56IiLYHsIiIAiIgCIiAIiIAiIgKOGRg9FhSnspOQ9249yzlg3QcrGyj7JwfcvMvB7r86MiCbnbg9QvUFaWCqLHg56LbRSiVgc1eITTPVtbiz1yioqgqUiCIiAIUVHHDcoGa2/XWO0W2Wqfu5owxv6Tj0C5HPUvq6h88ri+SRxLneZUj11d/XLh6qxx7Kn2OO956/LZReIczh4ea6bisXoh6kl3Zy3I5XqWdC8I2VDH3lbWlpJqyZsEDOaR2/8AVHiVbZLZPcZBDCzofbeRswefmp/bLTT2uARwt9o7ueerj4kqHOzVBuMfJbw8RySb8FbRQ/RtFFTc5kLc5ce8ncrPVAN1VaBvb2zexSS0giIsGQiIgCIiAIiZQBMpkeIXjNPHBG58j2sa0ZLnHAAXmUlHu2NnqfesK53altVO6oq52xRjvJ6+Q8T5KKX3iLT05dBa2Cpl6dociNv4/BQSvuVXdJzPWVD5pD4nZvuHctNl8vXWumHdkE7lHwb7UWuKu7l1PRl9NSHYnpI8ef6I8lGWt2w0bb4x3LNtFmrL5U9hSMJwfblP1Yx458fJSHUGhZbZTMqaB0lQxrcStO7gf0gP4Ln745V8XbreiXCpjfala9I3GiL3aI6SO3xt9VqB9YSH+dd3kHv93cpmHA9D8lwnIIBycjfI7ipNYtdV1rxDVk1dONsn67R7+9W+M51QSpuWtHQZfDOK6qO6+DqWSqham0ahoLzHz007XEdWdHN94W1aRjqurquhYuqD2aOcJQepLRVEyEUp5CIiAIiIAiIgCIiALGuDO0pZG/slZK8ar+Zk/qleZeD1HyiNCTO62Nsq+WTsnHZ3TyK1YGyqC5pBHUdFrFY4yNtZWpwJYNz5KqxaCoFTA1/f0PvWUtnF7WzUNaegiIvRgp0C1t+uYtdrmqdudrcMB73HotkVAuIFw7SeKib0jHaO37zsB8slWMSl22qBUzLvSqciFzyF7yXOLiTkk9SSthp2yz3quEURLGs9p8mPqjy81gQwvqJGxxjme4hrR4krrWnLJFZbcyBmC8+1I7vc5dDn5f29Srj5Ob47HeRa5PwjLt1ugttOyCBga1o+J96zB0VMKq5dtvuzrYxUVpBETKwegipzDKc4WNoFUVvaBeE9ypKYfnqiKPv9t4H714dsF5YMlUJHitBV65sVLkGvjkcPsxAvP3LRVvFCADFFQzSnOzpXBg+QyVVsz6IeWeHOK9ydlwCxa66UVujMlXUxQj9t2Mrltfrm91xIbUNpWHuhbv8AM7rRyyPnk7SZzpXn7cji4/MrV385Fdq0RSyEvBP7rxJp2czLXA6od/tZPZYPh1P3KF3W9XC8v5q2pfIAciNvssb7m/jlYJcAN+niVtrTpa63og08HZQ980wLW/AdStVLJycp6RC5zn4NSfqknGOnXCkmntEVl3cyer5qSkz9oYe8eQ7vipTbNIWnTcJrq17Z5Yhzunm2YzHeB0GPFc91RxZuVdWGOwTGjoozhsxYDJMfHB+q37yrdXHwp/O9nmcoU97DslstdLa6ZtPSQtijb0AHXzPisos5h0XO+HnE1l9LbZd3NiuX9G8bMqB5eDvEfJdGDshdHjuucPw8Fum2M1uBDtS6Fjri6rt/LBUndzfsyHz8D5rn9XRz0NQ6mqoHwyj7Lh+7xXcsEjuWuutho7vCY6uFsg7j3t9xWl5LgoXblV2ZvMHlp0/jPujjUUkkEjZYXuje07OaSCPipPauIFfRYZWM9bj6c7TyvH8Crrzw/rKHmkt7/Wov0HHEg/gfuUWkY+CUxTRvjkHVrxgrmX97gS17G9X2mbHfudZtOr7VdA1jKlscp/o5PZd9/VbtsjXAEOBXCS3JGwWxodQXO3YFNWy8g+xIedv3rcYv1N26bka3I4JrvUzswIPersgrnNBxJqGYFZRCQD7ULsfcVvaPiFZaghssr6dx7pWEff0W8p5fHs8SNVbx99fmJKQi19LfbdWfzFXBJnua8FZola4ZBWwhfXL9WVHCS8ovRUDwe9OYKRSTPJVFTmVcrIC8as8tPIf2SvZY1xOKZ/mMLzPweoruaDkBaChZsvfkw0YQtWpmuxtoyPW0SmKYxn6r/wB63eVHQCxwc04wcrfQP7SNrh0IVzFntdLKGTHT2emETKK2VtFsrwyNzicADJK4/eKx1dWz1JJ/OPLht3dw+S6VqmrNHZKkggPkHZtPm7ZctqG4b0GBsN1vOGq7ubNHy9jaUEbnRFF6zeGvIyIml/x7l1CMYCgHDoD1qqP7Lf3roAGFV5SfVeybh6lGnfyVREWuNsCrX5DSQMlXIRlYaBzm96m1ZRSvbJQspGBxw9kZlBGdva6KPzayvs5LXXR7e7EYY3+C7I6Np7lhVFkt1Vnt6Knkz15owVp8jAtm9xmRSrb8M43NdrjU7TXCrlH7Uxx9yxC3nPM/c/tbrsb9GWGQkm102/g3CtGibA3f6Lg+IJ/iqMuIvl5mROiT9zj+QNsgD3pzANDiWgd5J6LsrNLWWAF0dtpQR0PZhcJ1sxrdXXaMNAY2YBrRsAOUdArWH9NSvl0ykazkrvtIdfk3trtNbey/6Og9YDDhz2vAa0+GVJrfw0rZS11bVxwN72wjmd8zsrOCbR9F3E4GPWthj9gLpgAViXAU02OL76LmA1dSrH7mhtWirPa8PbTdrKP6SY85/ALaVVTBQU755nsiijaXOc44a0DxV9ZWw0ED56iVkMUYLnPecNaB3krguvtfVGrZzR0fOy2MeA1mDzVLs7FwG+M9G/FSXTqxYfiu5YvuVMe3krr7X02q53UlG50VqjOzTsag9znfs+A+ah/Xr1Wzm0rfoKd1RLaK1sbW8zstBeweJaNwPgtWCHAOBBB6YK5vItlbLcmc7l+pKW7FouDi0ghzmuBBDmnBBHQg9xXYeHPE0XAxWe9ShtZgNhqHbCo8j4P/AHrjuPAE+QGT/wDPJSil0jSUzGfTNdUxVBHMaakY0uh7xzOccB3kOilxMmdMtp9iXCnZCW4+D6HbJzDbCuO4UC0pqt9LDDR19f65BziGKtkZ2cjHH6scw6Bx7n9He9Ttr+bv/wC66mm6NsU0dHCfUipaCMEZWBcLFQXNnLU00cngSNx7itgUXqyqM1qSJYzce8WQO48N25L6CqdGf0Jfab8+qjldpC9UOS6jEzR1dCcj5dV14keK8pg0xuBA3C09/AY1z2lpmzx+WvraW9nCmyRyOLWva5zSWuDXAkEHcFeh2OMEELld5BZfLmWEsd65Nu0kH658F3PgxZqO86IimuMDKqQ1EwD5fadgO236rU2fS8k9wkdfyFixceNzW9keDMnPLv4gbrJira2m/mKupi8myOXT36EsLz/qLB7iR/FWfkBYc/6n/mP4qKPAZUf1maN8xjyX5QOfxanvdP8AVuU5/rgO/hlZkGu7608gmhqD3AwnP3KdxaKsUOC23xEjxyVsqa1UVGMQU0Uf9VgC2GPxeZH9rCldyGPL9azW6Xu1yutO99fbzSYI5HZ+uPHB3C3oVBG1vTPzV2F0dUHCCi3s002nLaWgsav/AJg+8LJXhWt5oHDOO/K9T/UR8o1ThsrcL0cNlbhayRsUy0tG62Ftk9h0Z+yc/BYJGy96J/JMB3O2WaZdMyO6O4m0wiItqUNkQ15U+xTUoP1iZCPHGw/eVCJ2gjw71J9YTdteHNBBbFG1ox3Hc/xUdlZ5ZPQldPxsempHO5r6rGSDh27FdVsz9hp+9dBb0XONCHkvr2/pQu+4hdHb0Wm5Jfz2bLjlqrRVERUTYBERAEREAREPRY0C2T6h9y+dddg/ljdx/wCcP+Vq+iXEFpGQvnriE3k1pdfN7D82BbTiv6jOb+o/6KJjwoulHZtOXKsrqmKmgbVbySOwB7IWzreNGn6cObSirrH9GiOLlB+J7vNc95McMqnb692b9zQtBZ6Wjr7iymrpnQwyhzQQ8M7R+PZj5iDyhx25sbLQcxmThlOuHuMHJnGuuqHuSfUl51br6ITRWqs+is5ZDAzmbIfEuP18eWy8dNWqqtArrhWUVRS1sRjgpu3jLCznB5pBnvw3lBHTJUA1ZXVVw1HWy1cTqSSKTsG0wl5hTBns9m0jAIBB6YUs4WVlXcBcLLK241NLKGSMlBEkdE4Z9t3McgHyz0WuyuOnOty3+R30fpX0IQzbZb/wb9rnxytmie6OZpy2RpIcD45Wi1jSQw3KCrgjbE2vpxUvjaMNbJzFr8DwJbn4qWNsdUQJHTUzaUn/AFoTAx47yO/PlhanUdgfeLgZqW7WkQwsbBTQuke32B4uI5eYkknuXK4sbK9q1kP1HTDIpX28dv8AwR/SxgGprV6xy9l60zPN0znb78KSzCQTSCUnted3PnrzZOcqJfQ9wFzFpNJM2vLuVsQOHeIIPTGN+bpsugNp6OopmG73Wlhubdpn0jHTRy4Gxdts/uOOuFdlW5V63o43DhJJxktGBTNZJSXWOYA077fN2uegAwWn3h2Me9bThrxKna+nsd5kfK54DKapO7ie5j/PwPzWq1NQ1AtLqex8lfSvAfWzRuzMQ3cN7LqGDrtnKimnKuGjvdFUTzCKEPLHTD+jDmlvP8CR962GBOVU4w32F986ZLpOvVfGO0U1ydSiCrkp2O5HVTAOTIOCQM5IHipBqPWNBp+yG6Sydq17R2DGO3mcRsG+/wAe5cCForo636MFJI6rB5OzY3IP7QPTlxvzdMLYa3hrqG50lvqzMYaOjijgLjlkgDRzvb73beOwXW8r0Y1CnW+7K2NyeRLq60ZMfFDVkdwdWfSLHhzsmmdGDEB+iO8Y6ZzuunaM4k0Gqh6lPijuJaT2DztJ5sPf7uoXBz1W50U4DWVkJ7qxn8VymHyFnqJN+STDzbPVSk/LIfqBmNRXRo2xWzD/ADlfQHAYY0DTHxmmP+crgeqWmPVd4ZjcV83/ADlfQPAwY4e0B/SdKf8A+xy6lPaPr/1A98fU/wDX/h0NVVB1VVg4MIiIAiIgCteOYEeSuVHDKw/ANM8cpI8CrVkVkYbMdtnbrHWqt7M2Nb2gqg8jmuHcVRD0Kr9enszJbRumOy0FF4Uz+eBh67YRbaNi0a9o57e5BPdaxw75eX5DC1zxk9Fl1DxLUyv/AEpXn714OaMjuz3rssb8YJHOT/JtmfpH83qGHwcx4+4LpDei5zpcc1+pnd+H/uXRm9FpeT/rf/DaYS1AqiIteXQiIgCIqEoBzDxVkkrGtOTjZYt0u1FZ6OWsrp44IIhl0jzgBcQ1txMrdSOkoreZKO2nIJBxJOPP9FvkPiqmTlxpXcrZGVGldyU634rNpZXW2wPbLIHtZLVdWR7jLW/pO679AofxI21nWnvcyN3zYPwUYordW3N3ZW2inqpBsGQMLsfHoFK+JMbo9VPL28rn00JIPUHBB/crf07fO22Updkczyts7qXKXg85Q5/DWnhjY98s93IYxjS5zyG9AAtlpvhFc7g1tTeZjbYNj2UZBmIG/Xo37yplwjhj/JGOSRjTiolcCR03xkfBc84u8Taqur59P2epdBSQkx1M0Rw6Z3expHQDv8ei8ZuHC3Jdkjovp/hJZvQomu4k6OopdWVFRZ73aHGrdzy09RVtjfHJ9o5zg5Iz4gqe6Qs9Nwv0w6WWWKtude7nLo/quONgP2QO/wA1898jcEFrT7xnK6vY29npuyQte5zGUYeMknd7iT9+3wVDl8r7bGco+T6dncddXXXj2T3E2VdXVFynM1VKZHE5AGzW+4dy8M/ux8UQ5wcdcbe9fM5XSsltsmjVCuPSl2NnSyRfRFSXdhHVtYKamnmlbGeyc4F8bS4jOMffhaqSGSne6GWN0T2ey5rhgtUG4jNk+mac1ABpHUsYpi7duMe2B582c9/RS+0esDTVmZXc/rYgdntM8wi7QmIO78hncd8YXW5OCoY0bNnHc3x0K6/uIvz7GVEZWSRyQue2ZpAY6M4fnOAB5rDvtdbaa4yPgtlDPcSA2pmkbzQNk7+SPPLzfpOO2c4C2VHIad1RVNxz0tNLO3O/tBhx95UJDcY3J27/ABXR/SXGxui7bO6PnPMZjqSjE3jtZXuSF9PNPBPSubyOppKZhiLP0cDBx5ZCz6Wttl4s0turIpaeGmaZmsY4yOox3ywk7mMfajOcDcZAUWWw0/KYb/b37uaZ2xuaejmu9lw9xBK6/keOqspfbwabE5Can0ye0zXXC3z2yrdTThhdgOY+M5ZKw9HsPe0/9ll6Vf2eqLQ8HcVsP/MvNk0cTJLRWc76SGV7InAe1TEOIyz9k4HMzv6jdUtGaW/27LmP5K2E8zDlpHONwfDvXy1RULu3yb6rp9WLXyaXXLOz1tfmkdK6X9+V3DhHeqC1aM07b6uYRT17ZjBkYDy15y3Pjv071xjiUzseIF/B2/0ou+bWlSO9Zj0VomIEj/Q5ZQQSMEvG4711N96pr6z6x9RZHRxdMv8AX/h9HseHDrlX5XLeG3Er1wR2e9zAVn1YKh5wKjyPg/8AeunseHjI6LOPkRuj1ROMpujZFOJeiDoinJgiIgCd6IUBiV7Mxh4+zutdlbiVnPGW+IWmcOUlveDhazMjp7LePLtoZwVTKpnJQnC1jkWmjYUbh2AGehKLEgmLGEZ78op1k6RVdT2QNuTuT3k/NXNYPZ8h3rzjdtnvAIXq3O3u719NfY5RGz0rHm9Qk/ZY8qft6KE6QZzXWQ4+pEfvKmzei57kJbuNtiLUCqIipFoJlD0VjncoWGwVL8b7LQ6q1hb9KURqa2TLnbRQs3fKfBo/j0C1etuIVLplgo6dnrt0m2ipWZJHm7G/wG5UMtPDW+aurjd9V1E0IlIPZZHaFvc0dzG+Q3VS6+X61rbKt10v1rW2Re7Xm/8AEa8NZHDJMQcxUcJ/Nwj9Jx6Z/aPwU70rwapIGsqL/J63L9YU0ZxE0+fe4/IeS6BZtP22w0jaW30scETe5o3cfEnqT5lbIDA3UVWFt9dvdkdWEt9dj2zFo7dS0EDYaanjgjb0ZG0NA+AXGOL8Qj1ZE/f26Rh6Z6OcF3ErjXGmHs75b58ey6ne0+eHA/xW+43UbVopc5Wvt+xn0N9GlODX0i1wE7opBEAer3PIbj4kLl+i+HFdqejqbrVulp7bGx7+2+3UvAJJbn7Ocknv7l0S+aSpKzhPTXOanE1XQULKhgeTyBrXdo8Y/aGQe/C6FUxU9TpGUULGtgloj2QYMDlMfsgD4hRWtOb/ANnWcHnPExIRq/Z62z5HY7ma1224XR9G3BtdpyCEnElve6Bw/YcS5jvvcFzeIYiYPAYW30xeRYrxFUSZNLN+YqWg9Y3Hr7wcELVcljfcUSrPp2dS7seNi8rudL7h4q2WeGlhlqqh5jgp4zLI4DJDR4eZOAF6SsMUj43EEt2yOhHcfiN/isG+wmq07doGjJdS9oAM79m4OI+QXzrCx192q7Pk08pbimvciVfru+SRNkpmRUNCXnsgacSBzh4veDl3jj5Lf6d1PLqOeajuMTYbsxjp2ytYWCraN3BzT9WQDcYwCM7LbcP9f6Tg0tS2rUcNO2e3u54TNDzMkwSWvacEcwz71H26mZqzi1arlR0/YwmdkMbCMOewNflzveCfgvpOViQljuHska3Ko+5hOqdWlHf5EpoojO+emBGailmhb5ksJH3gKEsPMxrvFodhTO0l3r1F2Zwe2j5T/aCideGtrasRjDBPIGtaOg5jsp/o+38J1/B8U5+vUlovjpGequrKutpaCkD+ybNUucO0kxkta1oJJA3O2y2WnLS6tvVvmt9VR3OlZVRmSajmDuyAOSXtOHMHmRhYM9dZKSAW69eq1jYCKqFlTHM3lMjRl0RjPtsOAC12N2rAv18p7np+YUdLT00NPVxQQVFPA2F0wcxxkYQ3drAA0gEknvJW6ycufVKPsdRwv0hVlUQnKLTfv7Gy1FpyvtVZLI/sqynlncG1VE7tY3EknlON2u8j8MrD+jblbnwVlVbq6nhZNG7tJad7WDDhuSRgLQaSuE9rvlGKeWohiqZo4J46eR0ZlY44xlpB78/BdhuXCK90d6prjpq/1EEL5GmpgrJ3yDkyObrnnBG3K7PXquTnxUZT69m3z/pavCuSlZr4Ob8XmCLiHeT3P7OUe4xtUx1Bpe7VWj9K1tHSOqaaktbGSiLd7ScOzy948wovxwpjTa4qSAPztHGQPdzD+AX0Xpqm7DT9ugcMdnTxtI9zQFevx1ZX0M3POpXcfRW/g+ZOoGO4+4g/wI+a67w14mOqTFZb5KBUH2YKp3Sb9lx7n/vUh1Xwys2o+eoY31KtI/1iEfW/rN6O/f5rjuptFXnSsjvXqcyUwOBVw5MZHie9p9/zWjjTdiS3HujgFTbiy6l3R9JteXNBAV2VyPhvxNeTFZr3PlxIbT1Tz9fwY8+Pge/3rrTHcwBC3dF8bY7Rt6b42raL0RFOTBMIiApyrV3CLs5eYdHb/FbVYdwiL4SR1achVsqHVDsSVS1I1atJyOqF3crCcLmLLNG0S2XDG+5ReQGckHCKl65nRDHNEckje8OcD816tPXfw6qlyYYLnVRkYxK44+/+KshcTse8r7VW+qCkcRrT0S7RUXNJVTY29lgP3qWBR3RUYFrfKP6SUn5bKRBczky3azcULUEERFATFH/VKjV9qr1WyOtlij7B/Sa4VDcxwD9hv23/AHDvUmPRUx5LzKO1oxJbIzpjQ1s0659S0SVdwlOZq6qPPNIe857h5BSVrQAqqoWIwUfBiMVHwMDwTCIvZ6LT0XKOONO4U9sqQM4fLEfeW5H7l1jBUR4j2CW/Wekhjjc98dbA8hoz7PNhx/ukqaifRPZSzqHbU4oz4rU2bRwtjwMPoewIx4x4WFw6lfW6BsplGZDRsjcPNo5T/wAqk8bOVgaBsNli2S0Q2O2x0NOXGKMvLebqOZxdj/MvDlttlyhuFaifJ+s7FJprVFxtr2OaxkrpIj4xOOW4+ePeFo5f5qTv9k/uX1LxF4aUWuqVr+Y0twgz2FS0ZI/ZcO9p8PiFx6n4G6tdd4qOphpm0ZkHa1bJQW8mdyGkc2cdyxpM+jcd9RUSxei16kkTK82x1BTWuXHsz0cQ+LWAfuK18Dg2aNxxy8wDs9OUnB+4rqeoNNNulmZRxYZJCAYXdwIGMe5QCn0leams9UfRSQ7gPlePYaPEHvXDclx1sMxW1rs2ajC5Gt1NTfdbOI3SkbQ3SupGMLWw1EkYae5occD5YUq4dUMWLjd3NLqmkMdPASdmdq1wc8ftADAPdkrN4n8PrzbtTVNZSW6rrKKs5ZBJBGXlr8YcHAbjJGfBb3TGir3Z9K0/bWupE9dUuqJWBuXRgAMja4eOMu8srqctzWP286Nhy3K1S41KuX5MzLDTSVV6oYYR7XbNft3Nacn7gobXtMdyq2HblqJQc/1iu5aJ0nJaYn1la0CrmGAzr2TfDPie9RrWnCmrr7lNcrNJCDO7mlp5TyjmP2mnz7wVZ+mYrFi3b22fHeY4+y6tOC2zk9xtlRe6GnbSOYKihDw6OR7WB0TnAghziBkOOME9+3esdtvp7LputZc5Q+auqoomxUkrJHwGPmfl53bk56Z6d6nly4OamrNPy08ZoGzPqY5HQOkOHsa0jBdjxOcLSwcFdYU9FXQup6F4miaGRxz9ZGvBaTtjYc3zWyypwlY5RPo/0vm+ngQqyZpNMt4Q2fTtz1ZEamrqpKqnHbwQTRNYyRw79iclvXHTvX0iwDlHuXAdB8JdV2rV1tuNZBS0lNSSmR7hOHucMEcoA967+xpDQPAKoyDn7oXZHVCfUj5/482t0+trMWN/1yNtP8e1aP3PXe6KPs6eNng0BQjiFpSW/ai0lVxQveykuBfOQNmx8pOT5czWqeNIAaMo32KWTk+pTXD4Ll5TQRysLHsa5rhghwyCF6A7qq8OKfZmv0mu5zPVnB2huIkqLK5lBUHcwEZhf8Ps/DbyWLpLWV00rVRae1jHLTsJ5Kasldlp8Guf0I8Hde4rqvLkrCudppLtSvpK6liqYJNnRyNBBVV4yjLqg9Fd0KMuqHYzGvDxsVetNYLE+wxmliqpZqJuOximPM6Efoh/VzfDO48VuQrS3ruWFvXcIiLJkK14BBB6K5UWJLa0CPTs7GV7fArxc7JWxvEfK5ko7/ZK1hwf3ri+RXpWOJtqZdUdnvBFzMz5osqkiPYA4RU1U2tkbt7kM1TB2N8qBgYeQ/5j/stbGSD1/wDmFJdc0vJXQTjYPjLT5kH/ALqMjOQvtOFPqoTOWtjqxnQ9HN5bFD5ucfvK3gWh0Y7NjiaPsucPvz/Fb4Lm7/6kjaV/qgiIoz2FRzg0ZOwCqo7xGJboDUjmuLXC2VJBBwQeycgN761B/to/7wT1qD/bR/3gvzb0NpvUPEPUlNp6zVhFbUte5hnqHNZhrS45O/cF1IeifxS3/wDqVr/x7/wQH2mamJoBMjAD0JcMFVbMx4y1wcPEHK+QfSLst10Twr4cWOuqf9No21EM7oJXFrnYYeu2eq6T6HEstRwsrXyyySOF3mAL3FxA7KLbf4oDuj6iKP672t8nEBUM0bmc/O3l682dvmvk301KqopdRaY7GeWPNHOTyPLc4kHgVvdL1M7vQ0uE5nlMop6vEheeb/WT39UB9LRyxuyGOa7HXlIOFV0zGtLnENA6k7YX518LOK954aaqiu0Es1TSPPZVtI+QltRFncb9HDqD3HyyvrPjNqq3as9Hq8X+x1jpaSpp4ZIpGuw5v51uWnHRw6EIDsLJ45CQ17XEb7EHZWunhBLXSxgjYguGQvkb0L6yoqdZ6gZNPM8C3NID3lwH55viVyni3UVr+LWpqWGqnBddZo2AyuAGX4Hf0QH6HdtCcNErDnbHMFXDSfBfEFR6MnF6ghdVQinnfGOYRwXL84fdkjf4q/hf6QWreG+oIrLqqorK+0Ry9hU01Zkz0ZzguaXb5b+iev3rDSflDbPtzka45AVHPjjdh72t22yQFbTTxTwRzwPbLFK0PY9p2c0jII8sEL4N9IHiNU694m3B1uqZ3W23/wChUgie7DwzPO8Adcu5jnwA8E1vsxs+9o5Y3NBY4OHTLdwrzgDJXy56HPER9QLnoq4VLnvZ/p1D2j8kt6SsGfD2XfE+C7xxO1/RcN9G1+oayPtewaGQw5wZpnbMZ89yfAFEtAk0tRBAwySyMiYOrnuAA+JXjTXO31hLaWspp3DqIpWvPyBXwK6v4k+kLql9JHPU3Kcgydg2Ts6WljzjOPqtbuBk7nzW2v8A6PPFDh1Si900QnERbzyWaoc6WEk/otAcRnwysj/R91uLAOYuDWjqScBVZPE84bIxxxnZwOy+f9QSa7j9F6+ya6lDbx2DXRkHEwh7WLl7Ujbn65x3EZ3yuc+hnV1FVxJuzZqiaRrbPIQ18jnAHtot9z4Z+aA+xcg7jO/wXGuO904jV7qTTmgoG0kUxDqu6ivhgfHv/Nty8OaBjLiBkjYLl/pH+kDdzfqzRulK6Sgo6JxhrayB3LLPL9pjXD6rW9DjcnPcoXY/Rh4laqtDb2+mo6Y1De1jjuFRyzyg7gkYOCf2iCgPrvhfpK56N06Ke9amr9RV85Es1TUzOexhxjliz0aPv6qYOmYwcznBo8ScBfA+keJeveBOrH2q4OqzFTyclZaKqQljm7bsJzynG4c3Yr6A9JTUVPfuAsF9tFS80tdUUk8UjHcpLXcxwceHQjxCA7u2eN/1XA+7dVfNHG3me9rR4uOF8DcDONtfwv1GBXSz1VhrSG1sBcXFncJWA/aHeO8beBXfvStu8VfwfoLla6wS09RXwSRTwSYEjHMcQQR3IDvbJo5PqPa7BweU5wr181+hTUTVNh1MZpZJC2rgxzvJxlh8V9KIAiIgCp3qqphAYdxiElK/bdoyFom4ccAKSVDeaF48QVHom4eB5rkPqCOpxaL2JL8Wjc0seIGoveFuImjyRbGnCXRH/RWcu5o9Z0vbWxswG8Lwencdj/BQcN3Heuo3ClFZQzwH+kYQuYvbyyEEbgkHyIXc8XZuLgazJr77Jdoeo/0aemJ3Y7nA8iP+ylQXO7DX/R9eyVx/Nu9l/uPeuhRuDm8zTkHfK1+dU4Wt/JYof4lyIip7Jgo7xG/8P9S/+11X/ScpEtBxAhlqNC6hhgjdLLJbaljGNGS5xjdgADvWQfnboPUGodL6lprrpcSG7QhwhEcHbEgtId7GDnbK61Hx149mRgNLX8pIzmx4GM/1Fh+jLpi+2zjFZ6mss1zpIWRVAfLNTPjYMxOAySMd6+4WjI3ygPmD01u0fp/R8r2n+eqOY4xglkf/AH+SkfoYzxu4XV8TXgvZd5S5veMxRY/cpxxz4YDipoma0U8kcNxppBVUMkmzRIARyuPg4EjPdse5fIFiuPFPgbdauno6O52maXAmilpO1hlx0cMgtPkQUB0f02ZWP1PpmMPBe2imcW94BkGD9x+SkWmGOj9C6vDmkZpapwz4GpOFxq36O4l8dtWtrK6nraiaYtbNcKyExQU8Y+AGB3AblfVPELRrdN+j9dtK2aCapbR2sU8TGMLnzODmkuwNyScnCA+NuHHDa58TK26UFnlhFdRUT6yOCTrU8pA7Np6AnOxOy87ZrzUOm9L33RjnEW+5kNqKWdh5oJWPBJaPsu9nBHkuyeiFp+8WriFc56+1V9JAbc5gknpnxtJ527AuA32KlXpO8Bn3tsuttL0ZkuDN7lRxNy6ob/tWgdXjvA6jfqNwIl6E++tdQn/9c3/rNXL+KX/jTqH/AN6f/wBRdf8AQ5sF2tGsL9LX2uuo4n29rGvqIHxhzu1acAuAzsuW8WtMajfxT1LWU1jusjTc5ZY5Y6SRzXDmyCCBgoD9AWgdmO/IHmvgz0oJ7dPxlvJtxjdyshZUOZ0MwjHN8egPmCtjNxW4+XaA0TZdQ/nByEwWzkee7ZwZlbvhN6L+pdRXunvOuaWW22pknbSU9Qc1NY7OeUjOWAnqTv4DfIA65qzXVTw69HC1Vk8hZdqm1U9FShxw7tXx4z/ZZk/AL539He/aJ0vrKovmtK0QRwUzo6Rr4HSh73+y5xwD0bnr4qZ+lZWai1RrKk0/b7JdZrbZYA1phpHmOSV4Bc5uBggNDWj3FTXRnof6YqtLWuo1FU3eO7zU7ZaqOGZrWRvcM8gHKemQPggPnW0ano+HfFOO/aYqXVNsoK90lM8tLTNTEkFpB33YS1fRnpd130zws09c7dIZrfUVzJudu4cx0Liwn5/NQbjt6NlLoaz0N30fHd7jGZzBVwu/PPbkZa9oa3ONiD7wpvwRtE/E3gvc+HurbbcKP1B4jpqieB8ZDHEvjc3mAyWODhjwwO9AYPoUT291r1NCOz+kjPC9wI9swcpA94Ds/NfTOwHhjvzjC+CLxw94n8DdR+v26G4Q9mS2G6W5pkhnZ5gA4BHVrgve8cROMXFaBlikdd6yGQhppqGiMQkPdzlrRke84QH1X6RLQOCmqv8A0zf+sxfPXoWb8TLtnr9Dyf8AXhXULxpzXVD6MV6s+qpH3K8+rtEMEI7WaOLtIuWNzh9dwAO4zt3nC596H2nrzauIt0nuFpr6KF9okYJJ6d8bS7tojyguA3wD8kByCmfFScWIXX8gQRX0GtM3QNFR7fN5YznyX6MtcxwJaW4IyMHYju/gvmL0ivRxuV5vFVrHRtJ63LVe3XW5m0hk75Ih9rPe3rncZzgcstPF7jHoq3fk9FU3SCOFvYxxVVBzyQAbBrXObnbu6oCT+mZPb5OIdqZTGM1sVtaKrl6jL3Fgd54J69xC2F/ZUs9DCy+s8wzXB0Yd1EZqJcfDr8FFNBcCNdcWdRG76kiuFFbqiTtau5V4Ilm8o2uwXE9Acco+5d69JPTRg4IxWOxW6eWKkqKSKGnpozIWxsBHQbnA6lAfKWiOGV415p3UN2svLNNYWwyyUYae0mY/nyWHploZnHf3brFfxDvUmgjoeokZUWplW2sg7QEvgcActYc7NOckePgvor0MLHdLQ7VpuNsraITCk7N1RA6MPwZc45gM4yPmFoPSV4AzWy4v1dpG3SzUdZLmuoqaIuNPKT/OMaPsOPUDofI7AST0Iv8A7Bqj/wBVB/yFfTK+cvQ0s9xtFi1Iy40FXROkq4S1tRC6MuAYenMAvo1AEREARFbkoCyoOIXHyK0dMztJWjxK29dIY6Z5z3YWvtrOaXPgFyfM/wAzLrqRapfTBs2wAAG6K7ARdRCqKikVGypUA1NQ+qXSXAw2XErfj1+9T9aPVdEZ6IVDW+1AcnzadirmHb6dh5nHaIMMtPRSrTd/a1jKOpdy42Y8/uUeMO+FTssHbIK3l9Ubo9yKKaOmtcCM5CqofZdQy0oEFYe0h6Nf3t9/kpZDNHNG2SN4e1wyCFz9tMq3pk6PRafWN0nsmk7xdaXs/WKKimqI+cZbzMYXDI7xkLcdy1OrLXLfNMXa1U72RzVtHNTsfJ9VrnsLQT5bqLfyZPn2y8YuMs+gWcRJbfpe4WCPmfPTRCSKoEbHlrnD2iOo8/cvfW/pD38ah03Bpmv09arVerQy4esXuN5ELyXgtc5p2xyY2HVLTwJ4qx6IZoCfV1hotOOLhMaWF753Mc7mc3JAyCSfBZ+rPR7vo1Lp24aSm06+islpZbmU97hM7ZCC/LnMwWnPPnO2CsdS+QdK4UX+9an0x9I3q62C6yPqHNiqbKXdgWDGx5t+YHOVoeC/Ei9cQbnrGlvDKNsdmuXqtMIIyz2Mv+tknJ9kKR8NLFqTT1klo9Rt082Vs5dBHZKbsIGRnBOW7DmLskkBcu09wk4t6IvGoarTF+0tDT3mudVvbUxPkcN3cv2dtnFOuPyDa8c+MWotEXaisujbfBca+KkkudwbJEZBBSs+1gEcvec+GF1XSeoqTV+m7bfaB4NPX07Zm4OS3I3afMHI+C4/H6OdfqvU1+1LrfUNRDXXJwjjZY6h0bGwcobyO5hkjYez0Uw4JcPL7wysdw0/dLhSV1uZWOltroi7tI4nEktfkADfB27yfJOuPyDmVPxq4i33VGp7bQ3/AEDaKa0XGWkibeXmGSRoe4NLcv8Aa+rufEqRcX+MmrNEfQVk07Q0N01BJQOuV0EcTpY44mNy5zQHDAJDzk9AB4rK0h6O1qp9RaquusbbZr2LrcXVdFzNc50DHPe4tOcAfWHTPRYJ9HKs1LrK/wCotV6gqacVjhBRQ2WodF2dKByiN5I3HKGjlG3VY64/IMnijx2rtO8L9Na30xHRztu08QfFUgua1pYS9mxGHBzSM92Fh8U/SVpdP6Bsl70o+Ce53xglgiqMvbTxt/nC9oI3DvYHnk9y1sfo56og0jFpM3m01Nvt+oGXOgdUB5Pq+Dzse3GAeh5Rscu3WfqP0V7W+1au/J6WlZcL2+M0batmI7cwStkkYwtBI5sEZA2GB4r0mn4B7v40amHEKewNZQCjj0sbyMxO5+39XEm55vq8x6eCmnBbXF14gcM6PUl3FM2umM4cIIyxnsOIG2T4eKibuBt9/LufUIuNu9Xk0z9ChmXc/a+rCLm6Y5eYZ8cLw4acNOLegaC2WBt+0s+wU8/NPEIXumdE52ZA1xA3IJwsg9+HfHK43ThLqPW2phRtktFTNDEynYY2yYa3kbgk5Jc4BZPAni7qDXFfdLHrOiht17pooq2CFkRi7SmkaCHcpJzjLTnwcopB6NmqnaJpNF1F9tkdrmvklyuL4S/tHxcrQxjcjBOzyc7Z5fBb+i9Huv0hr+w6r0rqGpqfViYbhFeah0r5YCOXkY4DubnAO2QEBvON2peI2jLbPqLSr7D9DUFL2tW2tjc6Yv58ezggYwW/etVpjiZre1cN7hr/AF1JYHW19tZV22Kha5sj5H/VY/JPUlo2810DihpWr1xoG8adoZ4IamvgEbJJyeRp5gd8ZPcue6p4J6j1RoPRGhpLvQUtqtTIhd3xl3aTmNoAEe2MbuO+N8ICvBjjRedTR36h1zSQ2y7WunZcRHHEYi+kczm5uUk5xtv4OHetNp/iRxm4iUFTqrRtm09TWBtQ5lJRVpPrFW1pw7LuYDPXfYZ23ws6H0dKvTWurRqHT1/qK6kEb6O6wXmodK+ale3kLGOA/RJwDsCGnyWPZ+EHFfQdLU6c0TrS0Q6dlmdJDJWQF1VSBxyeXYgnx7j1wMoDYVHHOr01xgfpfV9XZ7PZ47VHPI8lxLapzWksEn2hkuxsNgo5L6ROoqrS3Ea+2ya1VMOn62mitcrYHFksUkxZzO9r2vZAI6KXs4Jz3Pi4/V+p3WW+W59rjpHw1FOHGSoaxoMvZuBa0ZDiNzjKjc/o53pmnOIlnoKuzU0WpKymmt8TOZsdPHFMX8rhjbYgDGeiGdF184t8Rrhrqx6V0w7TkElwsUFzfJcInBnO5hc/B5umwwMLU3H0kdVx8ObndfULPBf7Pe4rVUSDM1LIHNkJfH7XjH3EgjcLfXr0bH6r1jabhf6qmktFJY4rbJHTyvZMJ42FrZG7YwCcjPhuFrZfRz1OeE0uhI63TzZYrwyvgrGse01EQa4ES7fXBcMdRjZBozdP8XNZ1Nm1HdZ9T6DvAtlolrI6e1tldIyUY5C8Ej2dyD54Wgi9K6413CmsudO23U2rqCeFkkErSYqmF7iDJGzmznbcZ269CpdbeFOvvoa92euGg6OmuNrmomyWq3+ry9oQAwucBu3bdR7UvopTXvQGnqGnrLbTantURp6ipaCIKqMvcQHYGeZoIwcb7jwQaPTVXHfVv5bnTFvuWmdNsgoIKn1y9tfyVkkkbHYYRs0e0QM+B3WTxC4za50lJoq3i4aQpKu9Ub562tk55KJjw7ZzXh2eXHfvuVs9ecKuIWoj6jTS6HuVp9UipYWXWhLp6LEbWuMb+UnJIJByOoWkuXo36mpLbomlstzsFbJpyKo7X6Vic+Gd8shfjs8EFgzgZ8MpsaOn8H9T3/Vdnq6693vTV4AqBHBNY+fs2gN9prubvzj4LoKgnC3TmptOUFZTaibpmMOla+njsVJ6vGBj2i4ADJJxup0EMFUREAVCqqx7wxpcV5nJRW2NbNfc5B7Mfed16WyPEZeR1KwXvNTUk+JwAtxCzs2Bo6YXJ8fvLzpX+y8Fif4w0emETCLrV/srlVZKxskbmOALXDBB7wr0IyFkEDq6J1HUyQEE8h2J729xXl2O+dlKNQ0PawipYMvj+t5t/wCy0DWfFbnGu64HnpPAQjO4Wdbqua3SZiPNGT7UZ6f/AOqxrAvRrNlm3UlpkiiSmlqmVcLZWAgHxXpIHFhDdj3FYdo2oWDzP71nZytJZDe4mPBrhS1ffUk/2VX1Wr/3k/3VsE+S1T4mtvbbPfqM1/qtX/vH+VPVav8A3j/Ktgix/Ca/ljrNf6rV/wC8f5U9Vqv94/yrYfBPgn8Jr+WPUNf6rV/7x/lVPVKv/eT/AHVsUwn8Jr+WOsi2rbDqO72OaksOofoave5hZWdgJOQA5IxnfIXP/wCSzjL+uU//AMWz8V2nCqr+Njxpj0xPDeziv8lnGX9cv/Cmfiq/yW8Zf1y/8KZ+K7SisGDi38lvGX9cv/Cmfin8lvGX9cv/AApn4rtKIDi38lvGX9cv/Cmfin8lvGX9cv8Awpn4rtKIDiv8lvGX9cn/AAtv4rJoOHHFame81vFV1Y0gBrRb2swfmuwqhCw1s91zcH1I5T+QXEbO/EF/+Eb+Kr+QXEX9YMn+Eb+K6rj3phePTRb+/n8L/iOU/kFxG/WDJ/hG/in5A8Rv1gyf4Vv4rq2Ewsekh9/P4X/Ecp/IHiN+sKT/AArfxT8geI36wZP8K38V1bCYT0l8j7+fwv8AiOU/kBxG/WDJ/hW/iq/kDxF/WDJ/hG/iuq496YWfTXyPv5/C/wCIi+ibHf7LTVEd+v8A9MyPeHRPMIj7Jvht18VKAmFVe0tdinOXXLqYTKKhKyzyVJwtZc6r+hacE9fJe9dWCmj23cdgFqYmOqJAepJzlcxzfI9vt6u7ZZpr/uZm22Aud2jsbbBbQArzgiETGtHcvXK2nFYf21Ci/JDZLqlsYREWy0eAiIsgte0EYIyD3eKi1dRGiqDHj2D7TD5eHw/BSsjKw7jRCshMfRw3afAqSiz05GURsNV464VMOa4seC1zTghXALZ7TWyVI9WyPAw17h06Fe8FXNC/n5nOHeCe5Y4Vw6KKVaZnpJHFIJWhzTkEK/C1FsqCx5iJIDjkeR8Fts5WvnDpeiGS0yqKiqvGjARETQCIiaAwiIsgIiIAiIgCIiAIiIBj3qiqiAY96Y96IgGPemPeiIBj3oiIBhCcBFR3RGBlYtZWMpYy4nLj0b4qytr2U4LWnL/DwWmkkfM/ne7JK0HKctGlOEPJZpocu78F0kr6h/O87nu8FtLdTdm3nI3KxrfSdo/ndnAW3a0NC1nDYE7bPurj3fYkuiJcAqqiquxRTCIiyAiIgCFEIQGpu9v7TNTE09o0e0B9ofiFp2uBGR0UtIPwWiu1sdE51VA3Ler2j96tY9uvxkSwl7Mww7BV7XZPcseORp3Dgcr1Y8FXWiyoM9mEghzeo3C31LOJomu8Qo+D13WxtEwJdH07wqmRDa2R2w7bNqN0VAdlXPvVMqhERAEREAREQBERAEREAREQBERAEREAREygCJlMoChx4oVQuwsOpuUUOQ0l7v0QoLboVrcmZjFy8GXJI1jSXEAea1VZdS7LIQcfpfgsSeolqjlx2HQDuXjsDhc7ncs5JxrL1WL7yKcxJ9rJ8cr3pKU1Eg7m+KthpnVLw1vTvK31NTNhYA0BavAwJ5dnVPwe7rlBdMS6GJsTA0DYL1VMFVXc1Vxriox9jW72ERFIAiIgCIiAIiIArXDmyCMq5MICOXazvhc6elb7PVzB3eYWsZMVNS0ELSXWzB/NNTgB/Ut7irtGRr8ZFqm7vqRqmzHxWRTVXYStf4Hf3LB5SwlrgQQr2nHVXZQUkX/SUkS6GdszA5pByvVRehuD6N2+8R6jwUip6qOoYHMcCPJaq2pwZrbqXW/8HvhFTKZURAVRUyqoAiIgCIiAIiIAipn3KuUARMqmUBVFTKpze5Y2gXKh2XhJWwxfWeM+AWJNcyc9mzHm4qCzIhHye41ykbAuAGSQAsWe4xR7N9s+S1sk8sxy+QkeC8y0dzVrb+QetRLEMb3Z6zVs02xPK3wCxyCeuMK4uA8/erCc4J+S0190p/sW4QUfCKOdy/V6/er4Kd1S8Bo95V9LSPqXbbN7yt3T0zIGhrR0TE46eS9y7Ijuv6FpeS2lpW07AAFkhU5VXousoojTFQguxrpSbe2ERFOYCIiAIiIAiIgCIiAIiIAeitIz1VyIDX19riqgXAcr8bOC0NRSSU7i2RpHg4dCpcV4VFOydvK5oPvCnqvcHplmnIcHp+CJYLQvSGZ0B543GM/d8lsqu0Pj9qIc4/R71rHRYPQghXVZGaNlGyFqNrT3t7cCZuR+k1bCK40049mUZ8Dsoxy4OVdv3qvOmJDZhxfdEubI13R2VcCFEWyyMOWve33OXsy4VbOk5PvVeVeivLCkvBKcoo4LvWN6vaf7KvF6qvBnyKjfYj+0sJAi0P0zU4+qxDd6o9OQfBeHNIfa2G+ymVoPpSsd9to/sqw1dW/rO74bLw7kPtZkgyBvkKx00bB7T2t95Wh55n7GZ5/tJycx33Pmo5ZGvB6WL8s3L7hTx/0rT7t14vu0f2WOd9y1wZhV5VBLJkeljRRkyXOZ31WtZ968HzSy/Xe4/cqAAndO5VZ3TfuSqqKKAd/RU5Rnqru5UxjwVSTfue/BQ7dFR2T7vNVOB028yqxQS1DvzbQR+megULjKb1FBySXc8XEHbfy8Vl0dtdLh8oLW9w7ys2lt0cJ53e0/xKzMYCvY3GbfVYVbcjf4xLY4mxNDWtAAV4xnzVUwt3CCitIqPuERF7AREQBERAEREAREQBERAEREAREQAqmFVE0ChCxam3xVI9puD4jqstFlNrwZjJx8GgqbPNHkx/nG+WxWAWFjuVw38DsVLV4zUkM/84xrveFKrX7lqvLlHtIjHs53y0+BCva1p7wVt5bMzcxPcB4HcLCktU0e/Z582H+C8ymmW45UWY3KPBVDArzTuZ9p7f6wVWskPQtcq8mSeon4ZaGDzCvbGO8lV5Xgbs+SuHTdpHuUTPDnsoGAdyqG+Kq0bdD81cB4A/NQs8tlA0dFUNV2FUArxI87KcoVMYV2FTv6Z9yhY2UVM57l6thkf9WMr1ZbpH/Xdyjw6rx6M5Hl2xRiH/4Ar46eWbZjMeZWyjoomD6oJ8SsgNDRgDHuU0MHb/IglkfBgw2trcGQ8x8O5ZrGBmwGArlUK/VRCH6orynKXkomFVFNo8hERAEREAREQBERAEREAREQBERAEREAREQBERAEREBQIURYYBCtOyIiMMOa0jcA+9eMlJC77A+GyIjPcWzHfSRg7ZHlleDowxxwSiKCZagyx2xVMoigkTHoGAgHJV7IWuIJJ3RF5iRMyo6SLGS0n3le7YY29GNHwRFPFIqybL8BOiIrCR4HcnciLKMlQiIsmAiIgCIiAIiIAiIgCIiAIiID/9k=",
  "SOC-18": "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",
  "SOC-19": "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",
  "SOC-20": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCABeAVQDASIAAhEBAxEB/8QAHAAAAgMBAQEBAAAAAAAAAAAAAAcFBggEAgMB/8QATxAAAQMDAgMEBwEJDAgHAAAAAQIDBAUGEQASByExE0FRYQgUFSIycYGRFhcjQlZyk6GxJDM2UmKisrPBwtHSJSZDU3WClOE3Y2R0kvDx/8QAGwEAAQUBAQAAAAAAAAAAAAAAAAECAwQFBgf/xAAyEQABAwIEBAQFBAMBAAAAAAABAAIDBBEFEiExE0FRcRQyYYEGIpHR8KGxweEjJFJy/9oADAMBAAIRAxEAPwDVOjRr5S5LcOK9Jd3ltpBWrYgqVgDJwBzJ8hoQou7LibtmjPT1BpTgwEIcWQCcjJ5AkhIyo4BOAdeKBczNXoSKo8hMcDKXML3o3Dkdivxhnv8AI6pVUqpvG6YbFHqLSGnGHowcSzl1pC05U6AVDKFBI2uJPuqylQOcCk8bL4cnT/uWpT5bp0EbJJa5B53vTy/FT0x3nPhrNqKzhtLwfQepWZPW8MOk3A0A6lMidxotaFJMc1GKVA4P4QnHzKQQPt1JxL9jz46ZMVDD7KvhcbeCkn6gaySpkjpy1J23ccy15vbsqUqOvlIYzhLifHyUO4/2awZa6sIJjk16WH2WKManzfNstSrvhCOsZP6T/tr4K4htJIzCJHk5/wBtL1yYQAVBaNyQoBaSlWCARkHpyI1zrm+eufd8RYiDbNb2H2Vg4jP1Too1wQq42pUZZC0fG2vkpP8A289SedIujXG5RaozNbJUEHC05+NB6j/73jVqqfEiVV6gxTLebLRecS2l9xOVHJ6hPQDv5/q11GH/ABHG+C9R5xpYc+llowYk1zLyeb90ytGvKMpQApWT3nx1611C1EaiqpdVBobwYqtapsBxQylEqShokeW4jOpXSE9LEA021sgH/SK+v5o09jczrJHGwunXSrio1c3+yqtAn7Pi9WkIc2/PaTjUhpB+kmkWhOtm9aKEw6wxKUyt5obS82EbwlePiHukYPco6t1Z4uuIq1apdJjRC/Raaia8mUpWZDy070x2wnnnb1Vz5kDaeel4ZsCEmbWxTO0aUsvjmyqt0ylNMR6W5UaSiewaqFoSt9ZIRHURjs+aVArORnAxqaq/EtyJctOtZtuHFqb9NNRluSyezjcsJbwCCpRVnv5AZ59NNyORmCYGuOq1mm0OP6zVJ8SBHKgntZLqW0Z8MqIGdLxjjKZlAtZ5FIci1m4p3qCIknclMdSVYccOQCpIGCOhVuA5c9VvjJV7gqnCO7Y9w0VNOXCntMMSEKy1Na7VJS6lJJKeXUEnnpWxkkAoLtE8GXm5DSHmXEuNuJCkLQchQPMEHvGvelLaXEasU+67Xsyq0uC1FqlGbkw3mHlLdb2tnk5kBPMIPw9MjmdfsrjXJVb9xXXT6dHfolCqKYKm1KUHpSdyUrcSr4U4KxtBBzjmRnRw3IzBNnRpXVzjVFi3TDoUNcKOJ1LRPhyahuQ1Kcc/emtwOG8gfEc8+WNMmC6/IgsOyGuwfW0lTjf8RRAyPodNLSN0oIKipN821DqK6bIrkBqU2driFvAdmr+Ko9Eq8iQeepZM6KqF696w16r2fbdsVAI2Yzuz0xjnnWcaRetQ4QLn2RxDt1cyhTZL601BtG8SEuqJUpQPJwHOSM7x0wcDTErVx0eabZ4bUkNz41ep2TIW4oITBQ2cH3SCorCMYyOWc6eYyE0OV8XdVBbpaKsqtU1NNcO1EwyUdio9OS87e49+vx666ExLpsRyrwUv1QboSO2TmSMZyj+MMEaTl4XrFurghetNRT2KfKoLqac/Gj/vICHkhKm/BJCTgd2CPPXZHuOHSZvCeny7cptQdnwmURZzpIehK7NAUUjaQc5HeOml4aMyck+pQqVFVLnymIkdHxOvLCEJ+ZPIa/YFQiVSK3MgSmJcZ0ZbeYcC0LGcZChyOlPc1/SrytziRDpsSMKZQ4r0FTjij2klzs1dopPclKccgQSrHdrhsy/UWJwRsstRkyp9UcTAhsqVtTvW8sFaiOe1I5nHM8h350nDNvVLmF07tGly7xXNIrl2UGqwkPTqBT/aba4uUpls7AojaSShQJAPMjBz3Y108NeIj1/ssy2VU56KqKFyPVypLsSTkZZWhRPLBJC+isHkNNLDa6XMNlaqrdFCobzbFVrNNp7riStDcqShpS0jlkBRGRriTxCs5ZCU3XQVFRCQBPaOSeg+LrrsnUSAua9WFx0LmiIYyXVAEpbyVEDwyTz8cDw0kfRlokCv8O7gp9RjIfjvVHCklIyMNIIIPcQcEHuOlDQWkpCSDZPap1inUWMJVTnRYLBUEdrJdS2jcegyogZPhrrSoLSFJIIIyCNJziVfaWnK1Mk28labOkxpEVNSStLM91wYKmyCElSQo7eSu84GrNM4oIcfs+nUyKj1+6WxIbD5JTFZDe9SlAYKj+KACMnvGNGQ2RmCuFVrtKoTaHatUodPbcVtQuU8lpKj4AqIyfLXaFBSQoEEHoRrP3G6sV6s8H+1uSh+yJzFdbY7NK9yH0J3YdR3hKu4Hw1dre4j1p3iK7Y9WpcCO4umpnQ3Y7ynNox8DmQMnzTy5d/XS8M5boza2V7otxUm4mn3aRUYs9uO8ph1UdwLCHE9UnHfqR0kbW4ms0vh3d1x0m0qVTlUipLS/FjulKJSiUhS9wRyJKvA9NWq3b+uqtMM1x21W2rddo5nodZkdpJW8AD2YbwOSue3lzGCSM40hYQgOCYmjSlgcaJ669ZsSbSmWWbnbVmMdyJMBzOE7wr4knuOE56jTaGkc0jdKDdGjRo01KjVJv69YUCBLpUOXGVPc/c7o9YLZihxJwokA7STgAnkCRkjV27tUFiwpce5+0clTXqaoOuNPNPhpxlS3Atxt0Y/CpWQMHuCcEdDqCcvtZnNV6gvy5Wc1X3qj9wdlP1ltMVuoVgJbhNxmS2017nNwIOdpON6gORO3r10kXGlKUVKJUokkknJJ7yfPWua7b1MuSAYNTiofZJ3JzyKD4pI5g/LSWvHg1UqNvl0YrqUIcy2B+HbHyHxDzHPy1z+LUlRcPYLtA5fqVm1tG8gZdQEqVMeWrlwlsP7rrlS9Ka3U2nlL0jI5OK/Eb+pGT5Dz1As09+XJbix2VOPurDSGwOZWTgD7dabsy127Ltlqnx2w9ISkuvqTyLzpHPmfoB5Aaq4TAaiTM7yt3+yp0VCJJMzhoFAcUreUuIK3ERlbACZASOqO5X0/Z8tKhyb56uF3yOIdxKU05Q50WF3Ro+FA/nKByr9nlqkSLduJnPaUOqIA7zGX/hrMxeETVJliYQDvcbnqitGeUuY0j2Qub56YHBykGfUZNZdSS1EHZNHxcUOZ+if6Wlc5BqSDhcGYkk4AUwsZPh01pOyKAm2bZhU4gdslG94+Liuav18vpqfAcPz1Gdw0br78vun4dBnlzEaBV+6eIdRtyoBh+lw4jAS48lyZMG+S22RuCEoB2qUD7u4jJGOur2w6l9lDqc7VpChkYOCM9NUTiTT1LjCtQHdpZw1JEdZSt4hQ7JJKQSQlaj7uRgr3Z93GrNa1TcqFIZTKUBOYSG5KFONqWFgdVBCiElXXGeWddrG48QtJ7LZie4SuY49lMaVHHLh1cfEdFIjUZFPbRT31SFOypCkbyQBtASg+HXTXzo1aa4tNwrJF9Er7n4b1vibXaRIur1Cn0SlLLwp8R5T7kpw4+NwpQEp5YwATgnx5c79k3bavFeoXfbcOFVadW2UtzIj8v1dbK0gAKCtpBGU56E81DHQ6bGjOlEh2SZQlRxM4c1LiBT5EWpUeDJmNxEez58d8NqjyTnehW7mpn4fEnnyBxrhqHDO67auy2LrtwxaxJp9MapdRjSXywZCUp2laVkHr59CkdeenLnRoEhAsjKClXxNsG6bxg0GuU9dPjXJQ5Zlsxu0UWSklJ7PtCOahtTzwAefTlro4gWzeHEXhzMo71PpVNqExbO1ky1LSyEq3KKnAjnnGAAOXie5maM6BIRb0S5UpRw5uVfESzLkWzATEodMRBkIEolalbFpKke5ggbh1IJx3ai5HB+vQrOuiyKamOuHWqomXGnuOgCOyVIUpK0fEVJ2YGMhWRzGndr83Dx0vEckyhKK/uEi7loIoCaQxKTTqezHo9RD6W3mXUp2qS6D1aOEk4yeZwM4OmTQaS9R7agUp6QqU9Ehtx1vE83FJQElX1I1K5GjOdNLiRYpQANUsZtFvWq2Kq063QqTVZT8X1f18y8MIVtwlxaVJ3708j7mckZBGeXNF4SSbWr9lVulL9oewICqZLaWoNrfQUqw4jPLIUtXukjkevLTXJA79GR46UPI0CTKEkvvN1/7gbxgpMP21dc8yVoW+Q1Fb7TelJUEkqIGc4GMnyzrqncNLplVTh3MQxTgi1WUIkpMs5eICQdnufyc88ddOPOjS8QoyhJhHDS6KAOINIpUSHNp90JdfiyHJPZmO4tKgpC04yfi5EcuXPGhXB+uOcNrTpTqoIrdsTUS2koeUWpCQ4VKQVFI2kg8jgjIHceTn0Z0cQoyBK9iwq4u+LqvrsIzU2ZATCpsF9YWDhCcqdIykBRSBgZwCflr52LwoFrcRZty06EaNTJEDsV09L4cSp9SwVFGOjYAGAeeScADlpqZ0Z0mcoyhctUMn1B8RGEPvlBCELc2Ak8uasHH2aW/Avh9cPDekVCl1lEBwSZHrKHor5WB7iU7SCkeGc6aWdGmhxAsltrdI28uGd9XRU73MlunzmZ8dDNGeellPqjYWFFtDe0hKlYAUrlkjqQdfetcL7t9nWHX6Q1BTcdsR0R3oTkj8E+gAAgOYHPkc/nHny5uvOvzcPHTxKUmQJXcUrNu3iTY7FMREpcCaqa3JLK5SlJZQhJ5FYR76iT3JAHnoZsO408YWL2VHgiC3SxBLIlEu79vX4MYzy6+flppZGjSZzayMoSMpnCG7YfDq8bZcRS/Wq9M9ZYcTLUUNpUpJIV7mcjb3Dnnu0w6NQ7hpXDFihx1xo1diUz1Rh0Ob2g8lG1K84HLOD05eerhozoLyd0BoCz9TeE98NTbEqcqnU5c2kTXZFTdXUCt6Upawe1Wsp944GMe9jA6DpoBOcc9fujSOeXbpQAEaNGjTUqpl23tUrckKbRRStjlskuOHYs48hy+ROqPUeLdzLBDCYMb81oqP846blblxoFKkyJbaHWUIJU2oZCz3Jx5nSBnM9o4texKNyidqBhKc9w8tcXj1VUUsoDZjZ2ttre4WJiEssTgGv35dF8KjxDu6UT2lclISe5kJbH80abXCa7V3JQDGmPF2fBIbcUo5U4g/Cs+J6g+Y89JSTG68td1k3Cu0bljzySIyz2MkDvbUeZ+hwfpqlheKvjnDpXEg6G5VSkq3MlBeSQVoM2xRlVhNZ9mxvaCAQJARhXPlnzPn11KY15bWlxCVpUFJUMgjoR469a75jGt8o3XSgAbL8xoxjx1+6Dz09Kq9c98UO0281CWC+RlEZr3nVfTuHmcDSZu7i7WrgC40NRpkI8tjKvwix/KX/YMfXX240267R7kNVTuVGqfvbjz2upABT9mCPr4aWrr3nrj8Srql0roT8oHTmsKtrJA4s2TB4R3SzT627QajscptZHYrQ5zT2pGBnyUCUn6am8TbDukR0vOLfSnY21HR2TLqCoFKinkgADIOELxk+9kckyt9SVBSVFKgchSTgg9xGn9Hqb188P4NypXJ9dhNuMTWGH1NCQn4VlW3OQP3zGFctwwc6sYbITHwidRqP5+6r0s/FGS/wAzdR25poRJBlxGn+zca7RIVscTtUnPcR3HSE4hcXeIdg3LIpMhujrZ/fYr5iKw80TyPx9R0PmPMabfD+dJmUBtt+JMYbjEMsLlAhbzYSMKO4AnwzgZxnv1QPSeisKs+mSlNIL7c8IQ5j3kpU2rcM+B2j7BremcTFnabLucAfFJUMZKwODtNeSXyvSVvZPxIog+cZQ/v67qR6TdysSkKqlNpkyKSN6Y6VNLx/JJURn56lPRggxZouL1mMw/tMfb2jYVj4+mRrn9I+xqbRlU+4aXEaietOqjym2UhKFK27krwOQPJQPjy1VHFEfFDl07hh5rTQuhA9fa/snhErf3VWqKrbMxgLlMFcV19G5KV+C0gg8iMEZ5c9Z+qPpB8QqRPkU+dEpDEqM4WnW1RVZSodR8ep/0X7jdUqr246sqbQEzWAT8OTtWB8/dP26r3pMRWWL8iONNIQt+noW6pIwVqC1pBPicAD6akllc6ISNNlSw+hhhr30UzA4bgn6/t+q+Q9JC+iMhikEeIiL/AM+vK/SSvlCSSzRwcE84ix/f1feD/Eaz7e4eU6BVq7BizGS6VsuE705cURyx4Y18rgYZ492JVqlTIIYlUuW4imbhhx5KUJKkq8N+eQ7iE+em2eW3D9eimL6VkxZLSgMBtm97DkrNxF4ou2VY9OqTbbLtWqbSOwQoe4lRQFLWR4Jz0z1I0nk17jZIbTXG1XIqOsdqlSI47Mp65De3p9NdfpBdsGrNacStKBSfhUMYV7gUMePTXXbvpMVWnRGItVocacGkBHbMPFlagBjJBBGfljRJKC8te4gBOo6J0dI2WnhbIXE3v0vYAXRR+P8AddamUWhvNRI77s9lmVLbQQtxBWkFOw8kHqCR9ANaErtbg25SZVWqTwYiRUFxxZ8O4Ad5JwAO8nSGertk8Urno9TprblDuZiay4pqSEpbnJSsEp3p5FzAOCcE9OfLHX6UFxuo9kW40spbcCpr4B+LB2oB+u4/ZqRkrmMc4m/RUaihjqamGBkfDJvmH2/jkqxW+M9+X3WvULXEqC04T2ESCgKfUkd6146464wB+vXu2eN95WZWjT7r9anx217JEeU2EyWfNKsDJ78HIPiOurV6LtDa9RrVcUgF5bqIaFEc0oCQtQ+pUn7NR/pRUNpifRK02hKXJCHIrpA+LZhSSfoVDUREgj42bVaIdRurDhvBGXa/O9r77/2mre97KpXDiXddBejyMMtuxnFpKkLClpHMZB6E8vHSLPpK3sFY2UTPh6srP9PXm0azOrfB25LUaC332pcT1NocyQ88kbR5bwT/AMx0w72sSn2TwJnU9thhyWy00p6T2Y3LdU6jcQeoHcPIDT3PfIM7TYWVWCmpaJ3h52B7i+w7WGv6pfH0lb2SMlFEHzjK/wA+r9wY4vXFftzyaZV0QAw3DU+gx2ShW4LQOpUeWFHVD9G6KxLvuY3IYaeR7NcIS4gKAPaN88HTFtmxfuI43yXojQRS6rT33o4SPdbXvQVt/Q8x5Hy02AynK8u0upcUZQxmWmbEGuDbgrt40XveFgphVKjIgO0x49i927Clqad6g5ChyUP1jz0rB6SV8qISlmjqUTgARFkk+Xv6vPpO3CY1AptBZVlya+X3EjqUNjkPqpQ+zSLuagT7JuJdOfVtlxeyeQscuZSlaSPkTj6abUyPa85TopcEoqaalaZowXG9vUA7/U2WyLSXW3rehO3F6uKo6gOPoYbKENk8wjBJ5gYBOeudTJ6aibVrjdy25Taw0RtmR0PEDuUR7w+hyPpqUcWlttS1nalIJJ8BrTbsuKlBD3Aixvsl9xZ4sRuHcJuPGbRLrElJUywo+62np2i8c8Z6DvPyOkSxxF4q3JJcnU6oVqSGjlSYEbLTfkUpSR9udVi8Lhk3ldU+rOqKlS3yGQTkIbztbSPIDH69bJtW3otrW/Bo8NpLbUZlKDt5b1Y95R8ycnVBpdUPNjYBdZLHBhFOzNGHyO3vy/LpKW16RFUVBRR6xTwquqlMRm3+z2IKVLCVFxH4qgD0HI5HTGtAjS24s8Oo1dVT7jhR0pqtOlx3HFIHN9gOJ3BXiUjmD5Ed+mSNWog9pIebrCxB9NI1klO3KTe49dNvRfKYmQuK6mK4ht8oUG1rTuSlWORI7xnu1mmrcf8AiHRKnKpk+NR2pUVxTTqDFVyUD3e/0PUeR1pp1aW0Fa1BKUglRPcB36xrW2JvECp3fdjJJYhqElQxnLanAhAHyQM/TUNW5zQMh1Wj8OwQyuf4hoLRbU9SbD6pu8JOJ988Q7jMeS3S26XER2kt1uMoK58koSSsgKJ/UDp3jWafRluH1K56hQnVYbqDHbNj/wAxv/FJP/x1pYakpXF0dydVUx6FsNWWMaGtsLW/OqNGjRqwsZVy/GHH6CrYCQl1ClDy/wD3GlTJjdeWnrIYbksrZdSFIWkpUD3jSur1DXT5TjRBIHNJ8R3HXBfFlFIJW1bdRax9Fh4rAcwlG2yosmN1yNWZHB+bULfjz2JKETnU9oqM8MJKT8I3dxxjry592oubUaVb7sebWUvLhh5IU2ykKW4eu0AkcuXPy1a0ekNaigMQqx+gR/n1XwKkp5WOkqTYbD7qnSNpzfju/OqsnDRdXZoPs2tQ5EeRT19ghTo5ON4ykg9+ByyPAat2lknj7bKvhg1b6tI/zasVo8SKReU12FBalsvNN9rh9AAUnIBwQT4jXaUtVTta2BslzsOq3oJosoY111aycagrwuyJaFIVPkJLrhOxlgKwp1XgD3DHMnu1MyZDUVhx99xLbTaSta1HASkDJJ1nK9bsdvOuOSklSYbQLUVs9yP4xHirr8sDu1Hi2ICkhu3zHb7plbVcBmm52Tqu63mr6s9yIUht59pL8ZSv9m7jKf24PkTrKMwOxn3GH21NPNLKHEK6oUDgg/IjWl6XxSoTMCNHLU8rbaQg4aGMhIHjpX8RLYi3fcq6vQnRERKSDJRJQR+EHLcnbnqMZ8x56x8SrKOQNkEgzc1k4oWStEkbgXc0qnHfPWluA9Mk060G+3SpHbEvlJ7t5JT/ADcH66oVqcI4Tclp+e+qou7hsYDexoq7s5yVfLkNaApkBFPhtsJxkDKj4nvOnYSBUTCSPyt5+u1kzBqR/E4ruS6QNKD0nf4DQP8AiSP6tzTgzjWcfSPvyPVZrNpwdriYDvby3Rzw7tIDY+QJJ8yB3HXR1TgIzdd7gUT5K1haNtT2Uh6K/S5PnH/v6nfSddbTY8Bo43rqSCn5BtzP7RpL8POJ9V4b+vezYMKV67s3+s7/AHducY2kfxtfG+eI1wcSJkVNSSylDJIjxIrZwFK5EgZKlKPIaoidgg4fNdQ/CZ3Yp4s2DAQd+gVx9GVhxd9TXk57NunLCz+c4jH7Dr16Tv8ADinf8NT/AFi9MrghYDthW1JqNZSmPUJ4DryVnHq7SQSlKj3HmVHwzju0iuLl7t35eDs+K3thRkCLGVjm4hJJ3n5kkjyxp0gyU4a7cqOkk8Vi75otWtFr+1lLWfwKrd523GrsKrU5hqRv2tPJXuBSop5kDHUaZPB+V97nh3cT1xNrhqplQd7ZpXxFQbRhKfHcSMY65GlrZ3HWvWVb0ahwqXTH2I5WUuPdpvO5RUc4UB36jb/4t13iFCYhTo8OHGaWXVNxQoB1eMAq3E5wM4+emskijAc3zWU1TR19W90M9uEXXvpcAH+QmxxQgI4kW5aTZ7CJW6nHXLg71YbW5sQpUck9NwPI+KB46QdZtiuW6+pmrUmdCWk4/CskJPyV0P0OmlxfdeYsDhq6wtxt5EXc2pskKSoNtYIxzznpqStH0lkswUQ7spj0pxA2mXECSXPzm1EDPjg/QaWUMe+zzY6fsosPfVU1MHU7M7bu02I1O3okQ24pKkraWUrSQUqSeaSOhB8RpgcX6pIuB21q5IyVzqGypSvFxK1hf6+f11+8V71oN+VOnm26CuItrchbhZQhyUpRG1O1Gc4IOMnPvaZ99cIplQ4U0KJEa7StUKMD2aerwKQXWx4nPMeYx36YyIkPaw3CuVFexj6eWduQkkWPIEfey+3owSkLs6pxwRvaqBUR5KbRj9h+zUf6U76BTbej5G9Uh5zHkEAf3hpY8K+Jb/DWrynHYjkuDLSESI6VbVpUknaoZ7xkgg+Plrn4l3/K4l3G3MTEWww0gR4kUHesAnJzjqpR7h5DT+O3gZOaqMwqUYsakj5N7+231V79F6IXq9XH1NhTTcZkcxkBe8kH58jppcdP/CuuD+Q1/Wo144K2E7YtphM5ARUp6xIkp/3fLCW/oOvmTqp+kdfrEKk/chE2uy5oQ7KPXsWgrKR+cogfQHxGrAHDp7O/LrHkf43Fw6HUAj6Ntc/oqZ6Mv8Ppn/DXP6xvWnFstrWhxSElaM7VEc05GDjWOOFN7JsK8GKnIb3w3kGNKwMqS2og7h5ggHzAOtS3tekO0rPk3DvbeSGwYoSch9xQ9wA94Oc/IHRRvaIteSd8R0srq0Fo8wAHfZZ14xXc3N4tLlKaTLi0V1qOlhStqXOzO5aSR0yskfTVe4jX6eIdaZqzlMYp77bAYWGni52gBJBOQMEZI1IcKK5SI9/IfumHGnMVHe0t2UgLQ064oEOEK5YJ5Z7t2dX70hZNp0WnsW7S6JTWas6tEhx2MwhtUdsZwCUjqrw8Bnw1VIL2Ofm06LfY5lNUw0oiJcG2Dr6W56furD6NFxe0LRl0VxeXaZIJQCf9k57w+xW/TYqzK5FLmMt/G4w4hPzKSBrIXCe/FcP7qbmvJKqfKSI8xIGSEZyFjzSefyyNbCYktS47b7DiXGnEhaFoOUqSRkEHw1dpJA+O3MLmPiCkdT1ZkA+V2o78/wBVg2Gv1aVHW4Mdk4gqB7tqhn9mt6NOoebS4ghSVgKBHeDzGsn8buHUi0LkfqcZhRo1SdU604ke6y4rmps+HPJHiD5al7K9IqpW1R2KVVKSmqojIDTL6X+yc2DkArIIOByzy1Wp3iBzmPW3i9K/FIIqil1tfTvb9rLQt2V1u2raqVYc2bYbCnQF9FKA5J+pwPrqTZcDrSHACApIVjwyNZok3xcfHW5qdbjERMCkB5L8hlpRX+DSclbi+WcdAMAZI6nXdxn4g3NQeJseLTJ0mLGp7bC2Y7aiEPlfNW9PRWfh5+HLVnxQsXctlhjA5C5sBIEhBcfQaW9ymtxluI23w7q0htex+Q36oyf5Tnu8vkncfprN9mcSm7Ptur0P2HGnIqwKH3XJBQQgo2hIASemSfrq4ekZe/tirxbain8DTvw0nBzl9SeSf+VJ+1Xlq58JpNiVjh4mZOotGaeo7PZ1BciMhahtGe0JIyQoc/nkd2oXkyTWabW/CtOljbR4cHzRl2cg6G3/AJ/rus/2bXlWvdFKrCVHESQha8H4kdFj6pJ1uJpxLraXEKCkKAKSOhB6HWHbuqcGuXLUajTKeiBBkPFTMZKQkITgAchyGcZwOmdaQ4DcRUXVbyKJNWBVKW2lsg/7ZkckrHmOQP0PfptFIGuMd1L8TUr5YmVQbYga+l/sU1NGjro1pLiUah7kpnr0TtUJy60CQB+MnvH9upjQRy1BU07Z4nRP2KZIwPaWnmstcY3FN1KmxU5DQZW981KVj9iRqjsK0+ONXDqTV2G6hTGt70cqUlA/HSrmpHzyMj6jw0hkoWw6pp1Cm3EHCkLG1ST4EHmNcYIDA3gOGrfy/uuJq4XwzkOUkwemmlwJV/rbI/8AYr/po0qmFeemlwIP+uD4/wDQr/po02iH+3H3Wjh5/wAjVO8aL1JUbYgrIHJc1QP1S3+wn6Dx0sYbfTTh4u2H7WjGv09rMyOn90ISObzQ7/NSf1j5DSnhI6d+osfErakmXY7dk7EA8THP7dlKwm+nLU9CbzjUVCb6ctWy2qQ7VZqGm0nYDlxeOSB/jrmRG+aQRRi5KpsYXuDW81crOpexsTHE9Pdbz+s/2fbq0jXzYZQwyhpsbUIASkeAGvpr1rD6NtJA2JvLfuusgiETAwIIzqqO8KbHfdW67a9KcccUVrWpkEqUTkknvOdWvRq4QDurLJHs8hI7KpfeksT8lKR+gGpGjWNbNvPdvSqFTYT3+9aYSFj5K6jU5o0gY0ck91RK4Wc8kdyuao02JVoT0GcwiRFfSUONLGUrSeoPlqtfeksT8lKR+gGrdo0paDuE1k0jNGOI7FVL70lifkpSP0A0feksP8lKR+gGrbo0mRvRP8VP/wBn6lRC7Toq36W8qnsFVJSpEFO33Y4IAykdMgJAB7u7UBdHBuzbskLlzaX2EtfNciIssrUfE45E+ZGrto0FjSLEIjqZo3BzHkHuqLafBez7OnIqEGE9ImNnLb8t3tVNnxSOQB88Z1esaNGhrA0WaE2aeSZ2eVxJ9VR7r4M2fd8xc6bAXHmOHLj8NwtKcPiodCfMjOvpaXB+0bMlJmU6nqdmI+GTKWXVo/NzySfMDOrpo0nCZfNbVS+OqOHws5y9LoxyxqtVHhrZ9WmvTp9u06VKfVvceda3KWfEnVl0acQDuoGSOYbsNuyqX3pLE/JSkf8ATjUhLsW2p9LiUmXRYT8CHzjxnG8oa7vdHd1Op3QemkyN6J5qJTYlx09SqieElhkY+5Skf9ONfaZwxsyoSVypdt02Q+vG5x1rcpWAAMk+QA+mqLWONFxUk3FVfYFHeoNAq5pkg+0VomO4U2NzbZb2k/hE4G7ngjXbVOLdbFSepVIotNdmfdG7QmjMlraaIRFD/aKUlCiCckYAOjI3ol8VNe+c/Uq0feksT8lKR+gGrHTKXDo0FmBT47caKwNrbLYwlA8AO4ag3bol23ZMu4rtYhRnILDsiQ3TnlPt7U52hClJSSSMDmBzOo607qvWp1GImvWaxTqdPjqkMyY08PqikYIbfSUpwog9UbhkHShoGwTHzSPFnuJ7lW6oU2HVYbsKdGZlRnk7XGnUBSVjzB0uZno52JKkl5tioRUk57FiUQj+cCR9uu/iVxFrdil2dFtkTqJAjIlT5zsrseSnQjsmRtO9wZ3YO0YwM5Oo+PxpKrsfhSaQlqgiXNp7NQS/lxciIz2ru5vbgIICwk7ico5gZ010bXeYXUkFXPBfgvLb9CrpatlUGy4aotDp7cVKyC4vmpx0jvUo8zr3VLOoNbqsKrVGlxpU6Ccx33E5U3zyPI4PMZzg8xqi29xsXKp8+VXaC5CcRTotYgx4TipTkqNJKksowEgh3cAkjmBuBzgHXHUOOz0e0rTqTFNpaancURyalmdUkxYzCGwCoF5Q+JRUhCRgZKueANLlFrWTDPIXmQuOY876q7SeFtlTJDsmRbNLdeeWXHHFsgqWonJJPeSdfrPDCzI7D7DVt01tmQEpebS1hLgSdwCh34PPVdrV/wB50u5bcp6bcoyo1fkNtMtGorMtlAbC31rSlBbw2N3NKyD7uPi1DNekF2sKv1lujwZFHpzDzkfsKm2qWVIeDKA8xjc0l1RylQ3AAc+o0ZG9EviZrWzn6lXX70lifkpSf0A12Unh5alBntz6XQKfClNghLzLW1QBGCM/LVGn8bpdGpUuNVaTTYdxxau3SHGXajshIUtntw+p9SQUthsEn3c5GO/TEtKsyrgtyn1WbCbgyJTQcWw3JRIQnzS4glK0kcwR3EdDoDGjYINTM4WLz9SpcDGjRo05Qo0aNGhC8rQlSSFAEHqD36Vd7zon3RvQGrco84sCO2n1mCpwvOublFvtQQlvCBu55+WmseeuF2hUx8vKdgx1l95EhwqQCVuIxsUfMbU4PlqCaESDkoKiIyNsEt4NRsapOJZgWM0+86jt2kCM0nexjJc3KIA7vdJz7yfHXXRrpotJZqsukW4y0I3a9q/HZQ0lCE7y2lWVblE9mSdvQEHGrj9xdubUI9iwSlDvbJBaBwr/AA5Dl05dNCrLtxakqVRYJKWiyMtDkjny/WftPjqFtO4G4Av2/pQNglG1vp/S4LUvZFySVU9yMpuU1GQ+44gpU0ok7VbSCcDcFAZ7h5aoHECy/YFRM+E3tp8pRO1I5MudSn5HqPqPDTYptv0qkPPP0+BHjOPcnFNpwVDJVj5ZUTjzOumfAjVOI5ElspeYdGFIV36r4hh3jIDG8/MNilmpTNFlkPzcioOj2nQnKZEdVS4pWtlClK2dSUjOp6NEjw2w1HZbZQPxUJAGvbLSGGkNNp2oQkJSB3Achr1q7BTRxAZWgH0CssiawaBHTRo0asKRGjRo0IRo0aNCEaNGjQhGjRo0IRo0aNCEaNGjQhGjRo0IRo0aNCEaD00aNCEiapwSqhqNYu6FTKWu6I9zqq1OU+tJTLhkIBZcJBCc++RyylQBBGdd0zhDUK3XlrrNMgzKS/dr1XeYecStKoyoIaTlPeQ4OnlnTo0aEKrXFw+pdW4fVCyoDLNMgyYbkZlLCMIYJyQQnwCueNUCn8PLyuC9aTWq9Dh0FdOhvQ5lQplWdcdqBUwppCmmykJa2lW8EgnOOunRo0ISXvWx7ydrVu0+LAkXVa9H/dbjdRrCWnp0veSgvKKDvQ2MYTjBPXpr8Z4SXDJuuRFmepN28mpVSrNy0vFTzq5rCmuxLePd2Fxw7skEbeXXTp0aEJVcMbBuSiyX51wsQY70ShRLdiIiyC6H22N5L6iUjbvKhhPMjBzqtzOD9xt2jY3ZUqkVOqUKlyqXKgTHwloh9vZ2iV7VDKCM4xzBOCDp86NCEtbO4e1egXTQH6g61LhUK12qSw/v5qklwdqoJPMApbQAfDlqk07gfcEJT1O9lW+5BpsSqsxnnnlH2z624FobkJQkKQGwMZ3Eg4KemtAaNCEgYvBOuRaQKwikwF1VFwMVlNFmVFclC2W2S12S5K0kqcOSvcQQDgaaPCm05tk2LTqJUFMGU0p51aI5Jaa7R1bnZoJ6pSF7R8tW3RoQjRo0aEL/2Q=="
};

function renderPhases() {
  const track = $('tlTrack');
  const legend = $('tlLegend');
  const list = $('phaseList');
  track.innerHTML = '';
  legend.innerHTML = '';
  list.innerHTML = '';

  const phases = sortDocs(state.phases).map(function (p) {
    return { raw: p, s: parseISO(p.start), e: parseISO(p.end) };
  });

  if (!phases.length) {
    list.appendChild(el('div', 'empty', 'Sin fases cargadas todavía.'));
    legend.appendChild(el('div', 'tl-leg-item', 'Sin fechas de fase cargadas.'));
    return;
  }

  // Rango del plan: meta si es válido, si no el mínimo/máximo de las fases.
  let planStart = parseISO(state.meta && state.meta.periodStart);
  let planEnd = parseISO(state.meta && state.meta.periodEnd);
  const valid = phases.filter(function (p) { return p.s && p.e; });
  if (!planStart && valid.length) planStart = valid.reduce(function (a, b) { return a.s < b.s ? a : b; }).s;
  if (!planEnd && valid.length) planEnd = valid.reduce(function (a, b) { return a.e > b.e ? a : b; }).e;

  const totalMs = (planStart && planEnd) ? (planEnd.getTime() - planStart.getTime()) : 0;
  const today = new Date();

  phases.forEach(function (p, i) {
    const shade = PHASE_SHADES[i % PHASE_SHADES.length];
    const d = p.raw;

    // --- Segmento de la línea de tiempo (proporcional a su duración) ---
    if (p.s && p.e && totalMs > 0) {
      const spanMs = Math.max(0, p.e.getTime() - p.s.getTime());
      const widthPct = pctOf(spanMs, totalMs);
      if (widthPct > 0) {
        const seg = el('div', 'tl-seg', txt(d.name).replace('Fase ', 'F'));
        seg.style.width = widthPct.toFixed(2) + '%';
        seg.style.background = shade;
        track.appendChild(seg);
      }
    }

    legend.appendChild(el('div', 'tl-leg-item',
      '<span class="sw" style="background:' + shade + '"></span>' +
      txt(d.name) + (txt(d.pillar).trim() ? ' · ' + txt(d.pillar) : '') +
      (p.s && p.e ? ' · ' + fmtDay(p.s) + '–' + fmtDay(p.e) : '')));

    // --- Bloque de calendario ---
    const isToday = !!(p.s && p.e && today >= p.s && today <= new Date(p.e.getTime() + 86399000));
    const block = el('div', 'phase-block' + (isToday ? ' today' : ''));
    block.innerHTML =
      '<div class="phase-row-top">' +
        '<h4>' + txt(d.name) + (txt(d.days).trim() ? ' · ' + txt(d.days) : '') + '</h4>' +
        (p.s && p.e ? '<span class="phase-dates mono">' + fmtDay(p.s) + ' — ' + fmtDay(p.e) + '</span>' : '') +
        (isToday ? '<span class="today-pill">Fase en curso</span>' : '') +
      '</div>' +
      (txt(d.pillar).trim() ? '<p class="phase-pillar">Pilar: ' + txt(d.pillar) + '</p>' : '') +
      '<p class="phase-milestone">' + txt(d.milestone) + '</p>';
    list.appendChild(block);
  });

  // --- Marcador HOY: solo si la fecha actual cae dentro del plan ---
  if (totalMs > 0 && today >= planStart && today <= planEnd) {
    const pct = pctOf(today.getTime() - planStart.getTime(), totalMs);
    const marker = el('div', 'tl-marker');
    marker.style.left = pct.toFixed(2) + '%';
    marker.setAttribute('data-label', 'HOY · ' + fmtDay(today));
    track.appendChild(marker);
  }
}

function renderStaticTables() {
  const pb = $('platformBody');
  pb.innerHTML = '';
  platformRows.forEach(function (r) {
    pb.appendChild(el('tr', '',
      '<td class="rowlabel">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td>'));
  });
  const rb = $('reportBody');
  rb.innerHTML = '';
  reportRows.forEach(function (r) {
    rb.appendChild(el('tr', '',
      '<td class="rowlabel">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td>'));
  });
}

/* ============ 5 · KPIs + PANEL DE ESTADO EN VIVO ============ */
let kpiSig = '';

function kpiCardHtml(k, kind) {
  return '<p class="piece">' + txt(k.piece) + '</p>' +
    '<div class="kpi-row"><span class="k">Métrica</span><span class="v">' + txt(k.metric) + '</span></div>' +
    '<div class="kpi-row"><span class="k">Meta</span><span class="v">' + txt(k.goal) + '</span></div>' +
    '<div class="status-btns" data-kind="' + kind + '" data-id="' + txt(k.id).replace(/"/g, '&quot;') + '">' +
      '<button type="button" class="status-btn g" data-status="g">Bien</button>' +
      '<button type="button" class="status-btn y" data-status="y">Proceso</button>' +
      '<button type="button" class="status-btn r" data-status="r">Atención</button>' +
    '</div>';
}

function buildKpiSection(containerId, items, kind) {
  const c = $(containerId);
  c.innerHTML = '';
  if (!items.length) {
    c.appendChild(el('div', 'empty', 'Sin KPIs cargados todavía.'));
    return;
  }
  items.forEach(function (k) {
    const card = el('div', 'card kpi-card', kpiCardHtml(k, kind));
    card.querySelectorAll('.status-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setStatus(kind, txt(k.id), btn.dataset.status); });
    });
    c.appendChild(card);
  });
}

function allKpis() {
  return sortDocs(state.kpiWeekly).map(function (k) { return { kind: 'w', item: k }; })
    .concat(sortDocs(state.kpiSpecial).map(function (k) { return { kind: 's', item: k }; }));
}

function syncKpiButtons() {
  document.querySelectorAll('.status-btns').forEach(function (wrap) {
    const kind = wrap.dataset.kind;
    const id = wrap.dataset.id;
    const arr = kind === 'w' ? state.kpiWeekly : state.kpiSpecial;
    const item = arr.filter(function (k) { return txt(k.id) === id; })[0];
    const cur = item ? kpiStatus(kind, item) : null;
    wrap.querySelectorAll('.status-btn').forEach(function (btn) {
      const on = cur === btn.dataset.status;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  });
}

function renderStatusSummary() {
  const all = allKpis();
  const total = all.length;
  const counts = { g: 0, y: 0, r: 0 };
  all.forEach(function (x) {
    const s = kpiStatus(x.kind, x.item);
    if (s && counts[s] !== undefined) counts[s]++;
  });
  const none = Math.max(0, total - counts.g - counts.y - counts.r);
  const pct = Math.round(pctOf(counts.g, total)); // total = 0 → 0%, nunca NaN

  $('segG').style.width = pctOf(counts.g, total).toFixed(2) + '%';
  $('segY').style.width = pctOf(counts.y, total).toFixed(2) + '%';
  $('segR').style.width = pctOf(counts.r, total).toFixed(2) + '%';
  $('segN').style.width = (total > 0 ? pctOf(none, total) : 100).toFixed(2) + '%';
  $('cntG').textContent = counts.g;
  $('cntY').textContent = counts.y;
  $('cntR').textContent = counts.r;
  $('cntN').textContent = none;
  $('statusPct').textContent = pct + '%';

  const circumference = 150.8;
  $('statusRingFg').style.strokeDashoffset = (circumference - (circumference * pct / 100)).toFixed(2);
}

function renderKpis() {
  const w = sortDocs(state.kpiWeekly);
  const s = sortDocs(state.kpiSpecial);
  const sig = JSON.stringify([
    w.map(function (k) { return [k.id, k.piece, k.metric, k.goal]; }),
    s.map(function (k) { return [k.id, k.piece, k.metric, k.goal]; })
  ]);
  if (sig !== kpiSig) {
    kpiSig = sig;
    buildKpiSection('kpiWeekly', w, 'w');
    buildKpiSection('kpiSpecial', s, 's');
  }
  syncKpiButtons();
  renderStatusSummary();
}

function setStatus(kind, id, status) {
  const arr = kind === 'w' ? state.kpiWeekly : state.kpiSpecial;
  const item = arr.filter(function (k) { return txt(k.id) === txt(id); })[0];
  if (!item) return;

  const prev = kpiStatus(kind, item);
  const next = (prev === status) ? null : status; // volver a pulsar = quitar el estado

  if (fb.live) {
    item.status = next; // actualización optimista; onSnapshot confirmará
    syncKpiButtons();
    renderStatusSummary();
    const col = kind === 'w' ? 'kpiWeekly' : 'kpiSpecial';
    fb.api.setDoc(fb.api.doc(fb.db, BRAND_SLUG, 'plan', col, txt(item.id)), { status: next }, { merge: true })
      .catch(function (err) {
        item.status = prev;
        syncKpiButtons();
        renderStatusSummary();
        toast('No se pudo guardar en Firestore: ' + (err && err.code ? err.code : 'error'));
      });
  } else {
    const key = kind + ':' + txt(item.id);
    if (next) localStatus[key] = next; else delete localStatus[key];
    safeStorage.set(LS_PREFIX + 'status_v1', localStatus);
    syncKpiButtons();
    renderStatusSummary();
  }
}

/* ============ 6 · CHECKLIST ============ */
let checkSig = '';

function buildChecklist(groups) {
  const wrap = $('checkGroups');
  wrap.innerHTML = '';
  if (!groups.length) {
    wrap.appendChild(el('div', 'empty', 'Sin checklist cargada todavía.'));
    return;
  }
  groups.forEach(function (g) {
    const items = Array.isArray(g.items) ? g.items : [];
    const group = el('div', 'check-group');
    group.dataset.group = txt(g.id);
    group.appendChild(el('div', 'check-group-head',
      '<span>' + txt(g.title) + '</span><span class="cnt">0/' + items.length + '</span>'));

    items.forEach(function (it, ii) {
      const domId = 'chk-' + txt(g.id) + '-' + ii;
      const row = el('div', 'check-item');
      row.innerHTML = '<input type="checkbox" id="' + domId + '"><label for="' + domId + '">' + txt(it && it.text) + '</label>';
      const cb = row.querySelector('input');
      cb.addEventListener('change', function () { setCheck(txt(g.id), ii, cb.checked); });
      group.appendChild(row);
    });
    wrap.appendChild(group);
  });
}

function syncChecklist() {
  const groups = sortDocs(state.checklist);
  groups.forEach(function (g) {
    const groupEl = document.querySelector('.check-group[data-group="' + CSS.escape(txt(g.id)) + '"]');
    if (!groupEl) return;
    const items = Array.isArray(g.items) ? g.items : [];
    const rows = groupEl.querySelectorAll('.check-item');
    let checked = 0;
    rows.forEach(function (row, ii) {
      const cb = row.querySelector('input');
      if (!cb) return;
      const on = itemChecked(g, ii);
      cb.checked = on;
      row.classList.toggle('checked', on);
      if (on) checked++;
    });
    const cnt = groupEl.querySelector('.cnt');
    if (cnt) cnt.textContent = checked + '/' + items.length;
  });
  renderProgress();
}

function checklistTotals() {
  let total = 0, checked = 0;
  sortDocs(state.checklist).forEach(function (g) {
    const items = Array.isArray(g.items) ? g.items : [];
    items.forEach(function (it, ii) {
      total++;
      if (itemChecked(g, ii)) checked++;
    });
  });
  return { total: total, checked: checked };
}

function renderProgress() {
  const t = checklistTotals();
  const pct = Math.round(pctOf(t.checked, t.total)); // 0 ítems → 0%, nunca NaN
  $('progBar').style.width = pct + '%';
  $('progPct').textContent = pct + '%';
  const circumference = 150.8;
  $('ringFg').style.strokeDashoffset = (circumference - (circumference * pct / 100)).toFixed(2);
}

function renderChecklist() {
  const groups = sortDocs(state.checklist);
  const sig = JSON.stringify(groups.map(function (g) {
    return [g.id, g.title, (Array.isArray(g.items) ? g.items : []).map(function (i) { return txt(i && i.text); })];
  }));
  if (sig !== checkSig) {
    checkSig = sig;
    buildChecklist(groups);
  }
  syncChecklist();
}

function setCheck(groupId, idx, checked) {
  const g = state.checklist.filter(function (x) { return txt(x.id) === txt(groupId); })[0];
  if (!g) return;

  if (fb.live) {
    const items = (Array.isArray(g.items) ? g.items : []).map(function (it, i) {
      return { text: txt(it && it.text), checked: i === idx ? !!checked : !!(it && it.checked) };
    });
    const prev = clone(g.items || []);
    g.items = items;
    syncChecklist();
    fb.api.setDoc(fb.api.doc(fb.db, BRAND_SLUG, 'plan', 'checklist', txt(g.id)), { items: items }, { merge: true })
      .catch(function (err) {
        g.items = prev;
        syncChecklist();
        toast('No se pudo guardar en Firestore: ' + (err && err.code ? err.code : 'error'));
      });
  } else {
    const key = txt(g.id) + ':' + idx;
    if (checked) localChecks[key] = true; else delete localChecks[key];
    safeStorage.set(LS_PREFIX + 'checklist_v1', localChecks);
    syncChecklist();
  }
}

function resetChecklist() {
  const t = checklistTotals();
  if (t.checked === 0) { toast('El checklist ya está vacío.'); return; }
  if (!window.confirm('¿Desmarcar los ' + t.checked + ' ítems verificados del checklist?')) return;

  if (fb.live) {
    const ops = sortDocs(state.checklist).map(function (g) {
      const items = (Array.isArray(g.items) ? g.items : []).map(function (it) {
        return { text: txt(it && it.text), checked: false };
      });
      g.items = items;
      return fb.api.setDoc(fb.api.doc(fb.db, BRAND_SLUG, 'plan', 'checklist', txt(g.id)), { items: items }, { merge: true });
    });
    syncChecklist();
    Promise.all(ops)
      .then(function () { toast('Checklist reiniciado.'); })
      .catch(function (err) { toast('No se pudo reiniciar en Firestore: ' + (err && err.code ? err.code : 'error')); });
  } else {
    localChecks = {};
    safeStorage.set(LS_PREFIX + 'checklist_v1', localChecks);
    syncChecklist();
    toast('Checklist reiniciado en este equipo.');
  }
}

/* ============ 7 · REPORTE IMPRIMIBLE (KPIs + checklist en un solo documento) ============ */
function statusLabel(s) {
  return s === 'g' ? 'Bien' : s === 'y' ? 'En proceso' : s === 'r' ? 'Atención' : 'Sin evaluar';
}

function buildPrintReport() {
  const t = checklistTotals();
  const pct = Math.round(pctOf(t.checked, t.total));

  const all = allKpis();
  const counts = { g: 0, y: 0, r: 0 };
  all.forEach(function (x) {
    const s = kpiStatus(x.kind, x.item);
    if (s && counts[s] !== undefined) counts[s]++;
  });
  const kpiPct = Math.round(pctOf(counts.g, all.length));

  const now = new Date();
  let dateStr, timeStr;
  try {
    dateStr = now.toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
    timeStr = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    dateStr = now.toISOString().slice(0, 10);
    timeStr = now.toISOString().slice(11, 16);
  }

  let html =
    '<h1>Reporte de progreso — Plan Comunicacional Integrado</h1>' +
    '<p class="rep-meta">' + txt(state.meta && state.meta.eyebrow) + '</p>' +
    '<p class="rep-meta">Generado el ' + dateStr + ' · ' + timeStr + '</p>' +
    '<p class="rep-meta">Origen de los datos: ' + (fb.live ? 'Firestore · proyecto ' + FIREBASE_PROJECT : 'almacenamiento local de este equipo') + '</p>' +
    '<div class="rep-overall">' +
      '<b>' + counts.g + ' de ' + all.length + ' KPIs en estado "Bien" (' + kpiPct + '%)</b>' +
      '&nbsp;·&nbsp;' +
      '<b>' + t.checked + ' de ' + t.total + ' ítems de checklist verificados (' + pct + '%)</b>' +
    '</div>';

  html += '<h2><span>Estado en vivo · KPI por pieza semanal</span></h2><ul>';
  sortDocs(state.kpiWeekly).forEach(function (k) {
    const s = kpiStatus('w', k);
    html += '<li class="status-' + (s || 'n') + '">' + txt(k.piece) + ' — <b>' + statusLabel(s) + '</b></li>';
  });
  html += '</ul>';

  html += '<h2><span>Estado en vivo · KPI por publicación especial</span></h2><ul>';
  sortDocs(state.kpiSpecial).forEach(function (k) {
    const s = kpiStatus('s', k);
    html += '<li class="status-' + (s || 'n') + '">' + txt(k.piece) + ' — <b>' + statusLabel(s) + '</b></li>';
  });
  html += '</ul>';

  sortDocs(state.checklist).forEach(function (g) {
    const items = Array.isArray(g.items) ? g.items : [];
    let groupChecked = 0;
    const li = items.map(function (it, ii) {
      const on = itemChecked(g, ii);
      if (on) groupChecked++;
      return '<li class="' + (on ? 'done' : '') + '">' + (on ? '☑' : '☐') + ' ' + txt(it && it.text) + '</li>';
    }).join('');
    html += '<h2><span>' + txt(g.title) + '</span><span class="rep-cnt">' + groupChecked + '/' + items.length + '</span></h2><ul>' + li + '</ul>';
  });

  $('printReport').innerHTML = html;
}

function printReport() {
  buildPrintReport();
  document.body.classList.add('print-mode');
  window.print();
}

/* ============ 8 · NAVEGACIÓN Y ATAJOS ============ */
const navBtns = Array.prototype.slice.call(document.querySelectorAll('.navbtn'));

function goToSection(index, focus) {
  if (index < 0 || index >= navBtns.length) return;
  const btn = navBtns[index];
  navBtns.forEach(function (b) { b.classList.remove('active'); });
  document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
  btn.classList.add('active');
  if (focus !== false) btn.focus({ preventScroll: true });
  const target = $(btn.dataset.target);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navBtns.forEach(function (btn, i) {
  btn.addEventListener('click', function () { goToSection(i); });
});

document.addEventListener('keydown', function (e) {
  if (!document.documentElement.classList.contains('gate-unlocked')) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.target && e.target.isContentEditable) return;
  if ($('fbDialog') && $('fbDialog').open) return;

  const current = navBtns.findIndex(function (b) { return b.classList.contains('active'); });
  // '1'-'9' van a las secciones 1-9; '0' es la 10ª (como en el teclado numérico).
  const digit = e.key === '0' ? 10 : Number(e.key);
  if (Number.isInteger(digit) && digit >= 1 && digit <= navBtns.length) {
    goToSection(digit - 1);
  } else if (e.key === 'ArrowRight') {
    goToSection(Math.min(current + 1, navBtns.length - 1));
  } else if (e.key === 'ArrowLeft') {
    goToSection(Math.max(current - 1, 0));
  }
});

/* ============ 9 · CONEXIÓN FIREBASE FIRESTORE ============
   Colecciones esperadas bajo la raíz "{BRAND_SLUG}/plan/...":
     meta/main            (documento único)
     pillars/{1..4}
     symbols/{1..3}
     weekly/{miercoles..domingo}
     specials/{1..3}
     phases/{1..4}
     kpiWeekly/{1..5}
     kpiSpecial/{1..3}
     checklist/{grupo1..grupo3}
     accountSegments/{1..4}
     newsSources/{1..13}
   platformRows y reportRows son iguales para las tres marcas y quedan
   fijas en el código (no viven en Firestore).
   ================================================================ */
const fb = { app: null, db: null, api: null, auth: null, authApi: null, user: null, live: false, unsubs: [], connecting: false };

function fbConfigKey() { return LS_PREFIX + 'fb_config_v1'; }
function loadStoredFbConfig() { return safeStorage.get(fbConfigKey()); }
function storeFbConfig(cfg) { safeStorage.set(fbConfigKey(), cfg); }
function clearStoredFbConfig() { safeStorage.remove(fbConfigKey()); }

function effectiveFbConfig() {
  const stored = loadStoredFbConfig();
  if (stored && stored.apiKey && stored.projectId) return stored;
  if (FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId) return FIREBASE_CONFIG;
  return null;
}

function setConnBadge(mode, label) {
  const badge = $('connBadge');
  const t = $('connTxt');
  if (!badge || !t) return;
  badge.classList.remove('live', 'loading', 'error');
  if (mode) badge.classList.add(mode);
  t.textContent = label;
}
function setLoadbar(show, label) {
  const bar = $('loadbar');
  if (!bar) return;
  bar.classList.toggle('show', !!show);
  if (label) $('loadbarTxt').textContent = label;
}

/* Convierte los datos de un doc de Firestore en algo siempre renderizable. */
function docOr(fallback, data) {
  return (data && typeof data === 'object') ? data : fallback;
}

function teardownListeners() {
  fb.unsubs.forEach(function (u) { try { u(); } catch (e) { /* ya desconectado */ } });
  fb.unsubs = [];
}

function attachListeners() {
  const api = fb.api, db = fb.db;
  const root = function (col) { return api.collection(db, BRAND_SLUG, 'plan', col); };

  // meta: documento único
  fb.unsubs.push(api.onSnapshot(api.doc(db, BRAND_SLUG, 'plan', 'meta', 'main'), function (snap) {
    state.meta = Object.assign({}, DEFAULT_DATA.meta, docOr({}, snap.data()));
    renderMeta();
    renderPhases(); // el rango de fechas de meta afecta la línea de tiempo
    scheduleFirstPaintDone();
  }, function (err) { onFsError('meta', err); }));

  function watchCollection(col, targetKey, onAfter) {
    fb.unsubs.push(api.onSnapshot(root(col), function (snap) {
      const rows = [];
      snap.forEach(function (d) { rows.push(Object.assign({ id: d.id }, d.data())); });
      state[targetKey] = rows;
      if (onAfter) onAfter();
      scheduleFirstPaintDone();
    }, function (err) { onFsError(col, err); }));
  }

  watchCollection('pillars', 'pillars', function () { renderPillars(); });
  watchCollection('symbols', 'symbols', function () { renderSymbols(); });
  watchCollection('weekly', 'weekly', function () { renderWeekly(); });
  watchCollection('specials', 'specials', function () { renderSpecials(); });
  watchCollection('phases', 'phases', function () { renderPhases(); });
  watchCollection('kpiWeekly', 'kpiWeekly', function () { renderKpis(); });
  watchCollection('kpiSpecial', 'kpiSpecial', function () { renderKpis(); });
  watchCollection('checklist', 'checklist', function () { renderChecklist(); });
  watchCollection('accountSegments', 'accountSegments', function () { renderAccountSegments(); });
  watchCollection('newsSources', 'newsSources', function () { renderNews(); });
}

let firstPaintPending = 0;
function scheduleFirstPaintDone() {
  firstPaintPending++;
  clearTimeout(scheduleFirstPaintDone._t);
  scheduleFirstPaintDone._t = setTimeout(function () { setLoadbar(false); }, 500);
}

function onFsError(where, err) {
  console.error('[Firestore] error en "' + where + '":', err);
  setConnBadge('error', 'Error de conexión');
  setLoadbar(true, 'No se pudo leer "' + where + '" de Firestore (' + (err && err.code ? err.code : 'error') + '). Mostrando el último contenido disponible.');
  toast('Firestore: no se pudo leer "' + where + '"');
}

/* Inicia sesión anónima si aún no hay una activa en este navegador.
   Se espera SIEMPRE antes de marcar fb.live = true, así ninguna
   escritura (setStatus, setCheck, seedFirestore) puede dispararse sin
   una sesión de Firebase Auth ya establecida — que es justo lo que la
   regla de Firestore exige para permitir escribir. */
function ensureAnonymousSession(authApi, auth) {
  return new Promise(function (resolve, reject) {
    const unsub = authApi.onAuthStateChanged(auth, function (user) {
      unsub();
      if (user) { resolve(user); return; }
      authApi.signInAnonymously(auth).then(function (cred) { resolve(cred.user); }).catch(reject);
    }, reject);
  });
}

async function connectFirebase(cfg) {
  if (fb.connecting) return;
  fb.connecting = true;
  setConnBadge('loading', 'Conectando…');
  setLoadbar(true, 'Conectando con Firestore (' + FIREBASE_PROJECT + ')…');
  try {
    const [{ initializeApp, getApps, getApp }, firestoreMod, authMod] = await Promise.all([
      import(FIREBASE_SDK + 'firebase-app.js'),
      import(FIREBASE_SDK + 'firebase-firestore.js'),
      import(FIREBASE_SDK + 'firebase-auth.js')
    ]);
    teardownListeners();
    const app = (getApps().length ? getApp() : initializeApp(cfg));
    const db = firestoreMod.getFirestore(app);
    const auth = authMod.getAuth(app);

    setLoadbar(true, 'Iniciando sesión anónima…');
    const user = await ensureAnonymousSession(authMod, auth);

    fb.app = app;
    fb.db = db;
    fb.api = firestoreMod;
    fb.auth = auth;
    fb.authApi = authMod;
    fb.user = user;
    attachListeners();
    fb.live = true;
    fb.connecting = false;
    setConnBadge('live', 'Firestore en vivo');
    return true;
  } catch (err) {
    console.error('[Firestore] no se pudo conectar:', err);
    fb.live = false;
    fb.connecting = false;
    setConnBadge('error', 'Sin conexión — modo local');
    setLoadbar(false);
    return err;
  }
}

/* Carga el contenido por defecto de este archivo hacia Firestore (una vez,
   a pedido del usuario) para que el proyecto arranque con contenido real
   editable desde la Consola de Firebase en vez de una colección vacía. */
async function seedFirestore() {
  if (!fb.live) { fbMsg('Conecta primero con Firestore antes de cargar el contenido inicial.', 'err'); return; }
  const api = fb.api, db = fb.db;
  const ops = [];
  ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'meta', 'main'), DEFAULT_DATA.meta));
  DEFAULT_DATA.pillars.forEach(function (p) { const d = clone(p); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'pillars', p.id), d)); });
  DEFAULT_DATA.symbols.forEach(function (s) { const d = clone(s); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'symbols', s.id), d)); });
  DEFAULT_DATA.weekly.forEach(function (w) { const d = clone(w); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'weekly', w.id), d)); });
  DEFAULT_DATA.specials.forEach(function (s) { const d = clone(s); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'specials', s.id), d)); });
  DEFAULT_DATA.phases.forEach(function (p) { const d = clone(p); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'phases', p.id), d)); });
  DEFAULT_DATA.kpiWeekly.forEach(function (k) { const d = clone(k); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'kpiWeekly', k.id), d)); });
  DEFAULT_DATA.kpiSpecial.forEach(function (k) { const d = clone(k); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'kpiSpecial', k.id), d)); });
  DEFAULT_DATA.checklist.forEach(function (g) { const d = clone(g); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'checklist', g.id), d)); });
  DEFAULT_DATA.accountSegments.forEach(function (s) { const d = clone(s); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'accountSegments', s.id), d)); });
  DEFAULT_DATA.newsSources.forEach(function (n) { const d = clone(n); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'newsSources', n.id), d)); });
  try {
    fbMsg('Cargando contenido inicial en Firestore…', 'ok');
    await Promise.all(ops);
    fbMsg('Contenido inicial cargado en la colección "' + BRAND_SLUG + '". Ya puedes editarlo desde la Consola de Firebase.', 'ok');
    toast('Contenido inicial cargado en Firestore.');
  } catch (err) {
    fbMsg('No se pudo cargar el contenido inicial: ' + (err && err.message ? err.message : err), 'err');
  }
}

/* ---- Diálogo de configuración ---- */
function fbMsg(text, kind) {
  const m = $('fbMsg');
  if (!m) return;
  m.textContent = text || '';
  m.className = 'fb-msg' + (kind ? ' ' + kind : '');
}
function refreshFbStatus() {
  const stored = loadStoredFbConfig();
  const status = $('fbStatus');
  if (!status) return;
  if (fb.live) {
    status.textContent = 'Conectado a Firestore · proyecto "' + FIREBASE_PROJECT + '" · colección "' + BRAND_SLUG + '" · sesión anónima ' + (fb.user ? 'activa (' + fb.user.uid.slice(0, 8) + '…)' : 'activa') + '.';
  } else if (stored) {
    status.textContent = 'Hay una configuración guardada en este navegador, pero la conexión no está activa. Pulsa "Conectar y guardar" para reintentar.';
  } else {
    status.textContent = 'Sin configuración guardada todavía — el dashboard funciona en modo local mientras tanto (los cambios se guardan solo en este equipo).';
  }
  $('fbInput').value = stored ? JSON.stringify(stored, null, 2) : '';
}

/* Acepta tanto JSON estricto como el objeto JS que copia la Consola de
   Firebase (con claves sin comillas), sin usar eval. */
function parseFirebaseConfigInput(raw) {
  const s = txt(raw).trim();
  if (!s) return null;
  try { return JSON.parse(s); } catch (e) { /* probamos el formato objeto JS */ }
  try {
    const body = s.replace(/^const\s+firebaseConfig\s*=/, '').replace(/;\s*$/, '').trim();
    const jsonLike = body
      .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
      .replace(/'/g, '"')
      .replace(/,(\s*[}\]])/g, '$1');
    const parsed = JSON.parse(jsonLike);
    return parsed;
  } catch (e2) {
    return null;
  }
}

function wireFbDialog() {
  const dialog = $('fbDialog');
  $('connBadge').addEventListener('click', function () {
    refreshFbStatus();
    fbMsg('', '');
    if (typeof dialog.showModal === 'function') dialog.showModal();
  });
  $('fbCloseBtn').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

  $('fbConnectBtn').addEventListener('click', async function () {
    const cfg = parseFirebaseConfigInput($('fbInput').value);
    if (!cfg || !cfg.apiKey || !cfg.projectId) {
      fbMsg('No se reconoce el formato. Pega el objeto firebaseConfig completo, con al menos "apiKey" y "projectId".', 'err');
      return;
    }
    fbMsg('Conectando…', 'ok');
    const result = await connectFirebase(cfg);
    if (result === true) {
      storeFbConfig(cfg);
      fbMsg('Conectado. Los datos de Firestore reemplazarán al contenido local en vivo.', 'ok');
      refreshFbStatus();
    } else {
      fbMsg('No se pudo conectar: ' + (result && result.message ? result.message : 'revisa la configuración y las reglas de Firestore.'), 'err');
    }
  });

  $('fbSeedBtn').addEventListener('click', seedFirestore);

  $('fbClearBtn').addEventListener('click', function () {
    clearStoredFbConfig();
    teardownListeners();
    fb.live = false;
    setConnBadge(null, 'Modo local');
    fbMsg('Configuración borrada. El dashboard sigue funcionando en modo local.', 'ok');
    refreshFbStatus();
    renderAllFromState();
  });
}

function renderAllFromState() {
  renderMeta();
  renderPillars();
  renderSymbols();
  renderWeekly();
  renderSpecials();
  renderPhases();
  renderKpis();
  renderChecklist();
  renderAccountSegments();
  renderNews();
}

/* ============ 10 · ARRANQUE ============ */
function wireStaticButtons() {
  $('printFromKpiBtn').addEventListener('click', printReport);
  $('printChecklistBtn').addEventListener('click', printReport);
  $('resetChecklistBtn').addEventListener('click', resetChecklist);
  $('goToChecklistBtn').addEventListener('click', function () {
    const idx = navBtns.findIndex(function (b) { return b.dataset.target === 'checklist'; });
    if (idx >= 0) goToSection(idx);
  });
  window.addEventListener('afterprint', function () { document.body.classList.remove('print-mode'); });
}

/* ---- Pantalla de contraseña ----
   Se guarda "desbloqueado" en localStorage de este navegador para no
   pedir la clave en cada visita. La sesión anónima de Firebase (y por lo
   tanto cualquier escritura a Firestore) solo se dispara DESPUÉS de
   pasar esta pantalla, tal como pide la especificación. */
function isGateUnlocked() { return safeStorage.get(LS_PREFIX + 'gate_unlocked_v1') === true; }
function unlockGate() {
  safeStorage.set(LS_PREFIX + 'gate_unlocked_v1', true);
  document.documentElement.classList.add('gate-unlocked');
}

async function attemptFirebaseConnect() {
  const cfg = effectiveFbConfig();
  if (cfg) {
    const result = await connectFirebase(cfg);
    if (result !== true) {
      // Sin red o config inválida: seguimos en modo local sin romper nada.
      setLoadbar(false);
    }
  } else {
    setConnBadge(null, 'Modo local');
    setLoadbar(false);
  }
}

function wireGate() {
  const overlay = $('gateOverlay');
  const form = $('gateForm');
  const input = $('gateInput');
  const err = $('gateError');
  if (!form || !input || !err) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const val = input.value.trim();
    if (val && val === DASHBOARD_PASSWORD) {
      err.textContent = '';
      unlockGate();
      attemptFirebaseConnect();
    } else {
      err.textContent = 'Contraseña incorrecta. Intenta de nuevo.';
      input.value = '';
      input.focus();
      if (overlay) {
        overlay.classList.add('shake');
        setTimeout(function () { overlay.classList.remove('shake'); }, 400);
      }
    }
  });
}

async function boot() {
  renderStaticTables();
  renderAllFromState(); // contenido local inmediato: nunca hay pantalla en blanco
  wireStaticButtons();
  wireFbDialog();
  wireSymbolModal();
  wireLogoModal();
  wireGate();

  if (isGateUnlocked()) {
    document.documentElement.classList.add('gate-unlocked');
    await attemptFirebaseConnect();
  } else {
    setConnBadge(null, 'Bloqueado');
    setLoadbar(false);
    const gateInput = $('gateInput');
    if (gateInput) gateInput.focus();
  }
}

boot();