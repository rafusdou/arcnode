const FOOTER_COLS_ES = [
  { h: "Producto", links: [
    { l: "Planes Minecraft", to: "/planes-minecraft" },
    { l: "Servidores VPS", to: "/vps" },
    { l: "Modpacks a pedido", to: "/modpacks" },
    { l: "Panel demo", to: "/panel-demo" },
  ] },
  { h: "Recursos", links: [
    { l: "Documentación", to: "/docs" },
    { l: "Tutoriales", to: "/tutoriales" },
    { l: "Estado de red", to: "/status" },
    { l: "Migrar de otro host", to: "/migrar" },
  ] },
  { h: "Empresa", links: [
    { l: "Sobre nosotros", to: "/about" },
    { l: "Afiliados", to: "/afiliados" },
    { l: "Términos", to: "/terminos" },
    { l: "Privacidad", to: "/privacidad" },
  ] },
];

const FOOTER_COLS_EN = [
  { h: "Product", links: [
    { l: "Minecraft plans", to: "/planes-minecraft" },
    { l: "VPS servers", to: "/vps" },
    { l: "Modpacks on request", to: "/modpacks" },
    { l: "Panel demo", to: "/panel-demo" },
  ] },
  { h: "Resources", links: [
    { l: "Documentation", to: "/docs" },
    { l: "Tutorials", to: "/tutoriales" },
    { l: "Network status", to: "/status" },
    { l: "Migrate from another host", to: "/migrar" },
  ] },
  { h: "Company", links: [
    { l: "About us", to: "/about" },
    { l: "Affiliates", to: "/afiliados" },
    { l: "Terms", to: "/terminos" },
    { l: "Privacy", to: "/privacidad" },
  ] },
];

