# Plan gratis: límites, publicidad y mensajes

Documento interno (Rafa, Tomi). Explica cómo funciona el plan gratis por
dentro: qué límites tiene, cómo se aplican, qué mensajes manda el servidor y
cómo se implementa cada cosa.

## 1. La idea

El plan gratis (internamente "Piedra") es la vidriera de ArcNode. Funciona de
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
| Términos y condiciones | Una línea: el plan gratis puede mostrar mensajes de ArcNode y de patrocinadores, y se apaga si no hay jugadores. |

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
| Jugadores | 3 | `max-players=3` forzado por el egg (ver 3.1) | Falta |
| Tipo de server | Paper o Vanilla | Forge no arranca bien con 1 GB; el checkout no lo ofrece y el backend lo rechaza | Ya está |
| Servidores gratis por cuenta | 1 | El backend rechaza un segundo plan gratis para el mismo email | Ya está |
| Checkout sin tarjeta | — | El checkout del plan gratis no pide medio de pago y dice "Soporte: Básico" | Ya está |
| Apagado por inactividad | 15 min sin jugadores | Worker (ver sección 5) | Falta |

Los límites que ya están salen solos de cómo está armado el backend. Los que
faltan se detallan abajo.

## 3. Lo que ve cualquiera en la lista de servidores

### 3.1 MOTD (el texto debajo del nombre)

```
ArcNode.cc · Servidor gratis
Creá el tuyo en arcnode.cc
```

Con colores (códigos `§`):

```
§b§lArcNode.cc §r§7· §fServidor gratis
§7Creá el tuyo en §barcnode.cc
```

En `server.properties` el `§` va escapado y el salto de línea es `\n`:

```
motd=§b§lArcNode.cc §r§7· §fServidor gratis\n§7Creá el tuyo en §barcnode.cc
```

**Cómo se fuerza (sin que el dueño lo pueda cambiar):** con eggs propios para
el plan gratis. En el panel de admin, Nests → Minecraft, se clonan los eggs de
Paper y Vanilla como "Paper (Gratis)" y "Vanilla (Gratis)". En la pestaña
*Configuration* de cada uno, en *Configuration Files*, se agregan `motd` y
`max-players` a lo que ya fuerza el egg:

```json
{
  "server.properties": {
    "parser": "properties",
    "find": {
      "server-ip": "0.0.0.0",
      "server-port": "{{server.build.default.port}}",
      "query.port": "{{server.build.default.port}}",
      "motd": "§b§lArcNode.cc §r§7· §fServidor gratis\\n§7Creá el tuyo en §barcnode.cc",
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
- Diseño: el logo de ArcNode sobre fondo oscuro y una franja abajo que diga
  **FREE** en blanco sobre azul `#378ADD`. Tiene que leerse a 64 px, así que
  nada de texto chico.
- Se publica en el sitio como `public/free-server-icon.png` (queda en
  `https://arcnode.cc/free-server-icon.png`).

**Cómo se fuerza:** se descarga en cada arranque con un prefijo en el
comando de inicio, igual que el truco que ya usamos para la EULA
(`EULA_PREFIX` en `server/app.js`). El dueño no puede editar el comando de
inicio desde su panel, solo un admin.

```js
const FREE_ICON_PREFIX =
  '$(curl -fsSL -o server-icon.png https://arcnode.cc/free-server-icon.png) ';
// startup: FREE_ICON_PREFIX + EULA_PREFIX + egg.startup
```

Hay que confirmar que la imagen de Docker del server (las `yolks` de Java)
trae `curl`. Si no lo trae, se puede usar `wget`, o meter el ícono en el
script de instalación del egg gratis.

## 4. Mensajes en el chat

Todos los mensajes salen con el prefijo **`[ArcNode]`** en celeste, para que
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
| `marca-1` | Este servidor está alojado gratis en **ArcNode.cc**. ¿Querés uno propio? **arcnode.cc** |
| `marca-2` | ¿Te gusta este server? El dueño puede pasarlo a un plan pago desde **{precio_1gb}/mes** y sacar estos mensajes. |
| `marca-3` | Los planes pagos de ArcNode quedan prendidos 24/7, aunque no haya nadie conectado. |
| `marca-4` | Con **2 GB** entran hasta 10 jugadores y podés usar más plugins. Planes en **arcnode.cc** |

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
    "texto": "20% off en remeras gamer con el código ARCNODE",
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
tellraw @a ["",{"text":"[ArcNode] ","color":"aqua","bold":true},{"text":"Este servidor está alojado gratis en ","color":"gray"},{"text":"ArcNode.cc","color":"white","bold":true},{"text":". ¿Querés uno propio? ","color":"gray"},{"text":"arcnode.cc","color":"aqua","underlined":true,"clickEvent":{"action":"open_url","value":"https://arcnode.cc/?utm_source=free_server&utm_medium=chat&utm_campaign=marca-1"}}]
```

**Ojo con la versión:** desde Minecraft **1.21.5** cambió el formato de los
links. En vez de `"clickEvent":{"action":"open_url","value":"..."}` va
`"click_event":{"action":"open_url","url":"..."}`. El worker sabe qué versión
eligió el cliente (está en las variables del server) y arma el mensaje en el
formato que corresponde. Si la versión es `latest`, se usa el formato nuevo.

## 5. Implementación: el worker

Los mensajes, el apagado por inactividad y los contextuales necesitan un
proceso que corra todo el tiempo. Va dentro del bot de Discord, que ya corre
24/7 en la misma máquina que el panel y ya habla con la API de Pterodactyl
(`bot/pterodactyl.js`). Archivo nuevo: `bot/freeplan.js`, arrancado desde
`bot/index.js` cuando el bot está listo.

Cada 60 segundos:

1. Lista los servidores (Application API) y se queda con los del plan
   gratis. Cada servidor guarda su plan en la descripción (`ArcNode plan:
   Piedra`), así que alcanza con filtrar por eso.
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

## 6. Más adelante (opcional)

- **Plugin propio para Paper** (`ArcNodeFree.jar`), descargado en cada
  arranque igual que el ícono. Permite cosas que con comandos de consola no
  se pueden: cartel en la lista de jugadores (Tab) que diga "ArcNode.cc · plan
  gratis", mensaje de bienvenida a cada jugador que entra, y un aviso al
  dueño (por su nombre de usuario de Minecraft) cuando el server se llena. No
  sirve para Vanilla.
- **Código de descuento para quien viene del plan gratis**, por ejemplo el
  primer mes al 50%. Se puede mencionar en `marca-2`.
- **Medir:** con las UTM de los links, ver qué mensaje trae más upgrades y
  sacar los que no rinden.
