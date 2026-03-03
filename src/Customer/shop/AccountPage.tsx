import { Navigate, useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, User, CreditCard, Heart, HelpCircle, ChevronRight, Package, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
const sections = [
  {
    title: 'Orders',
    icon: ShoppingBag,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    links: [
      { label: 'My Orders', to: '/orders' },
    ],
  },
  {
    title: 'Profile',
    icon: User,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    links: [
      { label: 'Personal Details', to: '/profile' },
    ],
  },
  {
    title: 'Addresses',
    icon: MapPin,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    links: [
      { label: 'Add New Address', to: '/account/addresses' },
    ],
  },
  {
    title: 'Payments & Credit',
    icon: CreditCard,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    links: [
      { label: 'Payment', to: '/checkout' },
    ],
  },
  {
    title: 'Wishlist',
    icon: Heart,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    links: [
      { label: 'My Wishlist', to: '/wishlist' },
    ],
  },
 
];


export default function AccountPage() {
  const navigate = useNavigate();
  const {user, setUser} = useUser()

  const handleLogout = () => {
  localStorage.removeItem('token');
  setUser(null)
  navigate('/');
};
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map(({ title, icon: Icon, color, bg, border, links }) => (
            <div
              key={title}
              className={`bg-slate-900 border ${border} rounded-2xl p-5 hover:border-opacity-60 transition-all`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`${bg} p-2.5 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h2 className="font-bold text-white">{title}</h2>
              </div>
              <div className="space-y-1">
                {links.map(({ label, to }) => (
                  <button
                    key={label}
                    onClick={() => navigate(to)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm"
                  >
                    <span>{label}</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </button>
                ))}
              </div>
            </div>
          ))}
           <button
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 rounded-2xl text-sm font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
        </div>
        
      </div>
    </div>
  );
}