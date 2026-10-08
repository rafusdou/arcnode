import { useState } from "react";
import Hero from "../components/Hero.jsx";
import Features from "../components/Features.jsx";
import Plans from "../components/Plans.jsx";
import Faq from "../components/Faq.jsx";

export default function Home() {
  const [ram, setRam] = useState(4);
  return (
    <>
      <Hero ram={ram} onRamChange={setRam} />
      <Features />
      <Plans selectedRam={ram} />
      <Faq />
    </>
  );
}
