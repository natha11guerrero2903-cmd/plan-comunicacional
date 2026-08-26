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
const logoImages = {"ECO-02":"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","ECO-03":"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","ECO-04":"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","ECO-05":"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HFI1naMlyJXc3MzAbvnOwa0AeSkkQQkejbNDG+KKnkZG8YexsrgHjrgjO++/qT4odGWYmMinkaYjzRlszwWHxG+xU2iDyWy1UlnpzT0UXZRFxfycxIBOM4z06L1oiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiD/9k=","ECO-07":"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","ECO-08":"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","ECO-09":"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","ECO-11":"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","EDU-05":"/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFAAUADASIAAhEBAxEB/8QAHQABAAEFAQEBAAAAAAAAAAAAAAUBAgYHCAQDCf/EAE4QAAEDAwEEBQgGBQcMAwEAAAEAAgMEBREGBxIhMRNBcZTSCBQWIlFVYYEVGDJCgpEXUlNyoSMzYpKVscEkNUNFVFZjk6Ky0dOzwsPw/8QAHAEBAAIDAQEBAAAAAAAAAAAAAAQFAQYHAwII/8QAOBEBAAEDAQYDBAgFBQAAAAAAAAECAwQRBQYSITFBExQiUXGR0RUWU2GBoeHwBzJSscEXI0Jykv/aAAwDAQACEQMRAD8A6nREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBFVEFEVUQURVRBRFVEFEVUQURVRBRFVEFEVUQURVRBRFVEFEVUQURVRBRFVEFEVUQURVRBRFVEFEVUQURVRBRFVEFEVUQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBEVsjgxpcTgAZKxMxEayKSSsiaXSODWjrJwvG+90bDgSF37rSoOvrX1sxc4ncH2W+wLzLlu1N/7tN2aMKiOGO89/wWdrAiY1rlkf07R+2T+qqi90Z/0jh2tKxtFVx/EDaPemn4T83r5C37ZZN9NUX7b/pK+sFwp6l+5FIHHGcYKxRZBYqXoqczOHrScvgFsW7m9OftTLixVRTFMRrMxE8o+KNkYtFqnWJ5pREXkudV5rSueD6x9Vva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","SEG-02":"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","SOC-13":"/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFAAUADASIAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAYHBAUIAwEC/8QAShAAAQQCAQIDBQMHCQYDCQAAAQACAwQFEQYSIQcTMQgUQVFhFSJxGDJSU4GRkyMzQlWCobHR0hY1VnKSsiSitCVDRWJmdHWDtf/EABwBAQABBQEBAAAAAAAAAAAAAAABAgMEBQYHCP/EADgRAAIBAwIDAwkHBAMAAAAAAAABAgMEEQUSITFBBlFhBxMUInGBkaHRFTJCk8Hh8FJUYmNEorH/2gAMAwEAAhEDEQA/AOqUREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAETabHzQBE2mx8wgCJtNj5oAibHzTYQBE2PmE2gCJsfNNhAEROofMIAibTY+YQBE2mx80ARNj5psfNAETY+YTYQBE2PmEQBERAEREAREQBERAEREAREQBERAEJ0EXlaDzXlEf55Yen8ddkBQ/il48jAOc6G5ZrUnSyRVIqLWe83jG7pfJ1vBbFEHAtB6S5xB1oBQHB+01K2/Cy67kOMikcCLM1tl2MA/F8bo2kt+fQ4H5KtfGBk7cngzJvyzha7Y/l1NLxIPx8wP39VafL8xw0jG/7SW+L2q5qRuxbZqtmxJDVLGfdca72ho6w/TXdx3XQxtqUKccxzuyWdzyXRmfFR9Lj0TmCnDlned575HF1epHEA6Sw4ju6Ppcw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","SOC-14":"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GOCEZGFOFOFSZmIay2dWfWFMYq6lZJ2tcODmHvBHEFU7dujJViVxtd5LWHkyph38flNI/UtkEwrKdadPwsxcU+TWag6Md7lmArb7SxRdvU07i7/idhWVRbFbXZNGXbT1smnZLdouqqqyQh0j+7hwAAyfRHDiVaGEwsp3FSfLCglwa5nowVDnEnUUvH/2rf3qPsXpu3UMv6M3962Nwiy9qq/mI7uPoa5jouyduoZv0Zv71aGyjZlDs0oa6GO4TVsldIyR7nxtYGbrcADHmVniYWE69SaxJ7BQit0ittrGy+XaNJQEXKWiNF1m7uMDg4PAz2jHwQq5+xZPbf5v0dv71sfhRhIV6kFiLJcU3llPbONgMGidTUl/deqmplpRIGQmFrWu32FvE5zyJVwoiwnOU3mTJSS4GUyiLEkLw9SV4YxtGw+k/wBJ/gOwL16qobSU8k7wSGDOBzPgsJlnfVTvmkOXvOT4eCAy+y/gun+b+0rurpWX8F0/zf2ld1AF0L890dpqHscWuaAQR2HIXfXRvsb5rTUsjY57y3g1oyTxCA47Jdm3Sm3nYEzOEjf2jwK9JYLQQXW3VTaiKjqMjgRuHDh2hZtTy9fC2TcezeGd14wR4EIDkREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAMKFKFAQiYXk6gqquOn9z0UEz5JB6T2NJ3B+9Aefer42VxhpnZ3HFuezPaf2Lxg4udknJPajLZXA8aOoH+7K5226tz96Tj8gqQZZZfwXT/N/aV3V07Qx0VtgZI0tcG8QRgjiu4oAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREB//9k=","SOC-15":"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","SOC-16":"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","SOC-17":"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","SOC-18":"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","SOC-19":"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","SOC-20":"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"};

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