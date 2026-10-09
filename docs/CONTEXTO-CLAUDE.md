# Changuihost: contexto completo del proyecto

Este documento es para retomar el proyecto en otra sesión de Claude (por
ejemplo, la app de escritorio) sin perder nada. Si sos Claude y estás leyendo
esto: acá está todo lo que se decidió, cómo está armado, qué funciona, qué
falta y qué cosas ya nos mordieron. Leelo entero antes de proponer cambios.

Última actualización: 9 de octubre de 2026.

> **Sobre los secretos:** este archivo no tiene claves ni contraseñas a
> propósito, porque se sube a GitHub. Las claves viven en el archivo `.env`
> (que no se sube) y en el `docker-compose.yml` del panel. Más abajo se
> explica qué hay en cada lugar.

---

## 1. Qué es

**Changuihost** es un hosting de servidores de Minecraft (Java Edition) hecho
en Argentina por dos personas: **Rafa** (el usuario de estas sesiones) y su
socio **Tomi**. "Dar changüí" es dar una ventaja o un poquito de más: la marca
juega con eso.

- **Precio:** US$1,80 por GB de RAM en todos los planes. Hay 25 planes pagos
  (de 1 a 25 GB) más un plan gratis.
- **Dominio:** `changuihost.com` (comprado en Namecheap). Antes se llamaba
  ArcNode / arcnode.cc; ese nombre ya no se usa en ningún lado salvo los
  nombres técnicos que se aclaran en la sección 9.
- **Estado:** es una demo funcional completa. El sitio está publicado, el
  checkout crea servidores reales en un panel Pterodactyl, pero **todavía no
  se cobra plata real** (el pago con tarjeta es simulado: acepta cualquier
  número que tenga el formato correcto) y los servidores corren en la PC de
  Rafa, no en un datacenter.

### Sobre Rafa (importante para cómo trabajar)

- Escribe en castellano rioplatense (voseo). Respondele igual.
- Es menor de edad. Por eso **no puede abrir a su nombre** cuentas de cobro
  (Mercado Pago, Stripe), de API de IA, ni comprar cosas con tarjeta propia:
  todo eso tiene que ir a nombre de un adulto (padre, madre o tutor). Ya se
  habló y lo tiene claro; no lo repitas en cada mensaje, pero tenelo en cuenta
  al proponer cosas.
- No es programador. Explicale los pasos que tiene que hacer él de forma
  concreta (dónde hacer click, qué copiar).
- Pidió explícitamente: **después de cada cambio de código, hacer commit y
  push a GitHub** (eso publica solo en Vercel).
- Pidió explícitamente que el sitio **no parezca hecho por IA** y que **todo
  sea realista**: nada de estadísticas inventadas, testimonios falsos ni
  promesas que el sistema no cumple (por ejemplo, no se promete anti-DDoS
  porque todavía no existe).

---

## 2. Cómo está armado

```
Visitante ──► changuihost.com (Vercel)
                ├─ Sitio: React + Vite (carpeta src/)
                └─ API: funciones serverless (carpeta api/ → server/app.js)
                         │  (necesita llegar al panel por internet:
                         │   hoy es un túnel de Cloudflare temporal)
                         ▼
             Panel Pterodactyl (Docker, dentro de WSL2 en la PC de Rafa)
                         │
                         ▼
             Wings (servicio en WSL2) ──► contenedores Docker con
                                           los servidores de Minecraft

Bot de Discord (Node, corre en la PC de Rafa) ──► mismo panel
```

### Piezas

| Pieza | Dónde vive | Para qué |
|---|---|---|
| Sitio web | `src/`, publicado en Vercel | Landing, planes, checkout, documentación, página de arranque del plan gratis |
| Backend | `server/` (código) y `api/` (entradas de Vercel) | Crea usuarios y servidores en Pterodactyl, maneja el plan gratis |
| Panel Pterodactyl | Docker en WSL2: `/home/rafas/pterodactyl/docker-compose.yml` | Panel donde el cliente maneja su servidor (consola, archivos) |
| Wings | Servicio systemd en WSL2, config en `/etc/pterodactyl/config.yml` | Levanta los contenedores de Minecraft |
| Bot de Discord | `bot/` | Comandos `/planes`, `/plan`, `/status`; tickets con botones; worker del plan gratis |
| Documentos | `docs/` | Proyecto, profit, promoción, plan gratis, guía para Tomi, este archivo |
| Marca | `brand/` | Logo SVG, avatar PNG, script que aplica la marca al panel |

