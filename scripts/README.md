# Métricas reales para el Centro de Control

Dos formas de llenar `accountSegments[].accounts[].metrics` en Firestore
con datos reales. El Centro de Control y la ficha de cada ente leen ese
mismo campo automáticamente en cuanto exista — no hace falta tocar el
código del dashboard en ninguno de los dos casos.

**Ya hay una medición real cargada** (2026-09-01, 29 cuentas, hecha con
Claude en Chrome): `redes-2026-09-01-medicion-real.csv` en esta misma
carpeta. Esos números ya están embebidos como respaldo en el propio
`main.js` (se ven en el dashboard incluso sin conexión a Firestore); si
además quieren subirlos a Firestore, corran el paso 3 de la Opción A
apuntando a ese archivo:
`node import-social-metrics.js redes-2026-09-01-medicion-real.csv`.

- **Opción A — Carga asistida con Claude en Chrome** (sin costo, cubre
  Instagram/X/Facebook/TikTok): tú navegas con tu propia sesión y un
  archivo CSV, ideal para actualizar cada semana.
- **Opción B — API oficial de X** (automática pero de pago, solo cubre
  cuentas de X): un script que consulta X directamente.

Puedes usar una, otra, o las dos a la vez (si cargas la misma cuenta por
ambos caminos, gana la que corras al final).

---

## Opción A: Carga asistida con Claude en Chrome

0. (Opcional) Si agregaron o quitaron cuentas desde la Consola de
   Firebase y quieren que el CSV refleje eso, regenera la plantilla con
   los datos reales actuales: `npm run generate-template` (usa la misma
   credencial de Firebase del punto 2 de la Opción B). Nunca hace falta
   correrlo la primera vez -- el CSV ya viene armado con las 29 cuentas
   de hoy.
1. Abre `scripts/prompt-claude-en-chrome.md` y sigue las instrucciones:
   copias el prompt en la extensión de Claude en Chrome (con tu sesión
   iniciada en tus redes), y te devuelve una línea de datos por cada
   cuenta.
2. Pasa esos datos a `scripts/plantilla-metricas.csv` -- ya viene con las
   29 cuentas reales (código, ente, plataforma, usuario, link)
   precargadas; solo completas las columnas de seguidores, publicaciones,
   likes y publicación destacada.
3. Sube el CSV a Firestore:

```bash
cd scripts
npm install
export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccountKey.json"
npm run import-metrics
```

(Necesitas la misma clave de servicio de Firebase que se explica en la
Opción B, punto 2 -- es la misma para ambos scripts.)

El importador:
- Solo escribe los campos que de verdad tengan un valor en el CSV -- una
  celda vacía o "no disponible" nunca sobrescribe con un cero ni con un
  dato de relleno.
- Detecta solo el delimitador (acepta CSV con comas o con punto y coma,
  como el que devuelve la extensión).
- Entiende seguidores/publicaciones abreviados ("17.1K", "31 mil") y los
  guarda ya convertidos, marcando `estimado: true` para dejar claro que no
  es una cifra exacta.
- Si la columna `estado` viene con un valor (activa/inactiva/suspendida/
  sin publicaciones/no existe), lo guarda tal cual -- es la verificación
  real de la cuenta, no una suposición por tener un handle anotado. La
  ficha del ente y las pastillas Activo/Inactivo de Segmentos ya usan ese
  dato en cuanto existe.
- Guarda las métricas por plataforma (`metrics.instagram`, `metrics.x`,
  etc.), nunca mezcladas entre redes.
- Si el código de un ente no coincide con ninguno real, te avisa en la
  terminal en vez de fallar en silencio.

Repite el proceso (prompt → CSV → `npm run import-metrics`) cada vez que
quieran refrescar los números -- no hay nada corriendo solo.

---

## Opción B: API oficial de X (Twitter)

### ⚠️ El costo real de la API de X

