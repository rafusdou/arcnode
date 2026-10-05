import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Checkout from "./pages/Checkout.jsx";
import PlanesMinecraft from "./pages/PlanesMinecraft.jsx";
import Vps from "./pages/Vps.jsx";
import Modpacks from "./pages/Modpacks.jsx";
import PanelDemo from "./pages/PanelDemo.jsx";
import Docs from "./pages/Docs.jsx";
import Tutoriales from "./pages/Tutoriales.jsx";
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
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/planes-minecraft" element={<PlanesMinecraft />} />
        <Route path="/vps" element={<Vps />} />
        <Route path="/modpacks" element={<Modpacks />} />
        <Route path="/panel-demo" element={<PanelDemo />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/tutoriales" element={<Tutoriales />} />
        <Route path="/status" element={<Status />} />
        <Route path="/migrar" element={<Migrar />} />
        <Route path="/about" element={<About />} />
        <Route path="/afiliados" element={<Afiliados />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
      </Route>
    </Routes>
  );
}
