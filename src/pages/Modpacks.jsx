import PageHeader from "../components/PageHeader.jsx";

const PACKS = [
  { n: "All The Mods 10", v: "1.21.1", c: "ATM", tag: "Popular" },
  { n: "Better Minecraft", v: "1.20.1", c: "BMC", tag: "Trending" },
  { n: "RLCraft", v: "1.12.2", c: "RLC", tag: "Hardcore" },
  { n: "FTB Skies", v: "1.20.1", c: "FTB", tag: "Skyblock" },
  { n: "Create Astral", v: "1.18.2", c: "CA", tag: "Tech" },
  { n: "Vault Hunters", v: "1.18.2", c: "VH", tag: "RPG" },
  { n: "Pixelmon Reforged", v: "1.16.5", c: "PIX", tag: "Pokémon" },
  { n: "SkyFactory 4", v: "1.12.2", c: "SF4", tag: "Skyblock" },
  { n: "Crazy Craft Updated", v: "1.18.2", c: "CC", tag: "Caos" },
  { n: "Enigmatica 9", v: "1.20.1", c: "E9", tag: "Expert" },
  { n: "Stoneblock 3", v: "1.19.2", c: "SB3", tag: "Survival" },
  { n: "Dawncraft", v: "1.20.1", c: "DC", tag: "Adventure" },
];

export default function Modpacks() {
  return (
    <>
      <PageHeader
        eyebrow="Modpacks a pedido"
        title="Cualquier modpack, instalado por nosotros."
        sub="Abrí un ticket en Discord con el modpack que necesitás y lo instalamos en menos de 1 hora. Incluido desde el plan Esmeralda (6 GB)."
      />
      <div className="page-section">
        <div className="modpack-grid">
          {PACKS.map((p, i) => (
            <div className="modpack-card" key={i}>
              <div className="modpack-cover" style={{ background: `linear-gradient(135deg, hsl(${i * 30} 60% 45%), hsl(${i * 30 + 60} 60% 50%))` }}>{p.c}</div>
              <div className="modpack-body">
                <div className="modpack-title">{p.n}</div>
                <div className="modpack-meta">Minecraft {p.v}</div>
                <span className="modpack-tag">{p.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
