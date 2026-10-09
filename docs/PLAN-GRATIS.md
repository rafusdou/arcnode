# Plan gratis: límites, publicidad y mensajes

Documento interno (Rafa, Tomi). Explica cómo funciona el plan gratis por
dentro: qué límites tiene, cómo se aplican, qué mensajes manda el servidor y
cómo se implementa cada cosa.

## 1. La idea

El plan gratis (internamente "Piedra") es la vidriera de Changuihost. Funciona de
verdad, pero:

- tiene límites que se notan cuando el server empieza a crecer,
- el propio servidor hace la publicidad: en la lista de servidores, en el
  chat y en el ícono.

Cada persona que entra a jugar a un server gratis ve la marca. El dueño ve,
con datos reales de su propio server, por qué le conviene pasar a un plan pago.

**Qué se dice y dónde:**

| Dónde | Qué dice sobre los límites |
|---|---|
| Home, tabla de planes, checkout | Nada. Se presenta como "un servidor chico para probar". |
| Términos y condiciones | Una línea: el plan gratis puede mostrar mensajes de Changuihost y de patrocinadores, y se apaga si no hay jugadores. |

Lo de Términos no es opcional: la Ley de Defensa del Consumidor pide informar
las condiciones del servicio aunque sea gratis, y nos cubre si alguien
reclama. Nadie lee los Términos para decidir si prueba un plan gratis, así que
no afecta la conversión.

Pendiente antes de lanzar: leer las *Minecraft Usage Guidelines* de Mojang
(sección de servidores) para confirmar qué permiten sobre publicidad dentro
del juego.

## 2. Límites

| Límite | Valor | Cómo se aplica | Estado |
|---|---|---|---|
| RAM | 1 GB | `memory` = 1024 cuando `plan.ram === 0` en `server/app.js` | Ya está |
| CPU | 50% de un núcleo | `CPU_MIN` en `server/app.js` | Ya está |
| Disco | 2 GB | `plan.ssd = "2 GB"` → `ssdToMb` | Ya está |
| Backups | 0 | `feature_limits.backups = 0` (el plan tiene `backups: false`) | Ya está |
| Bases de datos | 0 | `feature_limits.databases = 0` | Ya está |
| Jugadores | 3 | `playersPrefix` en `server/app.js` reescribe `max-players=3` en cada arranque, así editar el archivo no lo levanta. Los planes pagos arrancan con `max-players=1000` (sin límite) | Ya está |
| Tipo de server | Paper o Vanilla | Forge no arranca bien con 1 GB; el checkout no lo ofrece y el backend lo rechaza | Ya está |
| Servidores gratis por cuenta | 1 | El backend rechaza un segundo plan gratis para el mismo email | Ya está |
| Checkout sin tarjeta | — | El checkout del plan gratis no pide medio de pago y dice "Soporte: Básico" | Ya está |
| Arranque | Solo desde la página de arranque, con 1 minuto de espera | El cliente es subusuario sin permiso de prender (ver sección 5) | Ya está |
| Boost de RAM | 2 GB durante 1 hora a cambio de un anuncio | Página de arranque + worker del bot (ver sección 5) | Ya está |
| Apagado por inactividad | 15 min sin jugadores | Worker (ver sección 6) | Falta |

Los límites que ya están salen solos de cómo está armado el backend. Los que
faltan se detallan abajo.

## 3. Lo que ve cualquiera en la lista de servidores

### 3.1 MOTD (el texto debajo del nombre)

```
Changuihost · Servidor gratis
Creá el tuyo en changuihost.cc
```

Con colores (códigos `§`):

```
§6§lChanguihost §r§7· §fServidor gratis
§7Creá el tuyo en §6changuihost.cc
```

En `server.properties` el `§` va escapado y el salto de línea es `\n`:

```
motd=§6§lChanguihost §r§7· §fServidor gratis\n§7Creá el tuyo en §6changuihost.cc
```

**Cómo se fuerza (sin que el dueño lo pueda cambiar):** con eggs propios para
el plan gratis. En el panel de admin, Nests → Minecraft, se clonan los eggs de
Paper y Vanilla como "Paper (Gratis)" y "Vanilla (Gratis)". En la pestaña
*Configuration* de cada uno, en *Configuration Files*, se agrega `motd` a lo
que ya fuerza el egg (`max-players` ya lo maneja el backend, ver la tabla de
límites; si lo ponés también acá, no pasa nada):