### Tecnologías

- Frontend: React 18, Vite 5, react-router-dom 6. Sin librerías de UI.
- Backend: Express 5 (Node, módulos ES). En local corre como proceso; en
  Vercel cada endpoint es una función.
- Bot: discord.js 14.
- Panel: imagen `ghcr.io/pterodactyl/panel:latest` + MariaDB + Redis.
- Tipografías: **Inter** para todo el texto y **JetBrains Mono** solo para
  consola, direcciones y código (decisión de Rafa).

---

## 3. El repo y cómo se publica

- **GitHub:** `github.com/rafusdou/arcnode` (rama `main`). El repo es de la
  cuenta `rafusdou`; Rafa pushea con su cuenta `rafashayo`, que es
  colaboradora. Los commits se hicieron con `user.name=rafusdou` y
  `user.email=rafashayo39@gmail.com`.
- **Vercel:** proyecto `arcnode-cc`, equipo `arcnode1`, cuenta
  `rafashayo39-6742`. Está conectado a GitHub: cada push a `main` publica
  solo. También se puede publicar con `npx vercel --prod --yes`.
  - A veces el deploy por CLI falla con un error pasajero ("Not authorized"
    o `"status": "error"`); reintentar funciona.
- **Dominio en Vercel:** `changuihost.com` y `www.changuihost.com` ya están
  agregados al proyecto.
- **DNS:** desde el 9/10/2026 lo maneja **Cloudflare** (cuenta de Rafa, plan
  Free). En Namecheap los nameservers son `dave.ns.cloudflare.com` y
  `dell.ns.cloudflare.com`. Registros: `A @ 76.76.21.21` y `CNAME www
  cname.vercel-dns.com`, los dos **DNS only** (nube gris; con proxy Vercel no
  puede sacar el certificado). Quedaron los registros de mail de Namecheap
  (privateemail) que Cloudflare importó solo.
- **Carpeta local:** `C:\Users\rafas\OneDrive\Desktop\ArcNode` (Windows 11).
  El nombre de la carpeta quedó del nombre viejo.

### Comandos

```
npm run dev      # sitio en modo desarrollo (con --host, se ve desde la red local)
npm run build    # compila el sitio a dist/
npm run server   # backend local en el puerto 4000 (lee .env)
npm run bot      # bot de Discord (lee .env)
```

En desarrollo, Vite redirige `/api` al backend local (`vite.config.js`).

### Variables de entorno

En `.env` (local, no se sube) y en Vercel → Settings → Environment Variables:

| Variable | Qué es |
|---|---|
| `PTERODACTYL_URL` | URL del panel. Local: `http://localhost:8080`. En Vercel: la URL pública del túnel |
| `PTERODACTYL_API_KEY` | API key de aplicación (admin), empieza con `ptla_` |
| `PTERODACTYL_CLIENT_KEY` | API key de cliente del admin, empieza con `ptlc_` |
| `PTERODACTYL_NODE_ID`, `PTERODACTYL_NEST_ID` | Ambos `1` |
| `LAN_IP` | IP de la PC en la red local (`10.10.32.27`); se muestra como dirección del servidor |
| `DISCORD_TOKEN` y `DISCORD_*_ID` | Token del bot e IDs de canales y roles (solo en `.env`, el bot no corre en Vercel) |
| `FREE_QUEUE_SECONDS`, `FREE_AD_SECONDS`, `FREE_BOOST_MINUTES` | Opcionales. Tiempos del plan gratis (por defecto 60, 30 y 60) |
| `VITE_PANEL_URL` | Opcional. Si está, la página de login muestra un botón al panel |

---

## 4. El sitio

Páginas (`src/pages/`):

| Ruta | Página | Notas |
|---|---|---|
| `/` | Home | Hero con selector de RAM (1 a 25 GB), "Qué incluye", tarjetas de planes con pestañas por categoría, preguntas frecuentes |
| `/checkout?plan=Nombre` | Checkout | Formulario con datos del servidor, cuenta y pago. El plan gratis tiene un checkout distinto: sin tarjeta y con "Soporte: Básico" |
| `/arrancar/:id?t=token` | Página de arranque | Solo para servidores gratis (ver sección 6) |
| `/planes-minecraft` | Planes | Info de tipos de servidor + las mismas tarjetas |
| `/docs` | Documentación | Guías reales: conectarse, `op`, `server.properties`, plugins, subir un mundo |
| `/modpacks` | Modpacks | Guía para Forge. Aclara que NeoForge y Fabric todavía no andan |
| `/migrar` | Migrar | Paso a paso para traer un servidor de otro host |
| `/panel-demo` | Cómo es el panel | Vista de ejemplo (aclara que no está conectada) |
| `/status` | Estado | Consulta de verdad si el panel responde (`/api/status`) |
| `/about`, `/afiliados`, `/terminos`, `/privacidad`, `/login` | Institucionales | Todo con información real. Afiliados dice que el programa todavía no está abierto |

