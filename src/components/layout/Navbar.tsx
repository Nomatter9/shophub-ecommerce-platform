import { Menu, Package} from "lucide-react";
import { Button } from "../ui/button";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0B1224] border-b border-white/5 z-[100] flex items-center px-4 justify-between">
      <div className="flex items-center gap-4 flex-shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick} 
          className="text-white hover:bg-white/10"
        >
          <Menu className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-500" />
          <span className="text-xl font-bold text-white uppercase tracking-tighter hidden md:block">Admin</span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-white leading-none">Admin User</p>
          <p className="text-[10px] text-slate-500 mt-1">Super Admin</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black">
          A
        </div>
      </div>
    </nav>
  );
}