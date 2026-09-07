# Prompt para Claude en Chrome — actualizar métricas reales del dashboard

Copia y pega todo el texto de abajo (desde "Necesito que revises...") en
**Claude dentro de la extensión de Chrome de tu propio navegador**
(no aquí en esta sesión de código) -- estando tú con sesión iniciada en
las redes que uses habitualmente, para que las páginas carguen bien y no
te pidan iniciar sesión a cada rato.

Puedes pegarlo completo (29 cuentas) o partirlo en tandas de 5-10 filas si
prefieres ir revisando de a poco -- solo copia el bloque de la tabla que
quieras que revise en cada tanda.

No lo dejes corriendo solo ni en bucle: es para que lo uses tú, de forma
puntual, cuando quieras actualizar los números (por ejemplo, una vez por
semana). La última medición real cargada al dashboard es del 2026-09-01.

---

## Prompt (copiar desde aquí)

Necesito que revises, una por una, las cuentas de redes sociales de esta
tabla (son cuentas institucionales públicas del Gobierno del Estado
Táchira). Para cada una, abre el link y anota:

1. **Estado real de la cuenta**: "activa" (existe y tiene publicaciones),
   "inactiva" (existe pero no ha publicado en mucho tiempo), "suspendida"
   (el link muestra que la cuenta fue suspendida/eliminada por la red),
   "sin publicaciones" (existe, tiene seguidores, pero nunca publicó
   nada), o "no existe" (el usuario no existe / el link da error 404).
   Este dato es tan importante como los números -- no lo omitas.
2. **Seguidores**: el número que muestra el perfil. Si el perfil solo
   muestra una cifra redondeada (ej. "17.1K" o "31 mil"), anótala tal
   cual la ves y dilo así de exacto (no la conviertas tú).
3. **¿Es exacta o aproximada esa cifra de seguidores?** responde "si" (el
   perfil mostró el número exacto) o "no" (el perfil solo mostró una
   cifra redondeada/abreviada).
4. **Publicaciones históricas**: el número total de publicaciones que
   muestra el perfil (o del feed que puedas ver).
5. **Publicaciones del último mes**: cuenta cuántas publicaciones reales
   ves con fecha de los últimos 30 días.
6. **Fecha de la última publicación** (formato AAAA-MM-DD).
7. **Likes recientes**: suma los "me gusta" de las últimas 5-10
   publicaciones que veas (no hace falta scrollear todo el historial).
8. **Publicaciones que revisaste para el punto anterior**: cuántas
   publicaciones sumaste (ej. 10, 6, 5).
9. **Publicación con más interacción**: de esas mismas últimas
   publicaciones, cuál tiene más likes + comentarios/compartidos juntos.
   Anota un resumen corto de qué trata (una frase) y su cantidad de likes.

Si un dato no está visible o no aplica (por ejemplo, la cuenta es
privada, no carga, no existe, o está suspendida), escribe "no disponible"
en ese campo -- no quiero ningún número inventado ni adivinado.

Al terminar cada cuenta, devuélveme el resultado en **una sola línea**,
con este formato exacto (para poder pegarlo directo en un CSV), separando
los campos con punto y coma `;`:

```
codigo;ente;plataforma;usuario;url;estado;seguidores;seguidores_exacto;publicaciones_historico;publicaciones_ultimo_mes;ultima_publicacion;likes_recientes;publicaciones_muestra;publicacion_destacada_titulo;publicacion_destacada_likes;fecha_medicion
```

Ejemplo de una línea de resultado real:

```
SEG-01;Comisión de Seguridad Ciudadana;Instagram;@seguridadciudadanatachira;https://instagram.com/seguridadciudadanatachira;activa;2600;si;580;12;2026-09-06;510;10;Operativo de seguridad en el centro;180;2026-09-07
```

(la fecha de `fecha_medicion` es la de HOY, cuando hagas la revisión)

Aquí está la tabla de cuentas a revisar:

