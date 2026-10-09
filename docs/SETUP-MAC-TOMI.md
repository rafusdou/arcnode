# Preparar tu MacBook para Changuihost — guía para Tomi

Che Tomi, esto es para dejar tu MacBook Pro 2012 (i7, 16GB RAM) lista para que
corra servidores de Minecraft de prueba — la vamos a usar para testear entre
nosotros antes de gastar plata en una VPS real. No hace falta que entiendas
todo el por qué, solo seguir los pasos en orden. Cuando termines el paso 7,
el resto lo sigo yo.

## 1. Anotá el modelo exacto

Menú Apple (ícono de manzana arriba a la izquierda) → **"Acerca de esta Mac"**.
Sacale una foto a esa ventana o anotá el modelo exacto (ej: "MacBook Pro 13"
Mid 2012"). Sirve para confirmar que todo lo que sigue es compatible con tu
máquina puntual.

## 2. Hacé backup de lo que te importe

Le vamos a instalar **Linux (Ubuntu)** en vez de usar macOS — rinde mejor
para esto y es más simple de mantener a distancia. Si tenés fotos,
documentos o lo que sea que no quieras perder, copialo a un disco externo o
subilo a la nube **antes** de seguir. A partir del paso 5 el disco se borra.

## 3. Decidí: ¿borrar macOS del todo, o mantener las dos?

- **Más simple (recomendado)**: borrar macOS por completo y dejarla 100%
  dedicada a esto.
- **Más trabajo, pero conservás macOS**: particionar el disco e instalar
  Ubuntu al lado, eligiendo con cuál arrancar cada vez. Si preferís esto,
  avisame antes de instalar, el proceso cambia un poco.

## 4. Creá el pendrive de instalación

Necesitás otra computadora (no la MacBook) para esto:

1. Descargá **Ubuntu Server 22.04 LTS** desde [ubuntu.com/download/server](https://ubuntu.com/download/server).
2. Descargá **balenaEtcher** (gratis) desde [balena.io/etcher](https://www.balena.io/etcher).
3. Metele un pendrive de al menos 4GB a esa otra compu (se borra todo lo que
   tenga adentro).
4. Abrí Etcher, elegí el archivo de Ubuntu que bajaste y el pendrive, y
   dejalo grabar.

## 5. Instalá Ubuntu en la MacBook

1. Metele el pendrive a la MacBook.
2. Prendé la MacBook y **apenas la prendas, mantené apretada la tecla
   Option (⌥)** hasta que aparezca un menú de arranque.
3. Elegí bootear desde el pendrive (USB/EFI Boot).
4. Seguí el instalador de Ubuntu normalmente — te va a preguntar idioma,
   teclado, y si querés borrar el disco entero o particionarlo (según lo que
   decidiste en el paso 3).

Si en algún paso te tranca algo raro específico de Mac (teclado que no
responde, pantalla negra, etc.), buscá "instalar Ubuntu en MacBook Pro 2012"
— es un proceso súper documentado, seguro alguien ya pasó por lo mismo.

## 6. Conectala a internet y dejala siempre prendida

- Preferís **cable de red (Ethernet)** antes que WiFi si tenés la
  posibilidad — es más estable para esto.
- Dejala **siempre enchufada** a la corriente (no a batería).
- Que no se vaya a dormir ni se apague sola — la idea es que quede
  prendida 24/7 mientras la estemos usando de servidor de prueba.

## 7. Instalá el acceso remoto y pasame los datos

Una vez que Ubuntu ya está instalado y andando, abrí una terminal y escribí:

```
sudo apt update && sudo apt install -y openssh-server
```

Después necesito que me pases:
- La **IP local** de la MacBook en tu red (te la puede dar el mismo
  instalador, o corriendo `ip a` en la terminal y buscando algo tipo
  `192.168.x.x`).
- Un **usuario y contraseña** con los que pueda conectarme por SSH.

Con eso, de ahí en adelante sigo yo — instalo todo lo necesario (Wings, lo
que conecta esta máquina con el panel de Changuihost) sin que tengas que hacer
nada técnico más. Cualquier cosa rara en el medio, avisale a Rafa y lo
vemos juntos.
