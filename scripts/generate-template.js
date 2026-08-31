/**
 * Regenera scripts/plantilla-metricas.csv a partir de los datos REALES
 * que hay en Firestore en este momento (no del código del dashboard) --
 * así, si agregan o quitan cuentas desde la Consola de Firebase, el CSV
 * se puede volver a generar sin pedírmelo a mí.
 *
 * Solo genera identidad (segmento, código, ente, plataforma, usuario,
 * link); las columnas de métricas siempre salen vacías -- este script
 * nunca lee ni escribe cifras, solo arma la lista de cuentas a revisar.
 *
 * Uso:
 *   cd scripts
 *   npm install
 *   export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccountKey.json"
 *   npm run generate-template
 */
'use strict';

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const BRAND_SLUG = 'marca_gestion';
const OUT_PATH = path.join(__dirname, 'plantilla-metricas.csv');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  console.error('Falta GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT_JSON. Revisa scripts/README.md.');
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

/* Mismo parseo de "note" que usa el dashboard (parseAccountSocial en
   main.js) -- se reimplementa aquí porque este script corre en Node,
   fuera del navegador. Las cuentas "interno" (usan la cuenta central
   compartida) se excluyen: el dashboard no muestra métricas por
   separado para esas, ver openEnteModal(). */
function extractSocial(account) {
  const out = [];
  if (!account || account.status === 'interno' || account.status === 'sin_cuenta' || account.status === 'inactiva') return out;
  const note = String(account.note || '');
  let ig = null, x = null, fb = null;
  note.split('|').forEach(function (rawChunk) {
    const chunk = rawChunk.trim();
    let m;
    if ((m = /^IG\/X\s*:?\s*@([\w.]+)/i.exec(chunk))) {
      ig = m[1]; x = m[1];
    } else if ((m = /^IG\b[^:]*:\s*@([\w.]+)/i.exec(chunk))) {
      ig = m[1];
    } else if ((m = /^X\s*:?\s*@([\w.]+)/i.exec(chunk))) {
      x = m[1];
    } else if ((m = /^Facebook\s*:?\s*\/?([\w.\-]+)/i.exec(chunk))) {
      fb = m[1];
    }
  });
  if (ig) out.push({ platform: 'Instagram', usuario: '@' + ig, link: 'https://instagram.com/' + ig });
  if (x) out.push({ platform: 'X', usuario: '@' + x, link: 'https://x.com/' + x });
  if (fb) out.push({ platform: 'Facebook', usuario: '/' + fb, link: 'https://facebook.com/' + fb });
  return out;
}

function csvEscape(v) {
  const s = String(v == null ? '' : v);
  if (/["\n,]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

async function run() {
  const snap = await db.collection(BRAND_SLUG).doc('plan').collection('accountSegments').get();
  const header = ['segmento', 'segmento_nombre', 'codigo', 'ente', 'plataforma', 'usuario', 'link',
    'seguidores', 'publicaciones_historico', 'publicaciones_ultimo_mes', 'likes_recientes',
    'publicacion_destacada_titulo', 'publicacion_destacada_likes', 'fecha_carga'];
  const rows = [header];

  snap.docs.forEach(function (doc) {
    const seg = doc.data();
    (Array.isArray(seg.accounts) ? seg.accounts : []).forEach(function (a) {
      extractSocial(a).forEach(function (s) {
        rows.push([seg.num, seg.name, a.code, a.name, s.platform, s.usuario, s.link, '', '', '', '', '', '', '']);
      });
    });
  });

  const csv = rows.map(function (r) { return r.map(csvEscape).join(','); }).join('\n') + '\n';
  fs.writeFileSync(OUT_PATH, csv, 'utf8');
  console.log('Generado ' + OUT_PATH + ' con ' + (rows.length - 1) + ' cuentas reales.');
  process.exit(0);
}

run().catch(function (err) {
  console.error('Error general:', err);
  process.exit(1);
});
