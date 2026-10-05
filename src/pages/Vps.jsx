import PageHeader from "../components/PageHeader.jsx";

const VPS_PLANS = [
  { name: "VPS-1", cpu: 1, ram: 2, ssd: 40, price: 4500 },
  { name: "VPS-2", cpu: 2, ram: 4, ssd: 80, price: 8500 },
  { name: "VPS-4", cpu: 4, ram: 8, ssd: 160, price: 16500 },
  { name: "VPS-8", cpu: 6, ram: 16, ssd: 320, price: 32000 },
  { name: "VPS-16", cpu: 8, ram: 32, ssd: 640, price: 62000 },
  { name: "VPS-Dedi", cpu: 16, ram: 64, ssd: 1000, price: 119000 },
];

export default function Vps() {
  return (
    <>
      <PageHeader
        eyebrow="Servidores VPS"
        title="VPS Cloud con SSD NVMe en Argentina."
        sub="Para hostear lo que quieras: bots de Discord, web apps, dedicados de Minecraft custom, paneles de juego."
      />
      <div className="page-section">
        <div className="vps-grid">
          {VPS_PLANS.map((v) => (
            <div className="vps-card" key={v.name}>
              <div className="vps-name">{v.name}</div>
              <div className="vps-specs">{v.ram} GB RAM</div>
              <div className="vps-row"><span>vCPU</span><span>{v.cpu} núcleos</span></div>
              <div className="vps-row"><span>SSD NVMe</span><span>{v.ssd} GB</span></div>
              <div className="vps-row"><span>Tráfico</span><span>Ilimitado</span></div>
              <div className="vps-row"><span>IPv4</span><span>Dedicada</span></div>
              <div className="vps-price">${v.price.toLocaleString("es-AR")}<span> / mes</span></div>
              <a className="btn btn-outline" href={`/checkout?plan=${v.name}`} style={{ marginTop: 12 }}>Elegir {v.name}</a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
