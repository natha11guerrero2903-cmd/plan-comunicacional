# Sincronización de métricas reales (X / Twitter)

Este script llena `accountSegments[].accounts[].metrics` en Firestore con
datos reales de X para las cuentas que ya tienen un `@handle` de X cargado
en el dashboard. El Centro de Control y la ficha de cada ente leen ese
mismo campo automáticamente — no hace falta tocar el código del dashboard.

## ⚠️ Antes de empezar: el costo real de la API de X

La API de X tiene niveles de acceso. El nivel **gratuito** solo permite
publicar tweets — **no** permite leer seguidores ni tweets de una cuenta
(los endpoints que usa este script). Para eso hace falta como mínimo el
nivel **Basic** de pago.

Verifica el precio y los límites actuales en
https://developer.x.com/en/portal/products antes de suscribirte — cambian
con frecuencia y no quiero darte una cifra que ya no sea la real. Con 9
cuentas institucionales cargadas hoy, el volumen de consultas es bajo,
pero igual **hay que pagar la suscripción** para que la API responda.

Si el costo no tiene sentido para el equipo, la alternativa sin costo es
cargar seguidores/likes a mano desde la Consola de Firebase (mismo lugar
donde ya se edita todo el contenido) -- dímelo y preparo una guía corta
para eso en su lugar.

## 1. Credenciales que necesitas

1. **Bearer Token de X**: entra a https://developer.x.com, crea un
   Proyecto + App (o usa uno existente), activa un plan con acceso de
   lectura, y copia el "Bearer Token" (OAuth 2.0 App-only) desde las
   llaves de la App.
2. **Service account de Firebase** (para que este script, que corre
   fuera del navegador, pueda escribir en Firestore):
   - Consola de Firebase → proyecto **marcas-generales** → ⚙️
     Configuración del proyecto → pestaña **Cuentas de servicio** →
     "Generar nueva clave privada". Se descarga un archivo `.json`.
   - Guarda ese archivo como `scripts/serviceAccountKey.json` (ya está
     en `.gitignore`, nunca se sube a GitHub) o en cualquier ruta local.

## 2. Instalación

```bash
cd scripts
npm install
```

## 3. Variables de entorno

```bash
export X_BEARER_TOKEN="pega_aquí_tu_bearer_token"
export GOOGLE_APPLICATION_CREDENTIALS="/ruta/completa/a/serviceAccountKey.json"
```

(En Windows PowerShell: `$env:X_BEARER_TOKEN="..."` y
`$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\serviceAccountKey.json"`.)

## 4. Ejecutar

```bash
npm run sync-x
```

El script:
- Busca en cada cuenta el `@handle` de X que ya está en el campo "note"
  (el mismo texto que ves en Segmentos de la gestión) -- no hace falta
  cargar los handles de nuevo en ningún otro lado.
- Consulta seguidores, cantidad de publicaciones y las últimas ~10
  publicaciones reales de cada cuenta.
- Escribe en Firestore: seguidores, publicaciones históricas,
  publicaciones del último mes, likes recientes (suma de las últimas
  publicaciones consultadas, no un histórico completo -- la API de X no
  entrega "likes totales de la cuenta") y la publicación con más
  interacción de esas últimas consultadas.
- Si una cuenta no existe o la API no la encuentra, la deja intacta --
  nunca escribe un cero ni un dato de relleno.

## 5. Repetirlo periódicamente

Este script no queda corriendo solo: hay que volver a ejecutar
`npm run sync-x` cuando quieran refrescar los números (por ejemplo, una
vez por semana). Si más adelante quieres que se ejecute automáticamente
sin que nadie lo corra a mano, avísame y lo programamos (por ejemplo con
una tarea programada en el servidor donde decidan alojarlo) -- no lo
dejé corriendo solo todavía porque eso implica decidir dónde va a vivir
este script de forma permanente, y esa es una decisión de infraestructura
que les corresponde a ustedes.

## Qué falta para Instagram, Facebook y TikTok

Ninguna de esas plataformas ofrece hoy una API pública y gratuita para
leer seguidores/publicaciones de cuentas que el equipo no administra
directamente (a diferencia de X). Las opciones reales son:

- **Instagram/Facebook Graph API**: solo funciona para cuentas que la
  Gobernación administre directamente como "cuenta profesional" vinculada
  a una Página de Facebook -- útil como mucho para la cuenta central
  @gobernaciondeltachira, no para las cuentas independientes de cada ente.
- **TikTok**: no tiene una API pública equivalente para terceros.
- **Herramientas de social listening de pago** (Social Blade, Brand24,
  Meltwater, etc.): cubren varias plataformas pero tienen costo mensual.
- **Carga manual**: alguien del equipo anota seguidores/likes una vez por
  semana directo en Firestore. Sin costo, funciona para cualquier cuenta.

Dime si quieres que preparemos alguna de estas para Instagram/Facebook/
TikTok también.
