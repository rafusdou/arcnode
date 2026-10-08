import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Checkout from "./pages/Checkout.jsx";
import PlanesMinecraft from "./pages/PlanesMinecraft.jsx";
import Modpacks from "./pages/Modpacks.jsx";
import PanelDemo from "./pages/PanelDemo.jsx";
import Docs from "./pages/Docs.jsx";
import Status from "./pages/Status.jsx";
import Migrar from "./pages/Migrar.jsx";
import About from "./pages/About.jsx";
import Afiliados from "./pages/Afiliados.jsx";
import Terminos from "./pages/Terminos.jsx";
import Privacidad from "./pages/Privacidad.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/planes-minecraft" element={<PlanesMinecraft />} />
        <Route path="/modpacks" element={<Modpacks />} />
        <Route path="/panel-demo" element={<PanelDemo />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/status" element={<Status />} />
        <Route path="/migrar" element={<Migrar />} />
        <Route path="/about" element={<About />} />
        <Route path="/afiliados" element={<Afiliados />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        {/* Old URLs from pages that were removed, so existing links don't 404. */}
        <Route path="/signup" element={<Navigate to="/#calc" replace />} />
        <Route path="/tutoriales" element={<Navigate to="/docs" replace />} />
        <Route path="/vps" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
