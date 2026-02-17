import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Toaster } from "sonner";

export default function DashboardLayout() {
  const [sidebarLocked, setSidebarLocked] = useState(true);
  return (
    <div className="h-screen overflow-hidden bg-[#071025] flex flex-col">
      <Navbar onMenuClick={() => setSidebarLocked(!sidebarLocked)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarLocked} />
        <main
          className={`flex-1 pt-16 transition-all duration-300 overflow-hidden ${
            sidebarLocked ? "pl-64" : "pl-20"
          }`}
        >
          <div className="h-full overflow-y-auto overscroll-contain p-4 md:p-10">
            <Outlet />
          </div>
        </main>
        <Toaster richColors position="top-right" />
      </div>
    </div>
  );
}