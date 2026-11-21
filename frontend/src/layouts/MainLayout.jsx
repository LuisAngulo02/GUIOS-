import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

/**
 * Layout Principal para todas las páginas autenticadas
 */
export const MainLayout = () => {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Al cambiar de ruta o paso, cerrar el menú móvil y restablecer el scroll
    setMobileMenuOpen(false);
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F3F7F4] flex flex-col font-sans">
      <Topbar
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={mobileMenuOpen}
      />
      <div className="flex flex-1 relative">
        <Sidebar
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <main
          ref={mainRef}
          className="flex-1 p-3.5 sm:p-5 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