```json
{
  "server.properties": {
    "parser": "properties",
    "find": {
      "server-ip": "0.0.0.0",
      "server-port": "{{server.build.default.port}}",
      "query.port": "{{server.build.default.port}}",
      "motd": "§6§lChanguihost §r§7· §fServidor gratis\\n§7Creá el tuyo en §6changuihost.cc",
      "max-players": "3"
    }
  }
}
```

Wings reescribe esos valores en cada arranque, así que si el dueño edita
`server.properties` a mano, al reiniciar vuelve todo. El backend usa estos
eggs (en vez de los normales) cuando el plan es gratis: en `SERVER_TYPES` de
`server/app.js` se agrega el egg ID gratis de cada tipo.

### 3.2 Ícono del servidor

- PNG de **64×64 px** (Minecraft no acepta otro tamaño), llamado
  `server-icon.png` en la raíz del server.
- Diseño: el logo de Changuihost sobre fondo oscuro y una franja abajo que diga
  **FREE** en letras oscuras sobre amarillo `#F2B33D`. Tiene que leerse a 64 px, así que
  nada de texto chico.
- Se publica en el sitio como `public/free-server-icon.png` (queda en
  `https://changuihost.cc/free-server-icon.png`).

**Cómo se fuerza:** se descarga en cada arranque con un prefijo en el
comando de inicio, igual que el truco que ya usamos para la EULA
(`EULA_PREFIX` en `server/app.js`). El dueño no puede editar el comando de
inicio desde su panel, solo un admin.

```js
const FREE_ICON_PREFIX =
  '$(curl -fsSL -o server-icon.png https://changuihost.cc/free-server-icon.png) ';
// startup: FREE_ICON_PREFIX + EULA_PREFIX + egg.startup
```

Hay que confirmar que la imagen de Docker del server (las `yolks` de Java)
trae `curl`. Si no lo trae, se puede usar `wget`, o meter el ícono en el
script de instalación del egg gratis.

## 4. Mensajes en el chat

Todos los mensajes salen con el prefijo **`[Changuihost]`** en dorado (el `gold` de Minecraft, lo más parecido al amarillo de la marca), para que
quede claro que no los escribe el dueño ni un jugador. Los de patrocinadores
llevan **`[Sponsor]`**.

### 4.1 Reglas

1. **Lo que dice un mensaje tiene que ser verdad en ese momento.** Si dice
   que el server está lleno, está lleno. Si dice que usa casi toda la
   memoria, la está usando. Nunca se inventa lag ni problemas para vender.
2. **Frecuencia:** como máximo un mensaje cada 15 minutos y 3 por hora, en
   total (marca + contextuales + sponsors). El primero, recién a los 10
   minutos de que arrancó el server.
3. **Solo si hay jugadores conectados.** Sin nadie conectado no se manda
   nada.
4. **Nada de spam ni de interrumpir el juego:** sin títulos en el medio de la
   pantalla, sin sonidos, sin repetir el mismo mensaje dos veces seguidas.
5. **Sponsors aptos para menores:** gran parte de la gente que juega
   Minecraft es menor. Prohibido: apuestas y casinos, cripto, alcohol,
   contenido adulto, préstamos. Si dudás, no va.
6. **Todo link lleva UTM** para poder medir cuántos upgrades vienen de cada
   mensaje: `?utm_source=free_server&utm_medium=chat&utm_campaign=<id>`.

### 4.2 Mensajes de marca (rotativos)

Se mandan en orden, uno por vez, cuando toca y no hay un mensaje contextual
pendiente.

| id | Mensaje |
|---|---|
| `marca-1` | Este servidor está alojado gratis en **Changuihost**. ¿Querés uno propio? **changuihost.cc** |
| `marca-2` | ¿Te gusta este server? El dueño puede pasarlo a un plan pago desde **{precio_1gb}/mes** y sacar estos mensajes. |
| `marca-3` | Los planes pagos de Changuihost quedan prendidos 24/7, aunque no haya nadie conectado. |
| `marca-4` | Con **2 GB** entran hasta 10 jugadores y podés usar más plugins. Planes en **changuihost.cc** |