export const ARCNODE_I18N = {
  es: {
    nav: { prices: "Precios", includes: "Qué incluye", faq: "Preguntas", login: "Iniciar sesión", cta: "Crear servidor" },
    hero: {
      titleBefore: "Servidores de Minecraft a ",
      titleAfter: " el GB de RAM.",
      sub: "Elegís cuánta RAM querés y pagás solo eso. El servidor se crea apenas terminás la compra y lo manejás desde tu propio panel.",
      facts: ["Paper, Vanilla o Forge", "Consola y archivos desde el panel", "Soporte por Discord, con nosotros"],
    },
    config: {
      ram: "RAM",
      plan: "Plan",
      players: "Jugadores",
      playersValue: (n) => `hasta ${n}`,
      playersNote: "Con modpacks pesados, contá la mitad de jugadores.",
      disk: "Disco",
      total: "Total",
      perMonth: "por mes",
      cta: (gb) => `Continuar con ${gb} GB`,
      freeQ: "¿Querés probar primero?",
      freeLink: "Hay un plan gratis",
    },
    includes: {
      title: "Qué incluye",
      intro: "ArcNode lo hacemos dos personas desde Argentina. Esto es lo que trae cada servidor, sea del plan que sea.",
      items: [
        { t: "Un panel de verdad", d: "Consola en vivo, administrador de archivos, reinicios programados y subusuarios con permisos. Es Pterodactyl, un panel open source muy usado en el rubro, con nuestros colores." },
        { t: "Paper, Vanilla o Forge", d: "Lo elegís al crear el servidor, junto con la versión de Minecraft: de la 1.16.5 a la última." },
        { t: "Listo en un par de minutos", d: "Cuando terminás la compra el servidor ya se está instalando. Paper suele quedar online en uno o dos minutos. Forge tarda más porque baja muchas librerías." },
        { t: "La EULA ya viene aceptada", d: "Parece una pavada, pero no vas a tener que entrar a editar eula.txt para que el servidor arranque." },
        { t: "Soporte en Discord", d: "Abrís un ticket desde nuestro servidor de Discord y te contesta alguien del equipo, no un bot." },
        { t: "Mismo precio por GB", d: "Un plan de 2 GB y uno de 20 GB pagan lo mismo por cada GB. El total es esa cuenta y nada más." },
      ],
    },
    plans: {
      title: "Todos los planes",
      note: "Mismo precio por GB en todos. Los nombres son para ubicarte nomás.",
      cols: { plan: "Plan", ram: "RAM", players: "Jugadores", disk: "Disco", price: "Por mes", action: "Elegir plan" },
      free: "Gratis",
      pick: "Elegir",
      tryFree: "Probar",
    },
    faq: {
      title: "Preguntas",
      items: [
        { q: "¿Puedo instalar plugins o mods?", a: "Sí. Con Paper podés usar plugins de Bukkit, Spigot y Paper. Con Forge, mods. Los subís desde el administrador de archivos del panel." },
        { q: "¿Funciona con Bedrock (celular o consolas)?", a: "Por ahora no: los servidores son de Minecraft Java. Es algo que queremos sumar más adelante." },
        { q: "¿Qué versiones de Minecraft puedo usar?", a: "La última, 1.21.4, 1.20.4, 1.19.4, 1.18.2 o 1.16.5. La elegís cuando creás el servidor." },
        { q: "¿Cuánta RAM necesito?", a: "Para jugar entre amigos con Paper, con 2 o 3 GB andás bien. Si vas a usar un modpack grande, arrancá desde 6 GB. En la tabla de planes tenés una referencia de jugadores para cada uno." },
        { q: "¿Qué tiene el plan gratis?", a: "Es un servidor chico, para hasta 3 jugadores, pensado para que pruebes el panel y veas cómo funciona todo antes de pagar." },
        { q: "¿Cómo pido ayuda?", a: "En nuestro Discord, en el canal de soporte, tocás el botón de la categoría que corresponda y se te abre un canal privado con el equipo." },
      ],
    },
    footer: {
      blurb: "Hosting de servidores de Minecraft, hecho en Argentina.",
      cols: FOOTER_COLS_ES,
      copy: "© 2026 ArcNode",
      disclaimer: "No estamos afiliados a Mojang ni a Microsoft.",
    },
  },
  en: {
    nav: { prices: "Pricing", includes: "What's included", faq: "FAQ", login: "Sign in", cta: "Create server" },
    hero: {
      titleBefore: "Minecraft servers at ",
      titleAfter: " per GB of RAM.",
      sub: "Pick how much RAM you want and pay for exactly that. Your server gets created as soon as checkout finishes, and you run it from your own panel.",
      facts: ["Paper, Vanilla or Forge", "Console and files from the panel", "Support on Discord, from us"],
    },
    config: {
      ram: "RAM",
      plan: "Plan",
      players: "Players",
      playersValue: (n) => `up to ${n}`,
      playersNote: "With heavy modpacks, count on half as many players.",
      disk: "Disk",
      total: "Total",
      perMonth: "per month",
      cta: (gb) => `Continue with ${gb} GB`,
      freeQ: "Want to try it first?",
      freeLink: "There's a free plan",
    },
    includes: {
      title: "What's included",
      intro: "ArcNode is run by two people in Argentina. This is what every server comes with, whatever the plan.",
      items: [
        { t: "A real panel", d: "Live console, file manager, scheduled restarts and subusers with permissions. It's Pterodactyl, an open source panel widely used by hosts, in our colors." },
        { t: "Paper, Vanilla or Forge", d: "You choose when you create the server, along with the Minecraft version: anything from 1.16.5 to the latest." },
        { t: "Ready in a couple of minutes", d: "By the time checkout finishes, your server is already installing. Paper is usually online in a minute or two. Forge takes longer because it downloads a lot of libraries." },
        { t: "The EULA is already accepted", d: "Small thing, but you won't have to go edit eula.txt before the server will start." },
        { t: "Support on Discord", d: "Open a ticket from our Discord server and someone on the team answers, not a bot." },
        { t: "Same price per GB", d: "A 2 GB plan and a 20 GB plan pay the same for each GB. The total is that math and nothing else." },
      ],
    },
    plans: {
      title: "Every plan",
      note: "Same price per GB across the board. The names are just there to help you find your way.",
      cols: { plan: "Plan", ram: "RAM", players: "Players", disk: "Disk", price: "Per month", action: "Choose plan" },
      free: "Free",
      pick: "Choose",
      tryFree: "Try it",
    },
    faq: {
      title: "FAQ",
      items: [
        { q: "Can I install plugins or mods?", a: "Yes. Paper runs Bukkit, Spigot and Paper plugins. Forge runs mods. You upload them from the panel's file manager." },
        { q: "Does it work with Bedrock (mobile or consoles)?", a: "Not yet: servers run Minecraft Java Edition. It's something we want to add later." },
        { q: "Which Minecraft versions can I use?", a: "Latest, 1.21.4, 1.20.4, 1.19.4, 1.18.2 or 1.16.5. You pick one when you create the server." },
        { q: "How much RAM do I need?", a: "For playing with friends on Paper, 2 or 3 GB is plenty. For a big modpack, start at 6 GB. The pricing table lists a rough player count for each plan." },
        { q: "What's in the free plan?", a: "A small server for up to 3 players, so you can try the panel and see how everything works before paying." },
        { q: "How do I get help?", a: "In the support channel on our Discord, press the button for your kind of issue and a private channel with the team opens up." },
      ],
    },
    footer: {
      blurb: "Minecraft server hosting, made in Argentina.",
      cols: FOOTER_COLS_EN,
      copy: "© 2026 ArcNode",
      disclaimer: "Not affiliated with Mojang or Microsoft.",
    },
  },
};
