import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";

// React Router doesn't scroll to #anchors or reset scroll between pages on
// its own, so nav links like "/#planes" did nothing without this.
function useScrollOnNavigate() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [pathname, hash]);
}

export default function Layout() {
  useScrollOnNavigate();
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