`{precio_1gb}` se completa desde `src/data/plans.js` (el worker lo importa),
así el precio de los mensajes nunca queda desactualizado respecto de la web.

### 4.3 Mensajes contextuales (basados en datos reales)

Tienen prioridad sobre los de marca. Cada uno, como mucho una vez por hora
por servidor.

| id | Cuándo se dispara | Mensaje |
|---|---|---|
| `lleno` | Hay 3 de 3 jugadores conectados | El servidor está lleno (3/3). Con el plan **Madera** entran 5 y con **Piedra Arenisca**, 10. |
| `memoria` | Memoria arriba del 85% durante 2 minutos seguidos | El servidor está usando casi toda su memoria y puede andar más lento. Con 2 GB tendría el doble. |
| `apagado` | El servidor se apagó por inactividad y alguien lo vuelve a prender | Este servidor se apaga solo cuando no hay nadie. Los planes pagos quedan prendidos todo el día. |

El mensaje de `apagado` se manda 2 minutos después del arranque, si ya hay
alguien conectado.

### 4.4 Sponsors

- Un mensaje de sponsor cada 45 minutos como máximo (cuenta dentro del
  límite de 3 por hora).
- Formato fijo: `[Sponsor] <Marca>: <texto corto>. <link>`
- Máximo 120 caracteres para que entre en una línea del chat.
- Los sponsors se cargan en un archivo JSON (`bot/sponsors.json`) con fecha
  de inicio y fin, así una campaña se apaga sola.

```json
[
  {
    "id": "ejemplo-tienda",
    "marca": "TiendaEjemplo",
    "texto": "20% off en remeras gamer con el código CHANGUI",
    "url": "https://tiendaejemplo.com",
    "desde": "2026-11-01",
    "hasta": "2026-11-30"
  }
]
```

### 4.5 Cómo se ve en el juego

Los mensajes se mandan con `tellraw`, que permite colores y links que se
pueden clickear. Ejemplo de `marca-1`:

```
tellraw @a ["",{"text":"[Changuihost] ","color":"gold","bold":true},{"text":"Este servidor está alojado gratis en ","color":"gray"},{"text":"Changuihost","color":"white","bold":true},{"text":". ¿Querés uno propio? ","color":"gray"},{"text":"changuihost.cc","color":"gold","underlined":true,"clickEvent":{"action":"open_url","value":"https://changuihost.cc/?utm_source=free_server&utm_medium=chat&utm_campaign=marca-1"}}]
```

**Ojo con la versión:** desde Minecraft **1.21.5** cambió el formato de los
links. En vez de `"clickEvent":{"action":"open_url","value":"..."}` va
`"click_event":{"action":"open_url","url":"..."}`. El worker sabe qué versión
eligió el cliente (está en las variables del server) y arma el mensaje en el
formato que corresponde. Si la versión es `latest`, se usa el formato nuevo.

## 5. Página de arranque y boost de RAM (ya implementado)

Los servidores gratis no se prenden desde el panel: se prenden desde su
**página de arranque** (`changuihost.cc/arrancar/<id>?t=<token>`). El link se
muestra al terminar el checkout gratis y el cliente lo tiene que guardar.

**Cómo funciona para el cliente:**

1. Abre su link y toca **Prender servidor**.
2. Espera **1 minuto** con una cuenta regresiva. Ahí ve que con un plan pago
   arrancaría al instante.
3. Mientras espera, puede tocar **Mirar anuncio**: un anuncio de **30
   segundos**. Si lo mira entero, el servidor arranca con **2 GB en vez de 1
   GB durante 1 hora**.
4. Cuando termina la espera (y el anuncio, si eligió verlo), el servidor
   arranca solo y la página muestra la dirección para conectarse.
5. Cuando se cumple la hora, el bot avisa en el chat del juego, espera un
   minuto, lo apaga, le vuelve a poner 1 GB y lo prende de nuevo.

**Por qué no se puede hacer trampa:**

