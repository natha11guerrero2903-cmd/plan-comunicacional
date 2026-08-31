/**
 * Sincroniza métricas reales de X (Twitter) hacia Firestore para
 * alimentar el Centro de Control y las fichas de ente del dashboard
 * "Plan Comunicacional Integrado".
 *
 * Qué hace:
 *   1. Lee la colección accountSegments (marca_gestion/plan/accountSegments)
 *      y extrae, del campo "note" de cada cuenta, el @handle de X real
 *      que ya está cargado (mismo formato que usa el dashboard).
 *   2. Para cada handle, consulta la API oficial de X v2:
 *        - GET /2/users/by/username/:username  -> seguidores, tweets totales
 *        - GET /2/users/:id/tweets              -> últimos tweets reales,
 *          para calcular likes recientes y la publicación más destacada
 *   3. Escribe el resultado en accounts[].metrics de cada segmento, sin
 *      tocar ningún otro campo (director, redes, etc.) ni inventar nada
 *      para las cuentas sin handle de X o que la API no encuentre.
 *
 * Nunca simula datos: si la API no responde para una cuenta, esa cuenta
 * se deja tal cual estaba (no se escribe un cero ni un valor de relleno).
 *
 * Uso:
 *   cd scripts
 *   npm install
 *   export X_BEARER_TOKEN="..."                       # ver README.md
 *   export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccountKey.json"
 *   npm run sync-x
 */
'use strict';

const admin = require('firebase-admin');

const BRAND_SLUG = 'marca_gestion';
const X_API_BASE = 'https://api.x.com/2';
const REQUEST_DELAY_MS = 350;

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error('Falta la variable de entorno ' + name + '. Revisa scripts/README.md.');
    process.exit(1);
  }
  return v;
}

const X_BEARER_TOKEN = requireEnv('X_BEARER_TOKEN');

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

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

/* Mismo parseo que usa el dashboard (parseAccountSocial en main.js) --
   solo la parte de X, para no tocar cuentas "interno"/"sin_cuenta". */
function extractXHandle(account) {
  if (!account || account.status === 'interno' || account.status === 'sin_cuenta' || account.status === 'inactiva') return null;
  const note = String(account.note || '');
  let m = /IG\/X\s*:?\s*@([\w.]+)/i.exec(note);
  if (m) return m[1];
  m = /X\s*:?\s*@([\w.]+)/i.exec(note);
  return m ? m[1] : null;
}

async function xApiGet(path) {
  const res = await fetch(X_API_BASE + path, {
    headers: { Authorization: 'Bearer ' + X_BEARER_TOKEN }
  });
  if (res.status === 429) {
    const resetHeader = res.headers.get('x-rate-limit-reset');
    const waitMs = resetHeader ? Math.max(1000, Number(resetHeader) * 1000 - Date.now()) : 60000;
    console.warn('  Rate limit de X alcanzado, esperando ' + Math.round(waitMs / 1000) + 's...');
    await sleep(waitMs);
    return xApiGet(path);
  }
  const body = await res.json();
  if (!res.ok) {
    throw new Error('X API ' + res.status + ': ' + JSON.stringify(body));
  }
  return body;
}

async function fetchXMetrics(handle) {
  const userResp = await xApiGet('/users/by/username/' + encodeURIComponent(handle) + '?user.fields=public_metrics');
  if (!userResp.data) return null;
  const user = userResp.data;
  const pm = user.public_metrics || {};

  await sleep(REQUEST_DELAY_MS);
  let tweets = [];
  try {
    const tweetsResp = await xApiGet(
      '/users/' + user.id + '/tweets?max_results=10&tweet.fields=public_metrics,created_at&exclude=retweets,replies'
    );
    tweets = Array.isArray(tweetsResp.data) ? tweetsResp.data : [];
  } catch (err) {
    console.warn('  No se pudieron leer tweets recientes de @' + handle + ': ' + err.message);
  }

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const ultimoMes = tweets.filter(function (t) { return new Date(t.created_at).getTime() >= thirtyDaysAgo; }).length;
  const likesRecientes = tweets.reduce(function (sum, t) { return sum + ((t.public_metrics && t.public_metrics.like_count) || 0); }, 0);

  let destacada = null;
  tweets.forEach(function (t) {
    const score = (t.public_metrics && (t.public_metrics.like_count + t.public_metrics.retweet_count)) || 0;
    if (!destacada || score > destacada.score) {
      destacada = { score: score, titulo: t.text, likes: (t.public_metrics && t.public_metrics.like_count) || 0 };
    }
  });

  return {
    seguidores: pm.followers_count,
    publicacionesHistorico: pm.tweet_count,
    publicacionesUltimoMes: ultimoMes,
    likes: likesRecientes,
    publicacionDestacada: destacada ? { titulo: destacada.titulo, likes: destacada.likes } : null,
    fuente: 'x',
    actualizado: new Date().toISOString()
  };
}

async function run() {
  console.log('Leyendo accountSegments de Firestore (' + BRAND_SLUG + ')...');
  const snap = await db.collection(BRAND_SLUG).doc('plan').collection('accountSegments').get();

  let totalConHandle = 0, totalActualizadas = 0, totalSinEncontrar = 0;

  for (const doc of snap.docs) {
    const seg = doc.data();
    const accounts = Array.isArray(seg.accounts) ? seg.accounts.slice() : [];
    let changed = false;

    for (let i = 0; i < accounts.length; i++) {
      const a = accounts[i];
      const handle = extractXHandle(a);
      if (!handle) continue;
      totalConHandle++;

      console.log('Segmento ' + seg.num + ' · ' + a.code + ' (' + a.name + ') -> @' + handle);
      try {
        const metrics = await fetchXMetrics(handle);
        if (!metrics) {
          console.warn('  @' + handle + ' no existe o no es pública. No se escribe nada.');
          totalSinEncontrar++;
        } else {
          accounts[i] = Object.assign({}, a, { metrics: Object.assign({}, a.metrics, metrics) });
          changed = true;
          totalActualizadas++;
          console.log('  Seguidores: ' + metrics.seguidores + ' · Publicaciones: ' + metrics.publicacionesHistorico + ' · Últ. mes: ' + metrics.publicacionesUltimoMes);
        }
      } catch (err) {
        console.error('  Error consultando @' + handle + ': ' + err.message);
      }
      await sleep(REQUEST_DELAY_MS);
    }

    if (changed) {
      await doc.ref.update({ accounts: accounts });
      console.log('Segmento ' + seg.num + ' actualizado en Firestore.');
    }
  }

  console.log('\nListo. Cuentas con handle de X: ' + totalConHandle + ' · actualizadas: ' + totalActualizadas + ' · no encontradas: ' + totalSinEncontrar + '.');
  process.exit(0);
}

run().catch(function (err) {
  console.error('Error general:', err);
  process.exit(1);
});
