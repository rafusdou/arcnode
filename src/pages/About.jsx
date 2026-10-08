import PageHeader from "../components/PageHeader.jsx";

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="Sobre ArcNode"
        title="Somos dos personas haciendo hosting de Minecraft."
        sub="ArcNode arrancó en 2026, en Argentina."
      />
      <div className="page-section">
        <div className="legal-content">
          <h2>Por qué lo hacemos</h2>
          <p>
            Queríamos un hosting donde el precio fuera una cuenta simple: cuántos GB de RAM querés y
            cuánto sale cada uno. El GB cuesta lo mismo en el plan más chico que en el más grande, así
            que no hay que comparar planes para saber cuál conviene.
          </p>
          <h2>Cómo funciona por dentro</h2>
          <p>
            El panel es Pterodactyl, un proyecto open source muy usado en el rubro, con nuestros colores.
            Cada servidor corre aislado en su propio contenedor, con la RAM, el disco y la CPU de su plan.
            Cuando terminás la compra, el sistema crea tu cuenta y tu servidor solo, sin que tengamos
            que intervenir.
          </p>
          <h2>Cómo te atendemos</h2>
          <p>
            Estamos empezando, así que el soporte lo damos nosotros mismos, por Discord. Abrís un ticket,
            elegís de qué se trata y te contesta uno de los dos.
          </p>
        </div>
      </div>
    </>
  );
}