| Código | Ente | Plataforma | Usuario | Link |
|---|---|---|---|---|
| SEG-01 | Comisión de Seguridad Ciudadana | Instagram | @seguridadciudadanatachira | https://instagram.com/seguridadciudadanatachira |
| SEG-03 | Instituto Autónomo de Policía del Estado Táchira | Instagram | @politachira | https://instagram.com/politachira |
| SEG-03 | Instituto Autónomo de Policía del Estado Táchira | X | @policiatachira | https://x.com/policiatachira |
| SEG-04 | INAPROCET (Protección Civil Táchira) | Instagram | @pcsancristobal | https://instagram.com/pcsancristobal |
| SEG-04 | INAPROCET (Protección Civil Táchira) | X | @PCivilTachira | https://x.com/PCivilTachira |
| ECO-01 | FUNDESTA — Instituto Autónomo para el Desarrollo de la Economía Social | Instagram | @fundestaoficial | https://instagram.com/fundestaoficial |
| ECO-01 | FUNDESTA — Instituto Autónomo para el Desarrollo de la Economía Social | X | @Fundesta_inst | https://x.com/Fundesta_inst |
| ECO-03 | Lotería de Táchira | Instagram | @lotdeltachira | https://instagram.com/lotdeltachira |
| ECO-03 | Lotería de Táchira | X | @LotDelTachira | https://x.com/LotDelTachira |
| ECO-04 | I.V.T | Instagram | @ivt_tachira | https://instagram.com/ivt_tachira |
| ECO-04 | I.V.T | Facebook | /ivtgbt | https://facebook.com/ivtgbt |
| ECO-05 | CORPOTACHIRA | X | @corpotachira | https://x.com/corpotachira |
| ECO-06 | CORPOINTA | Instagram | @corpointa.gobtachira | https://instagram.com/corpointa.gobtachira |
| ECO-07 | COTATUR | Instagram | @cotaturve | https://instagram.com/cotaturve |
| ECO-08 | COIMTA | Instagram | @coimtaoficial | https://instagram.com/coimtaoficial |
| ECO-11 | SEDEBAT | Instagram | @sedebat_ | https://instagram.com/sedebat_ |
| ECO-11 | SEDEBAT | X | @Sedebat_ | https://x.com/Sedebat_ |
| SOC-13 | CORPOSALUD | Instagram | @corposalud_tachira | https://instagram.com/corposalud_tachira |
| SOC-15 | INTAMUJER | Instagram | @intamujer | https://instagram.com/intamujer |
| SOC-15 | INTAMUJER | X | @INTAMUJERTACH | https://x.com/INTAMUJERTACH |
| SOC-16 | INTAVI | Instagram | @intavienlinea | https://instagram.com/intavienlinea |
| SOC-17 | Fundación de la Familia Tachirense | Instagram | @famitachirense | https://instagram.com/famitachirense |
| SOC-17 | Fundación de la Familia Tachirense | X | @famitachirense | https://x.com/famitachirense |
| SOC-18 | FUNDES | Instagram | @fundes.tachira | https://instagram.com/fundes.tachira |
| EDU-02 | Dirección de Educación | Instagram | @diredutachira | https://instagram.com/diredutachira |
| EDU-02 | Dirección de Educación | X | @DirEduTachira | https://x.com/DirEduTachira |
| EDU-03 | Dirección de Cultura del Estado Táchira | Facebook | /direcciondeculturadelestadotachira | https://facebook.com/direcciondeculturadelestadotachira |
| EDU-04 | INTEDUCA | Instagram | @inteduca_tachira | https://instagram.com/inteduca_tachira |
| EDU-05 | I.D.T (Instituto del Deporte Tachirense) | Instagram | @idtachirense | https://instagram.com/idtachirense |

## (fin del prompt para pegar)

---

## Qué hacer con el resultado

1. Copia las líneas que te devuelva Claude (una por cuenta, separadas por `;`).
2. Pégalas en un archivo de texto, con esta primera línea de cabecera:
   ```
   codigo;ente;plataforma;usuario;url;estado;seguidores;seguidores_exacto;publicaciones_historico;publicaciones_ultimo_mes;ultima_publicacion;likes_recientes;publicaciones_muestra;publicacion_destacada_titulo;publicacion_destacada_likes;fecha_medicion
   ```
   y guárdalo como `.csv` (o mándamelo directo a mí, como hiciste la vez
   pasada, y yo lo cargo al dashboard).
3. Si lo subes tú mismo a Firestore:

```bash
cd scripts
npm install
export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccountKey.json"
npm run import-metrics -- ruta/al/archivo.csv
```

Esto sube todo de una vez a Firestore y el dashboard lo muestra
automáticamente (en la ficha de cada ente, en las pastillas Activo/Inactivo
de Segmentos de la gestión, y en las tarjetas de "KPI semanal por
institución").

---

## Lo que este prompt NO puede darte

Esta vía sirve solo para **métricas de redes sociales que ya existen**
(las 29 cuentas de la tabla). No sirve para llenar estas otras partes del
Centro de Control, que hoy están vacías a propósito porque no son datos
que se puedan leer navegando perfiles públicos:

- **Campañas activas** y **Proyectos en desarrollo**: son información
  interna de gestión (qué campañas/proyectos están corriendo, en qué
  fase) -- alguien del equipo tiene que cargarlos, no se "scrapean".
- **Radar de coyuntura**: requiere monitoreo real de medios/menciones,
  no solo revisar las cuentas propias.
- **Rendimiento de la semana (alcance/engagement agregado)**: una vez que
  tengamos dos o más mediciones en el tiempo (por ejemplo, esta y la del
  2026-09-01) puedo calcular la variación real semana a semana -- dímelo
  cuando tengas el nuevo CSV y lo agrego.

Si quieres, cuando me pases el nuevo archivo también reviso si hay
Instagram/X que se recuperaron (por ejemplo si @intamujer o @diredutachira
ya existen) o que se cayeron desde la medición anterior.
