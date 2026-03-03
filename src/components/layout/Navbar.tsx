import { Menu, Package} from "lucide-react";
import { Button } from "../ui/button";
import { useUser } from "@/Customer/context/UserContext";


export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
const { user } = useUser();
  return (
<nav className="fixed top-0 left-0 right-0 h-16 bg-[#0B1224] border-b border-white/5 z-[200] flex items-center px-4 justify-between">      <div className="flex items-center gap-4 flex-shrink-0">
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
          <span className="text-xl font-bold text-white uppercase tracking-tighter hidden md:block">  {user?.firstName}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
       <div className="flex items-center gap-2">
      <p className="text-xs font-bold text-white leading-none">
        {user?.firstName} {user?.lastName}
      </p>
    </div>
<div className="w-10 h-10 rounded-full bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] font-black overflow-hidden">
  {user?.profilePicture ? (
    <img 
      src={user.profilePicture.startsWith('data:') 
        ? user.profilePicture 
        : `${import.meta.env.VITE_STATIC_FILE_URL}${user.profilePicture}`
      } 
      alt="Profile" 
      className="w-full h-full object-cover"
    />
  ) : (
    <span>{user?.firstName?.charAt(0).toUpperCase() || 'U'}</span>
  )}
</div>
      </div>
    </nav>
  );
}