/**
 * Sube (o actualiza) SOLO la colección "newsSources" en Firestore -- el
 * directorio de fuentes de "Matrices de opinión". No toca ninguna otra
 * colección (checklist, KPIs, segmentos con métricas reales, etc.), a
 * diferencia del botón "Cargar contenido inicial" del diálogo de Firebase,
 * que sobrescribe TODO el plan con la plantilla por defecto.
 *
 * Úsalo cuando el directorio de medios cambie en el código (assets/scripts/
 * main.js, DEFAULT_DATA.newsSources) y haga falta reflejarlo en el
 * Firestore real -- por ejemplo, tras ampliar el directorio de Táchira.
 *
 * Uso:
 *   cd scripts
 *   npm install
 *   export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccountKey.json"
 *   node seed-news-sources.js
 */
'use strict';

const admin = require('firebase-admin');

const BRAND_SLUG = 'marca_gestion';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  console.error('Falta GOOGLE_APPLICATION_CREDENTIALS (ruta al service account JSON) o FIREBASE_SERVICE_ACCOUNT_JSON. Revisa scripts/README.md.');
  process.exit(1);
}
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
    projectId: 'marcas-generales'
  });
} else {
  admin.initializeApp({ projectId: 'marcas-generales' });
}
const db = admin.firestore();

/* Directorio regional de Táchira -- 3 fuentes originales + 51 cuentas de
   Instagram (medios_digitales_tachira_instagram.xlsx), ordenadas por
   alcance. Debe reflejar exactamente DEFAULT_DATA.newsSources (scope
   "regional") en assets/scripts/main.js. */
