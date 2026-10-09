import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";

const LABELS = {
  up: "Funcionando",
  down: "No responde",
  checking: "Comprobando…",
};

function Row({ name, detail, state }) {
  return (
    <div className="status-row">
      <span className={"status-dot status-" + state} />
      <div className="status-row-name">
        {name}
        <span>{detail}</span>
      </div>
      <div className={"status-state status-" + state}>{LABELS[state]}</div>
    </div>
  );
}

export default function Status() {
  const [panel, setPanel] = useState("checking");
  const [checkedAt, setCheckedAt] = useState(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => {
        setPanel(d.panel === "up" ? "up" : "down");
        setCheckedAt(new Date(d.checkedAt));
      })
      .catch(() => {
        setPanel("down");
        setCheckedAt(new Date());
      });
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Estado"
        title="Estado del servicio"
        sub="Se comprueba en el momento en que abrís esta página."
      />
      <div className="page-section">
        <div className="status-list">
          <Row name="Sitio web" detail="changuihost.com y el checkout" state="up" />
          <Row name="Panel y creación de servidores" detail="Panel de control y API de aprovisionamiento" state={panel} />
        </div>
        <p className="status-foot">
          {checkedAt && <>Última comprobación: {checkedAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}. </>}
          Si tu servidor no anda y acá figura todo funcionando, abrí un ticket en nuestro Discord.
        </p>
      </div>
    </>
  );
}