- El servidor gratis es de una cuenta de servicio (`gratis@changuihost.cc`).
  El cliente entra como subusuario: tiene consola, archivos y puede apagarlo,
  pero no tiene permiso de prender ni reiniciar, ni de crear tareas
  programadas (que también podrían prenderlo).
- La espera y el anuncio se controlan en el backend, no en el navegador: la
  página recibe "tickets" firmados con la hora de inicio, y el backend se
  fija que haya pasado el tiempo antes de prender o de dar el boost.
- El link de arranque está firmado por servidor: sin el token correcto no se
  puede ni ver el estado.

**Detalles técnicos:** la lógica está en `server/freeplan.js`. Los datos del
plan gratis (de qué cliente es, hasta cuándo dura el boost) se guardan en el
campo `external_id` del servidor, que el cliente no ve (`free:<id del
cliente>;boost=<vencimiento>`). Los tiempos se pueden cambiar con las
variables de entorno `FREE_QUEUE_SECONDS`, `FREE_AD_SECONDS` y
`FREE_BOOST_MINUTES` (por defecto 60, 30 y 60).

**Importante:** el boost se termina gracias al bot de Discord. **Si el bot no
está corriendo, el boost no se termina** y el cliente se queda con 2 GB hasta
que el bot vuelva a prenderse. Lo mismo para dar acceso al panel: el cliente
recibe permiso recién cuando termina la instalación, y eso lo hace la página
de arranque o el bot.

**El anuncio de hoy es nuestro:** el espacio muestra una promo de los planes
pagos. Cuando haya sponsors, su anuncio va en ese mismo lugar (componente
`AdSlot` en `src/pages/Arrancar.jsx`).

**Ojo con la capacidad:** cada boost ocupa 1 GB más del nodo durante una hora.
Si muchos servidores gratis piden boost a la vez, puede faltar RAM para los
planes pagos. Cuando haya más uso, conviene limitar cuántos boosts puede haber
al mismo tiempo.

## 6. Implementación: el worker

Los mensajes, el apagado por inactividad y los contextuales necesitan un
proceso que corra todo el tiempo. Va dentro del bot de Discord, que ya corre
24/7 en la misma máquina que el panel y ya habla con la API de Pterodactyl.
El archivo `bot/freeplan.js` ya existe y corre cada minuto: hoy da acceso a
los clientes cuando termina la instalación y termina los boosts vencidos. Lo
que sigue (mensajes y apagado por inactividad) se suma ahí.

Cada 60 segundos:

1. Lista los servidores (Application API) y se queda con los del plan
   gratis: los que tienen `external_id` empezando con `free:`.
2. Para cada uno, pide los recursos (Client API,
   `GET /api/client/servers/{id}/resources`): estado y memoria usada.
3. Si está prendido, consulta cuántos jugadores hay con un *Server List
   Ping* a `ip:puerto` (es lo mismo que hace Minecraft para mostrar
   "3/3" en la lista; se hace con el módulo `net` de Node, sin dependencias).
4. Decide si toca mandar algo, siguiendo las reglas de la sección 4.1, y lo
   manda con `POST /api/client/servers/{id}/command` usando la API key de
   cliente del admin. El dueño no puede bloquear esto desde su panel.
5. Si lleva 15 minutos seguidos con 0 jugadores, lo apaga con
   `POST /api/client/servers/{id}/power` (`{"signal": "stop"}`).

El estado (último mensaje mandado, minutos sin jugadores, cuándo arrancó)
vive en memoria. Si el bot se reinicia se pierde, y lo peor que pasa es que
un mensaje sale unos minutos antes o después.

## 7. Más adelante (opcional)

- **Plugin propio para Paper** (`ChanguihostFree.jar`), descargado en cada
  arranque igual que el ícono. Permite cosas que con comandos de consola no
  se pueden: cartel en la lista de jugadores (Tab) que diga "Changuihost · plan
  gratis", mensaje de bienvenida a cada jugador que entra, y un aviso al
  dueño (por su nombre de usuario de Minecraft) cuando el server se llena. No
  sirve para Vanilla.
- **Código de descuento para quien viene del plan gratis**, por ejemplo el
  primer mes al 50%. Se puede mencionar en `marca-2`.
- **Medir:** con las UTM de los links, ver qué mensaje trae más upgrades y
  sacar los que no rinden.
