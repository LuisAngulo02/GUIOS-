import React, { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

/**
 * Layout Principal para todas las páginas autenticadas
 */
export const MainLayout = () => {
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    // Al cambiar de ruta o paso, restablecer el scroll al inicio (arriba del todo)
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F3F7F4] flex flex-col font-sans">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main
          ref={mainRef}
          className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
