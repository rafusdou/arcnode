import { Outlet } from "react-router-dom";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";

export default function Layout() {
  return (
    <>
      <Nav />
      <main className="page-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
