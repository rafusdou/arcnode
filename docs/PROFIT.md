# ArcNode.cc — Cómo funciona el profit

Este documento explica, con números concretos, de dónde sale la plata y
cuánto queda libre en cada escalón del negocio. La idea es que cualquiera del
equipo (Rafa, Tomi) pueda mirar esto y entender el margen real sin tener que
adivinar.

## 1. El precio: $1,80 USD por GB de RAM

Es el único número que el cliente ve. No hay planes con nombres raros
escondiendo el precio real — lo que pagás es `GB de RAM × $1,80`.

Comparado con el mercado (investigado en octubre 2026):

| Proveedor | Precio por GB |
|---|---|
| PebbleHost (Budget, sin NVMe) | $1.00 |
| **ArcNode** | **$1.80** |
| PebbleHost (Premium, con NVMe) | $2.25 |
| Shockbyte | ~$2.50–4.00 |
| BisectHosting (Budget) | $2.99 |
| Apex Hosting | $3.25–3.75 |
| BisectHosting (Premium NVMe) | $4.99 |

ArcNode queda más barato que todos excepto el tier más pelado de PebbleHost
(que ni tiene NVMe) — y ArcNode sí ofrece NVMe + DDoS protection desde los
planes de 8GB para arriba.

## 2. El costo: un nodo (VPS) vendido en pedacitos

La plata no se gasta por cliente — se gasta **por servidor físico/VPS**, y
ese servidor se reparte entre varios clientes. Ejemplo con la VPS que
estuvimos mirando:

- **Specs**: 2 vCPU, 8GB RAM, 100GB NVMe, 8TB de ancho de banda.
- **Costo estimado**: ~$10-12 USD/mes (varía según proveedor y promoción).
- **RAM vendible real**: de los 8GB, hay que restarle lo que usa el sistema
  operativo + Wings (el agente que corre los servidores) + el panel si vive
  ahí también. Quedan realistamente **~6-6.5GB vendibles**.

### Ejemplo de ocupación de un nodo

Si ese nodo de 6GB vendibles se llena con, por ejemplo, 3 clientes del plan
"Blaze" (12GB)... no entra, es mucho. Ajustemos a planes chicos reales:

- 3 clientes de 2GB cada uno = 6GB vendidos.
- Ingreso: `6 GB × $1,80 = $10,80 USD/mes`.
- Costo del nodo: ~$10-12 USD/mes.

**Con un nodo lleno de clientes chicos, apenas se empata o se pierde
plata.** Este es el punto más importante de todo el documento: **un solo
nodo con pocos clientes chicos NO da ganancia por sí solo.** El margen
aparece en otro lado — ver punto 3.

## 3. Dónde aparece realmente el margen

### a) No todo el mundo usa el 100% de su RAM todo el tiempo
Un server de Minecraft con 2GB asignados casi nunca usa los 2GB llenos las
24 horas del día. Igual que un hosting web normal, se puede ser un poco más
generoso con cuántos clientes entran en un nodo sin que todos estén activos
al mismo tiempo al 100%. Esto hay que hacerlo con cuidado (por eso el límite
de CPU por plan que ya ajustamos en el código) — la idea no es sobrevender
al punto de que todo lague, sino no dejar recursos pagos completamente
ociosos.

### b) Los costos fijos no se repiten por cliente
El dominio ($4,98 USD/año), el panel (Pterodactyl, gratis), el sitio
(Vercel, gratis en el plan actual) — esos costos existen una sola vez, sin
importar si hay 1 cliente o 100. Cuanta más gente se suma, más se diluyen
esos costos fijos por cabeza.

### c) El segundo nodo es más barato de operar que el primero
El primer nodo "paga" el aprendizaje y la configuración inicial. Agregar un
segundo o tercer nodo (otra VPS) es repetir un proceso ya resuelto — el
tiempo que cuesta no se multiplica igual que la plata que entra.

### d) Clientes de planes más grandes son más rentables por GB de overhead
Un cliente de 10GB usa el mismo "overhead" de sistema que uno de 2GB (un
solo contenedor, una sola IP asignada). Mientras más clientes grandes haya
proporcionalmente, mejor el margen real por nodo.

## 4. Lo que todavía no está en esta cuenta (hay que restarlo)

- **Comisión de Mercado Pago**: cuando se conecte el pago real, se pierde
  un 5-7% + IVA de cada cobro. Hay que descontarlo del ingreso bruto antes
  de hablar de ganancia real.
- **Soporte**: el tiempo de alguien respondiendo tickets no es gratis,
  aunque no tenga un número en dólares todavía.
- **Abuso de recursos**: un cliente que intente usar el servidor para otra
  cosa (minar criptomonedas, atacar otros sitios) puede comerse recursos
  que deberían estar repartidos entre todos — por eso los límites de CPU
  por plan ya están puestos desde el código, no son opcionales.

## 5. Resumen en una frase

**El negocio no gana plata por vender un GB a la vez — gana plata cuando un
nodo completo está bien ocupado con una mezcla sana de clientes y los
costos fijos ya están amortizados por tener más de un nodo.** Por eso la
fase de "probar entre nosotros" (con la Mac de Tomi) antes de pagar una VPS
real importa: sirve para entender cuánta RAM realmente se usa en la
práctica antes de comprometerse a un costo mensual fijo.
