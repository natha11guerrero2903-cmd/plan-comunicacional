/**
 * Llena la colección "coyuntura" (Radar de coyuntura, Centro de Control)
 * con menciones reales en medios, usando la búsqueda de Google Noticias
 * (pública, sin necesidad de cuenta ni API de pago).
 *
 * Por cada tema de TOPICS, busca las noticias reales de los últimos
 * LOOKBACK_DAYS días y guarda en Firestore: cuántas encontró y un
 * resumen de las más recientes (título, medio, fecha, link real). Nunca
 * inventa un número de menciones ni un artículo -- si Google Noticias no
 * devuelve nada para un tema, se guarda menciones: 0, no se omite el
 * tema ni se rellena con algo de ejemplo.
 *
 * "sentimiento" NO lo pone este script (no hay ningún análisis de
 * sentimiento real conectado) -- si ya habías clasificado un tema a mano
 * en Firestore, este script conserva ese valor tal cual; los temas
 * nuevos quedan sin clasificar hasta que alguien del equipo los revise.
 *
 * Uso:
 *   cd scripts
 *   npm install
 *   export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccountKey.json"
 *   npm run monitor-coyuntura
 *
 * Edita el array TOPICS de abajo para agregar o quitar temas a vigilar.
 * No lo dejes corriendo solo ni en bucle: es para correrlo tú, de forma
 * puntual, cuando quieras refrescar el radar (por ejemplo, una vez por
 * semana, o después de un hecho noticioso puntual).
 */
'use strict';

const https = require('https');
const admin = require('firebase-admin');

const BRAND_SLUG = 'marca_gestion';
const LOOKBACK_DAYS = 7;

// Temas a vigilar. "tema" es lo que se ve en el Radar de coyuntura;
// "query" es lo que de verdad se busca en Google Noticias (puede ser más
// específico para evitar ruido de otros estados/personas con nombres
// parecidos).
const TOPICS = [
  { tema: 'Gobernación del Táchira', query: '"Gobernación del Táchira"' },
  { tema: 'Freddy Bernal (Gobernador)', query: '"Freddy Bernal" Táchira' }
];

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

function httpGet(url) {
  return new Promise(function (resolve, reject) {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MarcaGestionBot/1.0)' } }, function (res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpGet(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error('HTTP ' + res.statusCode + ' al pedir ' + url));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) { data += chunk; });
      res.on('end', function () { resolve(data); });
    }).on('error', reject);
  });
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .trim();
}

function tagContent(itemXml, tag) {
  const m = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i').exec(itemXml);
  return m ? decodeEntities(m[1]) : '';
}

/* Parser mínimo del RSS de Google Noticias: no hace falta una librería
   XML completa porque la estructura de <item> es siempre la misma. */
function parseGoogleNewsRss(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml))) {
    const block = m[1];
    let titulo = tagContent(block, 'title');
    const link = tagContent(block, 'link');
    const pubDate = tagContent(block, 'pubDate');
    const fuenteTag = tagContent(block, 'source');
    let fuente = fuenteTag;
    // El <title> de Google Noticias siempre trae "Titular real - Medio"
    // pegado al final, exista o no el tag <source> aparte -- hay que
    // quitarlo del título en los dos casos, no solo cuando falta <source>.
    if (fuenteTag && titulo.slice(-(fuenteTag.length + 3)) === ' - ' + fuenteTag) {
      titulo = titulo.slice(0, -(fuenteTag.length + 3)).trim();
    } else if (!fuenteTag) {
      const parts = titulo.split(' - ');
      if (parts.length > 1) { fuente = parts.pop().trim(); titulo = parts.join(' - ').trim(); }
    }
    const fecha = pubDate ? new Date(pubDate) : null;
    items.push({ titulo: titulo, url: link, fuente: fuente || 'Fuente no identificada', fecha: fecha });
  }
  return items;
}

async function fetchTopic(query) {
  const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(query) +
    '&hl=es-419&gl=VE&ceid=VE:es-419';
  const xml = await httpGet(url);
  return parseGoogleNewsRss(xml);
}

async function run() {
  const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const coll = db.collection(BRAND_SLUG).doc('plan').collection('coyuntura');

  for (const topic of TOPICS) {
    let items;
    try {
      items = await fetchTopic(topic.query);
    } catch (err) {
      console.error('No se pudo consultar "' + topic.tema + '": ' + err.message + ' -- se deja intacto, no se pisa con un 0 falso.');
      continue;
    }

    const recientes = items.filter(function (it) { return !it.fecha || it.fecha >= cutoff; });

    const docId = topic.tema.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const docRef = coll.doc(docId);
    const prev = await docRef.get();
    const prevData = prev.exists ? prev.data() : {};

    const data = {
      tema: topic.tema,
      menciones: recientes.length,
      articulos: recientes.slice(0, 8).map(function (it) {
        return {
          titulo: it.titulo,
          fuente: it.fuente,
          fecha: it.fecha ? it.fecha.toISOString().slice(0, 10) : null,
          url: it.url
        };
      }),
      fuente: 'google-news-rss',
      actualizado: new Date().toISOString().slice(0, 10)
    };
    // Nunca se pisa una clasificación de sentimiento hecha a mano.
    if (prevData.sentimiento) data.sentimiento = prevData.sentimiento;

    await docRef.set(data, { merge: false });
    console.log(topic.tema + ': ' + recientes.length + ' mención(es) real(es) en los últimos ' + LOOKBACK_DAYS + ' días' +
      (recientes.length ? ' (ej.: "' + recientes[0].titulo + '" -- ' + recientes[0].fuente + ')' : '.'));
  }

  console.log('\nListo. El Radar de coyuntura en Centro de Control ya muestra estos datos en cuanto Firestore esté conectado.');
  process.exit(0);
}

run().catch(function (err) {
  console.error('Error general:', err);
  process.exit(1);
});
