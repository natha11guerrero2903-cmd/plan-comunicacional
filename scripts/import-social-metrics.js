/**
 * Sube a Firestore las métricas reales que alguien cargó a mano (leídas con
 * ayuda de la extensión Claude en Chrome, o a mano) -- sin necesidad de la
 * API de X ni de ningún otro scraping automático.
 *
 * No inventa nada: una fila con columnas vacías o "no disponible"
 * simplemente no toca esa cuenta (el ente se deja tal cual estaba). Solo
 * escribe los campos que vengan con un valor real en el CSV.
 *
 * Acepta tanto la plantilla simple (scripts/plantilla-metricas.csv,
 * separada por comas) como el formato real que devuelve el prompt de
 * scripts/prompt-claude-en-chrome.md (separado por ";", con columnas
 * adicionales: estado, seguidores_exacto, ultima_publicacion,
 * publicaciones_muestra, fecha_medicion). El delimitador se detecta solo.
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

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const semi = (firstLine.match(/;/g) || []).length;
  const comma = (firstLine.match(/,/g) || []).length;
  return semi > comma ? ';' : ',';
}

/* Parser CSV mínimo pero correcto (RFC4180: comillas dobles, comas/punto y
   coma y saltos de línea dentro de un campo entre comillas). No hace falta
   ninguna dependencia externa para un archivo de este tamaño. */