const REGIONAL_SOURCES = [
  {"id": "1", "order": 1, "scope": "regional", "name": "La Nación (Táchira)", "description": "Diario regional de San Cristóbal — la referencia impresa y digital del estado.", "url": "https://www.lanacion.com.ve"},
  {"id": "2", "order": 2, "scope": "regional", "name": "Diario Los Andes", "description": "Cobertura de toda la región andina venezolana: Táchira, Mérida y Trujillo.", "url": "https://www.diariolosandes.com.ve"},
  {"id": "3", "order": 3, "scope": "regional", "name": "Google Noticias · Táchira", "description": "Agregador en vivo: reúne en un solo lugar lo último publicado sobre el estado por cualquier medio.", "url": "https://news.google.com/search?q=T%C3%A1chira&hl=es-419&gl=VE"},
  {"id": "14", "order": 4, "scope": "regional", "name": "Táchira Noticias (@tachiranoticias1)", "description": "Portal de noticias generalista. 755K seguidores en Instagram.", "url": "https://www.instagram.com/tachiranoticias1/"},
  {"id": "15", "order": 5, "scope": "regional", "name": "Diario La Nación - Venezuela (@lanacionweb)", "description": "Diario tradicional con edición digital (Editorial Torbes). 565K seguidores en Instagram.", "url": "https://www.instagram.com/lanacionweb/"},
  {"id": "16", "order": 6, "scope": "regional", "name": "Táchira Noticias (cuenta alterna) (@tachiranoticiastuvoz)", "description": "Portal de noticias generalista (respaldo de @tachiranoticias1). 358K seguidores en Instagram.", "url": "https://www.instagram.com/tachiranoticiastuvoz/"},
  {"id": "17", "order": 7, "scope": "regional", "name": "Noticias Tachirenses (@noticiastachirenses)", "description": "Portal de noticias / periodismo hiperlocal (red CNT Táchira). 356K seguidores en Instagram.", "url": "https://www.instagram.com/noticiastachirenses/"},
  {"id": "18", "order": 8, "scope": "regional", "name": "Táchira News (@tachiranews.oficial)", "description": "Portal de noticias generalista. 349K seguidores en Instagram. Handle activo real de 'Táchira News'; @tachiranews (sin sufijo) está inactivo.", "url": "https://www.instagram.com/tachiranews.oficial/"},
  {"id": "19", "order": 9, "scope": "regional", "name": "Diario del Pueblo (@diariodlpueblo)", "description": "Diario digital / portal de noticias generalista. 328K seguidores en Instagram.", "url": "https://www.instagram.com/diariodlpueblo/"},
  {"id": "20", "order": 10, "scope": "regional", "name": "Tachira Punto Noticias (@tachira.noticias)", "description": "Portal de noticias generalista. 317K seguidores en Instagram.", "url": "https://www.instagram.com/tachira.noticias/"},
  {"id": "21", "order": 11, "scope": "regional", "name": "Tachira24hrs | Red de Noticias | Servicio Público | Deportes (@tachira24hrs)", "description": "Portal de noticias generalista / agregador. 253K seguidores en Instagram.", "url": "https://www.instagram.com/tachira24hrs/"},
  {"id": "22", "order": 12, "scope": "regional", "name": "Reporte La Grita (@reportelagrita)", "description": "Medio municipal (La Grita / municipio Jáuregui). 205K seguidores en Instagram.", "url": "https://www.instagram.com/reportelagrita/"},
  {"id": "23", "order": 13, "scope": "regional", "name": "Yo Reporto a La Nación (@yoreportoalanacion)", "description": "Cuenta comunitaria/alterna de Diario La Nación. 174K seguidores en Instagram.", "url": "https://www.instagram.com/yoreportoalanacion/"},
  {"id": "24", "order": 14, "scope": "regional", "name": "Conexión Táchira - Noticias Táchira (@conexiontachira)", "description": "Portal de noticias / red hiperlocal (red CNT Táchira). 142K seguidores en Instagram.", "url": "https://www.instagram.com/conexiontachira/"},
  {"id": "25", "order": 15, "scope": "regional", "name": "Reporte.Táchira | Noticias de Táchira y Venezuela (@reporte.tachira)", "description": "Portal de noticias generalista (red CNT Táchira). 109K seguidores en Instagram.", "url": "https://www.instagram.com/reporte.tachira/"},
  {"id": "26", "order": 16, "scope": "regional", "name": "La Red Táchira (@laredtachira)", "description": "Portal de noticias generalista. 93.9K seguidores en Instagram.", "url": "https://www.instagram.com/laredtachira/"},
  {"id": "27", "order": 17, "scope": "regional", "name": "Tachiranoticia (@tachiranoticia)", "description": "Portal de noticias / servicios públicos y denuncias. 74K seguidores en Instagram.", "url": "https://www.instagram.com/tachiranoticia/"},
  {"id": "28", "order": 18, "scope": "regional", "name": "Tachira Punto Noticias (cuenta de respaldo) (@tachira.noticias1)", "description": "Portal de noticias generalista (respaldo). 67.7K seguidores en Instagram.", "url": "https://www.instagram.com/tachira.noticias1/"},
  {"id": "29", "order": 19, "scope": "regional", "name": "Táchira noticias (@tachiranoticias_)", "description": "Portal de noticias / comunidad (San Cristóbal). 65.9K seguidores en Instagram.", "url": "https://www.instagram.com/tachiranoticias_/"},
  {"id": "30", "order": 20, "scope": "regional", "name": "San Cristóbal | Noticias | Eventos y Comunidad (@noti.sancristobal)", "description": "Medio municipal (San Cristóbal). 54.7K seguidores en Instagram.", "url": "https://www.instagram.com/noti.sancristobal/"},
  {"id": "31", "order": 21, "scope": "regional", "name": "Fogón Informativo Táchira (@fogoninformativo)", "description": "Portal de noticias generalista. 49K seguidores en Instagram.", "url": "https://www.instagram.com/fogoninformativo/"},
  {"id": "32", "order": 22, "scope": "regional", "name": "Notitachira (@ntnotitachira)", "description": "Portal de noticias generalista. 45K seguidores en Instagram.", "url": "https://www.instagram.com/ntnotitachira/"},
  {"id": "33", "order": 23, "scope": "regional", "name": "Megavision (@megavision.ve)", "description": "Medio institucional / televisora regional tachirense. 39.7K seguidores en Instagram. Cuenta de un canal de TV, no medio nativo digital.", "url": "https://www.instagram.com/megavision.ve/"},
  {"id": "34", "order": 24, "scope": "regional", "name": "La Red de Noticias del Táchira (@laredsancristobal)", "description": "Medio municipal (San Cristóbal). 34.4K seguidores en Instagram.", "url": "https://www.instagram.com/laredsancristobal/"},
  {"id": "35", "order": 25, "scope": "regional", "name": "Centro de Noticias Táchira (@centrodenoticiastachira)", "description": "Portal de noticias / cabecera de red hiperlocal (red CNT Táchira). 31.4K seguidores en Instagram.", "url": "https://www.instagram.com/centrodenoticiastachira/"},
  {"id": "36", "order": 26, "scope": "regional", "name": "Ntnotitachira (cuenta alterna) (@nt_notitachira)", "description": "Portal de noticias (respaldo de @ntnotitachira). 21.6K seguidores en Instagram.", "url": "https://www.instagram.com/nt_notitachira/"},
  {"id": "37", "order": 27, "scope": "regional", "name": "LaGritaNoticias (@lagritanoticias)", "description": "Medio municipal (La Grita). 20K seguidores en Instagram.", "url": "https://www.instagram.com/lagritanoticias/"},
  {"id": "38", "order": 28, "scope": "regional", "name": "Sucesos Táchira (@sucesostachira)", "description": "Medio de sucesos / seguridad (policiales, judiciales). 15.6K seguidores en Instagram.", "url": "https://www.instagram.com/sucesostachira/"},
  {"id": "39", "order": 29, "scope": "regional", "name": "Noticias de Táchira y la zona norte (@tachiranorte)", "description": "Medio regional (zona norte del estado). 14.4K seguidores en Instagram.", "url": "https://www.instagram.com/tachiranorte/"},
  {"id": "40", "order": 30, "scope": "regional", "name": "La Red Táchira (cuenta alterna) (@laredtachira1)", "description": "Portal de noticias (respaldo de @laredtachira). 12.8K seguidores en Instagram.", "url": "https://www.instagram.com/laredtachira1/"},
  {"id": "41", "order": 31, "scope": "regional", "name": "La Voz del Táchira | Portal de Noticias (@lavozdeltachira)", "description": "Portal de noticias generalista. 10.7K seguidores en Instagram.", "url": "https://www.instagram.com/lavozdeltachira/"},
  {"id": "42", "order": 32, "scope": "regional", "name": "Tachira prensa 2.0 (@tachira_prensa2.0)", "description": "Canal cultural / medio digital regional. 10.1K seguidores en Instagram.", "url": "https://www.instagram.com/tachira_prensa2.0/"},
  {"id": "43", "order": 33, "scope": "regional", "name": "Noticias del Táchira, Venezuela, Colombia y el mundo (@infotachira24)", "description": "Portal de noticias generalista. 7.4K seguidores en Instagram.", "url": "https://www.instagram.com/infotachira24/"},
  {"id": "44", "order": 34, "scope": "regional", "name": "Portinformacionestachira (@portinformacionestachira)", "description": "Canal informativo generalista. 6.1K seguidores en Instagram.", "url": "https://www.instagram.com/portinformacionestachira/"},
  {"id": "45", "order": 35, "scope": "regional", "name": "Tachira 24 Horas (@tachira24horas)", "description": "Portal de noticias / info empresarial y social (zona fronteriza). 5.9K seguidores en Instagram.", "url": "https://www.instagram.com/tachira24horas/"},
  {"id": "46", "order": 36, "scope": "regional", "name": "Tachira Informa (@tachira_news)", "description": "Portal de noticias generalista. 4.5K seguidores en Instagram.", "url": "https://www.instagram.com/tachira_news/"},
  {"id": "47", "order": 37, "scope": "regional", "name": "La Voz del Táchira | Noticias (@lavozdeltachira_ve)", "description": "Portal de noticias (cuenta alterna). 2.5K seguidores en Instagram.", "url": "https://www.instagram.com/lavozdeltachira_ve/"},
  {"id": "48", "order": 38, "scope": "regional", "name": "La Prensa Táchira (@laprensatachira)", "description": "Medio digital independiente (cuenta alterna). 2.5K seguidores en Instagram.", "url": "https://www.instagram.com/laprensatachira/"},
  {"id": "49", "order": 39, "scope": "regional", "name": "Rubio Noticias al Día 2019 (@rubionoticiasaldia)", "description": "Medio municipal (Rubio). 2.2K seguidores en Instagram.", "url": "https://www.instagram.com/rubionoticiasaldia/"},
  {"id": "50", "order": 40, "scope": "regional", "name": "Informa Táchira (@informa_tachira)", "description": "Portal de noticias generalista. 2.2K seguidores en Instagram.", "url": "https://www.instagram.com/informa_tachira/"},
  {"id": "51", "order": 41, "scope": "regional", "name": "Noticias del Táchira (@diariotachira)", "description": "Portal de noticias generalista. 1.8K seguidores en Instagram.", "url": "https://www.instagram.com/diariotachira/"},
  {"id": "52", "order": 42, "scope": "regional", "name": "Cordero Táchira Venezuela (@corderoenfotos)", "description": "Medio comunitario / fotográfico (Cordero). 808 seguidores en Instagram. Cuenta pequeña; enfocada en fotografía comunitaria más que en noticias puras.", "url": "https://www.instagram.com/corderoenfotos/"},
  {"id": "53", "order": 43, "scope": "regional", "name": "Noticias, política, farándula, memes, Táchira (@lamugroteca2.0)", "description": "Medio de farándula / entretenimiento y humor. 712 seguidores en Instagram. Cuenta pequeña pero activa.", "url": "https://www.instagram.com/lamugroteca2.0/"},
  {"id": "54", "order": 44, "scope": "regional", "name": "Tachira al Día (@tachira_aldia)", "description": "Portal de noticias generalista. 560 seguidores en Instagram. Cuenta pequeña, solo 5 publicaciones.", "url": "https://www.instagram.com/tachira_aldia/"},
  {"id": "55", "order": 45, "scope": "regional", "name": "Lagritanoticiastachira (@lagritanoticiastachira)", "description": "Medio municipal (La Grita). 547 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/lagritanoticiastachira/"},
  {"id": "56", "order": 46, "scope": "regional", "name": "Táchira 24_7 (@tachira24_7)", "description": "Portal de noticias generalista. 513 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/tachira24_7/"},
  {"id": "57", "order": 47, "scope": "regional", "name": "Rubionoticias (@rubionoticias)", "description": "Medio municipal (Rubio). 429 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/rubionoticias/"},
  {"id": "58", "order": 48, "scope": "regional", "name": "San Cristóbal Noticias (@sancris_noticias)", "description": "Medio municipal (San Cristóbal). 280 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/sancris_noticias/"},
  {"id": "59", "order": 49, "scope": "regional", "name": "Noticias Capacho Nuevo (@politica_capachonuevo)", "description": "Medio municipal (Capacho). 263 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/politica_capachonuevo/"},
  {"id": "60", "order": 50, "scope": "regional", "name": "Prensa 171 Táchira (@emergencias171tachira)", "description": "Medio de emergencias / sucesos. 198 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/emergencias171tachira/"},
  {"id": "61", "order": 51, "scope": "regional", "name": "La voz del agro Táchira (@lavozdelagrotachira)", "description": "Medio institucional/radio - segmento agro. 141 seguidores en Instagram. Extensión de un programa de radio (Mastermix 91.5 FM).", "url": "https://www.instagram.com/lavozdelagrotachira/"},
  {"id": "62", "order": 52, "scope": "regional", "name": "NotiTachira (@notit.achira)", "description": "Portal de noticias generalista. 123 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/notit.achira/"},
  {"id": "63", "order": 53, "scope": "regional", "name": "Perla del Torbes (@taribanoticias1)", "description": "Medio municipal (Táriba). 114 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/taribanoticias1/"},
  {"id": "64", "order": 54, "scope": "regional", "name": "Táchira Hoy (@tachira.hoy)", "description": "Portal de noticias generalista. 111 seguidores en Instagram. Cuenta pequeña.", "url": "https://www.instagram.com/tachira.hoy/"}
];

async function run() {
  const col = db.collection(BRAND_SLUG).doc('plan').collection('newsSources');
  let ok = 0;
  for (const entry of REGIONAL_SOURCES) {
    const { id, ...fields } = entry;
    await col.doc(id).set(fields);
    ok++;
    console.log('OK · ' + id + ' · ' + fields.name);
  }
  console.log('\nListo. ' + ok + ' fuentes regionales escritas en newsSources (colección "' + BRAND_SLUG + '"). Ninguna otra colección fue tocada.');
  process.exit(0);
}

run().catch(function (err) {
  console.error('Error general:', err);
  process.exit(1);
});