Las rutas viejas `/signup`, `/vps` y `/tutoriales` redirigen a otras páginas
(eran productos o contenido inventado y se sacaron).

### Diseño

- Fondo casi negro cálido, un solo color de acento: **amarillo `#F2B33D`**
  con texto oscuro encima (`--accent`, `--accent-ink` en `src/index.css`).
  Verde (`--green`) solo para "online" y el plan gratis.
- Logo: un bloque de Minecraft en perspectiva con un "+" arriba (el "bloque de
  más"). Wordmark: "Changui" en blanco y "host" en amarillo. Componente
  `src/components/Logo.jsx`; SVG en `brand/changuihost-logo.svg`.
- Se sacó a propósito todo lo que delataba "hecho por IA": degradados,
  manchas de luz, grilla de fondo, terminal falsa, etiquetas en mayúscula con
  puntito, contadores inventados, testimonios falsos.
- Textos en `src/i18n.js` (castellano e inglés). El idioma y la moneda (ARS,
  USD, EUR) se cambian desde el menú.

### Datos de los planes (`src/data/plans.js`)

Es la única fuente de verdad: la usan el sitio, el backend y el bot.

- Precio: `PRICE_PER_GB = 1.8` (USD). Dólar de referencia: `USD_TO_ARS = 1500`
  (hay que actualizarlo a mano).
- Plan gratis: se llama **Piedra**, `free: true`, 3 jugadores, 2 GB de disco.
- Planes pagos: de **Madera** (1 GB) a **Herobrine** (25 GB), agrupados en
  Básico (1–5), Intermedio (6–12), Avanzado (13–20) y Elite (21–25).
- **Tope de jugadores (`maxPlayers`):** gratis 3; Madera 5, Piedra Arenisca 8,
  Hierro 12, Oro 16, Diamante 20. Desde 6 GB no hay tope.
- `players`: referencia de cuántos juegan cómodos (se muestra como sugerencia
  en el selector, no es un límite).

---

## 5. El backend (`server/`)

- `server/app.js`: rutas de Express.
  - `POST /api/checkout`: valida, busca o crea el usuario en Pterodactyl,
    busca un puerto libre, crea el servidor y devuelve los datos de acceso.
  - `GET /api/checkout/status/:id`: si el servidor terminó de instalarse y si
    está prendido (el checkout pago lo consulta para mostrar "online").
  - `GET /api/status`: si el panel responde (página de Estado).
  - `GET /api/free/:id` y `POST /api/free/:id/:action`: página de arranque
    del plan gratis (acciones `queue`, `ad`, `start`).
- `server/freeplan.js`: toda la lógica del plan gratis (sección 6).
- `server/ptero.js`: helpers para la API de Pterodactyl, con timeout de 20 s.
  Los usan el backend y el bot.
- `api/`: un archivo por endpoint, cada uno solo le pasa el pedido a la app de
  Express. **No usar una ruta comodín (`[...all].js`):** en este proyecto
  Vercel no la matcheaba para rutas con varios segmentos y daba 404.
- `vercel.json`: manda todo lo que no es `/api/` al `index.html` (la app es de
  una sola página).

### Cosas no obvias del backend

- **EULA automática:** al comando de arranque de cada servidor se le antepone
  `$([ -f eula.txt ] || echo "eula=true" > eula.txt)`. Wings no ejecuta el
  comando de arranque como un shell normal: `;`, `||`, `>` y las comillas
  escritas directo no funcionan, pero **lo que va dentro de `$(...)` sí se
  ejecuta como shell de verdad**. Por eso todos los "trucos" de arranque usan
  `$(...)`. No intentar envolver con `bash -c "..."`, porque se rompe.
- **Jugadores:** con el mismo truco, los planes con tope reescriben
  `max-players` en cada arranque (editar el archivo no lo levanta); los planes
  sin tope arrancan con `max-players=1000` solo la primera vez.
- **CPU:** medio núcleo por GB, mínimo medio núcleo, máximo 2 núcleos
  (`cpuLimitFor`). Está pensado para no saturar máquinas chicas.
- **Tipos de servidor:** Paper (egg 5), Vanilla (egg 3) y Forge (egg 2). Son
  los eggs que trae Pterodactyl. Fabric, NeoForge y Bedrock no existen en el
  panel: no ofrecerlos.
- **Descripción del servidor:** "Plan X de Changuihost". La ve el cliente en
  su panel.

---

## 6. El plan gratis

Detalle completo en `docs/PLAN-GRATIS.md`. Resumen de lo que ya funciona:

- **Límites:** 1 GB de RAM, medio núcleo, 2 GB de disco, 3 jugadores, sin
  backups ni bases de datos, solo Paper o Vanilla, uno por email.
- **El cliente no puede prenderlo desde el panel.** El servidor es de una
  cuenta de servicio (`gratis@changuihost.com`) y el cliente queda como
  subusuario sin permiso de prender, reiniciar ni crear tareas programadas.
  El subusuario se agrega recién cuando termina la instalación (el panel no
  deja antes); lo hace la página de arranque o el worker del bot.
- **Página de arranque** (`/arrancar/:id?t=token`): el cliente toca "Prender",
  espera 1 minuto y, si quiere, mira un anuncio de 30 segundos para arrancar
  con **2 GB durante 1 hora**. El link se muestra al terminar el checkout.
- **Anti-trampa:** el token del link está firmado por servidor; la espera y el
  anuncio se validan en el backend con "tickets" firmados que guardan la hora
  de inicio. El secreto de firma se deriva de la API key de aplicación.
- **Dónde se guarda el estado:** en el campo `external_id` del servidor, que
  el cliente no ve: `free:<id del cliente>` y, durante el boost,
  `;boost=<vencimiento en ms>`.
- **Fin del boost:** el worker del bot (`bot/freeplan.js`, cada minuto) avisa
  en el chat, espera 1 minuto, apaga el servidor, vuelve a 1 GB y lo prende de
  nuevo. Tarda unos 80 segundos en total. **Si el bot no está corriendo, el
  boost no se termina.**
- **El anuncio de hoy es una promo propia** de los planes pagos (componente
  `AdSlot` en `src/pages/Arrancar.jsx`). Cuando haya sponsors, van ahí.

Pendiente del plan gratis: mensajes en el chat (marca, contextuales,
sponsors), MOTD e ícono forzados, y apagado automático cuando no hay
jugadores. Todo está especificado en `docs/PLAN-GRATIS.md`.

### Bug ya resuelto que conviene recordar

Mientras un servidor se apaga, la consulta de estado al panel puede fallar.
Antes, un error se tomaba como "apagado", y el worker cambiaba la RAM con el
servidor todavía apagándose: tardaba 9 minutos. Ahora `currentState()`
devuelve `null` cuando no sabe, y nadie trata `null` como apagado. **No
volver a tratar un error como "offline".**

---

## 7. El bot de Discord (`bot/`)

- Se llama **Changuihost** (nombre y avatar ya cambiados). El servidor de
  Discord también se llama Changuihost.
- Comandos registrados por servidor (aparecen al instante): `/planes`, `/plan
  nombre:` (con autocompletado) y `/status` (estado real de los servidores).
- **Tickets:** el bot mantiene un mensaje fijo en el canal de tickets con 4
  botones de colores (Soporte técnico, Facturación, Reportar un bug, Otra
  consulta). Cada botón crea un canal privado con el usuario y el rol de
  soporte. Si encuentra el mensaje viejo de antes del cambio de marca, lo
  edita en vez de duplicarlo.
- **Bienvenida** en el canal configurado, con botón "Verificarme" que da el
  rol de verificado.
- **A prueba de caídas:** todas las respuestas pasan por `safeRespond` y hay
  handlers globales de errores. Antes, una interacción vencida tiraba el
  proceso entero.
- **Worker del plan gratis:** arranca solo cuando el bot se conecta.
- Requiere activado el intent privilegiado "Server Members" en el Developer
  Portal (ya está).
- **Hay que dejarlo corriendo siempre** (`npm run bot`). Hoy no está instalado
  como servicio: si se cierra la terminal o se apaga la PC, se corta.

---

## 8. Infraestructura en la PC de Rafa

Windows 11 con una cuenta **sin permisos de administrador**: varias cosas
(firewall, tareas programadas, instalar WSL) las tuvo que correr Rafa en una
PowerShell como administrador.

### WSL2

- Distro: **Ubuntu-22.04**. Dentro corren Docker, el panel y Wings.
- **WSL se apaga solo** al rato de no tener nada abierto, aunque esté
  configurado para no hacerlo. Se resolvió con un proceso
  `wsl.exe -d Ubuntu-22.04 -- sleep infinity` que se lanza solo al iniciar
  Windows, desde un VBScript en la carpeta de Inicio.
- IPv6 desactivado en WSL (trababa las descargas de Docker), salvo en
  `lo`: si se desactiva ahí, deja de andar `localhost` desde Windows.

### Panel Pterodactyl

- `docker-compose.yml` en `/home/rafas/pterodactyl/` (panel, MariaDB, Redis).
  Las contraseñas de la base de datos están ahí y todavía dicen "ArcNode":
  **no cambiarlas** sin cambiarlas también dentro de MariaDB, porque se rompe
  el panel.
- Panel en `http://localhost:8080`. `APP_NAME` es Changuihost.
- **Marca del panel:** el color de acento del panel (azul de Tailwind) está
  escrito fijo en unos 80 lugares de su código compilado. El script
  `brand/apply-panel-theme.sh` copia esos archivos de la imagen, cambia cada
  tono de azul por el amarillo de la marca (y el texto de los botones a
  oscuro), pone el logo y genera los favicons. El resultado se monta en
  `/srv/pterodactyl/panel/assets-themed`. **Hay que volver a correrlo cada vez
  que se actualice la imagen del panel**, porque los nombres de esos archivos
  cambian con cada versión:
  `sudo bash /mnt/c/Users/rafas/OneDrive/Desktop/ArcNode/brand/apply-panel-theme.sh`
  y después `cd /home/rafas/pterodactyl && sudo docker compose up -d panel`.
- Plantillas Blade sobrescritas (`/srv/pterodactyl/panel/blade-overrides/`)
  para el color de la barra del navegador.
- Backups de la configuración vieja (ArcNode) en
  `/srv/pterodactyl/panel/old-arcnode/`.

### Wings

- Servicio systemd. Config en `/etc/pterodactyl/config.yml`: subred de Docker
  `172.20.0.0/16` (la default chocaba con otra) y sin SSL.

### Red local

- Para que otros en la misma WiFi entren al panel y a los servidores, hay
  reglas `netsh interface portproxy` del puerto 8080 y del rango
  25565–25600 hacia la IP interna de WSL, y reglas en el firewall de Windows.
  **Si la IP interna de WSL cambia después de reiniciar, esas reglas dejan de
  andar** y hay que rehacerlas.

### Túnel hacia Vercel

- El backend en Vercel llega al panel con un túnel rápido de Cloudflare
  (`cloudflared tunnel --url http://localhost:8080`, corriendo en WSL). **Es
  temporal: Cloudflare lo da de baja cuando quiere y la URL cambia.** Cuando
  pasa, el checkout de la web deja de andar y la página de Estado muestra
  "No responde". Para arreglarlo hay que levantar un túnel nuevo y que Rafa
  cambie `PTERODACTYL_URL` en Vercel a mano.
- URL actual: `https://sing-vip-observer-dave.trycloudflare.com`. **Rafa
  todavía no la cargó en Vercel**, así que hoy el checkout de producción no
  anda.
- La solución definitiva (pendiente) es un túnel con nombre en
  `panel.changuihost.com` (ver pendientes).

### Herramientas instaladas en WSL

`cloudflared`, `librsvg2-bin` (rsvg-convert) e `imagemagick`.

---

## 9. Nombres técnicos que todavía dicen "arcnode" (a propósito)

Son nombres reales que existen en servicios externos. Cambiarlos en el código
o los documentos sin cambiarlos en el servicio rompe cosas:

- Proyecto de Vercel `arcnode-cc` y su URL `arcnode-cc.vercel.app`; equipo
  `arcnode1`. Se puede renombrar desde el dashboard de Vercel.
- Repo de GitHub `rafusdou/arcnode`. Se renombra desde la configuración del
  repo (GitHub redirige el nombre viejo).
- Carpeta local `ArcNode`.
- Contraseñas de la base de datos del panel.
- Un rol de Discord llamado "ArcNode.cc" que el bot no puede renombrar
  (Discord no deja que un bot edite roles a su altura o más arriba). Lo tiene
  que cambiar Rafa a mano.
- El marcador viejo del mensaje de tickets (`arcnode-ticket-picker`), que el
  bot sigue reconociendo para no duplicar el mensaje.

---

## 10. Pendientes

En orden de prioridad:

1. **Panel en panel.changuihost.com.** El DNS ya está en Cloudflare (ver
   sección 3). Falta:
   - Túnel con nombre (`cloudflared tunnel login`, `create`, `route dns`) en
     `panel.changuihost.com`, instalado como servicio en WSL para que arranque
     solo. Requiere que Rafa apruebe el login de Cloudflare en el navegador.
   - Rafa cambia `PTERODACTYL_URL` en Vercel a `https://panel.changuihost.com`
     por última vez. Conviene también actualizar `APP_URL` del panel.
   - En Namecheap el dominio muestra un "ALERT" en Status & Validity:
     probablemente es la verificación del mail del titular. Si no se
     confirma, Namecheap suspende el dominio.
2. **Cargar la URL actual del túnel en Vercel** (`PTERODACTYL_URL`) si se
   quiere que el checkout ande antes de lo anterior.
3. **Bot como servicio** para que no dependa de una terminal abierta.
4. **Precio del dominio:** preguntarle a Rafa cuánto pagó `changuihost.com`
   y completarlo en `docs/PROYECTO.md` y `docs/PROFIT.md` (hoy dice "completar").
5. **Seguridad:** el token del bot y las API keys del panel se pegaron en el
   chat en algún momento. Conviene regenerarlos (Developer Portal de Discord y
   panel → Application API / Account → API) y actualizar `.env` y Vercel.
6. **Plan gratis, lo que falta:** mensajes en el chat, MOTD e ícono, apagado
   por inactividad (todo especificado en `docs/PLAN-GRATIS.md`).
7. **Chatbot con IA** (Rafa preguntó si se podía): en la web, para recomendar
   plan y responder dudas, o en los tickets de Discord. Falta que elija cuál.
   Necesita una cuenta de API a nombre de un adulto.
8. **Pagos reales:** Mercado Pago (Checkout Pro) con la cuenta de un adulto.
   En el checkout, Mercado Pago figura como "Próximamente".
9. **Agregados en el checkout** (disco, base de datos, puertos, CPU):
   especificados en `docs/PROFIT.md`.
10. **Pasar a producción:** la MacBook de Tomi para pruebas internas
    (`docs/SETUP-MAC-TOMI.md`) y después un servidor real. Según los números de
    `docs/PROFIT.md`, $1,80/GB solo da ganancia con un servidor dedicado bien
    lleno, no con una VPS chica. Anti-DDoS: protección del proveedor + TCPShield
    cuando haya IP pública. No publicar la IP de la casa de Rafa.

---

## 11. Cómo se trabajó (para mantener el estilo)

- Antes de dar algo por terminado, se prueba de verdad: crear servidores
  reales contra el panel local, revisar el estado en Pterodactyl o en Docker,
  sacar capturas del sitio. Para hacer clicks se usó `playwright-core` con el
  Edge que ya está instalado, desde una carpeta temporal fuera del repo.
- Después de probar, se borran los servidores y usuarios de prueba del panel.
  La cuenta `gratis@changuihost.com` **no se borra**: es la dueña de los
  servidores gratis.
- No inventar datos en el sitio. Si algo no existe todavía, se dice que viene
  después o no se menciona.
- Los cambios que solo puede hacer Rafa (dashboards, pagos, logins en el
  navegador) se le explican paso a paso.
- Las acciones que exponen la PC a internet (túneles) o que cambian variables
  en Vercel a veces las bloquea el sistema de permisos de Claude Code; en ese
  caso se le pasa a Rafa el comando o los pasos para que lo haga él.

---

## 12. Otros documentos

| Archivo | Qué tiene |
|---|---|
| `docs/PROYECTO.md` | Descripción general, plan de negocio y promoción (versión inicial) |
| `docs/PROFIT.md` | Cómo funciona el margen, comparación con la competencia, agregados |
| `docs/PROMOCION.md` | Plan de promoción por fases |
| `docs/PLAN-GRATIS.md` | Límites, página de arranque, boost, mensajes y publicidad del plan gratis |
| `docs/SETUP-MAC-TOMI.md` | Guía para que Tomi prepare su MacBook como servidor de prueba |