function parseCsv(text, delimiter) {
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
    } else if (c === delimiter) {
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

/* Convierte un campo numérico real a número, entendiendo abreviaturas
   ("17.1K", "31 mil") y el texto "no disponible" (=> sin dato, nunca 0).
   Devuelve además si el valor venía redondeado (para no mostrarlo como si
   fuera una cifra exacta). */
function parseNumberField(raw) {
  const v = String(raw == null ? '' : raw).trim();
  if (!v || /^no disponible$/i.test(v)) return { value: undefined, estimated: false };
  let m = /^([\d.,]+)\s*mil$/i.exec(v);
  if (m) {
    const n = Number(m[1].replace(',', '.'));
    return Number.isFinite(n) ? { value: Math.round(n * 1000), estimated: true } : { value: undefined, estimated: false };
  }
  m = /^([\d.,]+)\s*k$/i.exec(v);
  if (m) {
    const n = Number(m[1].replace(',', '.'));
    return Number.isFinite(n) ? { value: Math.round(n * 1000), estimated: true } : { value: undefined, estimated: false };
  }
  const n = Number(v.replace(/[.,](?=\d{3}(\D|$))/g, '').replace(',', '.'));
  return { value: Number.isFinite(n) ? n : undefined, estimated: false };
}

function normalizeEstado(raw) {
  const v = String(raw == null ? '' : raw).trim().toLowerCase();
  if (!v || v === 'no disponible') return undefined;
  return v.replace(/\s+/g, '_');
}

async function run() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error('No se encontró el archivo: ' + CSV_PATH);
    process.exit(1);
  }
  const raw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^﻿/, '');
  const delimiter = detectDelimiter(raw);
  const rows = parseCsv(raw, delimiter);
  console.log('Filas leídas del CSV (delimitador "' + delimiter + '"): ' + rows.length);

  const snap = await db.collection(BRAND_SLUG).doc('plan').collection('accountSegments').get();
  const codeIndex = {};
  const segAccounts = {};
  snap.docs.forEach(function (seg) {
    const data = seg.data();
    const accounts = Array.isArray(data.accounts) ? data.accounts.slice() : [];
    segAccounts[seg.id] = { ref: seg.ref, num: data.num, accounts: accounts, changed: false };
    accounts.forEach(function (a, idx) { codeIndex[a.code] = { segId: seg.id, idx: idx }; });
  });

  let actualizadas = 0, sinCambios = 0, noEncontradas = 0;

  rows.forEach(function (r) {
    const codigo = (r.codigo || '').trim();
    if (!codigo) return;
    const loc = codeIndex[codigo];
    if (!loc) { noEncontradas++; console.warn('No se encontró el código "' + codigo + '" en ningún segmento.'); return; }

    const platformKey = PLATFORM_KEY[String(r.plataforma || '').trim().toLowerCase()];
    if (!platformKey) { console.warn('Plataforma desconocida "' + r.plataforma + '" en la fila de ' + codigo + ', se omite.'); return; }

    const fields = {};
    let anyEstimated = false;

    const followers = parseNumberField(r.seguidores);
    if (followers.value !== undefined) fields.seguidores = followers.value;
    if (followers.estimated) anyEstimated = true;
    if (r.seguidores_exacto && r.seguidores_exacto.trim().toLowerCase() === 'no') anyEstimated = true;

    const hist = parseNumberField(r.publicaciones_historico);
    if (hist.value !== undefined) fields.publicacionesHistorico = hist.value;
    if (hist.estimated) anyEstimated = true;

    const mes = parseNumberField(r.publicaciones_ultimo_mes);
    if (mes.value !== undefined) fields.publicacionesUltimoMes = mes.value;

    const likes = parseNumberField(r.likes_recientes);
    if (likes.value !== undefined) fields.likes = likes.value;

    const muestra = parseNumberField(r.publicaciones_muestra);
    if (muestra.value !== undefined) fields.muestraLikes = muestra.value;

    const ultimaPub = (r.ultima_publicacion || '').trim();
    if (ultimaPub && !/^no disponible$/i.test(ultimaPub)) fields.ultimaPublicacion = ultimaPub;

    const estado = normalizeEstado(r.estado);
    if (estado) fields.estado = estado;

    if (anyEstimated) fields.estimado = true;

    const titulo = (r.publicacion_destacada_titulo || '').trim();
    if (titulo && !/^no disponible$/i.test(titulo)) {
      const destLikes = parseNumberField(r.publicacion_destacada_likes).value;
      fields.publicacionDestacada = { titulo: titulo, likes: destLikes !== undefined ? destLikes : null };
    }

    // Solo se escriben los campos que de verdad vienen con un valor en el
    // CSV -- una columna vacía o "no disponible" nunca sobrescribe con un
    // cero ni con un dato de relleno; simplemente no se toca ese campo.
    const cleanFields = {};
    let anyField = false;
    Object.keys(fields).forEach(function (k) { if (fields[k] !== undefined) { cleanFields[k] = fields[k]; anyField = true; } });
    if (!anyField) { sinCambios++; return; }

    cleanFields.fuente = 'manual/claude-en-chrome';
    cleanFields.actualizado = (r.fecha_medicion && r.fecha_medicion.trim()) || (r.fecha_carga && r.fecha_carga.trim()) || new Date().toISOString().slice(0, 10);

    const seg = segAccounts[loc.segId];
    const account = seg.accounts[loc.idx];
    const prevMetrics = (account.metrics && typeof account.metrics === 'object') ? account.metrics : {};
    const prevPlatform = (prevMetrics[platformKey] && typeof prevMetrics[platformKey] === 'object') ? prevMetrics[platformKey] : {};
    seg.accounts[loc.idx] = Object.assign({}, account, {
      metrics: Object.assign({}, prevMetrics, {
        [platformKey]: Object.assign({}, prevPlatform, cleanFields)
      })
    });
    seg.changed = true;
    actualizadas++;
    console.log(seg.num + ' · ' + codigo + ' (' + r.plataforma + '): ' + JSON.stringify(cleanFields));
  });

  for (const segId of Object.keys(segAccounts)) {
    const seg = segAccounts[segId];
    if (seg.changed) {
      await seg.ref.update({ accounts: seg.accounts });
      console.log('Segmento ' + seg.num + ' actualizado en Firestore.');
    }
  }

  console.log('\nListo. Cuentas-plataforma actualizadas: ' + actualizadas + ' · filas sin datos para cargar: ' + sinCambios + ' · códigos no encontrados: ' + noEncontradas + '.');
  process.exit(0);
}

run().catch(function (err) {
  console.error('Error general:', err);
  process.exit(1);
});
