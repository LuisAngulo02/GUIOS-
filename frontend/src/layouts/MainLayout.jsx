import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

/**
 * Layout Principal para todas las páginas autenticadas
 */
export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#F3F7F4] flex flex-col font-sans">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
