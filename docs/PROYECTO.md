# Changuihost — Documento de proyecto

## 1. Qué es

Changuihost es un servicio de hosting de servidores de Minecraft. La propuesta
es simple y se vende así: **pagás por la RAM que usás, a $1,80 USD por GB**, sin
planes rígidos ni letra chica. El usuario entra al sitio, elige cuánta RAM
necesita (con una calculadora en vivo), paga, y a los segundos tiene su
servidor corriendo con panel de administración propio.

Hoy el proyecto existe como una **demo funcional completa**, corriendo en la
PC del fundador (vos), armada para probar que todo el flujo —de la landing al
servidor jugable— funciona de punta a punta antes de gastar un peso en
infraestructura real.

### Piezas que ya existen

| Pieza | Qué hace | Estado |
|---|---|---|
| Sitio web (React + Vite) | Landing, calculadora de precio, planes, checkout | Funcionando |
| Backend de checkout (Node/Express) | Habla con Pterodactyl, crea cuenta + servidor real al pagar | Funcionando (local) |
| Panel Pterodactyl (rebrandeado) | Consola, gestión de archivos, reinicios, consumo de recursos | Funcionando (local), con logo/colores propios |
| Wings | Motor que realmente levanta el contenedor del servidor de Minecraft | Funcionando (local) |
| Bot de Discord | Info de planes, estado de servidores en vivo, sistema de tickets de soporte | Funcionando |

El "pago" en esta etapa es simulado (cualquier dato de tarjeta "aprueba"),
pero todo lo que pasa *después* del pago es real: se crea un usuario de
verdad en Pterodactyl y un servidor de Minecraft de verdad, con el mismo
motor (Wings) que se usaría en producción.

---

## 2. Cómo funciona (arquitectura)

```
Usuario → Sitio (React)
            │
            ▼
      Checkout (Node/Express)
            │   (API Key admin)
            ▼
      Panel Pterodactyl ──► Wings ──► Contenedor Docker
      (gestión de cuentas,        (el servidor de Minecraft
       servidores, permisos)       en sí: Paper / Vanilla / Forge)
```

- **El sitio** no sabe nada de Minecraft ni de Docker. Solo junta los datos
  del pedido (tipo de servidor, versión, RAM, datos de la cuenta) y los manda
  al backend.
- **El backend** es el único que tiene las API keys de Pterodactyl. Crea (o
  reutiliza) el usuario, le busca un puerto libre, y le pide al panel que
  cree el servidor con la configuración elegida. Esto incluye un truco para
  auto-aceptar la EULA de Minecraft sin que el usuario tenga que tocar nada.
- **Pterodactyl (panel)** es el "cerebro": sabe qué usuarios y servidores
  existen, con qué permisos, y le da órdenes a Wings.
- **Wings** es el "músculo": corre en la máquina física (o VPS) y es quien
  efectivamente prende/apaga/reinicia el contenedor de Docker donde vive el
  servidor de Minecraft.

### De demo a producción

Hoy todo esto corre en una sola PC (con WSL2 haciendo de servidor Linux).
Para que cualquiera en internet pueda jugar, hace falta mover **Wings** (y
opcionalmente el panel) a un **VPS con IP pública** — el resto del código no
cambia, solo la variable `PTERODACTYL_URL` y la IP de conexión. Alternativas
evaluadas:

- **Hetzner Cloud**: de pago, barato (~€4-5/mes el plan más chico), muy
  estable, el candidato más realista para arrancar en serio.
- **Oracle Cloud Free Tier**: gratis para siempre (4 OCPU / 24GB RAM ARM),
  pero con cupos limitados y a veces "sin capacidad disponible" en la región;
  bueno para estirar el arranque sin gastar, no para depender de él 100%.

---

## 3. Plan de negocio

### Propuesta de valor

- **Precio simple y transparente**: $1,80 USD/GB de RAM, nada de planes
  escalonados con letra chica ni "ofertas" que en realidad son el precio
  normal.
- **Activación inmediata**: el servidor existe en segundos, no hay "ticket de
  soporte para que te activen el server".
- **Panel propio y prolijo**: Pterodactyl rebrandeado, no se nota que es un
  panel open-source genérico.

### Estructura de costos (estimada, por iterar con datos reales)

| Ítem | Costo aproximado |
|---|---|
| VPS Hetzner (nodo chico, varios servidores por nodo) | ~€5-20/mes según cuántos clientes |
| Dominio (changuihost.cc) | US$2,40 el primer año, después US$8,55 por año (Porkbun) |
| Hosting del sitio (Vercel, plan gratuito para empezar) | $0 |
| Panel Pterodactyl | $0 (open source) |

