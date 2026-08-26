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
        }
      ]
    }
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
  checklist: clone(DEFAULT_DATA.checklist)
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
  const found = [m.diag1, m.diag2, m.diag3].filter(function (d) { return txt(d).trim() !== ''; });
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
      (txt(p.phase) ? '<div class="pillar-meta"><span>' + txt(p.phase) + '</span></div>' : '') +
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

const PHASE_SHADES = ['#0e9d6b', '#118a63', '#0a7052', '#062821'];

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
  if (e.key >= '1' && e.key <= String(navBtns.length)) {
    goToSection(Number(e.key) - 1);
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