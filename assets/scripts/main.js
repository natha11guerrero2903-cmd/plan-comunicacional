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

/* Segunda contraseña, independiente de la del acceso general: desbloquea
   el "modo administrador" (aprobar/rechazar propuestas de contenido).
   No es un sistema de usuarios real -- es un segundo candado, igual de
   simple que DASHBOARD_PASSWORD, para separar "puede proponer" de "puede
   aprobar". Cámbiala aquí cuando haga falta. */
const ADMIN_PASSWORD = 'gestion80-admin';

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
    "periodEnd": "2026-11-03",
    "weekdaySegments": {
      "lunes": null,
      "martes": null,
      "miercoles": "1",
      "jueves": "2",
      "viernes": "3",
      "sabado": "4",
      "domingo": null
    },
    "heroSub": "Plan de 72 días para comunicar la gestión con evidencia: obra terminada, servicio que responde y cuentas verificables. Cubre Instagram, Facebook y TikTok. Quedan fuera la vocería en prensa tradicional y la pauta pagada.",
    "introCard": "Este plan integra tres insumos que hoy viven separados: el inventario de obras y servicios, el registro de reportes ciudadanos y el cronograma de ejecución. La regla principal es una sola: ninguna pieza sale sin un dato verificable —fecha, cifra, ubicación o responsable— ni sin material grabado en el sitio. Lo que no se puede mostrar, no se anuncia.",
    "stats": [
      {
        "num": "72",
        "lbl": "Días de plan · 24 ago – 3 nov"
      },
      {
        "num": "4",
        "lbl": "Categorías del banco de contenidos"
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
    "metricHero": "Menciones ciudadanas espontáneas que citan un resultado concreto de la gestión —una obra, un servicio o una cifra— sin que la cuenta oficial haya iniciado la conversación. Meta: pasar de 12 a 60 menciones mensuales al día 72.",
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
  /* El equipo pidió quitar la cadencia semanal fija de piezas sobre obras
     y cuadrilla (Obra de la semana, ¿Cómo va?, Resuelto, La cuadrilla,
     Cuentas de la semana) porque esas iniciativas no se están ejecutando
     ni encaminando en la realidad -- publicar contenido sobre ellas sería
     mostrar algo que no está pasando. Se deja vacío a propósito: el
     calendario ahora solo muestra los resúmenes de gestión reales
     (semanal/quincenal/mensual, ver buildScheduleOccurrences) hasta que
     el equipo defina una nueva cadencia de piezas semanales real. */
  "weekly": [],
  /* Mismo motivo: las 3 piezas especiales (calle, cuadrilla, rendición de
     72 días) estaban construidas sobre el mismo relato de obras que no
     se está cumpliendo. Vacío a propósito -- no se inventan reemplazos. */
  "specials": [],
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
      "end": "2026-11-03",
      "days": "días 51-72",
      "milestone": "Serie de oficios completa y rendición de los 72 días publicada el 3 de noviembre."
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
  /* Se quitó el grupo "Producción semanal y especiales" completo (9 ítems
     sobre las cinco piezas de lunes/martes, versión TikTok, especial de
     fase, etc.) y los 3 ítems de "Calendario y coordinación" sobre obras
     y cuadrilla -- verificaban justo la cadencia de piezas que se retiró
     del calendario por no estar encaminada en la realidad. */
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
      "id": "grupo3",
      "order": 2,
      "title": "Calendario y coordinación",
      "items": [
        {
          "text": "¿Los reportes ciudadanos de la semana están clasificados y con responsable asignado?",
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
      "order": 3,
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
      "extra": "Según el organigrama estructural de la Gobernación (nivel de descentralización), la Comisión de Seguridad Ciudadana y la Procuraduría General del Estado son dependencias directas del Despacho del Gobernador, no entes descentralizados -- se dejaron de listar aquí el 2026-09-07.",
      "accounts": [
        { "code": "SEG-03", "name": "Instituto Autónomo de Policía del Estado Táchira", "status": "verificado", "note": "IG: @politachira — verificado | X: @policiatachira — cuenta suspendida (verificado 2026-09-01)",
          "metrics": {
            "instagram": { "estado": "activa", "seguidores": 27907, "publicacionesHistorico": 2082, "publicacionesUltimoMes": 22, "likes": 3282, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Detención de un sujeto en San Juan de Colón tras la difusión del caso", "likes": 988 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" },
            "x": { "estado": "suspendida", "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" }
          } },
        { "code": "SEG-04", "name": "INAPROCET (Protección Civil Táchira)", "status": "verificado", "note": "IG: @pcsancristobal | X: @PCivilTachira (17.1K seg.) — verificado",
          "metrics": {
            "instagram": { "estado": "activa", "seguidores": 29567, "publicacionesHistorico": 2229, "publicacionesUltimoMes": 8, "ultimaPublicacion": "2026-08-28", "likes": 1499, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Reporte del sismo de magnitud 3.2 del 9 de agosto", "likes": 749 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" },
            "x": { "estado": "inactiva", "estimado": true, "seguidores": 17100, "publicacionesHistorico": 45300, "publicacionesUltimoMes": 0, "ultimaPublicacion": "2024-10-30", "likes": 0, "muestraLikes": 6, "publicacionDestacada": { "titulo": "Enlace al blog institucional sobre más de 50 mil personas evacuadas", "likes": 0 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" }
          } },
        { "code": "SEG-05", "name": "Fundación de Altos Estudios Jurídicos de la Procuraduría (FAEJ)", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" }
      ]
    },
    {
      "id": "2", "order": 2, "num": 2, "name": "Economía y Desarrollo Productivo", "phase": "Fase 2", "symbol": "",
      "accounts": [
        { "code": "ECO-01", "name": "FUNDESTA — Instituto Autónomo para el Desarrollo de la Economía Social", "status": "verificado", "note": "IG: @fundestaoficial | X: @Fundesta_inst — verificado",
          "metrics": {
            "instagram": { "estado": "inactiva", "seguidores": 1361, "publicacionesHistorico": 356, "publicacionesUltimoMes": 0, "ultimaPublicacion": "2021-12-23", "likes": 178, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Estímulo a los emprendedores del Táchira", "likes": 39 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" },
            "x": { "estado": "activa", "seguidores": 171, "publicacionesHistorico": 1467, "publicacionesUltimoMes": 2, "ultimaPublicacion": "2026-08-12", "likes": 5, "muestraLikes": 6, "publicacionDestacada": { "titulo": "Mensaje por el Día Internacional de la Juventud", "likes": 2 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" }
          } },
        { "code": "ECO-02", "name": "IAPRET", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" },
        { "code": "ECO-03", "name": "Lotería de Táchira", "status": "verificado", "note": "IG: @lotdeltachira (185K seg.) | X: @LotDelTachira — verificado",
          "metrics": {
            "instagram": { "estado": "inactiva", "seguidores": 186306, "publicacionesHistorico": 3050, "publicacionesUltimoMes": 0, "ultimaPublicacion": "2026-03-04", "likes": 1642, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Arranque de la 61 edición de la Vuelta al Táchira", "likes": 741 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" },
            "x": { "estado": "inactiva", "estimado": true, "seguidores": 20800, "publicacionesHistorico": 71200, "publicacionesUltimoMes": 0, "ultimaPublicacion": "2022-02-02", "likes": 14, "muestraLikes": 5, "publicacionDestacada": { "titulo": "Recorrido del presidente Marcos Albarrán con su directiva", "likes": 5 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" }
          } },
        { "code": "ECO-04", "name": "I.V.T", "status": "parcial", "note": "IG (candidato, sin verificar): @ivt_tachira | Facebook: /ivtgbt — verificado",
          "metrics": {
            "instagram": { "estado": "activa", "seguidores": 11140, "publicacionesHistorico": 1021, "publicacionesUltimoMes": 11, "likes": 1050, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Canal abierto de 300 metros y activación de alcantarilla", "likes": 705 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" },
            "facebook": { "estado": "sin_publicaciones", "seguidores": 22, "publicacionesUltimoMes": 0, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" }
          } },
        { "code": "ECO-05", "name": "CORPOTACHIRA", "status": "verificado", "note": "X: @corpotachira — verificado. Sin Instagram propio confirmado.",
          "metrics": { "x": { "estado": "inactiva", "seguidores": 108, "publicacionesHistorico": 409, "publicacionesUltimoMes": 0, "ultimaPublicacion": "2022-11-02", "likes": 3, "muestraLikes": 6, "publicacionDestacada": { "titulo": "Cuadrillas de Corpotáchira bajo lineamientos del gobernador", "likes": 2 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" } } },
        { "code": "ECO-06", "name": "CORPOINTA", "status": "candidato", "note": "IG (candidato, sin verificar): @corpointa.gobtachira",
          "metrics": { "instagram": { "estado": "activa", "seguidores": 2957, "publicacionesHistorico": 812, "publicacionesUltimoMes": 6, "ultimaPublicacion": "2026-08-29", "likes": 98, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Mantenimiento de la vía clave de la Alta Montaña", "likes": 23 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" } } },
        { "code": "ECO-07", "name": "COTATUR", "status": "verificado", "note": "IG: @cotaturve (15K seg.) — verificado",
          "metrics": { "instagram": { "estado": "activa", "seguidores": 29469, "publicacionesHistorico": 1180, "publicacionesUltimoMes": 11, "ultimaPublicacion": "2026-08-27", "likes": 11901, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Devoción al Santo Cristo de La Grita", "likes": 5659 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" } } },
        { "code": "ECO-08", "name": "COIMTA", "status": "verificado", "note": "IG: @coimtaoficial (2,156 seg.) — verificado",
          "metrics": { "instagram": { "estado": "activa", "seguidores": 2424, "publicacionesHistorico": 578, "publicacionesUltimoMes": 11, "ultimaPublicacion": "2026-08-29", "likes": 116, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Despliegue operativo minero en el municipio Lobatera", "likes": 36 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" } } },
        { "code": "ECO-09", "name": "MAFET, C.A.", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia (sitio web: mafet.net)" },
        { "code": "ECO-10", "name": "Agroinsumos del Táchira, C.A", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" },
        { "code": "ECO-11", "name": "SEDEBAT", "status": "verificado", "note": "IG: @sedebat_ (6,811 seg.) | X: @Sedebat_ — verificado",
          "metrics": {
            "instagram": { "estado": "activa", "seguidores": 7057, "publicacionesHistorico": 2505, "publicacionesUltimoMes": 9, "ultimaPublicacion": "2026-08-24", "likes": 264, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Única taquilla presencial a partir del 31 de agosto", "likes": 65 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" },
            "x": { "estado": "inactiva", "estimado": true, "seguidores": 4076, "publicacionesHistorico": 19900, "publicacionesUltimoMes": 0, "ultimaPublicacion": "2025-01-01", "likes": 3, "muestraLikes": 5, "publicacionDestacada": { "titulo": "Felicitación al Superintendente Bermúdez por su certificación", "likes": 2 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" }
          } }
      ]
    },
    {
      "id": "3", "order": 3, "num": 3, "name": "Gestión Social y Servicios", "phase": "Fase 3", "symbol": "",
      "extra": "Las 12 oficinas y direcciones internas de la Gobernación que se comunican únicamente a través de @gobernaciondeltachira (Secretaría General de Gobierno, Consejos, Gabinetes Sectoriales, y las direcciones de Despacho, Comunicación, Política y Participación Ciudadana, DISI, Cooperación/Protocolo/RR.II., ODACYSS, Archivo e Imprenta Social) dejaron de listarse una por una el 2026-09-07 -- según el organigrama estructural, ninguna es un ente descentralizado. Su cobertura queda representada por la cuenta central de la Gobernación, junto con la del Gobernador, listadas primero abajo. Incluye además 1 empresa inactiva (DESOTA, C.A.).",
      "accounts": [
        { "code": "GOB-01", "name": "Gobernación del Estado Táchira (cuenta institucional central)", "status": "verificado", "note": "IG/X: @gobernaciondeltachira — cuenta central de la Gobernación, usada también por sus 12 oficinas y direcciones internas — verificado" },
        { "code": "GOB-02", "name": "Freddy Bernal (Gobernador del Estado Táchira)", "status": "candidato", "note": "Cuenta pendiente de confirmar -- indícanos el @usuario real de Instagram/X/Facebook del Gobernador para poder darle seguimiento (todavía no se ha verificado ningún handle)." },
        { "code": "SOC-13", "name": "CORPOSALUD", "status": "verificado", "note": "IG: @corposalud_tachira (28K seg.) — verificado",
          "metrics": { "instagram": { "estado": "activa", "seguidores": 32686, "publicacionesHistorico": 6823, "publicacionesUltimoMes": 9, "ultimaPublicacion": "2026-08-31", "likes": 471, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Orientación sobre a qué servicio de salud acudir", "likes": 281 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" } } },
        { "code": "SOC-14", "name": "INAPCET", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" },
        { "code": "SOC-15", "name": "INTAMUJER", "status": "verificado", "note": "IG: @intamujer — la cuenta no existe (verificado 2026-09-01) | X: @INTAMUJERTACH — verificado, inactiva desde 2022",
          "metrics": {
            "instagram": { "estado": "no_existe", "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" },
            "x": { "estado": "inactiva", "seguidores": 22, "publicacionesHistorico": 31, "publicacionesUltimoMes": 0, "ultimaPublicacion": "2022-04-21", "likes": 0, "muestraLikes": 5, "publicacionDestacada": { "titulo": "Anuncio del programa Reporte Bernal del 22 de abril", "likes": 0 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" }
          } },
        { "code": "SOC-16", "name": "INTAVI", "status": "candidato", "note": "IG (candidato, sin verificar): @intavienlinea (5,278 seg.)",
          "metrics": { "instagram": { "estado": "activa", "seguidores": 8085, "publicacionesHistorico": 741, "publicacionesUltimoMes": 20, "ultimaPublicacion": "2026-08-31", "likes": 268, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Visita de la ministra de Hábitat y Vivienda al Táchira", "likes": 147 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" } } },
        { "code": "SOC-17", "name": "Fundación de la Familia Tachirense", "status": "verificado", "note": "IG/X: @famitachirense (27K seg.) — verificado",
          "metrics": {
            "instagram": { "estado": "activa", "seguidores": 29674, "publicacionesHistorico": 1952, "publicacionesUltimoMes": 35, "ultimaPublicacion": "2026-08-31", "likes": 4152, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Jornada 218 en el municipio Bolívar y la historia de una beneficiaria", "likes": 986 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" },
            "x": { "estado": "inactiva", "seguidores": 134, "publicacionesHistorico": 3, "publicacionesUltimoMes": 0, "ultimaPublicacion": "2022-03-27", "likes": 13, "muestraLikes": 3, "publicacionDestacada": { "titulo": "Mensaje institucional de presentación de la Fundación", "likes": 10 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" }
          } },
        { "code": "SOC-18", "name": "FUNDES", "status": "verificado", "note": "IG: @fundes.tachira (1,624 seg.) — verificado",
          "metrics": { "instagram": { "estado": "activa", "seguidores": 2294, "publicacionesHistorico": 620, "publicacionesUltimoMes": 3, "ultimaPublicacion": "2026-08-21", "likes": 587, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Taller de chocolatería para jóvenes con discapacidad auditiva", "likes": 223 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" } } },
        { "code": "SOC-19", "name": "FUNDACETA", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" },
        { "code": "SOC-20", "name": "DESOTA, C.A. (INACTIVA)", "status": "inactiva", "note": "Empresa inactiva — sin red social" }
      ]
    },
    {
      "id": "4", "order": 4, "num": 4, "name": "Educación y Desarrollo Humano", "phase": "Fase 4", "symbol": "",
      "extra": "Según el organigrama estructural de la Gobernación (nivel de descentralización), la Dirección de Talento Humano, la Dirección de Educación y la Dirección de Cultura del Estado Táchira son dependencias directas de la Gobernación, no entes descentralizados -- se dejaron de listar aquí el 2026-09-07 (las dos últimas tenían cuentas reales medidas: @DirEduTachira en X y el Facebook de Cultura, ambas quedan registradas en el historial del proyecto).",
      "accounts": [
        { "code": "EDU-04", "name": "INTEDUCA", "status": "candidato", "note": "IG (candidato, sin verificar): @inteduca_tachira",
          "metrics": { "instagram": { "estado": "inactiva", "seguidores": 1382, "publicacionesHistorico": 1158, "publicacionesUltimoMes": 0, "ultimaPublicacion": "2026-03-08", "likes": 56, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Mensaje navideño del presidente de Inteduca", "likes": 15 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" } } },
        { "code": "EDU-05", "name": "I.D.T (Instituto del Deporte Tachirense)", "status": "verificado", "note": "IG: @idtachirense (2,956 seg.) — verificado",
          "metrics": { "instagram": { "estado": "inactiva", "seguidores": 2997, "publicacionesHistorico": 744, "publicacionesUltimoMes": 0, "ultimaPublicacion": "2021-10-28", "likes": 391, "muestraLikes": 10, "publicacionDestacada": { "titulo": "Sub-14 femenino de baloncesto clasifica al nacional Súper 8", "likes": 51 }, "fuente": "manual/claude-en-chrome", "actualizado": "2026-09-01" } } },
        { "code": "EDU-06", "name": "Fundación Escuela de Gobierno del Estado Táchira", "status": "sin_cuenta", "note": "No se encontró cuenta oficial propia" }
      ]
    }
  ],
  "newsSources": [
    { "id": "1", "order": 1, "scope": "regional", "name": "La Nación (Táchira)", "description": "Diario regional de San Cristóbal — la referencia impresa y digital del estado.", "url": "https://www.lanacion.com.ve" },
    { "id": "2", "order": 2, "scope": "regional", "name": "Diario Los Andes", "description": "Cobertura de toda la región andina venezolana: Táchira, Mérida y Trujillo.", "url": "https://www.diariolosandes.com.ve" },
    { "id": "3", "order": 3, "scope": "regional", "name": "Google Noticias · Táchira", "description": "Agregador en vivo: reúne en un solo lugar lo último publicado sobre el estado por cualquier medio.", "url": "https://news.google.com/search?q=T%C3%A1chira&hl=es-419&gl=VE" },
    /* Directorio de medios digitales de Táchira en Instagram -- levantado
       a mano por el equipo (51 cuentas, ordenadas por alcance). Cada uno
       enlaza directo al perfil real de Instagram, no a un sitio web. */
    { "id": "14", "order": 4, "scope": "regional", "name": "Táchira Noticias (@tachiranoticias1)", "description": "Portal de noticias generalista. 755K seguidores en Instagram.", "url": "https://www.instagram.com/tachiranoticias1/" },
    { "id": "15", "order": 5, "scope": "regional", "name": "Diario La Nación - Venezuela (@lanacionweb)", "description": "Diario tradicional con edición digital (Editorial Torbes). 565K seguidores en Instagram.", "url": "https://www.instagram.com/lanacionweb/" },
    { "id": "16", "order": 6, "scope": "regional", "name": "Táchira Noticias (cuenta alterna) (@tachiranoticiastuvoz)", "description": "Portal de noticias generalista (respaldo de @tachiranoticias1). 358K seguidores en Instagram.", "url": "https://www.instagram.com/tachiranoticiastuvoz/" },
    { "id": "17", "order": 7, "scope": "regional", "name": "Noticias Tachirenses (@noticiastachirenses)", "description": "Portal de noticias / periodismo hiperlocal (red CNT Táchira). 356K seguidores en Instagram.", "url": "https://www.instagram.com/noticiastachirenses/" },
    { "id": "18", "order": 8, "scope": "regional", "name": "Táchira News (@tachiranews.oficial)", "description": "Portal de noticias generalista. 349K seguidores en Instagram. Handle activo real de 'Táchira News'; @tachiranews (sin sufijo) está inactivo.", "url": "https://www.instagram.com/tachiranews.oficial/" },
    { "id": "19", "order": 9, "scope": "regional", "name": "Diario del Pueblo (@diariodlpueblo)", "description": "Diario digital / portal de noticias generalista. 328K seguidores en Instagram.", "url": "https://www.instagram.com/diariodlpueblo/" },
    { "id": "20", "order": 10, "scope": "regional", "name": "Tachira Punto Noticias (@tachira.noticias)", "description": "Portal de noticias generalista. 317K seguidores en Instagram.", "url": "https://www.instagram.com/tachira.noticias/" },
    { "id": "21", "order": 11, "scope": "regional", "name": "Tachira24hrs | Red de Noticias | Servicio Público | Deportes (@tachira24hrs)", "description": "Portal de noticias generalista / agregador. 253K seguidores en Instagram.", "url": "https://www.instagram.com/tachira24hrs/" },
    { "id": "22", "order": 12, "scope": "regional", "name": "Reporte La Grita (@reportelagrita)", "description": "Medio municipal (La Grita / municipio Jáuregui). 205K seguidores en Instagram.", "url": "https://www.instagram.com/reportelagrita/" },
    { "id": "23", "order": 13, "scope": "regional", "name": "Yo Reporto a La Nación (@yoreportoalanacion)", "description": "Cuenta comunitaria/alterna de Diario La Nación. 174K seguidores en Instagram.", "url": "https://www.instagram.com/yoreportoalanacion/" },
    { "id": "24", "order": 14, "scope": "regional", "name": "Conexión Táchira - Noticias Táchira (@conexiontachira)", "description": "Portal de noticias / red hiperlocal (red CNT Táchira). 142K seguidores en Instagram.", "url": "https://www.instagram.com/conexiontachira/" },
    { "id": "25", "order": 15, "scope": "regional", "name": "Reporte.Táchira | Noticias de Táchira y Venezuela (@reporte.tachira)", "description": "Portal de noticias generalista (red CNT Táchira). 109K seguidores en Instagram.", "url": "https://www.instagram.com/reporte.tachira/" },
    { "id": "26", "order": 16, "scope": "regional", "name": "La Red Táchira (@laredtachira)", "description": "Portal de noticias generalista. 93.9K seguidores en Instagram.", "url": "https://www.instagram.com/laredtachira/" },
    { "id": "27", "order": 17, "scope": "regional", "name": "Tachiranoticia (@tachiranoticia)", "description": "Portal de noticias / servicios públicos y denuncias. 74K seguidores en Instagram.", "url": "https://www.instagram.com/tachiranoticia/" },
    { "id": "28", "order": 18, "scope": "regional", "name": "Tachira Punto Noticias (cuenta de respaldo) (@tachira.noticias1)", "description": "Portal de noticias generalista (respaldo). 67.7K seguidores en Instagram.", "url": "https://www.instagram.com/tachira.noticias1/" },
    { "id": "29", "order": 19, "scope": "regional", "name": "Táchira noticias (@tachiranoticias_)", "description": "Portal de noticias / comunidad (San Cristóbal). 65.9K seguidores en Instagram.", "url": "https://www.instagram.com/tachiranoticias_/" },
    { "id": "30", "order": 20, "scope": "regional", "name": "San Cristóbal | Noticias | Eventos y Comunidad (@noti.sancristobal)", "description": "Medio municipal (San Cristóbal). 54.7K seguidores en Instagram.", "url": "https://www.instagram.com/noti.sancristobal/" },
    { "id": "31", "order": 21, "scope": "regional", "name": "Fogón Informativo Táchira (@fogoninformativo)", "description": "Portal de noticias generalista. 49K seguidores en Instagram.", "url": "https://www.instagram.com/fogoninformativo/" },
    { "id": "32", "order": 22, "scope": "regional", "name": "Notitachira (@ntnotitachira)", "description": "Portal de noticias generalista. 45K seguidores en Instagram.", "url": "https://www.instagram.com/ntnotitachira/" },
    { "id": "33", "order": 23, "scope": "regional", "name": "Megavision (@megavision.ve)", "description": "Medio institucional / televisora regional tachirense. 39.7K seguidores en Instagram. Cuenta de un canal de TV, no medio nativo digital.", "url": "https://www.instagram.com/megavision.ve/" },
    { "id": "34", "order": 24, "scope": "regional", "name": "La Red de Noticias del Táchira (@laredsancristobal)", "description": "Medio municipal (San Cristóbal). 34.4K seguidores en Instagram.", "url": "https://www.instagram.com/laredsancristobal/" },
    { "id": "35", "order": 25, "scope": "regional", "name": "Centro de Noticias Táchira (@centrodenoticiastachira)", "description": "Portal de noticias / cabecera de red hiperlocal (red CNT Táchira). 31.4K seguidores en Instagram.", "url": "https://www.instagram.com/centrodenoticiastachira/" },
    { "id": "36", "order": 26, "scope": "regional", "name": "Ntnotitachira (cuenta alterna) (@nt_notitachira)", "description": "Portal de noticias (respaldo de @ntnotitachira). 21.6K seguidores en Instagram.", "url": "https://www.instagram.com/nt_notitachira/" },
    { "id": "37", "order": 27, "scope": "regional", "name": "LaGritaNoticias (@lagritanoticias)", "description": "Medio municipal (La Grita). 20K seguidores en Instagram.", "url": "https://www.instagram.com/lagritanoticias/" },
    { "id": "38", "order": 28, "scope": "regional", "name": "Sucesos Táchira (@sucesostachira)", "description": "Medio de sucesos / seguridad (policiales, judiciales). 15.6K seguidores en Instagram.", "url": "https://www.instagram.com/sucesostachira/" },
    { "id": "39", "order": 29, "scope": "regional", "name": "Noticias de Táchira y la zona norte (@tachiranorte)", "description": "Medio regional (zona norte del estado). 14.4K seguidores en Instagram.", "url": "https://www.instagram.com/tachiranorte/" },
    { "id": "40", "order": 30, "scope": "regional", "name": "La Red Táchira (cuenta alterna) (@laredtachira1)", "description": "Portal de noticias (respaldo de @laredtachira). 12.8K seguidores en Instagram.", "url": "https://www.instagram.com/laredtachira1/" },
    { "id": "41", "order": 31, "scope": "regional", "name": "La Voz del Táchira | Portal de Noticias (@lavozdeltachira)", "description": "Portal de noticias generalista. 10.7K seguidores en Instagram.", "url": "https://www.instagram.com/lavozdeltachira/" },
    { "id": "42", "order": 32, "scope": "regional", "name": "Tachira prensa 2.0 (@tachira_prensa2.0)", "description": "Canal cultural / medio digital regional. 10.1K seguidores en Instagram.", "url": "https://www.instagram.com/tachira_prensa2.0/" },
    { "id": "43", "order": 33, "scope": "regional", "name": "Noticias del Táchira, Venezuela, Colombia y el mundo (@infotachira24)", "description": "Portal de noticias generalista. 7.4K seguidores en Instagram.", "url": "https://www.instagram.com/infotachira24/" },
    { "id": "44", "order": 34, "scope": "regional", "name": "Portinformacionestachira (@portinformacionestachira)", "description": "Canal informativo generalista. 6.1K seguidores en Instagram.", "url": "https://www.instagram.com/portinformacionestachira/" },
    { "id": "45", "order": 35, "scope": "regional", "name": "Tachira 24 Horas (@tachira24horas)", "description": "Portal de noticias / info empresarial y social (zona fronteriza). 5.9K seguidores en Instagram.", "url": "https://www.instagram.com/tachira24horas/" },
    { "id": "46", "order": 36, "scope": "regional", "name": "Tachira Informa (@tachira_news)", "description": "Portal de noticias generalista. 4.5K seguidores en Instagram.", "url": "https://www.instagram.com/tachira_news/" },
    { "id": "47", "order": 37, "scope": "regional", "name": "La Voz del Táchira | Noticias (@lavozdeltachira_ve)", "description": "Portal de noticias (cuenta alterna). 2.5K seguidores en Instagram.", "url": "https://www.instagram.com/lavozdeltachira_ve/" },
    { "id": "48", "order": 38, "scope": "regional", "name": "La Prensa Táchira (@laprensatachira)", "description": "Medio digital independiente (cuenta alterna). 2.5K seguidores en Instagram.", "url": "https://www.instagram.com/laprensatachira/" },
    { "id": "49", "order": 39, "scope": "regional", "name": "Rubio Noticias al Día 2019 (@rubionoticiasaldia)", "description": "Medio municipal (Rubio). 2.2K seguidores en Instagram.", "url": "https://www.instagram.com/rubionoticiasaldia/" },
    { "id": "50", "order": 40, "scope": "regional", "name": "Informa Táchira (@informa_tachira)", "description": "Portal de noticias generalista. 2.2K seguidores en Instagram.", "url": "https://www.instagram.com/informa_tachira/" },
    { "id": "51", "order": 41, "scope": "regional", "name": "Noticias del Táchira (@diariotachira)", "description": "Portal de noticias generalista. 1.8K seguidores en Instagram.", "url": "https://www.instagram.com/diariotachira/" },
    { "id": "52", "order": 42, "scope": "regional", "name": "Cordero Táchira Venezuela (@corderoenfotos)", "description": "Medio comunitario / fotográfico (Cordero). 808 seguidores en Instagram. Cuenta pequeña; enfocada en fotografía comunitaria más que en noticias puras.", "url": "https://www.instagram.com/corderoenfotos/" },
    { "id": "53", "order": 43, "scope": "regional", "name": "Noticias, política, farándula, memes, Táchira (@lamugroteca2.0)", "description": "Medio de farándula / entretenimiento y humor. 712 seguidores en Instagram. Cuenta pequeña pero activa.", "url": "https://www.instagram.com/lamugroteca2.0/" },
    { "id": "54", "order": 44, "scope": "regional", "name": "Tachira al Día (@tachira_aldia)", "description": "Portal de noticias generalista. 560 seguidores en Instagram. Cuenta pequeña, solo 5 publicaciones.", "url": "https://www.instagram.com/tachira_aldia/" },
    { "id": "55", "order": 45, "scope": "regional", "name": "Lagritanoticiastachira (@lagritanoticiastachira)", "description": "Medio municipal (La Grita). 547 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/lagritanoticiastachira/" },
    { "id": "56", "order": 46, "scope": "regional", "name": "Táchira 24_7 (@tachira24_7)", "description": "Portal de noticias generalista. 513 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/tachira24_7/" },
    { "id": "57", "order": 47, "scope": "regional", "name": "Rubionoticias (@rubionoticias)", "description": "Medio municipal (Rubio). 429 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/rubionoticias/" },
    { "id": "58", "order": 48, "scope": "regional", "name": "San Cristóbal Noticias (@sancris_noticias)", "description": "Medio municipal (San Cristóbal). 280 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/sancris_noticias/" },
    { "id": "59", "order": 49, "scope": "regional", "name": "Noticias Capacho Nuevo (@politica_capachonuevo)", "description": "Medio municipal (Capacho). 263 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/politica_capachonuevo/" },
    { "id": "60", "order": 50, "scope": "regional", "name": "Prensa 171 Táchira (@emergencias171tachira)", "description": "Medio de emergencias / sucesos. 198 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/emergencias171tachira/" },
    { "id": "61", "order": 51, "scope": "regional", "name": "La voz del agro Táchira (@lavozdelagrotachira)", "description": "Medio institucional/radio - segmento agro. 141 seguidores en Instagram. Extensión de un programa de radio (Mastermix 91.5 FM).", "url": "https://www.instagram.com/lavozdelagrotachira/" },
    { "id": "62", "order": 52, "scope": "regional", "name": "NotiTachira (@notit.achira)", "description": "Portal de noticias generalista. 123 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/notit.achira/" },
    { "id": "63", "order": 53, "scope": "regional", "name": "Perla del Torbes (@taribanoticias1)", "description": "Medio municipal (Táriba). 114 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/taribanoticias1/" },
    { "id": "64", "order": 54, "scope": "regional", "name": "Táchira Hoy (@tachira.hoy)", "description": "Portal de noticias generalista. 111 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/tachira.hoy/" },
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
  ],
  "newsItems": [],
  "contentSummaries": [
    { "id": "1", "order": 1, "type": "Resumen semanal", "title": "", "note": "Ya aparece automáticamente en el Calendario de gestión cada lunes (resumen de la semana anterior). Falta redactar el contenido real de cada semana.", "linked": false },
    { "id": "2", "order": 2, "type": "Resumen quincenal", "title": "", "note": "Ya aparece automáticamente en el Calendario de gestión el día 1 y el 16 de cada mes (o el día hábil siguiente). Falta redactar el contenido real de cada quincena.", "linked": false },
    { "id": "3", "order": 3, "type": "Resumen mensual", "title": "", "note": "Ya aparece automáticamente en el Calendario de gestión el primer día hábil de cada mes. Falta redactar el contenido real de cada mes.", "linked": false },
    { "id": "4", "order": 4, "type": "Resumen trimestral", "title": "", "note": "Aún no redactado — cuando se escriba, se vincula a una publicación del calendario.", "linked": false },
    { "id": "5", "order": 5, "type": "Resumen semestral", "title": "", "note": "Aún no redactado — cuando se escriba, se vincula a una publicación del calendario.", "linked": false }
  ],
  /* Percepción ciudadana sobre la gestión: estructura preparada a propósito
     sin metodología ni cifras inventadas. positiva/negativa/neutra quedan
     en null hasta que exista una metodología real (encuesta, escucha
     social, etc.) que las alimente -- ver nota en renderPerception(). */
  "perception": {
    "metodologia": "",
    "ultimaMedicion": "",
    "positiva": null,
    "negativa": null,
    "neutra": null
  },
  /* Campañas y proyectos: conceptos nuevos que pidió el usuario para el
     Centro de Control, tomados del dashboard de referencia. Empiezan
     vacíos a propósito -- no existe ninguna campaña ni proyecto real
     cargado todavía. Se agregan desde la Consola de Firebase, igual que
     el resto del contenido; el conteo que se ve en el Centro de Control
     es siempre el real de lo que haya en Firestore, nunca inventado. */
  "campaigns": [],
  "projects": [],
  /* Radar de coyuntura: temas reales en monitoreo (menciones, sentimiento,
     tendencia). Empieza vacío -- requiere un monitoreo real de medios o
     redes conectado; no se inventan temas ni cifras de ejemplo. */
  "coyuntura": []
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
  ['Cierre del plan (día 72)','Resumen de los 4 pilares + recomendación para la siguiente fase','Equipo estratégico completo']
];

/* Recomendaciones de formato por plataforma (Banco de contenidos).
   Contenido fijo acordado con el equipo -- igual que platformRows/reportRows,
   no viene de Firestore. */
const PLATFORM_ORDER = ['instagram', 'tiktok', 'facebook', 'x'];
const PLATFORM_LABELS = { instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook', x: 'X' };
/* Íconos dibujados con primitivas SVG (rect/circle/text), en el mismo
   espíritu que los logos de cada red -- el tamaño lo controla el CSS
   del contenedor (.platform-link-icon / .platform-tab-icon), no el svg.
   (Los archivos reales viven en assets/icons/, subidos por el equipo.) */
const PLATFORM_ICONS = {
  instagram: '<img src="assets/icons/instagram.png" alt="" width="132" height="132">',
  tiktok: '<img src="assets/icons/tiktok.png" alt="" width="129" height="132">',
  facebook: '<img src="assets/icons/facebook.png" alt="" width="132" height="132">',
  x: '<img src="assets/icons/x.jpg" alt="" width="132" height="122">'
};
const PLATFORM_FORMATS = {
  instagram: {
    tagline: 'Plataforma de posicionamiento y estética institucional.',
    cadence: '4-5 piezas / semana',
    formats: [
      { name: 'Reel narrativo', duration: '15-30 seg', when: 'Anuncios, inauguraciones, avances de obra', notes: 'Cortes rápidos, texto en pantalla, música de tendencia moderada (no debe competir con la narrativa institucional).' },
      { name: 'Carrusel informativo', duration: '5-8 slides', when: 'Cifras de gestión, explicación de un programa, "antes/después"', notes: 'Slide 1 = gancho visual fuerte; última slide = CTA claro.' },
      { name: 'Post estático + copy largo', duration: '', when: 'Reconocimientos, comunicados formales, citas del Gobernador', notes: 'Diseño alineado a manual de marca (negro/dorado si es Gobernación, azul marino si es FUNDESTA).' },
      { name: 'Stories', duration: 'serie de 3-5', when: 'Cobertura en vivo de eventos, detrás de cámaras', notes: 'Usar stickers de encuesta/pregunta para generar interacción medible.' },
      { name: 'Guías guardables', duration: '', when: 'Contenido de servicio (trámites, requisitos, rutas de atención)', notes: 'Pensado para que el usuario lo guarde y regrese a consultarlo.' }
    ]
  },
  tiktok: {
    tagline: 'Plataforma de alcance y cercanía humana.',
    cadence: '2-3 videos / semana',
    formats: [
      { name: 'Día en la vida / detrás de cámaras', duration: '', when: 'Humanizar la gestión, mostrar equipos técnicos trabajando', notes: 'Tono informal, cámara al hombro, sin sobreproducir.' },
      { name: 'Explicativo rápido ("te explico")', duration: '60 seg', when: 'Programas o políticas que la gente no entiende bien (ej. ZEEFT, PVC)', notes: 'Un solo presentador, lenguaje sencillo, subtítulos siempre.' },
      { name: 'Testimonial ciudadano corto', duration: '10-15 seg c/u', when: 'Impacto directo de un programa social', notes: 'Preguntas breves, respuestas de 10-15 seg, varios testimonios en un mismo video.' },
      { name: 'Reacción a cifras/logros', duration: '', when: 'Resultados de gestión mensual o trimestral', notes: 'Gráficos simples animados, tono de "esto es lo que se logró".' },
      { name: 'Trend adaptado institucionalmente', duration: '', when: 'Solo cuando el trend permite mensaje claro sin restarle seriedad a la institución', notes: 'Usar con moderación — filtrar por coherencia de posicionamiento antes de aprobar.' }
    ]
  },
  facebook: {
    tagline: 'Plataforma de profundidad y comunidad.',
    cadence: '3-4 publicaciones / semana',
    formats: [
      { name: 'Post + artículo/nota de prensa enlazada', duration: '', when: 'Anuncios formales, rendición de cuentas', notes: 'Copy de 3-5 líneas que resuma lo esencial, enlace a nota completa.' },
      { name: 'Álbum fotográfico de evento', duration: '8-12 fotos', when: 'Cobertura extensa de actos protocolares o jornadas', notes: 'Fotos curadas, pie de foto con contexto.' },
      { name: 'Video en vivo (Facebook Live)', duration: '', when: 'Eventos de alto interés público, inauguraciones grandes', notes: 'Anunciar con antelación en Stories/IG para direccionar audiencia.' },
      { name: 'Post de comunidad / agradecimiento', duration: '', when: 'Cierre de jornadas, agradecimiento a equipos o beneficiarios', notes: 'Tono cercano, etiquetar instituciones y personas involucradas cuando aplique.' }
    ]
  },
  x: {
    tagline: 'Plataforma de vocería directa e institucional — es donde el Gobernador tiene mayor audiencia acumulada y más margen de crecimiento en uso, así que se trata como canal propio, no como réplica de lo publicado en IG/FB.',
    cadence: '1-2 tweets/día + 1 hilo explicativo/semana',
    formats: [
      { name: 'Tweet de anuncio/declaración', duration: '', when: 'Comunicados oficiales, posicionamientos, primeras reacciones a hechos noticiosos', notes: 'Máximo 2-3 líneas, tono directo, sin adornos gráficos; la fuerza está en el texto y el timing (publicar cuando el tema es tendencia).' },
      { name: 'Hilo explicativo', duration: '5-10 tweets', when: 'Desglosar una política, rendir cuentas de una gestión, responder a críticas con datos', notes: 'Primer tweet = gancho que resuma la conclusión; cada tweet siguiente aporta un dato o paso; cerrar con CTA o resumen.' },
      { name: 'Video nativo corto', duration: '30-60 seg', when: 'Declaraciones en cámara, cortes de discursos, anuncios en video', notes: 'Subtítulos siempre (mucho consumo sin audio); subir nativo a X, no solo enlazar YouTube/IG.' },
      { name: 'Quote tweet con comentario institucional', duration: '', when: 'Reaccionar a medios, otras instituciones o ciudadanos de forma controlada', notes: 'Útil para corregir información o sumarse a una conversación sin abrir un tema nuevo.' },
      { name: 'Encuesta (poll)', duration: '', when: 'Sondear percepción rápida sobre un tema de gestión, generar interacción medible', notes: 'Preguntas cerradas, 2-4 opciones, resultado se puede reutilizar como contenido en un tweet posterior.' },
      { name: 'Hilo de cobertura en vivo (live-tweeting)', duration: '', when: 'Eventos protocolares, jornadas, inauguraciones', notes: 'Tweets cortos y espaciados en tiempo real, con foto o video corto en cada uno.' },
      { name: 'Space (audio en vivo)', duration: '', when: 'Rendición de cuentas conversacional, entrevistas con voceros institucionales', notes: 'Mejor con invitados de otras instituciones (refuerza la lógica de vocería descentralizada del LOST).' }
    ]
  }
};

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
  newsSources: clone(DEFAULT_DATA.newsSources),
  newsItems: clone(DEFAULT_DATA.newsItems),
  contentSummaries: clone(DEFAULT_DATA.contentSummaries),
  perception: clone(DEFAULT_DATA.perception),
  campaigns: clone(DEFAULT_DATA.campaigns),
  projects: clone(DEFAULT_DATA.projects),
  coyuntura: clone(DEFAULT_DATA.coyuntura),
  /* Propuestas de contenido hechas desde Banco de contenidos (ver sección
     "Propuestas de contenido" más abajo). Nunca vienen de DEFAULT_DATA --
     no existen propuestas "de ejemplo", solo las que alguien cree de
     verdad desde el dashboard. */
  contentProposals: [],
  /* Las publicaciones del calendario no vienen de DEFAULT_DATA: se
     generan en vivo a partir de weekly/specials (ver
     buildScheduleOccurrences). Aquí solo vive el ESTADO de cada una
     (Diseñada..Métricas cargadas), igual que kpiWeekly/kpiSpecial. */
  publications: safeStorage.get(LS_PREFIX + 'publications_v1') || []
};

/* Estado local (se usa mientras no haya conexión con Firestore). */
let localStatus = safeStorage.get(LS_PREFIX + 'status_v1') || {};
let localChecks = safeStorage.get(LS_PREFIX + 'checklist_v1') || {};

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

/* Días de calendario entre hoy y una fecha límite (ambas a medianoche,
   para no depender de la hora exacta) -- positivo si falta, 0 si es
   hoy, negativo si ya pasó. */
function daysUntil(dateStr) {
  const end = parseISO(dateStr);
  if (!end) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((end.getTime() - today.getTime()) / 86400000);
}

/* Lunes siguiente a "from" -- si "from" ya es lunes, salta al de la
   semana entrante (nunca devuelve el mismo día). */
function nextMonday(from) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const add = ((8 - d.getDay()) % 7) || 7;
  d.setDate(d.getDate() + add);
  return d;
}

/* Independiente del resto de renderMeta() para poder refrescarse solo
   (ver boot()): así el recuento de días sigue correcto aunque la
   pestaña quede abierta de un día para otro, sin re-renderizar todo. */
function updateDateDisplay() {
  const m = state.meta || {};
  const e = parseISO(m.periodEnd);
  const today = new Date();

  let period = 'Hoy: ' + fmtDay(today) + ' ' + today.getFullYear();
  if (e) period += ' · Cierra el ' + fmtDay(e) + ' ' + e.getFullYear();
  setHTML('brandPeriod', period);

  const daysLeft = m.periodEnd ? daysUntil(m.periodEnd) : null;
  let countdown = '';
  if (daysLeft !== null) {
    if (daysLeft > 1) countdown = daysLeft + ' días para el cierre';
    else if (daysLeft === 1) countdown = '1 día para el cierre';
    else if (daysLeft === 0) countdown = 'Hoy es el cierre del plan';
    else countdown = 'Plan finalizado';
  }
  setHTML('brandCountdown', countdown);

  const monday = nextMonday(today);
  setHTML('updateNextDate', fmtDay(monday) + ' ' + monday.getFullYear());
}

/* ============ 4 · RENDER ============ */
function renderMeta() {
  const m = state.meta || {};
  document.title = DOC_TITLE;
  setHTML('brandEyebrow', m.eyebrow || BRAND_NAME);

  updateDateDisplay();

  setHTML('heroSub', m.heroSub);
  setHTML('quoteTxt', m.quote);
  setHTML('metricHero', m.metricHero);
  setHTML('resumenNote', m.resumenNote);
  setHTML('semanalNote', m.semanalNote);
  setHTML('symbolDiff', m.symbolDiff);
  setHTML('symbolReflection', m.symbolReflection);
  setHTML('docFoot', m.footer);

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

/* ============ ECOSISTEMA DE CUENTAS ============
   Mismo patrón visual y de datos que "Pilares de marca" (acordeón +
   gráfico de cobertura), aplicado a un inventario distinto: no son ideas
   de contenido sino cuentas institucionales reales, cada una con su
   estado de verificación en redes sociales. */
/* Ya no usamos un único "estado de verificación" por ente (ver punto
   13 del brief de corrección): cada red social se muestra por separado,
   Activa o no, con su link real -- parseado del texto de "note" que ya
   existe (no se inventa ningún dato nuevo, ni se toca Firestore). */
const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'x', label: 'X' },
  { key: 'facebook', label: 'Facebook' }
];

/* Redes del DIRECTOR de un ente -- estructura separada de las redes del
   ente (punto 16). No hay datos reales todavía para ningún director; esto
   solo prepara la conversión handle→link real para cuando se carguen
   (ver openEnteModal y la nota de "preparación para scraping/API"). */
const DIRECTOR_SOCIAL_BASE = {
  instagram: 'https://instagram.com/',
  x: 'https://x.com/',
  facebook: 'https://facebook.com/',
  tiktok: 'https://tiktok.com/@'
};
function directorSocialLink(key, raw) {
  const s = txt(raw).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return { handle: s.replace(/^https?:\/\/(www\.)?/i, ''), url: s };
  const handle = s.replace(/^@/, '');
  const base = DIRECTOR_SOCIAL_BASE[key];
  if (!base || !handle) return null;
  return { handle: '@' + handle, url: base + handle };
}

function parseAccountSocial(a) {
  const info = { instagram: null, x: null, facebook: null, tiktok: null, central: null };
  const note = txt(a && a.note);
  if (a && a.status === 'interno') {
    const m = /@([\w.]+)/.exec(note);
    if (m) info.central = { handle: '@' + m[1], url: 'https://instagram.com/' + m[1] };
    return info;
  }
  if (!a || a.status === 'sin_cuenta' || a.status === 'inactiva') return info;
  note.split('|').forEach(function (rawChunk) {
    const chunk = rawChunk.trim();
    let m;
    if ((m = /^IG\/X\s*:?\s*@([\w.]+)/i.exec(chunk))) {
      info.instagram = { handle: '@' + m[1], url: 'https://instagram.com/' + m[1] };
      info.x = { handle: '@' + m[1], url: 'https://x.com/' + m[1] };
    } else if ((m = /^IG\b[^:]*:\s*@([\w.]+)/i.exec(chunk))) {
      info.instagram = { handle: '@' + m[1], url: 'https://instagram.com/' + m[1] };
    } else if ((m = /^X\s*:?\s*@([\w.]+)/i.exec(chunk))) {
      info.x = { handle: '@' + m[1], url: 'https://x.com/' + m[1] };
    } else if ((m = /^Facebook\s*:?\s*\/?([\w.\-]+)/i.exec(chunk))) {
      info.facebook = { handle: '/' + m[1], url: 'https://facebook.com/' + m[1] };
    }
  });
  return info;
}

/* Una fila de pastillas Activo/Inactivo por plataforma, con link real en
   las activas. Nunca marca "Activo" sin un handle real detrás (punto 14).
   Cuando ya se verificó el estado real de la cuenta (metrics.<red>.estado,
   cargado a mano o por scraping), se usa ese dato en vez de asumir que
   "tiene un handle anotado" significa "existe y funciona". */
function socialPillsHtml(a) {
  const info = parseAccountSocial(a);
  if (info.central) {
    return '<a class="social-pill central" href="' + info.central.url + '" target="_blank" rel="noopener noreferrer">Usa cuenta central (' + info.central.handle + ')</a>';
  }
  const anyActive = info.instagram || info.x || info.facebook || info.tiktok;
  if (!anyActive) return '<span class="social-pill">Sin presencia en redes propias</span>';
  const metricsByPlatform = (a && typeof a.metrics === 'object' && a.metrics) || {};
  return SOCIAL_PLATFORMS.map(function (p) {
    const d = info[p.key];
    if (!d) return '<span class="social-pill">' + p.label + '</span>';
    const pm = (metricsByPlatform[p.key] && typeof metricsByPlatform[p.key] === 'object') ? metricsByPlatform[p.key] : {};
    if (pm.estado === 'no_existe') return '<span class="social-pill broken">' + p.label + ' (no existe)</span>';
    if (pm.estado === 'suspendida') return '<span class="social-pill broken">' + p.label + ' (suspendida)</span>';
    const dormant = pm.estado === 'inactiva' || pm.estado === 'sin_publicaciones';
    return '<a class="social-pill active' + (dormant ? ' dormant' : '') + '" href="' + d.url + '" target="_blank" rel="noopener noreferrer">' + p.label +
      (pm.estado === 'sin_publicaciones' ? ' (sin publicaciones)' : dormant ? ' (inactiva)' : '') + '</a>';
  }).join('');
}

function hasActiveSocial(a) {
  const info = parseAccountSocial(a);
  return !!(info.instagram || info.x || info.facebook || info.tiktok);
}


/* ============ TIPO DE ENTE (punto 11 de la corrección) ============
   No todo ente es "descentralizado". La regla es transparente y se basa
   en el nombre propio de cada institución (Dirección/Oficina/Secretaría
   -> dependencia; Comisión/Consejo -> coordinación especial; Instituto
   Autónomo/Corporación/Fundación/C.A. -> descentralizado). No es una
   clasificación legal verificada -- se marca como tal para que el
   equipo administrativo la confirme, nunca se presenta como un hecho. */
function inferEnteType(a) {
  if (a && a.status === 'interno') return 'Dependencia de la Gobernación';
  const n = txt(a && a.name);
  if (/^Gobernaci[oó]n del Estado/i.test(n)) return 'Cuenta institucional central';
  if (/Gobernador/i.test(n)) return 'Máxima autoridad del Ejecutivo estadal';
  if (/^(Direcci[oó]n|Oficina|Secretar[ií]a|Consejo|Gabinete)/i.test(n)) return 'Dependencia de la Gobernación';
  if (/Comisi[oó]n/i.test(n)) return 'Comisión / coordinación especial';
  if (/Instituto Aut[oó]nomo|Corporaci[oó]n|Fundaci[oó]n|Servicio Desconcentrado|C\.A\./i.test(n)) return 'Ente descentralizado';
  return 'Por confirmar';
}

/* Fila "Publicación con más interacción y likes": metrics.publicacionDestacada
   = {titulo, likes}, cargado a mano o por un futuro scraping/API. Sin
   datos reales todavía para ningún ente -- se muestra vacío, nunca con
   un título o cifra inventados. */
function destacadaRowHtml(pd, rowClass) {
  const titulo = pd && txt(pd.titulo).trim();
  const likes = pd && pd.likes;
  const has = !!titulo;
  return '<div class="' + (rowClass || 'pub-detail-row') + '"><span class="k">Publicación con más interacción</span><span class="v"' +
    (has ? '' : ' style="color:var(--gray-soft);font-weight:500;"') + '>' +
    (has ? titulo + (likes !== undefined && likes !== null && likes !== '' ? ' — ' + txt(likes) + ' likes' : '') : 'Sin datos cargados') +
    '</span></div>';
}

/* ============ FICHA DE ENTE: tipo, director, redes y métricas ============
   Punto 10/16/26-28: la jerarquía Segmento->Ente->Director->Redes->
   Publicaciones->Métricas vive aquí. Director y métricas no tienen
   ningún dato real todavía en ningún lado -- se muestran como campos
   vacíos y listos, nunca con cifras inventadas (punto 38). */
function openEnteModal(segNum, code) {
  const seg = state.accountSegments.find(function (s) { return Number(s.num) === Number(segNum); });
  if (!seg) return;
  const a = (seg.accounts || []).find(function (x) { return txt(x.code) === txt(code); });
  if (!a) return;

  setHTML('enteModalEyebrow', txt(a.code) + ' · ' + txt(seg.name));
  setHTML('enteModalTitle', a.name);

  const tipo = inferEnteType(a);
  const social = parseAccountSocial(a);

  let socialHtml = '';
  if (social.central) {
    socialHtml = '<div class="pub-detail-row"><span class="k">Cuenta central</span><span class="v"><a href="' + social.central.url + '" target="_blank" rel="noopener noreferrer">' + social.central.handle + '</a></span></div>';
  } else {
    SOCIAL_PLATFORMS.forEach(function (p) {
      const d = social[p.key];
      socialHtml += '<div class="pub-detail-row"><span class="k">' + p.label + '</span><span class="v">' +
        (d ? '<a href="' + d.url + '" target="_blank" rel="noopener noreferrer">' + d.handle + '</a>' : '<span style="color:var(--gray-soft);font-weight:500;">Sin cuenta</span>') +
        '</span></div>';
    });
  }

  // Las métricas se guardan y se muestran POR RED (metrics.instagram,
  // metrics.x, etc.) -- nunca combinadas en un solo número, por la misma
  // razón que el estado Activo/Inactivo ya se muestra por separado por
  // plataforma (punto 14). Solo se listan las redes que el ente tiene
  // realmente (según parseAccountSocial), para no mostrar 4 bloques
  // vacíos en entes con una sola red.
  const METRIC_FIELDS = [
    { key: 'seguidores', label: 'Seguidores' },
    { key: 'publicacionesHistorico', label: 'Publicaciones (histórico)' },
    { key: 'publicacionesUltimoMes', label: 'Publicaciones último mes' },
    { key: 'ultimaPublicacion', label: 'Última publicación' },
    { key: 'likes', label: 'Likes' },
    { key: 'comentarios', label: 'Comentarios' },
    { key: 'compartidos', label: 'Compartidos' },
    { key: 'alcance', label: 'Alcance' },
    { key: 'impresiones', label: 'Impresiones' },
    { key: 'frecuenciaPublicacion', label: 'Frecuencia de publicación' }
  ];
  const ESTADO_LABELS = {
    activa: 'Activa',
    inactiva: 'Inactiva (sin publicar recientemente)',
    suspendida: 'Suspendida',
    sin_publicaciones: 'Sin publicaciones',
    no_existe: 'No existe'
  };
  const metricsByPlatform = (a && typeof a.metrics === 'object' && a.metrics) || {};
  let hasAnyMetric = false;
  let metricRows = '';
  if (social.central) {
    metricRows = '<div class="pub-detail-row"><span class="k">Métricas</span><span class="v" style="color:var(--gray-soft);font-weight:500;">Usa la cuenta central -- se mide a nivel de esa cuenta, no por separado</span></div>';
  } else {
    const platformsWithAccount = SOCIAL_PLATFORMS.filter(function (p) { return !!social[p.key]; });
    if (!platformsWithAccount.length) {
      metricRows = '<div class="pub-detail-row"><span class="k">Métricas</span><span class="v" style="color:var(--gray-soft);font-weight:500;">Sin redes propias que medir</span></div>';
    } else {
      platformsWithAccount.forEach(function (p) {
        const pm = (metricsByPlatform[p.key] && typeof metricsByPlatform[p.key] === 'object') ? metricsByPlatform[p.key] : {};
        const platformHasData = METRIC_FIELDS.some(function (f) { return pm[f.key] !== undefined && pm[f.key] !== null && pm[f.key] !== ''; })
          || !!pm.estado
          || !!(pm.publicacionDestacada && txt(pm.publicacionDestacada.titulo).trim());
        if (platformHasData) hasAnyMetric = true;
        metricRows += '<p class="symbol-tag" style="margin-top:14px;">' + p.label + (platformHasData ? '' : ' (pendiente de conectar)') + '</p>';
        if (pm.estado) {
          metricRows += '<div class="pub-detail-row"><span class="k">Estado verificado</span><span class="v"' +
            ((pm.estado === 'suspendida' || pm.estado === 'no_existe') ? ' style="color:#b91c1c;font-weight:600;"' : '') +
            '>' + (ESTADO_LABELS[pm.estado] || txt(pm.estado)) + '</span></div>';
        }
        metricRows += METRIC_FIELDS.map(function (f) {
          const v = pm[f.key];
          const has = v !== undefined && v !== null && v !== '';
          let display = has ? txt(v) : 'Sin datos cargados';
          if (has && f.key === 'seguidores' && pm.estimado) display += ' (aprox.)';
          if (has && f.key === 'likes' && pm.muestraLikes) display += ' (últimas ' + txt(pm.muestraLikes) + ' publicaciones)';
          return '<div class="pub-detail-row"><span class="k">' + f.label + '</span><span class="v"' +
            (has ? '' : ' style="color:var(--gray-soft);font-weight:500;"') + '>' + display + '</span></div>';
        }).join('') + destacadaRowHtml(pm.publicacionDestacada);
      });
    }
  }

  const director = (a && typeof a.director === 'object' && a.director) || null;
  const hasDirector = !!(director && txt(director.nombre).trim());
  let directorHtml;
  if (hasDirector) {
    directorHtml = '<div class="pub-detail-row"><span class="k">Director</span><span class="v">' + txt(director.nombre) + '</span></div>';
    SOCIAL_PLATFORMS.forEach(function (p) {
      const link = directorSocialLink(p.key, director[p.key]);
      directorHtml += '<div class="pub-detail-row"><span class="k">' + p.label + ' (director)</span><span class="v">' +
        (link ? '<a href="' + link.url + '" target="_blank" rel="noopener noreferrer">' + link.handle + '</a>' : '<span style="color:var(--gray-soft);font-weight:500;">Sin cuenta</span>') +
        '</span></div>';
    });
  } else {
    directorHtml = '<div class="pub-detail-row"><span class="k">Director</span><span class="v" style="color:var(--gray-soft);font-weight:500;">Sin datos cargados</span></div>';
  }

  $('enteModalBody').innerHTML =
    '<div class="pub-detail-row"><span class="k">Tipo</span><span class="v">' + tipo +
      (a.status === 'interno' ? '' : ' <span style="color:var(--gray-soft);font-weight:500;font-style:italic;">(inferido, confirmar)</span>') +
    '</span></div>' +
    directorHtml +
    '<p class="symbol-tag" style="margin-top:16px;">Redes sociales del ente</p>' +
    socialHtml +
    '<p class="symbol-tag" style="margin-top:16px;">Métricas por red</p>' +
    metricRows +
    '<p class="pub-objective" style="font-style:italic;color:var(--gray);">' +
      (hasAnyMetric
        ? 'Estos valores provienen del mecanismo de obtención de datos ya conectado para este ente. Los campos que sigan en "Sin datos cargados" aún no llegan por esa vía.'
        : 'Estos campos se completan cuando se conecte un mecanismo real de obtención de datos (scraping o API). No se muestran cifras estimadas.') +
    '</p>';

  const dialog = $('enteModal');
  if (typeof dialog.showModal === 'function') dialog.showModal();
}

function wireEnteModal() {
  const dialog = $('enteModal');
  $('enteModalClose').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
}

/* ============ DIAGNÓSTICO DIGITAL POR SEGMENTO (punto 29) ============
   Comparación real entre los 4 segmentos: nada de "rendimiento" inventado
   -- solo lo que se puede calcular de datos que ya existen (entes,
   redes activas, frecuencia planificada del calendario). */
function renderSegmentDiagnostics() {
  const body = $('segmentDiagBody');
  if (!body) return;
  body.innerHTML = '';
  const segMap = (state.meta && state.meta.weekdaySegments) || {};
  const segments = sortDocs(state.accountSegments);
  if (!segments.length) {
    body.appendChild(el('tr', '', '<td colspan="7">Sin segmentos cargados todavía.</td>'));
    return;
  }
  segments.forEach(function (s) {
    const accounts = Array.isArray(s.accounts) ? s.accounts : [];
    const activeCount = accounts.filter(hasActiveSocial).length;
    const inactiveCount = accounts.filter(function (a) { return a.status === 'sin_cuenta' || a.status === 'inactiva'; }).length;
    const platformsUsed = SOCIAL_PLATFORMS.filter(function (p) {
      return accounts.some(function (a) { return !!parseAccountSocial(a)[p.key]; });
    }).map(function (p) { return p.label; });
    const days = Object.keys(segMap).filter(function (k) { return segMap[k] && String(segMap[k]) === String(s.num); });
    const freq = days.length
      ? days.length + (days.length === 1 ? ' vez/semana · ' : ' veces/semana · ') + days.map(function (d) { return WEEKDAY_LABELS[d]; }).join(', ')
      : 'Sin día asignado todavía';
    body.appendChild(el('tr', '',
      '<td class="rowlabel">' + txt(s.name) + '</td>' +
      '<td>' + accounts.length + '</td>' +
      '<td>' + activeCount + '</td>' +
      '<td>' + inactiveCount + '</td>' +
      '<td>' + (platformsUsed.length ? platformsUsed.join(', ') : 'Ninguna') + '</td>' +
      '<td>' + freq + '</td>' +
      '<td style="color:var(--gray-soft);font-style:italic;">Sin datos reales</td>'));
  });
}

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
  const activeCount = allAccounts.filter(hasActiveSocial).length;
  setHTML('chipAccountsTotal', total + (total === 1 ? ' ente' : ' entes'));
  setHTML('chipAccountsVerified', activeCount + ' con redes activas');
  setHTML('chipResumenEntes', total + (total === 1 ? ' ente' : ' entes'));
  setHTML('chipResumenVerificadas', activeCount + ' con redes activas');
  renderSegmentDiagnostics();

  if (!segments.length) {
    list.appendChild(el('div', 'empty', 'Sin segmentos cargados todavía.'));
    chart.appendChild(el('div', 'empty', 'Sin datos para el gráfico de cobertura.'));
    return;
  }

  // ---- Gráfico de cobertura, un color de la paleta por segmento ----
  // Se mantiene la barra general por segmento y, debajo, una tabla real
  // mes x organismo -- a pedido del usuario: primero los meses
  // (encabezado, con el mes real de hoy resaltado), luego una fila por
  // cada organismo del segmento.
  const counts = segments.map(function (s) { return Array.isArray(s.accounts) ? s.accounts.length : 0; });
  const maxAccounts = Math.max.apply(null, [1].concat(counts));
  const monthDefs = complianceMonthDefs();
  segments.forEach(function (s, i) {
    const n = counts[i];
    const pct = Math.round(pctOf(n, maxAccounts));
    const shade = PHASE_SHADES[i % PHASE_SHADES.length];
    const group = el('div', 'chart-seg-group');
    group.appendChild(el('div', 'bar-chart-row',
      '<span class="bar-chart-lbl">' + String(txt(s.num) || (i + 1)).padStart(2, '0') + ' · ' + txt(s.name) + '</span>' +
      '<div class="bar-chart-track"><div class="bar-chart-fill" style="width:' + pct + '%;background:' + shade + '"></div></div>' +
      '<span class="bar-chart-val">' + n + '</span>'));

    const accountsOfSeg = Array.isArray(s.accounts) ? s.accounts : [];
    if (accountsOfSeg.length && monthDefs) {
      const theadHtml = '<thead><tr><th>Organismo</th>' +
        monthDefs.map(function (mo) { return '<th class="compliance-month-col' + (mo.isCurrent ? ' is-current' : '') + '">' + mo.label + (mo.isCurrent ? ' <span class="compliance-current-tag">actual</span>' : '') + '</th>'; }).join('') +
        '</tr></thead>';
      let tbodyHtml = '<tbody>';
      accountsOfSeg.forEach(function (a) {
        tbodyHtml += '<tr><td class="compliance-seg-name"><div class="compliance-ente">' + enteLogoHtml(a) + '<span>' + txt(a.name) + '</span></div></td>';
        monthDefs.forEach(function (mo) {
          // Ninguna pieza está asignada todavía a un organismo específico
          // (se planifican por segmento, ver buildScheduleOccurrences) --
          // el valor real hoy es 0 para cada organismo, no se inventa
          // ninguna cifra mayor.
          const nMonth = 0;
          tbodyHtml += '<td class="' + (mo.isCurrent ? 'is-current' : '') + '">' +
            '<div class="compliance-cell">' +
              '<div class="compliance-cell-track"><div class="compliance-cell-fill" style="width:0%;background:' + shade + '"></div></div>' +
              '<span class="compliance-cell-val">' + nMonth + '</span>' +
            '</div></td>';
        });
        tbodyHtml += '</tr>';
      });
      tbodyHtml += '</tbody>';
      group.appendChild(el('div', 'chart-ente-breakdown',
        '<span class="chart-ente-breakdown-lbl">Seguimiento mensual por organismo -- todas las piezas se planifican por segmento, no hay todavía ninguna asignada a un organismo específico (por eso el 0 real en cada celda)</span>' +
        '<div class="table-wrap"><table class="compliance-table">' + theadHtml + tbodyHtml + '</table></div>'));
    }
    chart.appendChild(group);
  });

  // ---- Leyenda de cobertura real (sin la etiqueta "Verificado") ----
  if (legend) {
    const central = allAccounts.filter(function (a) { return a.status === 'interno'; }).length;
    const noOwn = allAccounts.filter(function (a) { return a.status === 'sin_cuenta' || a.status === 'inactiva'; }).length;
    const active = total - central - noOwn;
    [
      { label: 'Con redes activas', n: active, color: '#0a7052' },
      { label: 'Sin cuenta propia', n: noOwn, color: '#948ca3' },
      { label: 'Usa cuenta central', n: central, color: '#2f5488' }
    ].forEach(function (row) {
      legend.appendChild(el('div', 'tl-leg-item',
        '<span class="sw" style="background:' + row.color + '"></span>' + row.label + ' · <b>' + row.n + '</b>'));
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
        inner += '<div class="idea-row">' +
          enteLogoHtml(a) +
          '<div class="idea-txt">' + txt(a.name) +
            '<span class="ente-type-tag">' + inferEnteType(a) + '</span>' +
            '<div class="ente-social">' + socialPillsHtml(a) + '</div>' +
            '<button type="button" class="ente-detail-btn" data-seg="' + txt(s.num) + '" data-code="' + txt(a.code).replace(/"/g, '&quot;') + '">Ver ficha completa →</button>' +
          '</div>' +
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
    body.querySelectorAll('.ente-detail-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { openEnteModal(btn.dataset.seg, btn.dataset.code); });
    });
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

/* ============ PERCEPCIÓN SOBRE LA GESTIÓN ============
   Estructura preparada a propósito, sin metodología ni cifras inventadas.
   positiva/negativa/neutra solo se muestran si alguien las carga desde
   Firestore (perception/main) tras aplicar una metodología real (encuesta,
   escucha social, etc.). Mientras eso no exista, la sección explica por
   qué está vacía en vez de simular un dato. */
function renderPerception() {
  const p = state.perception || {};
  const body = $('perceptionBody');
  if (!body) return;
  const hasData = p.positiva !== null && p.positiva !== undefined
    || p.negativa !== null && p.negativa !== undefined
    || p.neutra !== null && p.neutra !== undefined;
  const rows = [
    { key: 'positiva', label: 'Positiva', color: 'var(--ok)' },
    { key: 'negativa', label: 'Negativa', color: 'var(--alert)' },
    { key: 'neutra', label: 'Neutra', color: 'var(--neutral-status)' }
  ];
  body.innerHTML = rows.map(function (r) {
    const v = p[r.key];
    const hasVal = v !== null && v !== undefined && v !== '';
    return '<div class="perception-stat">' +
      '<span class="perception-dot" style="background:' + r.color + ';"></span>' +
      '<span class="perception-label">' + r.label + '</span>' +
      '<span class="perception-value" style="' + (hasVal ? '' : 'color:var(--gray-soft);font-style:italic;') + '">' +
        (hasVal ? txt(v) + '%' : 'Sin datos') +
      '</span></div>';
  }).join('');
  setHTML('perceptionMetodologia', txt(p.metodologia).trim() || 'Aún no se ha definido ni aplicado una metodología real de medición de percepción ciudadana.');
  setHTML('perceptionUltimaMedicion', txt(p.ultimaMedicion).trim() ? 'Última medición: ' + txt(p.ultimaMedicion) : 'Sin mediciones registradas todavía.');
  const note = $('perceptionNote');
  if (note) {
    note.textContent = hasData
      ? 'Estas cifras provienen de la metodología descrita arriba. Se actualizan desde la Consola de Firebase cada vez que hay una nueva medición.'
      : 'Esta sección queda sin cifras a propósito: no existe todavía una metodología real de medición de percepción ciudadana. Cuando el equipo defina una (encuesta, escucha social u otra), se carga aquí -- no se muestran porcentajes estimados mientras tanto.';
  }

  // Mismo dato de arriba, mostrado en miniatura dentro de "Centro de
  // Control" -- no es un sistema paralelo, es la misma state.perception.
  const ring = $('perceptionMiniRing');
  if (ring) {
    if (hasData) {
      const pos = Number(p.positiva) || 0, neg = Number(p.negativa) || 0, neu = Number(p.neutra) || 0;
      const total = pos + neg + neu || 1;
      const posPct = pos / total * 100, negPct = neg / total * 100;
      ring.style.background = 'conic-gradient(var(--ok) 0% ' + posPct + '%, var(--alert) ' + posPct + '% ' + (posPct + negPct) + '%, var(--neutral-status) ' + (posPct + negPct) + '% 100%)';
      setHTML('perceptionMiniValue', Math.round(pos) + '%');
      setHTML('perceptionMiniLabel', 'Positiva');
    } else {
      ring.style.background = 'var(--paper-2)';
      setHTML('perceptionMiniValue', '—');
      setHTML('perceptionMiniLabel', 'Sin medir');
    }
  }
}

/* ============ NOTICIAS SOBRE LA GESTIÓN (matrices de opinión) ============
   Cobertura real y verificada, no un feed automático: cada noticia se
   carga a mano (foto, titular, medio, fecha, resumen breve y el enlace
   real a la nota) desde la Consola de Firebase cuando aparece. Empieza
   vacía a propósito -- no se inventa ninguna noticia ni cifra de
   percepción mientras no exista contenido real cargado. */
function formatNewsDate(iso) {
  const s = txt(iso).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const [y, m, d] = s.split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const mi = Number(m) - 1;
  return d + ' ' + (meses[mi] || m) + '. ' + y;
}

function renderOpinionNews() {
  const grid = $('opinionNewsList');
  const countEl = $('opinionNewsCount');
  if (!grid) return;
  grid.innerHTML = '';
  const items = sortDocs(state.newsItems);
  if (countEl) setHTML('opinionNewsCount', items.length + (items.length === 1 ? ' noticia cargada' : ' noticias cargadas'));
  if (!items.length) {
    grid.appendChild(el('div', 'empty', 'Aún no se ha cargado ninguna noticia real sobre la gestión. Se agregan desde la Consola de Firebase (colección "newsItems") a medida que aparecen coberturas verificables -- con foto, medio, fecha, resumen y enlace real a la nota. No se muestran noticias de ejemplo.'));
    return;
  }
  items.forEach(function (n) {
    const url = safeUrl(n.url);
    const photo = safeUrl(n.photo);
    grid.appendChild(el('div', 'opinion-card',
      (photo
        ? '<div class="opinion-card-photo" style="background-image:url(&quot;' + photo + '&quot;);"></div>'
        : '<div class="opinion-card-photo opinion-card-photo--empty">' + newsInitials(n.medio) + '</div>') +
      '<div class="opinion-card-body">' +
        '<p class="opinion-card-meta">' + txt(n.medio) + (n.fecha ? ' · ' + formatNewsDate(n.fecha) : '') + '</p>' +
        '<h5>' + txt(n.titular) + '</h5>' +
        '<p class="opinion-card-summary">' + txt(n.resumen) + '</p>' +
        (url
          ? '<a class="news-card-link" href="' + url + '" target="_blank" rel="noopener noreferrer">Leer noticia <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></a>'
          : '<span class="acct-badge s">Sin enlace todavía</span>') +
      '</div>'));
  });
}

/* ============ RESÚMENES DE GESTIÓN (banco de contenidos) ============
   Semanal/mensual/trimestral/semestral. Quedan como estructura --
   "linked" pasará a true cuando el calendario (próxima corrección)
   permita vincular cada resumen a una publicación real; no se inventa
   contenido ni fecha de publicación mientras tanto. */
function renderContentSummaries() {
  const list = $('summariesList');
  if (!list) return;
  list.innerHTML = '';
  const items = sortDocs(state.contentSummaries);
  const linkedCount = items.filter(function (it) { return !!it.linked; }).length;
  setHTML('summariesCount', linkedCount + ' de ' + items.length + ' vinculados al calendario');
  if (!items.length) {
    list.appendChild(el('div', 'empty', 'Sin resúmenes cargados todavía.'));
    return;
  }
  items.forEach(function (it) {
    const hasTitle = txt(it.title).trim() !== '';
    list.appendChild(el('div', 'card',
      '<div class="symbol-tag">' + txt(it.type) + '</div>' +
      '<p style="margin:8px 0 0;font-size:13px;color:' + (hasTitle ? 'var(--black)' : 'var(--gray-soft)') + ';">' +
        (hasTitle ? txt(it.title) : 'Sin redactar todavía') +
      '</p>' +
      '<p style="margin:8px 0 0;font-size:11.5px;color:var(--gray);font-style:italic;">' + txt(it.note) + '</p>'));
  });
}

/* Los 4 accesos de Banco de contenidos abren una sub-página propia
   (#platformDetail) en vez de mostrar la cuadrícula en el mismo panel --
   reutiliza el mismo mecanismo de .panel/.panel.active que el resto de
   la navegación (ver goToSection), pero sin pasar por el sidebar. */
function renderPlatformLinks() {
  const wrap = $('platformLinks');
  if (!wrap) return;
  wrap.innerHTML = '';
  PLATFORM_ORDER.forEach(function (p) {
    const btn = el('button', 'platform-link',
      '<span class="platform-link-icon">' + PLATFORM_ICONS[p] + '</span>' +
      '<span class="platform-link-label">' + PLATFORM_LABELS[p] + '</span>' +
      '<span class="platform-link-arrow" aria-hidden="true">→</span>');
    btn.type = 'button';
    btn.addEventListener('click', function () { openPlatformDetail(p); });
    wrap.appendChild(btn);
  });
}

function renderPlatformDetailTabs(active) {
  const wrap = $('platformDetailTabs');
  if (!wrap) return;
  wrap.innerHTML = '';
  PLATFORM_ORDER.forEach(function (p) {
    const on = p === active;
    const btn = el('button', 'platform-tab' + (on ? ' active' : ''),
      '<span class="platform-tab-icon">' + PLATFORM_ICONS[p] + '</span>' + PLATFORM_LABELS[p]);
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
    btn.addEventListener('click', function () { openPlatformDetail(p); });
    wrap.appendChild(btn);
  });
}

function openPlatformDetail(platform) {
  const data = PLATFORM_FORMATS[platform];
  if (!data) return;

  document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
  const panel = $('platformDetail');
  if (panel) panel.classList.add('active');

  setHTML('platformDetailTitle', PLATFORM_LABELS[platform]);
  setHTML('platformDetailTagline', data.tagline);
  setHTML('platformDetailCadence', data.cadence ? 'Cadencia sugerida: ' + data.cadence : '');
  renderPlatformDetailTabs(platform);

  const list = $('platformDetailList');
  if (list) {
    list.innerHTML = '';
    if (!data.formats.length) {
      list.appendChild(el('div', 'empty', 'Sin formatos cargados todavía para esta plataforma.'));
    } else {
      data.formats.forEach(function (f) {
        const card = el('div', 'card format-card',
          '<p class="format-name">' + txt(f.name) + '</p>' +
          (txt(f.duration).trim() ? '<span class="format-duration">' + txt(f.duration) + '</span>' : '') +
          '<p class="format-row"><b>Cuándo usarlo</b>' + txt(f.when) + '</p>' +
          '<p class="format-row"><b>Notas de producción</b>' + txt(f.notes) + '</p>' +
          '<button type="button" class="propose-btn">+ Proponer contenido</button>');
        card.querySelector('.propose-btn').addEventListener('click', function () { openProposalForm(platform, f.name); });
        list.appendChild(card);
      });
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closePlatformDetail() {
  document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
  const pilares = $('pilares');
  if (pilares) pilares.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function wirePlatformDetail() {
  renderPlatformLinks();
  const back = $('platformBackBtn');
  if (back) back.addEventListener('click', closePlatformDetail);
}

/* ============ PROPUESTAS DE CONTENIDO ============
   Cualquiera con la contraseña general puede proponer una pieza desde un
   formato concreto de Banco de contenidos. Queda "pendiente" hasta que
   alguien en modo administrador la aprueba o la rechaza -- solo al
   aprobarla se convierte en una ocurrencia real del Calendario de gestión
   (ver buildScheduleOccurrences). Nunca se inventa una propuesta de
   ejemplo: la cola empieza vacía y solo crece con las que cree el equipo. */
let proposalContext = null; // { platform, formatName }

function proposalSegmentOptionsHtml() {
  const segs = sortDocs(state.accountSegments);
  let html = '<label class="proposal-seg-opt proposal-seg-all">' +
    '<input type="checkbox" name="proposalSeg" value="all">Todas las cuentas de la Gobernación</label>';
  segs.forEach(function (s) {
    html += '<label class="proposal-seg-opt">' +
      '<input type="checkbox" name="proposalSeg" value="' + txt(s.num) + '">' + txt(s.name) + '</label>';
  });
  return html;
}

function wireProposalSegmentExclusivity(container) {
  const boxes = container.querySelectorAll('input[name="proposalSeg"]');
  boxes.forEach(function (box) {
    box.addEventListener('change', function () {
      if (box.value === 'all') {
        if (box.checked) boxes.forEach(function (b) { if (b.value !== 'all') b.checked = false; });
      } else if (box.checked) {
        boxes.forEach(function (b) { if (b.value === 'all') b.checked = false; });
      }
    });
  });
}

function openProposalForm(platform, formatName) {
  proposalContext = { platform: platform, formatName: formatName };
  setHTML('proposalModalTitle', 'Proponer contenido');
  setHTML('proposalModalSubtitle', PLATFORM_LABELS[platform] + ' · ' + txt(formatName));

  const segWrap = $('proposalSegments');
  if (segWrap) {
    segWrap.innerHTML = proposalSegmentOptionsHtml();
    wireProposalSegmentExclusivity(segWrap);
  }
  const desc = $('proposalDescription'); if (desc) desc.value = '';
  const date = $('proposalDate'); if (date) date.value = '';
  const by = $('proposalBy'); if (by) by.value = '';
  const msg = $('proposalMsg'); if (msg) { msg.textContent = ''; msg.className = 'fb-msg'; }

  const dialog = $('proposalModal');
  if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
}

function closeProposalModal() {
  const dialog = $('proposalModal');
  if (dialog) dialog.close();
}

function submitProposal(e) {
  e.preventDefault();
  if (!proposalContext) return;
  const msg = $('proposalMsg');
  const setMsg = function (text, kind) { if (msg) { msg.textContent = text; msg.className = 'fb-msg' + (kind ? ' ' + kind : ''); } };

  if (!fb.live) { setMsg('Conecta primero con Firestore (ver el estado en la barra lateral) antes de enviar una propuesta -- necesita quedar guardada para que el equipo la revise.', 'err'); return; }

  const description = txt($('proposalDescription') && $('proposalDescription').value).trim();
  const proposedDate = txt($('proposalDate') && $('proposalDate').value).trim();
  const proposedBy = txt($('proposalBy') && $('proposalBy').value).trim();
  const segments = Array.prototype.slice.call(document.querySelectorAll('input[name="proposalSeg"]:checked')).map(function (b) { return b.value; });

  if (!description) { setMsg('Describe la idea de contenido antes de enviar.', 'err'); return; }
  if (!proposedDate || !parseISO(proposedDate)) { setMsg('Elige una fecha propuesta válida.', 'err'); return; }
  if (!segments.length) { setMsg('Marca al menos un segmento (o "Todas las cuentas").', 'err'); return; }

  const proposal = {
    platform: proposalContext.platform,
    format: proposalContext.formatName,
    description: description,
    proposedDate: proposedDate,
    segments: segments,
    proposedBy: proposedBy,
    status: 'pendiente',
    createdAt: new Date().toISOString()
  };

  setMsg('Enviando propuesta…', 'ok');
  fb.api.addDoc(fb.api.collection(fb.db, BRAND_SLUG, 'plan', 'contentProposals'), proposal)
    .then(function () {
      toast('Propuesta enviada. Queda pendiente de aprobación.');
      closeProposalModal();
    })
    .catch(function (err) { setMsg('No se pudo guardar la propuesta: ' + (err && err.code ? err.code : 'error'), 'err'); });
}

function proposalSegmentLabel(proposal) {
  const segments = Array.isArray(proposal.segments) ? proposal.segments : [];
  if (segments.indexOf('all') !== -1) return 'Todas las cuentas de la Gobernación';
  const names = segments.map(function (num) {
    const s = state.accountSegments.find(function (seg) { return String(seg.num) === String(num); });
    return s ? txt(s.name) : null;
  }).filter(Boolean);
  return names.length ? names.join(', ') : 'Sin segmento';
}

function proposalStatusBadgeClass(status) {
  if (status === 'aprobada') return 'v';
  if (status === 'rechazada') return 's';
  return 'p';
}
function proposalStatusLabel(status) {
  if (status === 'aprobada') return 'Aprobada';
  if (status === 'rechazada') return 'Rechazada';
  return 'Pendiente';
}

function renderProposalsQueue() {
  const list = $('proposalsQueueList');
  if (!list) return;
  const items = state.contentProposals.slice().sort(function (a, b) {
    return String(b.createdAt).localeCompare(String(a.createdAt));
  });
  const pendingCount = items.filter(function (p) { return p.status === 'pendiente'; }).length;
  setHTML('proposalsPendingCount', pendingCount + (pendingCount === 1 ? ' pendiente' : ' pendientes'));

  list.innerHTML = '';
  if (!items.length) {
    list.appendChild(el('div', 'empty', 'Sin propuestas todavía. Se crean desde un formato en cualquiera de las 4 plataformas de arriba.'));
    return;
  }
  const admin = isAdminUnlocked();
  items.forEach(function (p) {
    const d = parseISO(p.proposedDate);
    const card = el('div', 'card proposal-card',
      '<div class="proposal-card-top">' +
        '<p class="format-name">' + PLATFORM_LABELS[p.platform] + ' · ' + txt(p.format) + '</p>' +
        '<span class="acct-badge ' + proposalStatusBadgeClass(p.status) + '">' + proposalStatusLabel(p.status) + '</span>' +
      '</div>' +
      '<p class="format-row">' + txt(p.description) + '</p>' +
      '<p class="format-row"><b>Fecha propuesta</b>' + (d ? fmtDay(d) + ' de ' + d.getFullYear() : txt(p.proposedDate)) + '</p>' +
      '<p class="format-row"><b>Segmento</b>' + proposalSegmentLabel(p) + '</p>' +
      (txt(p.proposedBy).trim() ? '<p class="format-row"><b>Propuesto por</b>' + txt(p.proposedBy) + '</p>' : ''));

    if (admin && p.status === 'pendiente') {
      const actions = el('div', 'proposal-actions',
        '<button type="button" class="status-btn g active">Aprobar</button>' +
        '<button type="button" class="status-btn r active">Rechazar</button>');
      const btns = actions.querySelectorAll('button');
      btns[0].addEventListener('click', function () { reviewProposal(p.id, 'aprobada'); });
      btns[1].addEventListener('click', function () { reviewProposal(p.id, 'rechazada'); });
      card.appendChild(actions);
    }
    list.appendChild(card);
  });
}

function reviewProposal(id, status) {
  if (!isAdminUnlocked()) { toast('Activa el modo administrador para aprobar o rechazar propuestas.'); return; }
  if (!fb.live) { toast('Conecta con Firestore para aprobar o rechazar propuestas.'); return; }
  fb.api.setDoc(fb.api.doc(fb.db, BRAND_SLUG, 'plan', 'contentProposals', txt(id)), { status: status, reviewedAt: new Date().toISOString() }, { merge: true })
    .then(function () { toast(status === 'aprobada' ? 'Propuesta aprobada: ya aparece en el Calendario de gestión.' : 'Propuesta rechazada.'); })
    .catch(function (err) { toast('No se pudo guardar: ' + (err && err.code ? err.code : 'error')); });
}

function wireProposalForm() {
  const dialog = $('proposalModal');
  const form = $('proposalForm');
  if (!dialog || !form) return;
  $('proposalModalCloseBtn').addEventListener('click', closeProposalModal);
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  form.addEventListener('submit', submitProposal);
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
   del inventario de cuentas del cliente -- 19 de 29 entes con logo
   propio (excluye las cuentas 'interno', que usan la cuenta central).
   Los que faltan muestran un icono generico con iniciales hasta que
   se reciba el logo real. */
const logoImages = {
  "SEG-04": "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",
  "ECO-02": "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",
  "ECO-03": "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",
  "ECO-04": "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",
  "ECO-05": "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",
  "ECO-07": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFUAVQDASIAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAYHAQUIBAMC/8QAThAAAgIBAgIHAwUKCggHAAAAAAECAwQFEQYxBxITIUFRYSJxgRQjkaGxFTJSYnN0krLB0QgXMzU2QkNVcrMWJFSCk9Lw8SY0N1OjwuH/xAAbAQEAAgMBAQAAAAAAAAAAAAAABAUBAgYDB//EADMRAQACAgEDAwMBBgUFAAAAAAABAgMEEQUhMRITQQZRYRQVIjJxgZEjM1Kh4UKxwdHx/9oADAMBAAIRAxEAPwDqkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0fFXFOHwvpssrIfXsfs1UqSUrZeS/azW94pHqt4a2tFY5s29+VRi1StvurqrjznOSil8WQ/Vulnh/Tpuuid2fNdz7CPsr/AHnsn8Cp+I+KtT4nyHbnXfNKW9dEe6uv4eL9X3mn3KHP1i3PGKP6qXN1WeeMULafTbhb92j5TXn2sUbDTumDQsuxQyq8rC3/AK1kVKP0x/cUqCNHVs8TzKPHU88T3dOYWp4eo1K7Dyqcit/1qpqS+o9JzPpOr52iZccvT8idFq8VykvJrk0XRwf0g4Wv6bbZmWV4mViw618JPaPV/DW/h9hbanUqZv3bdpWmrv0y9rdpS9yUVu2kRjXekbQNDk655Xym9f2WOuu/i+S+krbjLpIzeIJ2YuBKzE0/vi0u6dy85PwXp9JC+RG2uremfTijn8o+x1SKz6cX91tWdNuIn83o+TJecrYr95+qOmzAk12+k5da373CcZbfYVGNyD+1djnz/shftLP93ROhcZaLxDFfIs2DtfOmfs2L/dfP4G739Tl2EpQmpxk4zi04yT2afmmWlwF0mW33V6VrlvWlY+rTlPZbvwjP9j+kstTqsZJ9GSOJWOr1KMk+nJ2lMMrj/hvCybcXI1Wqu6mbhODjLeLXNcj5fxk8K/3xT+jL9xS3Fkv/ABRq2z7vldn6xqt35kbJ1fJW01iIR79UyVtMcQv7+MnhX++Kf0ZfuH8ZPCv98U/oy/cUDu/MbvzNP2zl/wBMNP2tk/0w6R0biPS+IFa9MzIZKpaU+qmurvy5o2bKv6Ev5PVv8dX2SLOtsjVXKyclGMVu5N9yXmXepnnLijJb5XGtlnLii8/LzT1LGqz68Cd0Y5FsJWQrfOUU0m/rR609zn7WeMsrN4w+7tM5bY9qVEU/7JPl8Vvv7y9dJ1LH1fT6M7Fn16boKcX5ej9VyNNbcrntasfDTX2q5rWiPh9szLqwcW3Kvl1KqYSsnLbfaKW7ZEsPpe4Nz6nZj6upxT2fzM019RvuK/6M6r+Z3fqM4y0/NtwbYXUy2kkk0+TXkzTd2r4ePR8us6P0G3U9fNbFbi9eOPtP83XH8Z/Cv95//DP9xmPSdwrKSitTW7e38lP9xz1p2pU6jSp1tKa++g33xZ6m0k9+RVftbPM+mKxy4fb29nTyzh2KcTHl0FPj/h6EXOWoKMYrdt1y2X1HhfSzwj/eb/4M/wBxQ2Rn3X0xoc32UeS8/eeQ6Xp+tntj9W1xzPxCr3/qWsXiNSvb55+7o/SOkLh/XdRr0/T83tsixSai65R7kt3zRJTnfonyILpB0+jfecq7nt5JQfM6IPbYxe3bhb9K28m1h9zJHE8tNxLxdo/COPTkazl/Jqrp9nCXZynvLbfb2U/BGio6Y+DsvIqx8XU7LrbJdWMIYtrk36Lq95F/4R39H9I/PZf5citejDiLSdC1qX3Sx4QleuzrzpSfzG/NNclF+fh49xjZxzj0L7OOs2vHPEQn0jLkzeisdvu6aWtYb/tfqZn7s4bf8tt8GRiM4zipQkpRkt00900D5TP1puRPE0j/AHW36Kn3SuGpYlj2jfDf1ex6FJSW6aZC5zjXCU5yUYxW7bfckRX+NO3T9XrjiQ7XTYNxtTXtWfjR8tvDzLvpH1Tk2snozY+I+8N6dKyZefZ78LfB5tPz8fVMOrLxLY202x60ZR8T0naRMTHMKuYmJ4kABlgAAAAMD82zVdcpyaUYrdt+COeOMeJbOKNbtzHuqIfN0Q/Bgnz975/9i4+kbVJaXwjn2VycbLYqiDT705Pb7NygPDuKHrGee2KP5qbquae2ODvb2W7bLH4Y6Irs6ivK1q+eLGXesavbr7fjPw9x4OifQ6tV16zLyKlZVhQU4prddo37P0bNl2JGvTdCt6+7k7tNDSrevuZETr6MOFa4KL01zf4Urp7v6yPcQ9D2NKud+iZE6rEm1Rc+tGXopc18dyzgW19LDevpmsLO+pitHE1cwZWJkYORPGyqZ031vqzrmtnFmcjGvwrHTfXOmxxTlCXc0n3pNeHg9n6HROVw3pWTqterX4dVmZVHqwskuS8O7luvMoDX8+Wp65n5kv7W+bS8lvsvqSOe3NL9NHPPnwo9vT/Txzz58NcAfazCyKsarKnTNUW7qFm3sya5rfz9CviJnwgxEz4fEAGGAAATTg/g3G43hk336tdVmVz3th2ak5J8pb7+Pf8AFHi454Qr4Qy8WivLnk9vXKbc4KO2zS8Peezoly54/F8KVJqGRRZCUfPb2l9htemr+dNM/IWfrItpxY7afucfvQs/bx21fc4/eVuWPoHRPRrei4eoy1W6mWRUrHBVJqO/xK48ToXgL+h+k/m8TTpmCmW8xeOezXpuGmW8xeOXn4M4JhwdHKUM2eV8pcW+tBR6u2/k/U1vS3rlum6BHCpc4zzpdnKaXcoLvkt/XuX0k2yL68Wiy+6ca664ucpSeyilzZVmo8X4PHmqZHD9nZ04Fy2wsqS2l265S7/B962/eXWxFMWL2qTxM+FvsenHi9qk8TPhWWyLc6GMzNs03MxbKm8Kqzeq1v8ArP76Pr4P4lYLSMyWrrSOxazO27Dqfjb/AGePuJTxJr8+GLcHQNDyGqtLkrbrYv8Al7+clL09PX0KPSn2bzlv2iOym059m05b+I7Lk1XBjqenZOFKbhHIqnU5LnFSTW/1lPx/gzaZFJf6RZ3cv/YgWzw/q9Ou6Ri6jTso3wUnHffqy8V8HujYS5HS2x480Ra0cuy0eqbOpEzrXmsS464g0e7hTjDO0jT7rL5YlvZRnKKTmtk+9Lu27zeYyedl42PN9RW2Qg+r37btJv6za8f4tVPHet2xj85Zkbyk+f3se73Gr0r+dcL84q/XR7aXTKYpnLaO/wAfhy/1h9TV6tsYsNa8ejiLW+bT8/0WjmdCeDi4d161jLk6q5T2dce/ZblLZ2orHioV7O1r9E6y1ltaNnNPvWPY1+izjJSlOKlJttpNt+Jd9Mp70zN58IO/0rBS9JpXiE96EpOfSTp8pNtuq9tvx+bZ0+cv9CH/AKkad+Sv/wAtnUHgeHV/8/iPsuunxxi4hUP8I7+j2kfnsv8ALkUCdQdLeHRn6Pi42TWrKp3PdPw9l968n6nOmvcP36Jf39a3Gm/m7tufo/J/aROm9Xwe/OjeeLx3j8ujwa1/YjLEdkt6POkmejOvSdYtlPT3tCm6XPG9H5w+z3Fxzvprod8rYKpR67n1l1dtt99/I5aJDpXGGoY+nw0bJyrHpylvFN/een+H08Dmfqj6Krs3/Vanaf8Aqj7/AJj8pGtxa8UtPESn3FfFs9XnPDxG4YcXs5Lnd7/xfQjRhSUkpJpp96afM1+r6xXpley2nfJexDy9X6HN6+rXDX26Q+gaepWlYx4oXJ0Na27as3Rp2KXYdXIrjv3qMm0/huvrLPOf/wCDlXk5nEWtajbKU1HGhXKTXOTlul9EToA7XQ59ivL599RYK4d/JSv4/vMAAJikAAAAAEI6Xqp2cIylFd1eRVKXu3a/aikUzpHibSo6zoOdgS53VSUX5S5r60jm5pxbUltJdzXkzm+s45jJF1D1WkxeLLS6ErYbatVuu03qnt6bSRaZzxwVxK+F9cry5pyx7F2V8Vz6jfNeq5nQGFm4+fjV5ONdC2m2KlCcXupIsOlZq2wxT5hO6bli2KK/MPuAYlOME23skWiwfmz71o5hvhKvIthJe1GySfvTZavEfS3HB1qujSq6czDq3V83uu0e/KD9PPkytteyMXM1nMysLdY99jthFrZx63e1t6Pc53qufHliIpPeFF1PNTJERWe8NeSDhLWcfBzfkOqQV2k5b6mRVPvjF+Fi8mvNeHuNTprwnmVw1DrrFm+rZZB+1Uvwl57eR7+JeF8vhzIhG2SvxL11sfJh97bHbf4Pv5Fbhi1f8WviFfii1f8AEr8Prxlwtbwtqro3dmJanPGt/Cj5P1X/AOmowcHJ1PLqxMOmV19r2hCPNlnX4keNujKjISUs7T4Pqvx60O6S+MUvjsaPQ6ocM8C5PEUVFajnT+TYs33uuO+zcfJ90n8ES8upX3PVHasxylZNWPc9UfwzHKLaxplOk3LEeUr8ut7XqtfN1y/BUv6zXi+Rr9tiRcM8LvWoZOo5988bS8SLnfkc5SfPqx38fX95ob5QsuslVV2Vbk+pDrN9VeC3fMh5aTERfjiJ8ImTHxEX44ifCTdGEXLjbA28FY37uozfdNX86aZ+Qs/WR8ehvSLMjWcnVJRaqxquzi/Octu74JfWfbpq/nXTPyFn6yLKtJroTM/MrCtZrpTz8yrfxOheAv6H6T+bROevE6B4KvrxeCNNvtkoV14inKT8Ek22Oj9r2/kdJ/jt/Joel3iT7n6XDSKH89mp9o/walz+l930lORlKElKEnGUXupLuafmbTiXXruJNYyNRubSse1cPwIL71f9eLZqyHu7M5ss2jxHhE3Nj3cs2jxHhYr4u0l6OuIuyh/pIqvkW34+38r+j4/AryUpTk5Tk5Sk93Jvvb82fkHln2LZeOfh55ti2XjlYvRFxJ8kz7dFyLdqsn26E/Cxc0veu/4Fvvkcv499uLfXkUycLapKcJJ8mnujorhfXqeI9Fo1CppOa2sh4wmua+n6i86Ts+untW8wuOmbHqp7c+YUL0if021f8v8A/VEaxNQVOs6fTVtKbyqlJ/g+3H6ybdIXDOqZ/EOt5WH2asdy7Ktv2rF1Vvt4J+W/MrLRoyjrunxkmpRzKlJPmn2i33Ou6dn19mt647xM08x9nPx0y8bM5csdpnt/d19rfdo2f+b2/qs41xcezKddVUXKTS/7naGoUPKwcihf2lc4fSmijtC4WwtC054ahG6ycUr7ZLvsa8PRLwX7Tn936lx9GwTaY5tbxH/l1WxqWzzEV+Hl6HdOrwOMcNR9ux129abX4j7l6HQZSvBenfcXjfT7HJyxrevVCb8JOD2T/wCu8upNNbkXpW9O7inPa3MzLXRx2x0mt/PKE9J//kMH8tL9VlbZWJRm0Sx8mqNtU/voy+30fqTvpa1ejEhpmLLvnOydkvxYpbb/AEshEJxnFSg1KL7014nF/Uc3x73u0njx3d10LPiyYZwc8zHmFbcQ8PW6Hf1k3Zi2PauzxX4svX7TUFvX49WVTOi+uNlU1tKMlumV3xFw3bolvaVuVuHNpRsfOL/Bl6+vid59L/VVd2I1tmeMnxP3/wCXlv8AT5xT68f8P/Z48PWsjBplVGKtjt7Cm/vH+70NZGGVqWbGuMbMjKvmoRiu+U5PuSR9Gi4P4Pl+gTzsvEysPH+7O/a42ROO8pVpbSjHfk1z7u9p+hZ9V6NjvPv07T8pvTPqS+hitW1fV9vx/wALH6JuCrOCuE68bKrjHPyZu/J6vftJ8o7+PVWy+kmwXIEalYrWKw5DYz32Mts2Se9p5kABs8QAAAAAa3RSvSjwjLStSnq+JS/kWTLezq8q7Xz9yfP37l1HxysSjNx7MfIqhbVZFxnCa3UkRdvWjPT0yj7OvGanplzAbTQ+JtW4du6+nZc64t7yql7VcvfF/aia8U9EWTTbLI0GUbqX3/JrJbTh/hk+a9H3le5mBl6fa6szFvx5rnG2Dj9pzGTBm17c+Py52+DNr2+yax6ZNfUUnjae359SX/MabXuPtd4gr7HIylTR41Y6cFL3vfdkb60fwl9J9sfGvy7FXj023Tl3KNcHJv6BO1sXj0zaZJ2s949MzL5G30DhbU+JPlD0+lTjjw60pSeyb8Ip/hMlHDHRNqOfbXfrP+pYvN1J72z9PKP2ltaXpOJo+FVhYVMaaK1tGK+1+b9SZqdMvk/ey9oS9Xp1r/vZe0OZ5RlCTjKLjKL2aa70/Jlp8EQx+M+Csrh/Mb7XDltXPxgnu4NP0e69xvuNOjjD4k6+Ziyjiaht9/t7Fv8AiX7efvI90d8Pa1wxxXbj52JOFN+PJdrD2q5NNNe0vHn3M9cGnfXz+mY5rPZ6YdS+DNxMc1ns9XRFG2rG1rScpLfHyEpR9WnGX6pCszEycjJx+EsdyduPqF8YxfJKTXVfwSbLT0XEhgcda9GCSWVRj5Gy825Rf2Ee0/AhPpjz57L5ml3besoRX7We+TXn26U/PH9HtkwT6KU/PH9Hl6S+x4d4a0rhzCk4wk+tPznGPi/fJ7/ArzTNNytYz6cHDr7S+17RXgvV+SXmWfx3wbrHFnFFbxoQqxKceEHfbL2d222kl3tks4W4O07hXGcMROy6zbtL7O+U3+xeiPLJo3z5557Vh55NO2bNzPasPRwvoFPDmjUafS+s4Lec9tnOb5v/AK8Cuempbarpn5Cz9ZFupbFS9M9F1uqaa66rJpUT36sW9vaXkTOoY+Naa1j7JW9TjXmtY+ytPEsLiPiJ4fR7omj49nVuy8eMrUuaqXhv6v6kyCfIcr/Zr/8Ahy/cfS6rOyHF20ZEnCEa4/Ny7opbJcigw3viraKxPfso8V7462iI8vITngHo8q4oxLs7Puvox+t1KeyaTm198+9Pu5L6SJ4Oi52oZtGHVj2qy+ari5QaSb8W9uR0Toel0aLpeLp+Ovm6IKCb5vzfxe7JfTdP3LzbJHaErp+p7lptkjtCG/xL6J/tuofpQ/5TWcR9EeHp+jZOVpmRl3ZNUeuq7JRaklz5Jd+2+xahiS3WzRc20MExMRWFvbSwzEx6XLm+/InXRPxI9M1eWlXP/V85+x+Lal3fSu74I1vH3DN+i8RXqjHnLFyG7qXXBtRTffHu5bP6miPVY+bVZGyujJhOElKMlXLdNcnyOdpGTWzc8eFBji+vm548LO4k/n3M/KfsRE9R4Kjrmr4edgxhVm031Ts37o2wU031vKXk/HkSHFnm8QyryrKJwuvgpT3g0k0tm/q3JJgYMcRwrrhLvkm213t7nJYNza1Oozm1+Y5t9vMTPy7GMVc9I9XhNeaK04k02enaraurtVbJ2Vvw2fNfBlmR5I1+s6NRrGN2Vvsyj3wmucWd717pU9Q1vTX+KO8PKlvTKrnFSi4vk/gZz+PeKNEojGFuNk462hG22veyL/G2a39/ibDWNDztEqndfVKyiCbdlSclt7uaK81bU7tRu2lGcKYv2a2vrfqcP0nF1DTzTSImsfKwwdKvvxMY7enj5fDU9TzNYzJ5mfkTvvnzlLwXkl4L0Pro1+Q8urEqhK3tpKMYLnu/IxpmhanrF6pwcG++Te28YNRj73ySLa4K6PYcOUTz85xt1KVcorqveFSa5LzfqdLTp99vmLx2+Zcxh1tzR3J78WrPefv/APVfwnGyKlBqUX3po2vDml4ut6otOza1Zj5NVldkX4rqkUwvl2HNp4mS6m+9dlLu9V3E44ErsfEmJZ2dig4ze8oNf1X5lDraOTBu4+08cx3d7r9Zx72nefF4jvH/AKVHxvwVk8I6nfV3zxIz6sZt98d+W/v8GaPS9TydF1LF1LDn1MnFsjbW/DdPk/R8n6M6j6QOG46xprya6I23UxanBrftK/FbePmc78ScGZml29vh4mVbiTeySrlKVb8n3cvJn1Xp3Vp939FtefifiY+0/lWxWuTF7lf6w6d4P4mxuLuH8TV8VOMbo7TrfOua7pR+D+rY3Rzj0McS6hwvxAtOzcfNr0zUGoy61E+rVbyjPl3J8m/d5HRxnYxRjvMR4VeSvpngAB4tAAAAAAAABrc/E6a7VtOEZLyktz9gxMcnDwy0HSpT68tNwnLzdEd/sPVVjVUrq11wgvKMUvsPoDEUrHiGPTDGxkA2ZDGxkAfjso9o7OrHrNbdbbv28tzEaa1ZKyMIdeXOSS3fxPoNjHAxsjKWwBkDDimZAGOoh1F5GQY4gY6qXgZ2AMgAAMdVDqryMgxxAx1UOqjIMemv2AAGww1ufN4tLe7qrb/wo+oMcQzE8PzGtRW0UkvRGdjIa3W3eOGH56iM9VCMVCKS37vN7mRxAxsOqkZA4gNvVgAyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//2Q==",
  "ECO-08": "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",
  "ECO-09": "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",
  "ECO-11": "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",
  "EDU-05": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFUAVQDASIAAhEBAxEB/8QAHQABAAEFAQEBAAAAAAAAAAAAAAcCBAUGCAEDCf/EAFYQAAEDAwEEBAcLBwcJCQEAAAEAAgMEBREGBxIhMQgTQVEUGCJhcYGRFRYjMkJSgpKUodIkVFZyscHRFyVDU1VikzNERWN0laKy8DU2ZHWDhIWz4fH/xAAcAQEAAQUBAQAAAAAAAAAAAAAABQEDBAYHAgj/xAA1EQEAAgECAwUGBAYDAQAAAAAAAQIDBBEFITEGEhNB0RQiUWFxkRZTgcEyQ1KhsfAHJOHx/9oADAMBAAIRAxEAPwDqdERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMJhARMIg9REQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEVL3tY0ucQAOZKxk9/gY4tiY6TzjgFga7iml0Md7U3iu/+9Or3THa/wDDDKosH74nfm4+t/8Aie+J35uPrKGjtlwn83+0+i97Jl+DOIsMNRN7ad31l6NRM7ad/wBYK5Ha7hM/zo+0+insuX4Mwit6KrFZF1gY5oJwN7tVwp/BnpmpGTHO8T0WJiYn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U36/0tX6m1ZobZzbql8Qt1ih8Nmc/wAmAP8AKlkeeHINHPmSB2rBeK9tM/s63fb2fwXviw7TTn8gt/Hgf5wbxQSRT1+ktX0V/wBFaY1XT1dsOn3Ulss7KKaMxyQnfMxkcA17nP4kjmMefOp3fTOotebJNC0eg4zXUFJA9l0oqaobG+OsJGXStJGeO/xPLOe0LBjowbTAci324HzV7FXF0ZtqMBcYaOiiLxuuMdya3eHcccwgz2g4Ztnlj2i3XWA92ZaGnpbIYI7iXda2TnE2UEloAe3IHEYPLBVxP7gXjZNZ7dpvTnvfj1bqWnpHUxq3VBkjid5Ty5w4DycY5fetVHRf2mAYFut2OePD2L3xYNpox/N9v4cvy9qqJKrrtaRqPa9qS51tVRW6mp6bTkU1E0SSxgt3X9W3OCd4j/rKtqG2UNtuezzQFlfW3WzV1e3UrrvWPa4Ttja53VsA+Ju4bvA45jvKj7xYNph4e59u+3sQdGDaaMYt9vGOX84NQZjbBp253Oe418uze52ee43JkIu8l4dLHIZJAxvwAOBvjHDsypErrjp3W20OXZddDFGywSUNVZ6hoAJkhYx00JPDm37s9wUR+LBtNP8Ao+3/AO8Gp4sG03Ofc+357/D2IN2o59TakumtZ49E++7SmobvJHIymuDYKiIwHq2uzvDDcMGM8OHPB43ujNFUGldY69dpiCr1BDb7NDRQUJrAZBNOS59O2UcAWho4j4u93qP4ejNtRpy4w0dFEXjdd1dya3eHcccwqB0X9pjeAt1uHor2BBr21KyS2Ktt8L9F1ukxJE9wgqbm6tM+CBvgk+TjljtypL6HX/eTUn+xQf8A2OWq+K/tMJ42+3euvap42BbGqvZfRV9Zd6mCa63DcY9lOS6OCNuSGhxA3iSSScY4AedUEtoiKoIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiDzITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrITIVKIKshMhUogqyEyFSiCrIRUogIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIg//2Q==",
  "SEG-02": "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",
  "SOC-13": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFUAVQDASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAAYHBAUIAQMCCf/EAFIQAAEEAQIEAwQFBwgFCAsAAAEAAgMEBQYRBxIhMRNBURQiYXEIFTKBkRcjUlWUodEWGDNCVmJysUR0gpLSJCU0NkNFk7RGU5aio7O1wtPh8f/EABwBAQACAwEBAQAAAAAAAAAAAAABAgMEBQcGCP/EADgRAAIBAgQDBAgFAwUAAAAAAAABAgMRBAUSIQYTMRRBUXEHFVNhgZLR8CIyUpGxM6HBJEJy4fH/2gAMAwEAAhEDEQA/AOqUREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERACQBuVHshxB0ti7LqtrO0GWGdHRCTmc35hu+33qN8YtSuxOPr44WJqsFiOxauzwO5ZGVIGc8jWHyc8lrAfLmXLGndWcROI2dkxOk8lHp+vHG6ZlSnN7JBCzmDQC8Dme4lzRu4kklb2FwTrRc27JFZStsdtYnUeIzzHPxeSqXAz7fgyBxZ8x3H3rIyGVpYms61kLcFSBn2pZpAxo+8rk3hXqnX7s5PDqOhlH2KcMlmtkrVRzJGui950MknKOeN7Q4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",
  "SOC-14": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFUAVQDASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAEHBggDBAUCCf/EAFcQAAEDAwEEBgQHCQsKBgMAAAEAAgMEBREGBxIhMQgTQVFhcSIygZEUFSNiobHBM0JScnN0grLSFhgkNDVDU5KTorMXJjY3RVRVY8LRJSdEZXXhg+Lx/8QAGwEBAAIDAQEAAAAAAAAAAAAAAAIDAQQFBgf/xAAyEQEAAgECBAMHAwQDAQAAAAAAAQIDBBESITFBBRNRBhQiMmFxoUKR0TOBsfEVI1Ji/9oADAMBAAIRAxEAPwDalERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQERCccSgIvnro/w2+9Ouj/AA2+9B9Ivnro/wANvvUhwcMggjvCCUREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERARFBe0c3AIJRR1jPwh706xn4QQSijrGfhD3p1jPwgglFAc13IgqUBERAXzJ9zd5FfS+Zfub/IoPMCIuang605d6g+lAp6cyHed6nd3rvAADA4BAAAApQQikqEBERARFKCEU4UIJwiIgIiIGEREBERAUYUogYTCIgYREQEwiIGEwijKCcKMKUQQvl8YeOI9q+iiDqlhYcEKF2nsDxgrrOaWnB5oIwoUphGHJT+ufJdhcFP658lzoyIiIC+Zfub/Ir6USAuY4DmQQg8+GEzOxyA5ld9rQ0AAYAXzDEIWBo9p7yvtBPYmVCIJyoREBSFCIJUEopCCFKhSEBERAREygIoTKCUXnXDUNotJxX3SipXfgzTNafcTldSm1vpmskEUF/tkjzwDRUtBPlkqPFHTdZGK8xxRWdvs9xFDXBwyMEHiD3qVJWI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",
  "SOC-15": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAFUAVQDASIAAhEBAxEB/8QAHQABAAEEAwEAAAAAAAAAAAAAAAcEBQYIAQIDCf/EAFEQAAEDAwIDBAcFBAMLCwUAAAEAAgMEBREGIQcSMRMiQVEIFDJhcYGhFUKRscEXI1JiFnLRGCQzRlRWY5KU0uElJkNERVNkg6LC4nSEk7Lw/8QAGwEBAAEFAQAAAAAAAAAAAAAAAAECAwQFBgf/xAArEQEAAQQABAUEAwEBAAAAAAAAAQIDBBEFEiExExVBUZEGMlNxFCIjYTP/2gAMAwEAAhEDEQA/ANqUREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQETKZQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQFwuV1ycqJHBf5rh72t2zhU1dcIKCB808ga1gySSov1RxMkq+entRDI+naePyV/Gxbl6eWGDl59vHp3M9fZIl01Na7NGXVlXHGfAE7lYhXcXqVmfVaV8ozgPPslRzBR3O9zEhstQ9xyXHdZNb+GdyqcOqXcrCOjdluKcLFsdL9W5aOc/Oyav8adQqJ+Ll1kd+6o4GM8ySvFnFq8NdtBTP+ZV2bwqZG3LpeUgZzIchW6fR9DCCO3pw4dS1pWJkcQ4bj/fHRcpwOKXauamvqqqTjBVcwFVQxgeJaTlZPZ+I9luTg18xppD0bL4qO5dK0biRBUuMn4BWaps81O97WkO5eod3fqeqWL3DM6P8K9SXJ4piTzXqdw2EirI6hgfE9r2noWnZerTnxWv9k1RctPSB1PK7ss4MUmeU/JStpPXNDf2mN5MNW3YxvPj7lbysCux1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",
  "SOC-16": "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",
  "SOC-17": "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",
  "SOC-18": "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",
  "SOC-19": "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",
  "SOC-20": "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",
  "ECO-01": "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",
  "GOB-01": "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",
  "GOB-02": "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"
};

/* Logo institucional de la Gobernación del Estado Táchira (escudo,
   recortado del banner oficial que suministró el usuario), usado como
   respaldo en cualquier ente que no tenga su propio logo cargado en
   logoImages -- ver enteLogoHtml. */
const GOB_TACHIRA_LOGO_B64 = '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';

/* Logo de un ente para la fila de "Segmentos de la gestión": el logo
   propio si existe, si no el de la Gobernación del Táchira, y solo si
   tampoco hay logo de respaldo cargado, un marcador honesto de
   "pendiente" (nunca un logo inventado). Sustituye al cuadro con el
   código del ente (ej. "SEG-01") que mostraba antes esa columna. */
function enteLogoHtml(a) {
  const code = txt(a && a.code);
  const own = logoImages[code];
  if (own) {
    return '<div class="ente-logo"><img src="data:image/jpeg;base64,' + own + '" alt="Logo de ' + txt(a.name).replace(/"/g, '&quot;') + '" title="' + code + '"></div>';
  }
  if (GOB_TACHIRA_LOGO_B64) {
    return '<div class="ente-logo ente-logo--gob"><img src="data:image/jpeg;base64,' + GOB_TACHIRA_LOGO_B64 + '" alt="Logo de la Gobernación del Estado Táchira" title="' + code + ' -- sin logo propio, se usa el de la Gobernación"></div>';
  }
  return '<div class="ente-logo ente-logo--pending" title="' + code + ' -- sin logo propio; pendiente el logo de la Gobernación del Táchira">GOB</div>';
}

/* ============ CALENDARIO REAL + CUMPLIMIENTO POR SEGMENTO ============
   Punto 6/7/18/19 de la corrección: ya no hay Fase 1->2->3->4. Las
   publicaciones se generan a partir de lo que ya existe (weekly,
   specials y el resumen semanal de los lunes) proyectado sobre fechas
   reales -- no se inventa contenido nuevo. Solo el ESTADO de cada
   publicación (Diseñada..Métricas cargadas) se guarda en Firestore,
   un documento pequeño por ocurrencia, igual que ya hacían los KPI. */
const WEEKDAY_KEYS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']; // índice = Date.getDay()
const WEEKDAY_LABELS = { domingo: 'Domingo', lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado' };
const MONTH_LABELS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MES_ABBR = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
const PUBLICATION_STATES = [
  { key: 'disenada', label: 'Diseñada' },
  { key: 'revisada', label: 'Revisada' },
  { key: 'aprobada', label: 'Aprobada' },
  { key: 'publicada', label: 'Publicada' },
  { key: 'reposteada', label: 'Reposteada' },
  { key: 'metricas', label: 'Métricas cargadas' }
];

function normalizeAccents(s) { return txt(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function isoOf(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function addDays(d, n) { const r = new Date(d.getTime()); r.setDate(r.getDate() + n); return r; }

/* "Fase 4 · 2 nov 2026" -> "2026-11-02" (null si no puede leerla). */
function parseSpanishDate(s) {
  const m = /(\d{1,2})\s+([a-z]{3,})\.?\s+(\d{4})/i.exec(normalizeAccents(s));
  if (!m) return null;
  const day = Number(m[1]);
  const month = MES_ABBR[m[2].slice(0, 3)];
  if (month === undefined) return null;
  return Number(m[3]) + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}

function publicationStatus(id) {
  const found = state.publications.find(function (p) { return p.id === id; });
  return (found && found.status) || 'disenada';
}

/* Genera cada casilla real del calendario dentro del período del plan. */
/* Sábado/domingo -> el lunes siguiente. Sin calendario de feriados (no
   hay una fuente real de feriados del Táchira conectada todavía) -- solo
   evita caer en fin de semana, que es la parte segura de "día hábil". */
function nextBusinessDay(d) {
  const wd = d.getDay();
  if (wd === 6) return addDays(d, 2);
  if (wd === 0) return addDays(d, 1);
  return d;
}

function buildScheduleOccurrences() {
  const start = parseISO(state.meta && state.meta.periodStart);
  const end = parseISO(state.meta && state.meta.periodEnd);
  if (!start || !end) return [];

  const weeklyByDay = {};
  state.weekly.forEach(function (w) { weeklyByDay[normalizeAccents(w.day)] = w; });
  const segMap = (state.meta && state.meta.weekdaySegments) || {};

  const specialsByDate = {};
  state.specials.forEach(function (s) {
    const iso = parseSpanishDate(s.phase);
    if (iso) specialsByDate[iso] = s;
  });

  const out = [];
  for (let d = new Date(start.getTime()); d <= end; d = addDays(d, 1)) {
    const iso = isoOf(d);
    const wd = WEEKDAY_KEYS[d.getDay()];

    if (wd === 'lunes') {
      const id = iso + '_resumen-semanal';
      out.push({
        id: id, date: iso, weekday: wd, kind: 'resumen', segment: null,
        title: 'Resumen semanal de gestión (semana anterior)', format: 'Carrusel o video corto',
        objective: 'Cierre de la semana anterior: lo más relevante de los 4 segmentos en una sola pieza.',
        time: '', status: publicationStatus(id)
      });
    }

    // Primer día hábil del mes -> resumen del mes que acaba de cerrar.
    const firstBizDay = nextBusinessDay(new Date(d.getFullYear(), d.getMonth(), 1));
    if (isoOf(firstBizDay) === iso) {
      const id = iso + '_resumen-mensual';
      out.push({
        id: id, date: iso, weekday: wd, kind: 'resumen', segment: null,
        title: 'Resumen mensual de gestión (mes anterior)', format: 'Carrusel o video corto',
        objective: 'Balance del mes que cerró: avance real por segmento y cifras verificables.',
        time: '', status: publicationStatus(id)
      });
    }

    // Días 1 y 16 (primer día hábil desde ahí) -> resumen de la quincena
    // que acaba de cerrar (1-15 y 16-fin de mes).
    [1, 16].forEach(function (dom) {
      const target = nextBusinessDay(new Date(d.getFullYear(), d.getMonth(), dom));
      if (isoOf(target) === iso) {
        const id = iso + '_resumen-quincenal-' + dom;
        out.push({
          id: id, date: iso, weekday: wd, kind: 'resumen', segment: null,
          title: 'Resumen quincenal de gestión (quincena anterior)', format: 'Carrusel o video corto',
          objective: 'Cierre de la quincena que terminó: avance real por segmento y cifras verificables.',
          time: '', status: publicationStatus(id)
        });
      }
    });

    const w = weeklyByDay[wd];
    if (w) {
      const id = iso + '_' + wd;
      out.push({
        id: id, date: iso, weekday: wd, kind: 'semanal', segment: segMap[wd] || null,
        title: txt(w.title), format: txt(w.format), objective: txt(w.objective), time: txt(w.time),
        status: publicationStatus(id)
      });
    }

    const sp = specialsByDate[iso];
    if (sp) {
      const id = iso + '_especial-' + txt(sp.id);
      out.push({
        id: id, date: iso, weekday: wd, kind: 'especial', segment: null,
        title: txt(sp.title), format: txt(sp.format), objective: txt(sp.theme), time: '',
        status: publicationStatus(id)
      });
    }
  }

  /* Propuestas de contenido ya aprobadas -- se agregan como una ocurrencia
     real por cada segmento que hayan marcado (o por los 4 segmentos, si
     se propuso para "todas las cuentas de la Gobernación"). */
  const allSegmentNums = state.accountSegments.map(function (s) { return String(s.num); });
  state.contentProposals.forEach(function (p) {
    if (p.status !== 'aprobada') return;
    const iso = txt(p.proposedDate);
    if (iso < isoOf(start) || iso > isoOf(end)) return;
    const segNums = Array.isArray(p.segments) && p.segments.indexOf('all') !== -1
      ? allSegmentNums
      : (Array.isArray(p.segments) ? p.segments.filter(function (n) { return allSegmentNums.indexOf(String(n)) !== -1; }) : []);
    segNums.forEach(function (segNum) {
      const id = iso + '_propuesta-' + txt(p.id) + '-' + segNum;
      out.push({
        id: id, date: iso, weekday: WEEKDAY_KEYS[(parseISO(iso) || new Date()).getDay()], kind: 'propuesta', segment: segNum,
        title: txt(p.format) + ' (' + PLATFORM_LABELS[p.platform] + ')', format: PLATFORM_LABELS[p.platform] + ' · ' + txt(p.format),
        objective: txt(p.description), time: '',
        status: publicationStatus(id)
      });
    });
  });

  return out;
}

function kindLabel(kind) {
  if (kind === 'semanal') return 'Pieza semanal';
  if (kind === 'especial') return 'Publicación especial';
  if (kind === 'propuesta') return 'Propuesta aprobada';
  return 'Resumen de gestión';
}

/* ============ CENTRO DE CONTROL ============
   Widgets de la nueva página de aterrizaje (antes "Resumen"). Reutilizan
   exactamente los mismos datos reales que ya alimentan el calendario, los
   segmentos y la percepción -- no son un sistema paralelo. Donde el
   dashboard de referencia mostraba "Alcance acumulado", "Engagement",
   "Rendimiento de la semana" o "Top contenidos" con cifras de ejemplo,
   aquí se deja honestamente sin datos: no hay todavía ningún scraping/API
   conectado que mida resultados reales de publicaciones (mismo principio
   que en Métricas y en la ficha de ente). "Campañas activas" y
   "Proyectos en desarrollo" del dashboard de referencia no se
   implementaron: ese concepto no existe en los datos reales de este
   plan (no hay campañas ni proyectos cargados en ningún lado). */
function pubStateLabel(key) {
  const found = PUBLICATION_STATES.find(function (s) { return s.key === key; });
  return found ? found.label : 'Diseñada';
}
function pubStateBadgeClass(key) {
  if (key === 'publicada' || key === 'reposteada' || key === 'metricas') return 'v';
  if (key === 'aprobada') return 'p';
  if (key === 'revisada') return 'c';
  return 's';
}
function controlOccurrenceRowHtml(o) {
  return '<div class="control-item">' +
    '<span class="control-item-time">' + (txt(o.time).trim() || '—') + '</span>' +
    '<div class="control-item-body">' +
      '<p class="control-item-title">' + txt(o.title) + '</p>' +
      '<span class="control-item-tag">' + kindLabel(o.kind) + '</span>' +
    '</div>' +
    '<span class="acct-badge ' + pubStateBadgeClass(o.status) + '">' + pubStateLabel(o.status) + '</span>' +
  '</div>';
}

function renderTodayPriorities() {
  const c = $('todayPriorities');
  if (!c) return;
  c.innerHTML = '';
  const today = isoOf(new Date());
  const items = buildScheduleOccurrences().filter(function (o) { return o.date === today; });
  if (!items.length) {
    c.appendChild(el('div', 'empty', 'Sin piezas del calendario programadas para hoy.'));
    return;
  }
  items.forEach(function (o) { c.appendChild(el('div', '', controlOccurrenceRowHtml(o))); });
}

function renderUpcoming7Days() {
  const c = $('upcoming7Days');
  if (!c) return;
  c.innerHTML = '';
  const today = new Date();
  const todayIso = isoOf(today);
  const limitIso = isoOf(addDays(today, 7));
  const items = buildScheduleOccurrences().filter(function (o) { return o.date > todayIso && o.date <= limitIso; });
  if (!items.length) {
    c.appendChild(el('div', 'empty', 'Sin piezas del calendario en los próximos 7 días.'));
    return;
  }
  let lastDate = '';
  items.forEach(function (o) {
    if (o.date !== lastDate) {
      lastDate = o.date;
      const d = parseISO(o.date);
      c.appendChild(el('div', 'control-day-hdr', d ? fmtDay(d) : o.date));
    }
    c.appendChild(el('div', '', controlOccurrenceRowHtml(o)));
  });
}

function computeControlAlerts() {
  const today = isoOf(new Date());
  const occurrences = buildScheduleOccurrences();
  const overdue = occurrences.filter(function (o) { return o.date < today && o.status === 'disenada'; }).length;
  const todayPending = occurrences.filter(function (o) { return o.date === today && (o.status === 'disenada' || o.status === 'revisada'); }).length;

  const allAccounts = sortDocs(state.accountSegments).reduce(function (acc, s) { return acc.concat(Array.isArray(s.accounts) ? s.accounts : []); }, []);
  const sinRedesPropias = allAccounts.filter(function (a) { return a.status === 'sin_cuenta' || a.status === 'inactiva'; }).length;

  const perc = state.perception || {};
  const percMeasured = (perc.positiva !== null && perc.positiva !== undefined && perc.positiva !== '')
    || (perc.negativa !== null && perc.negativa !== undefined && perc.negativa !== '')
    || (perc.neutra !== null && perc.neutra !== undefined && perc.neutra !== '');

  const alerts = [];
  if (overdue > 0) alerts.push({ label: 'Piezas vencidas sin avanzar de estado', n: overdue, kind: 'r' });
  if (todayPending > 0) alerts.push({ label: 'Piezas de hoy sin aprobar todavía', n: todayPending, kind: 'c' });
  if (sinRedesPropias > 0) alerts.push({ label: 'Entes sin redes propias', n: sinRedesPropias, kind: 's' });
  if (!percMeasured) alerts.push({ label: 'Percepción sin metodología de medición', n: null, kind: 's' });
  return alerts;
}

function renderControlAlerts() {
  const c = $('controlAlerts');
  if (!c) return;
  c.innerHTML = '';
  const alerts = computeControlAlerts();
  if (!alerts.length) {
    c.appendChild(el('div', 'empty', 'Sin alertas activas por ahora.'));
    return;
  }
  alerts.forEach(function (a) {
    c.appendChild(el('div', 'control-item',
      '<div class="control-item-body"><p class="control-item-title">' + a.label + '</p></div>' +
      (a.n !== null ? '<span class="acct-badge ' + a.kind + '">' + a.n + '</span>' : '<span class="acct-badge ' + a.kind + '">Pendiente</span>')));
  });
}

/* "Informes disponibles" reutiliza el generador de informe ya existente
   (buildPrintReport/printReport) y el banco real de resúmenes -- no crea
   un segundo sistema de reportes. */
function renderReportsAvailable() {
  const c = $('reportsAvailable');
  if (!c) return;
  c.innerHTML = '';
  c.appendChild(el('div', 'control-item',
    '<div class="control-item-body"><p class="control-item-title">Informe mensual de actividades de comunicación de gestión</p>' +
    '<span class="control-item-tag">Calendario, segmentos, medios, percepción</span></div>' +
    '<button type="button" class="link-btn" id="controlPrintReportBtn">Generar →</button>'));
  const summaries = sortDocs(state.contentSummaries);
  summaries.forEach(function (s) {
    const linked = !!s.linked;
    c.appendChild(el('div', 'control-item',
      '<div class="control-item-body"><p class="control-item-title">' + txt(s.type) + '</p>' +
      '<span class="control-item-tag">' + (linked ? 'Vinculado al calendario' : 'Aún no redactado') + '</span></div>' +
      '<span class="acct-badge ' + (linked ? 'v' : 's') + '">' + (linked ? 'Listo' : 'Pendiente') + '</span>'));
  });
  const btn = $('controlPrintReportBtn');
  if (btn) btn.addEventListener('click', printReport);
}

/* Fila de estadísticas operativas del Centro de Control. Programadas /
   realizadas / eventos próximos / alertas se calculan de datos reales
   del calendario y segmentos. Campañas y proyectos son conteos reales
   de colecciones nuevas (empiezan vacías). Alcance y engagement quedan
   honestamente sin dato: no hay scraping/API conectado todavía. */
/* Rendimiento real a partir de metrics.<red> de cada cuenta -- nunca
   estima ni promedia sobre cuentas sin datos.
   - engagement: suma de likes + comentarios de la muestra más reciente de
     cada cuenta con esos campos cargados (puede estar incompleto si
     todavía no se cargaron comentarios para todas las cuentas).
   - nuevosSeguidores: suma de (seguidores - seguidoresAnterior) solo en
     las cuentas donde el importador ya guardó una medición anterior real
     (ver import-social-metrics.js) -- 0 mediciones comparables = null,
     nunca se muestra un 0 que en realidad es "no medido todavía".
   - alcance/impresiones: quedan siempre null. Instagram/X/Facebook no
     muestran esas cifras en un perfil público -- solo se pueden leer con
     acceso de administrador a la cuenta (API oficial de Meta/X), que hoy
     nadie tiene conectado. */
function computeControlPerformance() {
  let engagement = 0, engagementCuentas = 0;
  let nuevosSeguidores = 0, comparablesCuentas = 0;
  allEnteMetrics().forEach(function (pm) {
    const likes = Number(pm.likes);
    if (Number.isFinite(likes)) {
      engagement += likes + (Number.isFinite(Number(pm.comentarios)) ? Number(pm.comentarios) : 0);
      engagementCuentas++;
    }
    if (Number.isFinite(Number(pm.seguidores)) && Number.isFinite(Number(pm.seguidoresAnterior))) {
      nuevosSeguidores += Number(pm.seguidores) - Number(pm.seguidoresAnterior);
      comparablesCuentas++;
    }
  });
  return {
    engagement: engagementCuentas ? engagement : null,
    engagementCuentas: engagementCuentas,
    nuevosSeguidores: comparablesCuentas ? nuevosSeguidores : null,
    comparablesCuentas: comparablesCuentas
  };
}

/* Todas las cuentas-plataforma reales de accountSegments, planas, para
   que computeControlPerformance()/computeTopContents() no dupliquen el
   recorrido de segmentos -> cuentas -> plataformas. */
function allEnteMetrics() {
  const out = [];
  sortDocs(state.accountSegments).forEach(function (s) {
    (Array.isArray(s.accounts) ? s.accounts : []).forEach(function (a) {
      const m = (a && typeof a.metrics === 'object' && a.metrics) || {};
      SOCIAL_PLATFORMS.forEach(function (p) {
        const pm = m[p.key];
        if (pm && typeof pm === 'object') out.push(Object.assign({ ente: a, platform: p }, pm));
      });
    });
  });
  return out;
}

function renderControlPerformance() {
  const perf = computeControlPerformance();
  setHTML('perfAlcance', '—');
  setHTML('perfImpresiones', '—');
  setHTML('perfEngagement', perf.engagement === null ? '—' : txt(perf.engagement));
  setHTML('perfNuevosSeguidores', perf.nuevosSeguidores === null ? '—' : (perf.nuevosSeguidores > 0 ? '+' : '') + txt(perf.nuevosSeguidores));
  const note = $('controlPerformanceNote');
  if (!note) return;
  const parts = [];
  parts.push(perf.engagement === null
    ? 'Engagement: sin cuentas con likes/comentarios cargados todavía.'
    : 'Engagement: suma real de likes + comentarios de la muestra más reciente de ' + perf.engagementCuentas + ' cuenta(s)-red.');
  parts.push(perf.nuevosSeguidores === null
    ? 'Nuevos seguidores: hace falta al menos dos mediciones de la misma cuenta para calcular una variación real -- todavía no hay ninguna comparación disponible.'
    : 'Nuevos seguidores: variación real entre la medición anterior y la actual en ' + perf.comparablesCuentas + ' cuenta(s)-red.');
  parts.push('Alcance e impresiones no están disponibles: esas cifras no se muestran en un perfil público, solo con acceso de administrador a la cuenta (API oficial de Meta/X), que hoy no está conectado.');
  note.textContent = parts.join(' ');
}

/* Top contenidos real: junta publicacionDestacada de cada cuenta-red ya
   medida y ordena por likes + comentarios. Es la publicación más
   comentada/gustada de la MUESTRA más reciente de cada cuenta (no
   necesariamente publicada esta semana calendario) -- se rotula así,
   nunca como "de esta semana" sin serlo. */
function computeTopContents(limit) {
  const rows = allEnteMetrics()
    .filter(function (pm) { return pm.publicacionDestacada && txt(pm.publicacionDestacada.titulo).trim(); })
    .map(function (pm) {
      const likes = Number(pm.publicacionDestacada.likes);
      const interacciones = (Number.isFinite(likes) ? likes : 0);
      return { ente: pm.ente, platform: pm.platform, titulo: txt(pm.publicacionDestacada.titulo), likes: Number.isFinite(likes) ? likes : null, interacciones: interacciones };
    });
  rows.sort(function (a, b) { return b.interacciones - a.interacciones; });
  return rows.slice(0, limit || 5);
}

function renderTopContents() {
  const c = $('topContentsList');
  if (!c) return;
  const rows = computeTopContents(5);
  if (!rows.length) {
    c.innerHTML = '<div class="empty">Sin publicaciones con métricas registradas todavía: requiere datos de interacción por publicación, que hoy no vienen de ninguna fuente conectada.</div>';
    return;
  }
  c.innerHTML = rows.map(function (r) {
    return '<div class="control-item">' +
      enteLogoHtml(r.ente) +
      '<div class="control-item-body">' +
        '<p class="control-item-title">' + r.titulo + '</p>' +
        '<span class="control-item-tag">' + txt(r.ente.name) + ' · ' + r.platform.label + '</span>' +
      '</div>' +
      '<span class="acct-badge v">' + (r.likes === null ? 'Sin likes' : r.likes + ' likes') + '</span>' +
    '</div>';
  }).join('');
}

function renderControlStats() {
  const c = $('controlStatGrid');
  if (!c) return;
  c.innerHTML = '';
  const today = new Date();
  const dow = today.getDay();
  const weekStart = addDays(today, dow === 0 ? -6 : 1 - dow);
  const weekEnd = addDays(weekStart, 6);
  const weekStartIso = isoOf(weekStart), weekEndIso = isoOf(weekEnd);
  const todayIso = isoOf(today);

  const occurrences = buildScheduleOccurrences();
  const thisWeek = occurrences.filter(function (o) { return o.date >= weekStartIso && o.date <= weekEndIso; });
  const done = thisWeek.filter(function (o) { return o.status === 'publicada' || o.status === 'reposteada' || o.status === 'metricas'; }).length;
  const scheduled = thisWeek.length - done;
  const upcomingEvents = occurrences.filter(function (o) { return o.kind === 'especial' && o.date > todayIso; }).length;
  const alerts = computeControlAlerts();
  const perf = computeControlPerformance();

  [
    { num: String(scheduled), lbl: 'Publicaciones programadas (semana)' },
    { num: String(done), lbl: 'Publicaciones realizadas (semana)' },
    { num: String(upcomingEvents), lbl: 'Eventos próximos' },
    { num: String(state.campaigns.length), lbl: 'Campañas activas' },
    { num: String(state.projects.length), lbl: 'Proyectos en desarrollo' },
    { num: '—', lbl: 'Alcance acumulado (sin datos)' },
    { num: perf.engagement === null ? '—' : String(perf.engagement), lbl: perf.engagement === null ? 'Engagement (sin datos)' : 'Engagement (likes + comentarios)' },
    { num: String(alerts.length), lbl: 'Alertas pendientes' }
  ].forEach(function (st) {
    c.appendChild(el('div', 'card stat-card', '<div class="num">' + st.num + '</div><div class="lbl">' + st.lbl + '</div>'));
  });
}

/* Radar de coyuntura: temas reales en monitoreo. Colección "coyuntura"
   se llena con scripts/monitor-coyuntura.js (Google News, ver README) --
   nunca se inventan temas ni menciones. "sentimiento" nunca lo pone el
   script solo (no hay análisis de sentimiento real conectado): queda sin
   clasificar hasta que alguien del equipo lo revise a mano. */
function renderCoyuntura() {
  const c = $('coyunturaGrid');
  if (!c) return;
  c.innerHTML = '';
  const items = sortDocs(state.coyuntura);
  if (!items.length) {
    c.appendChild(el('div', 'empty', 'Estructura preparada, sin datos todavía: requiere un monitoreo real de medios/redes por tema, que no está conectado. No se muestran temas ni menciones de ejemplo.'));
    return;
  }
  items.forEach(function (t) {
    const sentimiento = txt(t.sentimiento);
    const badge = /positiv/i.test(sentimiento) ? 'v' : /negativ/i.test(sentimiento) ? 'x' : 's';
    const articulos = Array.isArray(t.articulos) ? t.articulos.slice(0, 3) : [];
    const articulosHtml = articulos.length
      ? '<div class="coyuntura-articulos">' + articulos.map(function (a) {
          return a.url
            ? '<a href="' + txt(a.url) + '" target="_blank" rel="noopener noreferrer">' + txt(a.titulo) + '</a>'
            : '<span>' + txt(a.titulo) + '</span>';
        }).join('') + '</div>'
      : '';
    c.appendChild(el('div', 'coyuntura-tile',
      '<div><p class="coyuntura-tema">' + txt(t.tema) + '</p>' +
      '<p class="coyuntura-menciones">Menciones: <b>' + txt(t.menciones) + '</b>' +
        (t.actualizado ? ' · actualizado ' + txt(t.actualizado) : '') + '</p>' +
      articulosHtml + '</div>' +
      '<span class="acct-badge ' + badge + '">' + (sentimiento || 'Sin clasificar') + '</span>'));
  });
}

/* ============ CAMPAÑAS Y PROYECTOS (Centro de Control) ============
   Formulario simple para que el equipo cargue directamente el estado
   real de campañas y proyectos -- no existe ninguna fuente externa de
   la que "scrapear" esto (es información interna de gestión), así que
   la única forma honesta de tenerla es que alguien la escriba. Mismo
   patrón de escritura que "Proponer contenido": abierto a cualquiera con
   la contraseña general del equipo, sin necesidad de modo administrador
   (no es una propuesta que alguien más deba aprobar, es un hecho real que
   el equipo ya decidió). */
const CAMPAIGN_ESTADOS = ['Activa', 'En pausa', 'Finalizada'];
const PROJECT_ESTADOS = ['En planificación', 'En ejecución', 'Finalizado', 'Detenido'];
let campaignProjectContext = null; // 'campaigns' | 'projects'

function openCampaignProjectForm(kind) {
  campaignProjectContext = kind;
  const isCampaign = kind === 'campaigns';
  setHTML('campaignProjectModalTitle', isCampaign ? 'Agregar campaña' : 'Agregar proyecto');
  setHTML('campaignProjectModalSubtitle', isCampaign ? 'Aparece en "Campañas activas" del Centro de Control.' : 'Aparece en "Proyectos en desarrollo" del Centro de Control.');

  const estadoSel = $('cpEstado');
  if (estadoSel) {
    const opts = isCampaign ? CAMPAIGN_ESTADOS : PROJECT_ESTADOS;
    estadoSel.innerHTML = opts.map(function (o) { return '<option value="' + o + '">' + o + '</option>'; }).join('');
  }
  ['cpNombre', 'cpDescripcion', 'cpFechaInicio', 'cpResponsable'].forEach(function (id) { const f = $(id); if (f) f.value = ''; });
  const msg = $('campaignProjectMsg'); if (msg) { msg.textContent = ''; msg.className = 'fb-msg'; }

  const dialog = $('campaignProjectModal');
  if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
}

function closeCampaignProjectModal() {
  const dialog = $('campaignProjectModal');
  if (dialog) dialog.close();
}

function submitCampaignProject(e) {
  e.preventDefault();
  if (!campaignProjectContext) return;
  const msg = $('campaignProjectMsg');
  const setMsg = function (text, kind) { if (msg) { msg.textContent = text; msg.className = 'fb-msg' + (kind ? ' ' + kind : ''); } };

  if (!fb.live) { setMsg('Conecta primero con Firestore (ver el estado en la barra lateral) antes de guardar -- necesita quedar guardado ahí para que todo el equipo lo vea.', 'err'); return; }

  const nombre = txt($('cpNombre') && $('cpNombre').value).trim();
  const estado = txt($('cpEstado') && $('cpEstado').value).trim();
  const descripcion = txt($('cpDescripcion') && $('cpDescripcion').value).trim();
  const fechaInicio = txt($('cpFechaInicio') && $('cpFechaInicio').value).trim();
  const responsable = txt($('cpResponsable') && $('cpResponsable').value).trim();

  if (!nombre) { setMsg('Escribe un nombre antes de guardar.', 'err'); return; }
  if (!estado) { setMsg('Elige un estado.', 'err'); return; }

  const doc = { nombre: nombre, estado: estado, createdAt: new Date().toISOString() };
  if (descripcion) doc.descripcion = descripcion;
  if (fechaInicio) doc.fechaInicio = fechaInicio;
  if (responsable) doc.responsable = responsable;

  setMsg('Guardando…', 'ok');
  fb.api.addDoc(fb.api.collection(fb.db, BRAND_SLUG, 'plan', campaignProjectContext), doc)
    .then(function () {
      toast((campaignProjectContext === 'campaigns' ? 'Campaña' : 'Proyecto') + ' guardado.');
      closeCampaignProjectModal();
    })
    .catch(function (err) { setMsg('No se pudo guardar: ' + (err && err.code ? err.code : 'error'), 'err'); });
}

function deleteCampaignProject(kind, id) {
  if (!fb.live) { toast('Conecta con Firestore para eliminar.'); return; }
  if (!window.confirm('¿Eliminar este ' + (kind === 'campaigns' ? 'campaña' : 'proyecto') + '? Esta acción no se puede deshacer.')) return;
  fb.api.deleteDoc(fb.api.doc(fb.db, BRAND_SLUG, 'plan', kind, txt(id)))
    .then(function () { toast('Eliminado.'); })
    .catch(function (err) { toast('No se pudo eliminar: ' + (err && err.code ? err.code : 'error')); });
}

function campaignProjectItemHtml(kind, item) {
  return '<div class="cp-item">' +
    '<div><p class="cp-item-name">' + txt(item.nombre) + '</p>' +
    '<p class="cp-item-meta">' + txt(item.estado) +
      (item.fechaInicio ? ' · desde ' + txt(item.fechaInicio) : '') +
      (item.responsable ? ' · ' + txt(item.responsable) : '') + '</p>' +
    (txt(item.descripcion).trim() ? '<p class="cp-item-desc">' + txt(item.descripcion) + '</p>' : '') + '</div>' +
    '<button type="button" class="cp-item-del" data-kind="' + kind + '" data-id="' + txt(item.id) + '">Eliminar</button>' +
  '</div>';
}

function renderCampaignsProjects() {
  [['campaigns', 'campaignsList', 'Sin campañas cargadas todavía.'], ['projects', 'projectsList', 'Sin proyectos cargados todavía.']].forEach(function (cfg) {
    const kind = cfg[0], elId = cfg[1], emptyMsg = cfg[2];
    const c = $(elId);
    if (!c) return;
    const items = sortDocs(state[kind]);
    c.innerHTML = items.length
      ? items.map(function (it) { return campaignProjectItemHtml(kind, it); }).join('')
      : '<div class="empty">' + emptyMsg + '</div>';
    c.querySelectorAll('.cp-item-del').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteCampaignProject(btn.dataset.kind, btn.dataset.id); });
    });
  });
}

function wireCampaignProjectForm() {
  const dialog = $('campaignProjectModal');
  const form = $('campaignProjectForm');
  if (!dialog || !form) return;
  $('campaignProjectModalCloseBtn').addEventListener('click', closeCampaignProjectModal);
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  form.addEventListener('submit', submitCampaignProject);
  const addCampaignBtn = $('addCampaignBtn');
  if (addCampaignBtn) addCampaignBtn.addEventListener('click', function () { openCampaignProjectForm('campaigns'); });
  const addProjectBtn = $('addProjectBtn');
  if (addProjectBtn) addProjectBtn.addEventListener('click', function () { openCampaignProjectForm('projects'); });
}

/* ---- Gráfico: piezas planificadas por segmento y mes (Resumen) ---- */
/* Lista de meses del período del plan, con el mes real de hoy marcado
   -- se reutiliza en la tabla de "Piezas planificadas por segmento y
   mes" y en la tabla de seguimiento mensual por organismo. */
function complianceMonthDefs() {
  const start = parseISO(state.meta && state.meta.periodStart);
  const end = parseISO(state.meta && state.meta.periodEnd);
  if (!start || !end) return null;
  const todayKey = (function () { const t = new Date(); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0'); })();
  const months = [];
  for (let c = new Date(start.getFullYear(), start.getMonth(), 1); c <= new Date(end.getFullYear(), end.getMonth(), 1); c = new Date(c.getFullYear(), c.getMonth() + 1, 1)) {
    const key = c.getFullYear() + '-' + String(c.getMonth() + 1).padStart(2, '0');
    const lbl = MONTH_LABELS[c.getMonth()];
    months.push({ key: key, label: lbl.charAt(0).toUpperCase() + lbl.slice(1), isCurrent: key === todayKey });
  }
  return months;
}

function renderComplianceChart() {
  const box = $('complianceChart');
  if (!box) return;
  box.innerHTML = '';

  const months = complianceMonthDefs();
  if (!months) { box.appendChild(el('div', 'empty', 'Sin período de plan cargado todavía.')); return; }

  const occurrences = buildScheduleOccurrences();
  const counts = {};
  occurrences.forEach(function (o) {
    if (!o.segment) return;
    counts[o.segment] = counts[o.segment] || {};
    const mk = o.date.slice(0, 7);
    counts[o.segment][mk] = (counts[o.segment][mk] || 0) + 1;
  });

  const segments = sortDocs(state.accountSegments);
  if (!segments.length) { box.appendChild(el('div', 'empty', 'Sin segmentos cargados todavía.')); return; }

  const maxCount = Math.max.apply(null, [1].concat(segments.map(function (s) {
    return Math.max.apply(null, [0].concat(months.map(function (mo) { return (counts[s.num] && counts[s.num][mo.key]) || 0; })));
  })));

  // ---- Tabla segmento x mes: se recalcula en cada render con la fecha
  // real del navegador, así que el mes "actual" resaltado avanza solo
  // con el calendario, sin tocar código. ----
  const theadHtml = '<thead><tr><th></th>' +
    months.map(function (mo) { return '<th class="compliance-month-col' + (mo.isCurrent ? ' is-current' : '') + '">' + mo.label + (mo.isCurrent ? ' <span class="compliance-current-tag">actual</span>' : '') + '</th>'; }).join('') +
    '</tr></thead>';

  let tbodyHtml = '<tbody>';
  segments.forEach(function (s, i) {
    const shade = PHASE_SHADES[i % PHASE_SHADES.length];
    tbodyHtml += '<tr><td class="compliance-seg-name">' + String(txt(s.num)).padStart(2, '0') + ' · ' + txt(s.name) + '</td>';
    months.forEach(function (mo) {
      const n = (counts[s.num] && counts[s.num][mo.key]) || 0;
      const pct = Math.round(pctOf(n, maxCount));
      tbodyHtml += '<td class="' + (mo.isCurrent ? 'is-current' : '') + '">' +
        '<div class="compliance-cell">' +
          '<div class="compliance-cell-track"><div class="compliance-cell-fill" style="width:' + pct + '%;background:' + shade + '"></div></div>' +
          '<span class="compliance-cell-val">' + n + '</span>' +
        '</div></td>';
    });
    tbodyHtml += '</tr>';
  });
  tbodyHtml += '</tbody>';

  box.appendChild(el('div', 'table-wrap', '<table class="compliance-table">' + theadHtml + tbodyHtml + '</table>'));

  // Las piezas se planifican por segmento (día de la semana -> segmento),
  // no por ente específico -- no existe un dato real de "cuántas piezas
  // le tocan a cada organismo". En vez de inventar ese reparto, se lista
  // aquí, a pedido del usuario, cada organismo real de cada segmento.
  const rosterBox = el('div', 'compliance-roster');
  segments.forEach(function (s, i) {
    const shade = PHASE_SHADES[i % PHASE_SHADES.length];
    const accountsOfSeg = Array.isArray(s.accounts) ? s.accounts : [];
    if (!accountsOfSeg.length) return;
    const chipsHtml = accountsOfSeg.map(function (a) {
      return '<span class="compliance-ente-chip" style="border-color:' + shade + '55;">' + txt(a.name) + '</span>';
    }).join('');
    rosterBox.appendChild(el('div', 'chart-ente-breakdown',
      '<span class="chart-ente-breakdown-lbl">' + String(txt(s.num)).padStart(2, '0') + ' · ' + txt(s.name) + ' -- organismos de este segmento (' + accountsOfSeg.length + '); las piezas se planifican por segmento, no todavía por organismo individual</span>' +
      '<div class="compliance-ente-chips">' + chipsHtml + '</div>'));
  });
  box.appendChild(rosterBox);
}

/* ---- Hitos de gestión (antes: bloques de "Fase N", ahora sin encadenarlos) ---- */
function renderMilestones() {
  const list = $('milestonesList');
  if (!list) return;
  list.innerHTML = '';
  const phases = sortDocs(state.phases);
  if (!phases.length) { list.appendChild(el('div', 'empty', 'Sin hitos cargados todavía.')); return; }
  phases.forEach(function (p) {
    const s = parseISO(p.start), e = parseISO(p.end);
    list.appendChild(el('div', 'card',
      '<div class="symbol-tag">' + (s && e ? fmtDay(s) + ' – ' + fmtDay(e) : '') + '</div>' +
      (txt(p.pillar).trim() ? '<p style="margin:0 0 6px;font-size:11.5px;font-weight:600;color:var(--brand-deep-2);">' + txt(p.pillar) + '</p>' : '') +
      '<p style="margin:0;font-size:13px;color:var(--black);">' + txt(p.milestone) + '</p>'));
  });
}

/* ---- Calendario mensual real (lunes primero) ---- */
let calendarViewDate = null;

function initCalendarView() {
  const start = parseISO(state.meta && state.meta.periodStart);
  const end = parseISO(state.meta && state.meta.periodEnd);
  const today = new Date();
  let ref = today;
  if (start && today < start) ref = start;
  if (end && today > end) ref = end;
  calendarViewDate = { year: ref.getFullYear(), month: ref.getMonth() };
}

function shiftCalendarMonth(delta) {
  if (!calendarViewDate) initCalendarView();
  let m = calendarViewDate.month + delta, y = calendarViewDate.year;
  while (m < 0) { m += 12; y--; }
  while (m > 11) { m -= 12; y++; }
  calendarViewDate = { year: y, month: m };
  renderCalendar();
}

function renderCalendar() {
  const grid = $('calGrid');
  const legend = $('calLegend');
  if (!grid) return;
  if (!calendarViewDate) initCalendarView();

  const occurrences = buildScheduleOccurrences();
  const byDate = {};
  occurrences.forEach(function (o) { (byDate[o.date] = byDate[o.date] || []).push(o); });

  const y = calendarViewDate.year, m = calendarViewDate.month;
  setHTML('calMonthLabel', MONTH_LABELS[m].charAt(0).toUpperCase() + MONTH_LABELS[m].slice(1) + ' ' + y);

  const firstOfMonth = new Date(y, m, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // lunes = 0
  const gridStart = addDays(firstOfMonth, -startOffset);
  const todayIso = isoOf(new Date());

  grid.innerHTML = '';
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    const iso = isoOf(d);
    const inMonth = d.getMonth() === m;
    const dayItems = byDate[iso] || [];
    const cell = el('div', 'cal-day' + (inMonth ? '' : ' outside') + (iso === todayIso ? ' today' : ''));
    let html = '<span class="num">' + d.getDate() + '</span>';
    dayItems.forEach(function (o) {
      const shade = o.segment ? PHASE_SHADES[(Number(o.segment) - 1) % PHASE_SHADES.length] : '#948ca3';
      html += '<button type="button" class="cal-pub" style="border-left-color:' + shade + '" data-pub="' + o.id + '">' + txt(o.title) + '</button>';
    });
    cell.innerHTML = html;
    grid.appendChild(cell);
  }
  grid.querySelectorAll('.cal-pub').forEach(function (btn) {
    btn.addEventListener('click', function () { openPubModal(btn.dataset.pub, occurrences); });
  });

  if (legend) {
    legend.innerHTML = '';
    sortDocs(state.accountSegments).forEach(function (s, i) {
      legend.appendChild(el('span', '', '<span class="sw" style="background:' + PHASE_SHADES[i % PHASE_SHADES.length] + '"></span>' + txt(s.name)));
    });
    legend.appendChild(el('span', '', '<span class="sw" style="background:#948ca3"></span>Resumen / especial transversal'));
  }
}

function wireCalendarNav() {
  $('calPrevBtn').addEventListener('click', function () { shiftCalendarMonth(-1); });
  $('calNextBtn').addEventListener('click', function () { shiftCalendarMonth(1); });
}

/* ---- Modal de detalle + estado de la publicación ---- */
function openPubModal(pubId, occurrencesCache) {
  const list = occurrencesCache || buildScheduleOccurrences();
  const pub = list.find(function (o) { return o.id === pubId; });
  if (!pub) return;
  const segObj = pub.segment ? state.accountSegments.find(function (s) { return String(s.num) === String(pub.segment); }) : null;
  const d = parseISO(pub.date);

  setHTML('pubModalDate', d ? WEEKDAY_LABELS[pub.weekday] + ' · ' + fmtDay(d) + ' de ' + d.getFullYear() : '');
  setHTML('pubModalDay', pub.title);

  const body = $('pubModalBody');
  body.innerHTML =
    '<div class="pub-detail-row"><span class="k">Tipo</span><span class="v">' + kindLabel(pub.kind) + '</span></div>' +
    (segObj ? '<div class="pub-detail-row"><span class="k">Segmento</span><span class="v">' + txt(segObj.name) + '</span></div>' : '') +
    (txt(pub.format).trim() ? '<div class="pub-detail-row"><span class="k">Formato</span><span class="v">' + txt(pub.format) + '</span></div>' : '') +
    (txt(pub.time).trim() ? '<div class="pub-detail-row"><span class="k">Horario</span><span class="v">' + txt(pub.time) + '</span></div>' : '') +
    '<p class="pub-objective">' + txt(pub.objective) + '</p>' +
    '<div class="pub-status-steps" id="pubStatusSteps"></div>';

  const steps = $('pubStatusSteps');
  PUBLICATION_STATES.forEach(function (st) {
    const btn = el('button', 'pub-status-btn' + (pub.status === st.key ? ' active' : ''), txt(st.label));
    btn.type = 'button';
    btn.addEventListener('click', function () { setPublicationStatus(pub.id, st.key); });
    steps.appendChild(btn);
  });

  const dialog = $('pubModal');
  if (typeof dialog.showModal === 'function') dialog.showModal();
}

function setPublicationStatus(pubId, status) {
  const existing = state.publications.find(function (p) { return p.id === pubId; });
  const prev = existing ? existing.status : 'disenada';
  const next = (prev === status) ? 'disenada' : status; // volver a pulsar = reiniciar

  if (existing) existing.status = next;
  else state.publications.push({ id: pubId, status: next });

  renderCalendar();
  openPubModal(pubId);

  if (fb.live) {
    fb.api.setDoc(fb.api.doc(fb.db, BRAND_SLUG, 'plan', 'publications', pubId), { status: next }, { merge: true })
      .catch(function (err) { toast('No se pudo guardar en Firestore: ' + (err && err.code ? err.code : 'error')); });
  } else {
    safeStorage.set(LS_PREFIX + 'publications_v1', state.publications);
  }
}

function wirePubModal() {
  const dialog = $('pubModal');
  $('pubModalClose').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
}

function renderStaticTables() {
  // "Multiplataforma" dejó de ser una pestaña propia (punto 25 de la
  // corrección): platformRows queda aquí sin usar hasta que se
  // re-asocie a entes/publicaciones en el calendario.
  const pb = $('platformBody');
  if (pb) {
    pb.innerHTML = '';
    platformRows.forEach(function (r) {
      pb.appendChild(el('tr', '',
        '<td class="rowlabel">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td>'));
    });
  }
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

/* Una tarjeta igual en estilo a las de "KPI por pieza semanal", pero con
   la medición real por institución que pidió el usuario: seguidores,
   likes y la publicación con más interacción. No lleva botones de
   Bien/Proceso/Atención -- esos califican una pieza contra una meta
   definida, y aquí no hay meta que calificar, solo una cifra medida (o,
   por ahora, sin medir todavía -- nunca un cero inventado). */
/* Igual que en la ficha del ente: una fila real por cada red que el
   ente tiene de verdad (nunca un número combinado entre redes). El
   detalle completo (publicaciones, likes, publicación destacada) queda
   en "Ver ficha completa" para no hacer la tarjeta demasiado larga. */
function institutionKpiCardHtml(a, segNum) {
  const social = parseAccountSocial(a);
  const metricsByPlatform = (a && typeof a.metrics === 'object' && a.metrics) || {};
  let rows;
  if (social.central) {
    rows = '<div class="kpi-row"><span class="k">Redes</span><span class="v" style="color:var(--gray-soft);font-weight:500;">Usa cuenta central</span></div>';
  } else {
    const platforms = SOCIAL_PLATFORMS.filter(function (p) { return !!social[p.key]; });
    if (!platforms.length) {
      rows = '<div class="kpi-row"><span class="k">Redes</span><span class="v" style="color:var(--gray-soft);font-weight:500;">Sin redes propias</span></div>';
    } else {
      rows = platforms.map(function (p) {
        const pm = (metricsByPlatform[p.key] && typeof metricsByPlatform[p.key] === 'object') ? metricsByPlatform[p.key] : {};
        const seg = pm.seguidores;
        const has = seg !== undefined && seg !== null && seg !== '';
        let v;
        if (pm.estado === 'no_existe') v = '<span class="v" style="color:#b91c1c;font-weight:600;">No existe</span>';
        else if (pm.estado === 'suspendida') v = '<span class="v" style="color:#b91c1c;font-weight:600;">Suspendida</span>';
        else if (has) v = '<span class="v">' + txt(seg) + (pm.estimado ? ' aprox.' : '') + ' seguidores' + (pm.estado === 'sin_publicaciones' ? ' (sin publicaciones)' : pm.estado === 'inactiva' ? ' (inactiva)' : '') + '</span>';
        else v = '<span class="v" style="color:var(--gray-soft);font-weight:500;">Sin datos cargados</span>';
        return '<div class="kpi-row"><span class="k">' + p.label + '</span>' + v + '</div>';
      }).join('');
    }
  }
  return '<div class="kpi-card-head">' + enteLogoHtml(a) + '<p class="piece">' + txt(a.name) + '</p></div>' +
    rows +
    '<button type="button" class="ente-detail-btn" data-seg="' + txt(segNum) + '" data-code="' + txt(a.code).replace(/"/g, '&quot;') + '">Ver ficha completa →</button>';
}

function renderInstitutionKpis() {
  const c = $('kpiInstitutions');
  if (!c) return;
  c.innerHTML = '';
  const accounts = sortDocs(state.accountSegments).reduce(function (acc, s) {
    return acc.concat((Array.isArray(s.accounts) ? s.accounts : []).map(function (a) { return { account: a, segNum: s.num }; }));
  }, []);
  if (!accounts.length) {
    c.appendChild(el('div', 'empty', 'Sin instituciones cargadas todavía.'));
    return;
  }
  accounts.forEach(function (entry) {
    const card = el('div', 'card kpi-card', institutionKpiCardHtml(entry.account, entry.segNum));
    const btn = card.querySelector('.ente-detail-btn');
    if (btn) btn.addEventListener('click', function () { openEnteModal(btn.dataset.seg, btn.dataset.code); });
    c.appendChild(card);
  });
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

  const occurrences = buildScheduleOccurrences();
  const statusCounts = {};
  PUBLICATION_STATES.forEach(function (s) { statusCounts[s.key] = 0; });
  occurrences.forEach(function (o) { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  const reportSegments = sortDocs(state.accountSegments);
  const segMap = (state.meta && state.meta.weekdaySegments) || {};

  const newsByScope = { regional: 0, nacional: 0, internacional: 0 };
  state.newsSources.forEach(function (n) { if (newsByScope[n.scope] !== undefined) newsByScope[n.scope]++; });
  const opinionCount = state.newsItems.length;

  const perc = state.perception || {};
  const hasPerception = (perc.positiva !== null && perc.positiva !== undefined && perc.positiva !== '')
    || (perc.negativa !== null && perc.negativa !== undefined && perc.negativa !== '')
    || (perc.neutra !== null && perc.neutra !== undefined && perc.neutra !== '');

  let html =
    '<h1>Informe mensual de actividades de comunicación de gestión</h1>' +
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

  html += '<h2><span>Calendario del período · piezas por estado</span></h2><ul>';
  PUBLICATION_STATES.forEach(function (s) {
    html += '<li>' + s.label + ' — <b>' + (statusCounts[s.key] || 0) + '</b></li>';
  });
  html += '</ul>';

  html += '<h2><span>Segmentos de la gestión y entes</span></h2><ul>';
  reportSegments.forEach(function (s) {
    const accounts = Array.isArray(s.accounts) ? s.accounts : [];
    const activeCount = accounts.filter(hasActiveSocial).length;
    const days = Object.keys(segMap).filter(function (k) { return segMap[k] && String(segMap[k]) === String(s.num); });
    const freq = days.length ? days.map(function (d) { return WEEKDAY_LABELS[d]; }).join(', ') : 'sin día asignado todavía';
    html += '<li>' + txt(s.name) + ' — ' + accounts.length + ' entes, ' + activeCount + ' con redes activas · frecuencia planificada: ' + freq + '</li>';
  });
  html += '</ul>';

  html += '<h2><span>Medios y matrices de opinión</span></h2><ul>' +
    '<li>Directorio de fuentes — Regional (Táchira): <b>' + newsByScope.regional + '</b> · Nacional: <b>' + newsByScope.nacional + '</b> · Internacional: <b>' + newsByScope.internacional + '</b></li>' +
    '<li>Noticias reales cargadas sobre la gestión: <b>' + opinionCount + '</b></li>' +
  '</ul>';

  html += '<h2><span>Percepción sobre la gestión</span></h2>';
  if (hasPerception) {
    html += '<ul>' +
      '<li>Positiva — <b>' + (perc.positiva !== null && perc.positiva !== undefined && perc.positiva !== '' ? txt(perc.positiva) + '%' : 'sin datos') + '</b></li>' +
      '<li>Negativa — <b>' + (perc.negativa !== null && perc.negativa !== undefined && perc.negativa !== '' ? txt(perc.negativa) + '%' : 'sin datos') + '</b></li>' +
      '<li>Neutra — <b>' + (perc.neutra !== null && perc.neutra !== undefined && perc.neutra !== '' ? txt(perc.neutra) + '%' : 'sin datos') + '</b></li>' +
    '</ul>';
  } else {
    html += '<p class="rep-meta">Sin metodología de medición todavía -- no se muestran cifras estimadas.</p>';
  }

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
     newsItems/{id}       (curadas a mano: cada una es una noticia real
                            con foto, titular, medio, fecha, resumen breve
                            y enlace real a la nota; empieza vacía a
                            propósito -- no se cargan noticias de ejemplo)
     contentSummaries/{1..4}
     publications/{fecha_tipo}   (solo el campo "status" -- las
                                  publicaciones se generan en vivo desde
                                  weekly+specials+meta.weekdaySegments;
                                  ver buildScheduleOccurrences())
     perception/main      (documento único; positiva/negativa/neutra
                            quedan en null hasta que exista una
                            metodología real de medición -- no se
                            inventan cifras de percepción ciudadana)
     campaigns/{id}        (Campañas activas del Centro de Control; se
                            cargan con el formulario "+ Agregar campaña"
                            -- {nombre, estado: 'Activa'|'En pausa'|
                            'Finalizada', descripcion?, fechaInicio?,
                            responsable?, createdAt} -- empieza vacía,
                            no existe ninguna fuente externa de la que
                            "scrapear" esto, es información interna)
     projects/{id}         (Proyectos en desarrollo del Centro de
                            Control; mismo formulario -- {nombre,
                            estado: 'En planificación'|'En ejecución'|
                            'Finalizado'|'Detenido', descripcion?,
                            fechaInicio?, responsable?, createdAt})
     coyuntura/{id}        (Radar de coyuntura; se llena con
                            scripts/monitor-coyuntura.js, ver README.
                            {tema, menciones, articulos: [{titulo, fuente,
                            fecha, url}], fuente: 'google-news-rss',
                            actualizado, sentimiento} -- "sentimiento" no
                            lo pone nunca el script, solo lo conserva si
                            ya estaba cargado a mano; no hay análisis de
                            sentimiento real conectado.)
   platformRows y reportRows son iguales para las tres marcas y quedan
   fijas en el código (no viven en Firestore).

   ---- Scraping/API (puntos 37-39 de la corrección) ----
   accountSegments/{seg}.accounts[].director = {
     nombre, instagram, tiktok, x, facebook   (handles "@usuario" o URL)
   }
   accountSegments/{seg}.accounts[].metrics = {
     instagram: { ... }, tiktok: { ... }, x: { ... }, facebook: { ... }
   }
   -- cada objeto de plataforma (solo se llena para las redes que el
   ente tiene de verdad, ver parseAccountSocial) trae:
     estado                 'activa'|'inactiva'|'suspendida'|
                             'sin_publicaciones'|'no_existe' -- verificación
                             real de la cuenta, no una suposición por tener
                             un handle anotado. Ver socialPillsHtml():
                             'suspendida'/'no_existe' quitan el enlace
                             clicable (cuenta rota o inexistente).
     seguidores, publicacionesHistorico, publicacionesUltimoMes,
     ultimaPublicacion       fecha 'YYYY-MM-DD' de la última publicación real
     estimado                true si el número de seguidores/publicaciones
                             venía redondeado en el origen (ej. "17.1K")
                             en vez de una cifra exacta
     likes, comentarios,     de la misma muestra de publicaciones recientes
     muestraLikes            (likes+comentarios alimentan Engagement real
                             en Centro de Control, ver computeControlPerformance())
     seguidoresAnterior,     el valor de "seguidores"/"actualizado" que
     seguidoresAnteriorFecha tenía la medición ANTERIOR, antes de que
                             import-social-metrics.js los sobrescribiera --
                             permite calcular "Nuevos seguidores" real
                             (diferencia entre dos mediciones reales, nunca
                             una estimación). Aparece solo desde la segunda
                             vez que se importa una cuenta.
     compartidos, alcance, impresiones, frecuenciaPublicacion
                             (alcance/impresiones nunca se llenan por esta
                             vía -- ninguna red los muestra en un perfil
                             público; solo con acceso de administrador a
                             la cuenta vía API oficial)
     publicacionDestacada: { titulo, likes }   (la publicación con más
                                                 interacción y likes de la
                                                 muestra -- alimenta "Top
                                                 contenidos" en Centro de
                                                 Control, ver computeTopContents())
   Las métricas nunca se combinan entre redes -- mismo principio que el
   estado Activo/Inactivo por plataforma (punto 14).
   openEnteModal() y las tarjetas de "KPI semanal por institución"
   (institutionKpiCardHtml()) ya muestran estos datos reales en cuanto
   existan en el documento del ente; si no existen, siguen mostrando
   "Sin datos cargados" (nunca un cero ni un estimado).
   Carga real vigente: las 29 cuentas medidas a mano con Claude en Chrome
   el 2026-09-01 (ver scripts/redes-2026-09-01-medicion-real.csv) ya están
   embebidas en DEFAULT_DATA como fallback -- se ven en el dashboard incluso
   sin conexión a Firestore. Cuando haya credenciales de Firebase, correr
   `npm run import-metrics -- ../scripts/redes-2026-09-01-medicion-real.csv`
   desde scripts/ sube lo mismo a Firestore (gana sobre el fallback en
   cuanto la conexión esté activa). Repetir el proceso cada vez que se
   quiera refrescar los números.
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
    // el rango de fechas y el mapa día->segmento de meta afectan al calendario
    renderComplianceChart();
    renderCalendar();
    renderSegmentDiagnostics();
    renderTodayPriorities();
    renderUpcoming7Days();
    renderControlAlerts();
    renderControlStats(); renderControlPerformance(); renderTopContents();
    scheduleFirstPaintDone();
  }, function (err) { onFsError('meta', err); }));

  // perception: documento único (estructura preparada, sin metodología aún)
  fb.unsubs.push(api.onSnapshot(api.doc(db, BRAND_SLUG, 'plan', 'perception', 'main'), function (snap) {
    state.perception = Object.assign({}, DEFAULT_DATA.perception, docOr({}, snap.data()));
    renderPerception();
    renderControlAlerts();
    renderControlStats(); renderControlPerformance(); renderTopContents();
    scheduleFirstPaintDone();
  }, function (err) { onFsError('perception', err); }));

  function watchCollection(col, targetKey, onAfter) {
    fb.unsubs.push(api.onSnapshot(root(col), function (snap) {
      const rows = [];
      snap.forEach(function (d) { rows.push(Object.assign({ id: d.id }, d.data())); });
      state[targetKey] = rows;
      if (onAfter) onAfter();
      scheduleFirstPaintDone();
    }, function (err) { onFsError(col, err); }));
  }

  /* Las 4 categorías del banco de contenidos ya no tienen ninguna vista
     que las use (se quitaron de "Banco de contenidos" y del conteo de
     "Ideas" en Centro de Control, ambos a pedido del usuario) -- se
     conserva la sincronización de "pillars" sin tocar los datos, por si
     se vuelve a mostrar. */
  watchCollection('pillars', 'pillars');
  /* "symbols" no tiene ninguna vista que lo use por ahora -- se conserva
     la sincronización sin tocar los datos, por si se vuelve a mostrar. */
  watchCollection('symbols', 'symbols');
  watchCollection('weekly', 'weekly', function () { renderComplianceChart(); renderCalendar(); renderTodayPriorities(); renderUpcoming7Days(); renderControlAlerts(); renderControlStats(); renderControlPerformance(); renderTopContents(); });
  watchCollection('specials', 'specials', function () { renderComplianceChart(); renderCalendar(); renderTodayPriorities(); renderUpcoming7Days(); renderControlAlerts(); renderControlStats(); renderControlPerformance(); renderTopContents(); });
  watchCollection('phases', 'phases', function () { renderMilestones(); });
  watchCollection('publications', 'publications', function () { renderCalendar(); renderTodayPriorities(); renderUpcoming7Days(); renderControlAlerts(); renderControlStats(); renderControlPerformance(); renderTopContents(); });
  watchCollection('kpiWeekly', 'kpiWeekly', function () { renderKpis(); });
  watchCollection('kpiSpecial', 'kpiSpecial', function () { renderKpis(); });
  watchCollection('checklist', 'checklist', function () { renderChecklist(); });
  watchCollection('accountSegments', 'accountSegments', function () { renderAccountSegments(); renderInstitutionKpis(); renderControlAlerts(); renderControlStats(); renderControlPerformance(); renderTopContents(); });
  watchCollection('newsSources', 'newsSources', function () { renderNews(); });
  watchCollection('newsItems', 'newsItems', function () { renderOpinionNews(); });
  watchCollection('contentSummaries', 'contentSummaries', function () { renderContentSummaries(); renderReportsAvailable(); });
  watchCollection('campaigns', 'campaigns', function () { renderControlStats(); renderControlPerformance(); renderTopContents(); renderCampaignsProjects(); });
  watchCollection('projects', 'projects', function () { renderControlStats(); renderControlPerformance(); renderTopContents(); renderCampaignsProjects(); });
  watchCollection('coyuntura', 'coyuntura', function () { renderCoyuntura(); });
  watchCollection('contentProposals', 'contentProposals', function () {
    renderProposalsQueue();
    renderComplianceChart(); renderCalendar(); renderSegmentDiagnostics();
    renderTodayPriorities(); renderUpcoming7Days(); renderControlAlerts(); renderControlStats(); renderControlPerformance(); renderTopContents();
  });
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
  ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'perception', 'main'), DEFAULT_DATA.perception));
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
  DEFAULT_DATA.newsItems.forEach(function (n) { const d = clone(n); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'newsItems', n.id), d)); });
  DEFAULT_DATA.contentSummaries.forEach(function (c) { const d = clone(c); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'contentSummaries', c.id), d)); });
  DEFAULT_DATA.campaigns.forEach(function (c) { const d = clone(c); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'campaigns', c.id), d)); });
  DEFAULT_DATA.projects.forEach(function (pr) { const d = clone(pr); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'projects', pr.id), d)); });
  DEFAULT_DATA.coyuntura.forEach(function (t) { const d = clone(t); delete d.id; ops.push(api.setDoc(api.doc(db, BRAND_SLUG, 'plan', 'coyuntura', t.id), d)); });
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
  renderKpis();
  renderInstitutionKpis();
  renderChecklist();
  renderAccountSegments();
  renderNews();
  renderOpinionNews();
  renderPerception();
  renderContentSummaries();
  renderComplianceChart();
  renderMilestones();
  renderCalendar();
  renderTodayPriorities();
  renderUpcoming7Days();
  renderControlAlerts();
  renderControlStats(); renderControlPerformance(); renderTopContents();
  renderCampaignsProjects();
  renderCoyuntura();
  renderReportsAvailable();
}

/* ============ 10 · ARRANQUE ============ */
function wireStaticButtons() {
  $('printFromKpiBtn').addEventListener('click', printReport);
  $('printChecklistBtn').addEventListener('click', printReport);
  $('resetChecklistBtn').addEventListener('click', resetChecklist);
  $('goToChecklistBtn').addEventListener('click', function () {
    const idx = navBtns.findIndex(function (b) { return b.dataset.target === 'calendario'; });
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

/* ---- Modo administrador (segundo candado, solo para aprobar propuestas) ---- */
function isAdminUnlocked() { return safeStorage.get(LS_PREFIX + 'admin_unlocked_v1') === true; }
function unlockAdmin() {
  safeStorage.set(LS_PREFIX + 'admin_unlocked_v1', true);
  document.documentElement.classList.add('admin-unlocked');
  updateAdminBadge();
  renderProposalsQueue();
}
function lockAdmin() {
  safeStorage.remove(LS_PREFIX + 'admin_unlocked_v1');
  document.documentElement.classList.remove('admin-unlocked');
  updateAdminBadge();
  renderProposalsQueue();
}
function updateAdminBadge() {
  const btn = $('adminModeBtn');
  if (!btn) return;
  const on = isAdminUnlocked();
  btn.classList.toggle('active', on);
  setHTML('adminModeBtnLabel', on ? 'Modo administrador activo' : 'Modo administrador');
}
function wireAdminGate() {
  if (isAdminUnlocked()) document.documentElement.classList.add('admin-unlocked');
  updateAdminBadge();

  const btn = $('adminModeBtn');
  const dialog = $('adminModal');
  const form = $('adminUnlockForm');
  const input = $('adminPasswordInput');
  const err = $('adminUnlockError');
  if (!btn || !dialog || !form || !input) return;

  btn.addEventListener('click', function () {
    if (isAdminUnlocked()) { lockAdmin(); toast('Modo administrador desactivado.'); return; }
    if (err) err.textContent = '';
    input.value = '';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    input.focus();
  });
  $('adminModalCloseBtn').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value === ADMIN_PASSWORD) {
      if (err) err.textContent = '';
      dialog.close();
      unlockAdmin();
      toast('Modo administrador activado: ya puedes aprobar o rechazar propuestas.');
    } else {
      if (err) err.textContent = 'Contraseña de administrador incorrecta.';
      input.value = '';
      input.focus();
    }
  });
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
  wirePlatformDetail();
  wireProposalForm();
  wireCampaignProjectForm();
  wireAdminGate();
  renderProposalsQueue();
  wireFbDialog();
  wireLogoModal();
  wireCalendarNav();
  wirePubModal();
  wireEnteModal();
  wireGate();

  // Refresca el recuento de días por si la pestaña queda abierta de un
  // día para otro -- cada render normal (carga, Firestore) ya lo hace,
  // esto solo cubre a quien nunca recarga.
  setInterval(updateDateDisplay, 60 * 60 * 1000);

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