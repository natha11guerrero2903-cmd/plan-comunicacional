# Prompt para Claude en Chrome — cargar métricas reales al dashboard

Copia y pega todo el texto de abajo (desde "Necesito que revises...") en
Claude dentro de la extensión de Chrome, **estando tú con sesión iniciada**
en las redes que uses habitualmente (ayuda a que las páginas carguen bien
y no te pidan iniciar sesión a cada rato).

Puedes pegarlo completo (29 cuentas) o partirlo en tandas de 5-10 filas si
prefieres ir revisando de a poco -- solo copia el bloque de la tabla que
quieras que revise en cada tanda.

No lo dejes corriendo solo ni en bucle: es para que lo uses tú, de forma
puntual, cuando quieras actualizar los números (por ejemplo, una vez por
semana).

---

## Prompt (copiar desde aquí)

Necesito que revises, una por una, las cuentas de redes sociales de esta
tabla (son cuentas institucionales públicas del Gobierno del Estado
Táchira). Para cada una, abre el link y anota:

1. **Seguidores** (el número que muestra el perfil).
2. **Publicaciones históricas**: el número total de publicaciones que
   muestra el perfil (o del feed que puedas ver).
3. **Publicaciones del último mes**: cuenta cuántas publicaciones reales
   ves con fecha de los últimos 30 días.
4. **Likes recientes**: suma los "me gusta" de las últimas 5-10
   publicaciones que veas (no hace falta scrollear todo el historial).
5. **Publicación con más interacción**: de esas mismas últimas 5-10
   publicaciones, cuál tiene más likes + comentarios/compartidos juntos.
   Anota un resumen corto de qué trata (una frase) y su cantidad de likes.

Si un dato no está visible (por ejemplo, la cuenta es privada, no carga,
o no puedes ver el número de publicaciones), escribe "no disponible" en
vez de adivinar — no quiero ningún número inventado ni aproximado sin
avisarme.

Al terminar cada cuenta, devuélveme el resultado en **una sola línea**,
con este formato exacto (para poder pegarlo directo en un CSV), separando
los campos con punto y coma `;`:

```
código;seguidores;publicaciones_historico;publicaciones_ultimo_mes;likes_recientes;publicacion_destacada_titulo;publicacion_destacada_likes
```

Ejemplo de una línea de resultado real:

```
SEG-01;4520;312;14;980;Operativo de seguridad en el centro;245
```

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
2. Ábrelas junto a `scripts/plantilla-metricas.csv` en Excel/Sheets/un
   editor de texto, y pega cada valor en la columna que corresponde según
   el **código** de esa línea (busca la fila con el mismo código y
   plataforma en el CSV).
3. Cuando termines de pasar los datos al CSV, avísame o corre tú mismo:

```bash
cd scripts
npm install
export GOOGLE_APPLICATION_CREDENTIALS="/ruta/a/serviceAccountKey.json"
npm run import-metrics
```

Esto sube todo de una vez a Firestore y el dashboard lo muestra
automáticamente (en la ficha de cada ente y en las tarjetas de "KPI
semanal por institución").
