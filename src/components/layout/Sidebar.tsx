import axiosClient from "@/axiosClient";
import { ChevronDown, FolderTree, Home, User, Package, LogOut, Package2, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

type SidebarProps = { isOpen: boolean };

export default function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const user = useMemo(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }, []);

  const role = user?.role;

  const logout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      toast.success("Logged out successfully");
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
      isActive 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
        : "text-slate-400 hover:bg-white/5 hover:text-white"        
    }`;

  const isCategoriesActive = location.pathname.includes("categories");

  return (
    <aside
      className={`fixed inset-y-0 left-0 bg-[#0B1224] border-r border-white/5 z-30 pt-16 transition-all duration-300 ease-in-out group 
      ${isOpen ? "w-64" : "w-20 hover:w-64"}`} 
    >
      <nav className="p-3 space-y-2">
        {role === 'admin' && (
          <>
            <NavLink to="/dashboard" className={linkClass} end>
              <Home className="w-6 h-6 flex-shrink-0" />
              <span className={`font-medium transition-opacity duration-300 ${!isOpen && "opacity-0 group-hover:opacity-100"}`}>
                Dashboard
              </span>
            </NavLink>
            <NavLink to="/dashboard/users" className={linkClass}>
              <Users className="w-6 h-6 flex-shrink-0" />
              <span className={`font-medium transition-opacity duration-300 ${!isOpen && "opacity-0 group-hover:opacity-100"}`}>
                Manage Users
              </span>
            </NavLink>

            <NavLink to="/dashboard/profile" className={linkClass}>
              <User className="w-6 h-6 flex-shrink-0" />
              <span className={`font-medium transition-opacity duration-300 ${!isOpen && "opacity-0 group-hover:opacity-100"}`}>
                Profile
              </span>
            </NavLink>
                    <NavLink to="/shop" className={linkClass}>
              <Package className="w-6 h-6 flex-shrink-0" />
              <span className={`font-medium transition-opacity duration-300 ${!isOpen && "opacity-0 group-hover:opacity-100"}`}>
                View Shop
              </span>
            </NavLink>

            <div className="relative">
              <button 
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isCategoriesActive ? "text-white bg-white/5" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FolderTree className="w-6 h-6 flex-shrink-0" />
                <span className={`flex-1 text-left font-medium transition-opacity duration-300 ${!isOpen && "opacity-0 group-hover:opacity-100"}`}>
                  Categories
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${categoriesOpen ? "rotate-0" : "-rotate-90"}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${categoriesOpen ? "max-h-40 mt-1" : "max-h-0"}`}>
                <div className="ml-6 space-y-1 border-l border-white/10 pl-4">
                  <NavLink to="/dashboard/categories" className={({ isActive }) => `block py-2 text-sm transition-colors ${isActive ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-white"}`}>
                    Manage Categories
                  </NavLink>
                  <NavLink to="/dashboard/subcategories" className={({ isActive }) => `block py-2 text-sm transition-colors ${isActive ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-white"}`}>
                    Manage Subcategories
                  </NavLink>
                </div>
              </div>
            </div>

            <NavLink to="/dashboard/products" className={linkClass}>
              <Package2 className="w-6 h-6 flex-shrink-0" />
              <span className={`font-medium transition-opacity duration-300 ${!isOpen && "opacity-0 group-hover:opacity-100"}`}>
                All Products
              </span>
            </NavLink>
          </>
        )}
        {role === 'seller' && (
          <NavLink to="/seller/products" className={linkClass}>
            <Package className="w-6 h-6 flex-shrink-0" />
            <span className={`font-medium transition-opacity duration-300 ${!isOpen && "opacity-0 group-hover:opacity-100"}`}>
              My Products
            </span>
          </NavLink>
        )}
        {role === 'customer' && (
  <>
    <NavLink to="/account" className={linkClass}>
      <User className="w-6 h-6 flex-shrink-0" />
      <span className={`font-medium transition-opacity duration-300 ${!isOpen && "opacity-0 group-hover:opacity-100"}`}>
        My Account
      </span>
    </NavLink>

    <NavLink to="/orders" className={linkClass}>
      <Package className="w-6 h-6 flex-shrink-0" />
      <span className={`font-medium transition-opacity duration-300 ${!isOpen && "opacity-0 group-hover:opacity-100"}`}>
        My Orders
      </span>
    </NavLink>
  </>
)}

        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 mt-4 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all rounded-xl group"
        >
          <div className="p-2 mr-3 rounded-lg bg-slate-800/50 text-slate-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
            <LogOut className="w-5 h-5" />
          </div>
          <span className={`font-semibold transition-opacity duration-300 ${!isOpen && "opacity-0 group-hover:opacity-100"}`}>
            Logout
          </span>
        </button>
      </nav>
    </aside>
  );
}