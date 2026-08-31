/**
 * Sube a Firestore las métricas reales que alguien cargó a mano en
 * scripts/plantilla-metricas.csv (leídas con ayuda de la extensión
 * Claude en Chrome, o a mano) -- sin necesidad de la API de X ni de
 * ningún otro scraping automático.
 *
 * No inventa nada: una fila con columnas vacías simplemente no toca esa
 * cuenta (el ente se deja tal cual estaba). Solo escribe los campos que
 * vengan con un valor real en el CSV.
 *
 * Uso:
 *   cd scripts
 *   npm install
 *   export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccountKey.json"
 *   npm run import-metrics
 *   # o para usar otro archivo:
 *   node import-social-metrics.js ruta/a/otro-archivo.csv
 */
'use strict';

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const BRAND_SLUG = 'marca_gestion';
const CSV_PATH = process.argv[2] || path.join(__dirname, 'plantilla-metricas.csv');

const PLATFORM_KEY = { instagram: 'instagram', x: 'x', facebook: 'facebook', tiktok: 'tiktok' };

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

/* Parser CSV mínimo pero correcto (RFC4180: comillas dobles, comas y
   saltos de línea dentro de un campo entre comillas). No hace falta
   ninguna dependencia externa para un archivo de este tamaño. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift().map(function (h) { return h.trim(); });
  return rows.map(function (r) {
    const obj = {};
    header.forEach(function (h, i) { obj[h] = (r[i] || '').trim(); });
    return obj;
  });
}

function toNumber(v) {
  if (v === undefined || v === null || v.trim() === '') return undefined;
  const n = Number(String(v).replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

async function run() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error('No se encontró el archivo: ' + CSV_PATH);
    process.exit(1);
  }
  const rows = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  console.log('Filas leídas del CSV: ' + rows.length);

  const snap = await db.collection(BRAND_SLUG).doc('plan').collection('accountSegments').get();
  const segDocs = {};
  snap.docs.forEach(function (d) { segDocs[String(d.data().num)] = d; });

  let actualizadas = 0, sinCambios = 0, noEncontradas = 0;

  for (const seg of snap.docs) {
    const data = seg.data();
    const accounts = Array.isArray(data.accounts) ? data.accounts.slice() : [];
    let changed = false;

    rows.filter(function (r) { return String(r.segmento) === String(data.num); }).forEach(function (r) {
      const idx = accounts.findIndex(function (a) { return a.code === r.codigo; });
      if (idx === -1) { noEncontradas++; console.warn('No se encontró el código "' + r.codigo + '" en el segmento ' + data.num + '.'); return; }

      const platformKey = PLATFORM_KEY[String(r.plataforma).toLowerCase()];
      if (!platformKey) { console.warn('Plataforma desconocida "' + r.plataforma + '" en la fila de ' + r.codigo + ', se omite.'); return; }

      const fields = {
        seguidores: toNumber(r.seguidores),
        publicacionesHistorico: toNumber(r.publicaciones_historico),
        publicacionesUltimoMes: toNumber(r.publicaciones_ultimo_mes),
        likes: toNumber(r.likes_recientes)
      };
      const titulo = (r.publicacion_destacada_titulo || '').trim();
      const destLikes = toNumber(r.publicacion_destacada_likes);
      if (titulo) fields.publicacionDestacada = { titulo: titulo, likes: destLikes !== undefined ? destLikes : null };

      // Solo se escriben los campos que de verdad vienen con un valor en
      // el CSV -- una columna vacía nunca sobrescribe con un cero ni con
      // "undefined"; simplemente no se toca ese campo.
      const cleanFields = {};
      let anyField = false;
      Object.keys(fields).forEach(function (k) { if (fields[k] !== undefined) { cleanFields[k] = fields[k]; anyField = true; } });
      if (!anyField) { sinCambios++; return; }

      cleanFields.fuente = 'manual/claude-en-chrome';
      cleanFields.actualizado = (r.fecha_carga && r.fecha_carga.trim()) || new Date().toISOString();

      const account = accounts[idx];
      const prevMetrics = (account.metrics && typeof account.metrics === 'object') ? account.metrics : {};
      const prevPlatform = (prevMetrics[platformKey] && typeof prevMetrics[platformKey] === 'object') ? prevMetrics[platformKey] : {};
      accounts[idx] = Object.assign({}, account, {
        metrics: Object.assign({}, prevMetrics, {
          [platformKey]: Object.assign({}, prevPlatform, cleanFields)
        })
      });
      changed = true;
      actualizadas++;
      console.log(data.num + ' · ' + r.codigo + ' (' + r.plataforma + '): ' + JSON.stringify(cleanFields));
    });

    if (changed) {
      await seg.ref.update({ accounts: accounts });
      console.log('Segmento ' + data.num + ' actualizado en Firestore.');
    }
  }

  console.log('\nListo. Cuentas-plataforma actualizadas: ' + actualizadas + ' · filas sin datos para cargar: ' + sinCambios + ' · códigos no encontrados: ' + noEncontradas + '.');
  process.exit(0);
}

run().catch(function (err) {
  console.error('Error general:', err);
  process.exit(1);
});