Con el modelo de "varios servidores de clientes compartiendo un mismo nodo
físico" (lo normal en este rubro), el costo marginal por cliente es bajo: un
VPS de 8GB de RAM puede alojar varios servidores chicos de 1-2GB cada uno.
Eso es lo que hace viable cobrar $2/GB y tener margen.

### Punto de equilibrio (ejemplo simple)

Si un VPS cuesta ~$10 USD/mes y tiene 8GB de RAM vendibles a $2/GB, el
"techo" de ingresos de ese nodo es ~$16 USD/mes vendiéndolo *todo*. El margen
real está en:
1. No vender el 100% de la RAM física de golpe (los servidores chicos no usan
   el 100% de su RAM todo el tiempo, se puede sobre-asignar con cuidado).
2. Escalar: el segundo, tercer, décimo VPS no repiten costos fijos (dominio,
   panel, sitio), así que el margen mejora con cada nodo nuevo mientras haya
   demanda.

Esto hay que validarlo con uso real antes de prometer números — la demo
sirve justamente para no tener que adivinar esto con clientes pagando de
verdad desde el día uno.

### Riesgos conocidos

- **Abuso de recursos**: alguien que monta un servidor para minar
  criptomonedas, hacer ataques, o saturar CPU. Se mitiga con límites de CPU
  por contenedor (ya soportado por Pterodactyl/Docker) y monitoreo.
- **Picos de soporte**: sin un plan de atención claro, el fundador se vuelve
  el único soporte técnico. El bot de Discord con tickets ya ayuda a
  organizar esto desde el día uno.
- **Dependencia de un solo VPS**: si se cae el nodo, se caen todos los
  servidores de esa zona. Mitigable más adelante con más de un nodo /
  distintas regiones.

---

## 4. Plan de promoción

### Canales (ordenados por costo/esfuerzo)

1. **Discord propio** (ya existe el bot): el servidor de Discord de Changuihost
   es el centro de comunidad — ahí la gente ve el estado de los servidores,
   pide soporte, y es el lugar más fácil de mantener activo sin gastar en
   ads.
2. **Comunidades de Minecraft existentes** (Reddit r/mcservers,
   r/admincraft, foros de modpacks, Discords de servers grandes buscando
   hosting): publicar donde la gente *ya* está buscando esto, en vez de
   intentar atraerla de cero.
3. **Programa de afiliados** (ya hay una página `/afiliados` en el sitio):
   dar un % de comisión a quien recomiende Changuihost — los primeros
   referentes naturales son dueños de servidores de Minecraft con su propia
   audiencia (streamers chicos, admins de comunidades).
4. **Contenido técnico/comparativo**: artículos o videos cortos comparando
   precio real Changuihost vs. competidores (muchos hosts de Minecraft cobran
   planes fijos que terminan siendo más caros por GB real que $2/GB).
5. **SEO básico**: el sitio ya tiene páginas de "Planes Minecraft",
   "Modpacks", "Migrar" — esas son palabras que la gente busca en Google
   cuando ya decidió que quiere un server, conviene que estén bien indexadas.

### Mensaje central

> "Pagás por la RAM que usás. Nada más."

Todo el material de promoción debería insistir en esto, porque es lo que
diferencia a Changuihost de la mayoría de hosts (que venden "planes" con nombres
de fantasía y letra chica).

### Secuencia sugerida de lanzamiento

1. Demo pública (sitio en Vercel, sin checkout real) — para mostrar y pedir
   feedback sin comprometerse a nada.
2. Soft launch con VPS real (Hetzner) y checkout funcional, invitando
   primero a conocidos / comunidades chicas para detectar problemas con
   pocos usuarios reales.
3. Promoción activa una vez que el sistema aguantó un puñado de clientes
   reales sin caerse ni generar tickets de soporte imposibles de atender.

---

## 5. Estado actual y próximos pasos

**Hecho:**
- Sitio completo (React/Vite) con calculadora, planes, checkout.
- Backend que crea cuentas y servidores reales en Pterodactyl.
- Panel Pterodactyl rebrandeado (logo, colores, favicons).
- Bot de Discord con estado en vivo, info de planes, tickets por categoría.
- Repo en GitHub (`github.com/rafusdou/arcnode`).

**En curso:**
- Deploy del sitio (solo demo visual, sin checkout real todavía) en Vercel.

**Pendiente (decisión del fundador, no técnico):**
- Elegir y pagar un VPS real (Hetzner es el candidato más sólido) para que
  el checkout funcione de verdad para cualquier visitante de internet, no
  solo en la red local.
- Definir límites de recursos por servidor/cliente antes de abrir al
  público, para evitar abuso.