La API de X tiene niveles de acceso. El nivel **gratuito** solo permite
publicar tweets — **no** permite leer seguidores ni tweets de una cuenta
(los endpoints que usa este script). Para eso hace falta como mínimo el
nivel **Basic** de pago.

Verifica el precio y los límites actuales en
https://developer.x.com/en/portal/products antes de suscribirte — cambian
con frecuencia y no quiero darte una cifra que ya no sea la real. Con las
cuentas institucionales cargadas hoy el volumen de consultas es bajo,
pero igual **hay que pagar la suscripción** para que la API responda.

### 1. Credenciales que necesitas

1. **Bearer Token de X**: entra a https://developer.x.com, crea un
   Proyecto + App (o usa uno existente), activa un plan con acceso de
   lectura, y copia el "Bearer Token" (OAuth 2.0 App-only) desde las
   llaves de la App.
2. **Service account de Firebase** (para que estos scripts, que corren
   fuera del navegador, puedan escribir en Firestore):
   - Consola de Firebase → proyecto **marcas-generales** → ⚙️
     Configuración del proyecto → pestaña **Cuentas de servicio** →
     "Generar nueva clave privada". Se descarga un archivo `.json`.
   - Guarda ese archivo como `scripts/serviceAccountKey.json` (ya está
     en `.gitignore`, nunca se sube a GitHub) o en cualquier ruta local.

### 2. Instalación

```bash
cd scripts
npm install
```

### 3. Variables de entorno

```bash
export X_BEARER_TOKEN="pega_aquí_tu_bearer_token"
export GOOGLE_APPLICATION_CREDENTIALS="/ruta/completa/a/serviceAccountKey.json"
```

(En Windows PowerShell: `$env:X_BEARER_TOKEN="..."` y
`$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\serviceAccountKey.json"`.)

### 4. Ejecutar

```bash
npm run sync-x
```

El script:
- Busca en cada cuenta el `@handle` de X que ya está en el campo "note"
  (el mismo texto que ves en Segmentos de la gestión) -- no hace falta
  cargar los handles de nuevo en ningún otro lado.
- Consulta seguidores, cantidad de publicaciones y las últimas ~10
  publicaciones reales de cada cuenta.
- Escribe en `metrics.x`: seguidores, publicaciones históricas,
  publicaciones del último mes, likes recientes (suma de las últimas
  publicaciones consultadas, no un histórico completo -- la API de X no
  entrega "likes totales de la cuenta") y la publicación con más
  interacción de esas últimas consultadas.
- Si una cuenta no existe o la API no la encuentra, la deja intacta --
  nunca escribe un cero ni un dato de relleno.

### 5. Repetirlo periódicamente

Este script no queda corriendo solo: hay que volver a ejecutar
`npm run sync-x` cuando quieran refrescar los números (por ejemplo, una
vez por semana). Si más adelante quieres que se ejecute automáticamente
sin que nadie lo corra a mano, avísame y lo programamos (por ejemplo con
una tarea programada en el servidor donde decidan alojarlo) -- no lo
dejé corriendo solo todavía porque eso implica decidir dónde va a vivir
este script de forma permanente, y esa es una decisión de infraestructura
que les corresponde a ustedes.

---

## Qué falta para Instagram, Facebook y TikTok de forma automática

Ninguna de esas plataformas ofrece hoy una API pública y gratuita para
leer seguidores/publicaciones de cuentas que el equipo no administra
directamente (a diferencia de X) -- por eso la Opción A (asistida, no
automática) es la vía real para esas tres redes por ahora:

- **Instagram/Facebook Graph API**: solo funciona para cuentas que la
  Gobernación administre directamente como "cuenta profesional" vinculada
  a una Página de Facebook -- útil como mucho para la cuenta central
  @gobernaciondeltachira, no para las cuentas independientes de cada ente.
- **TikTok**: no tiene una API pública equivalente para terceros.
- **Herramientas de social listening de pago** (Social Blade, Brand24,
  Meltwater, etc.): cubren varias plataformas pero tienen costo mensual.
