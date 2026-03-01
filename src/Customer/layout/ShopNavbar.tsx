import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { 
  LayoutGrid, ChevronRight, ChevronDown, 
  Search, Heart, ShoppingCart, X
} from "lucide-react";
import { useAllCategories } from "@/hooks/useCategories";
import { useCart } from "@/Customer/context/CartContext"; 
import { Input } from "@/components/ui/input";
import axiosClient from "@/axiosClient";
import { useUser } from "../context/UserContext";

export default function DepartmentMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: categories = [] } = useAllCategories(true);
  const { itemCount } = useCart();
  const searchRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [authKey, setAuthKey] = useState(0);
const { user } = useUser();   
const isLoggedIn = !!user;
  useEffect(() => {
    const handleAuthChange = () => setAuthKey(prev => prev + 1);
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const { data } = await axiosClient.get('/products', {
          params: {
            search: searchQuery,
            limit: 5, 
            page: 1
          }
        });
        
        setSuggestions(data.products || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const mainCategories = categories.filter((cat: any) => cat.parentId === null);
  const getSubcategories = (categoryId: number) => categories.filter((cat: any) => cat.parentId === categoryId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  const handleSuggestionClick = (product: any) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${product.id}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    navigate('/shop');
  };

  return (
    <header className="w-full bg-[#0B1224] text-white sticky top-0 z-50" key={authKey}>
      <div className="bg-[#080E1C] border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-6">
            <Link 
              to="/sell" 
              className="text-slate-400 hover:text-blue-400 transition-colors font-medium flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              Sell on TakealotClone
            </Link>
          </div>
<div className="flex items-center gap-2">
  {isLoggedIn ? (
    <div className="flex items-center gap-4">
      <Link 
        to="/orders" 
        className="text-slate-300 hover:text-white px-3 py-1 rounded-md hover:bg-slate-800 transition-all"
      >
        My Orders
      </Link>

      <Link 
        to="/account" 
        className="text-slate-300 hover:text-white px-3 py-1 rounded-md hover:bg-slate-800 transition-all"
      >
        My Account
      </Link>

      <Link 
        to="/profile" 
        className="text-slate-300 hover:text-white font-bold px-3 py-1 rounded-md hover:bg-slate-800 transition-all"
      >
        Profile
      </Link>
    </div>
  ) : (
    <div className="flex items-center">
      <Link to="/login" className="px-4 py-1">Login</Link>
      <Link to="/register" className="px-4 py-1">Register</Link>
    </div>
  )}
</div>
        </div>
      </div>
      <div className="border-b border-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between gap-10">
          <Link to="/shop" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl leading-none">T</span>
            </div>
            <span className="text-2xl font-black tracking-tight hidden md:block">
              takealot<span className="text-blue-500">Clone</span>
            </span>
          </Link>

          <div ref={searchRef} className="flex-1 max-w-3xl relative">
            <form onSubmit={handleSearch}>
              <div className="relative flex items-center w-full">
                <Search className="absolute left-3 w-5 h-5 text-gray-400 z-10" />
                <Input
                  className="pl-10 pr-10 h-12 bg-slate-900/50 border-slate-700 text-slate-200 focus-visible:ring-blue-500 w-full"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 text-gray-400 hover:text-white transition-colors z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>

            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
                {loadingSuggestions ? (
                  <div className="p-4 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    {suggestions.map((product) => {
                      const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
                      const imageUrl = primaryImage
                      //@ts-ignore
                        ? `${import.meta.env.VITE_STATIC_FILE_URL}${primaryImage.url}`
                        : `https://picsum.photos/seed/${product.id}/50`;

                      return (
                        <button
                          key={product.id}
                          onClick={() => handleSuggestionClick(product)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 transition-colors text-left"
                        >
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover bg-slate-800"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/50`;
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium line-clamp-1">{product.name}</p>
                            <p className="text-sm text-emerald-400 font-bold">R{Number(product.price).toFixed(2)}</p>
                          </div>
                          {product.stockQuantity > 0 ? (
                            <span className="text-xs text-green-500">In Stock</span>
                          ) : (
                            <span className="text-xs text-red-500">Out of Stock</span>
                          )}
                        </button>
                      );
                    })}
                    <button
                      onClick={handleSearch}
                      className="w-full p-3 text-blue-400 hover:bg-slate-800 transition-colors text-sm font-semibold border-t border-slate-700"
                    >
                      See all results for "{searchQuery}"
                    </button>
                  </>
                ) : searchQuery.length >= 2 ? (
                  <div className="p-4 text-center text-slate-400">
                    No products found for "{searchQuery}"
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex items-center gap-8 shrink-0">
            <Link to="/wishlist" className="text-slate-300 hover:text-blue-500 transition-all">
              <Heart className="w-7 h-7" />
            </Link>
            <Link to="/cart" className="relative text-slate-300 hover:text-blue-500 transition-all">
              <ShoppingCart className="w-7 h-7" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-green-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#0B1224]">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-[#161F32] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative inline-block">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-3 px-6 py-3 transition-colors text-sm font-bold ${
                isOpen ? "bg-blue-600 text-white" : "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="uppercase tracking-wide">Shop by Department</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div
                className="absolute top-full left-0 flex bg-[#161F32] border border-slate-700 shadow-2xl z-50 rounded-b-md overflow-hidden"
                onMouseLeave={() => {
                  setIsOpen(false);
                  setActiveCategory(null);
                }}
              >
                <div className="w-64 bg-[#161F32]">
                  {mainCategories.map((category: any) => (
                    <div
                      key={category.id}
                      onMouseEnter={() => setActiveCategory(category)}
                      onClick={() => {
                        navigate(`/shop?category=${category.id}`);
                        setIsOpen(false);
                      }}
                      className={`flex justify-between items-center px-4 py-3 text-sm cursor-pointer transition-colors ${
                        activeCategory?.id === category.id
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-blue-600/20"
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                      {getSubcategories(category.id).length > 0 && <ChevronRight className="w-4 h-4 opacity-50" />}
                    </div>
                  ))}
                </div>

                {activeCategory && getSubcategories(activeCategory.id).length > 0 && (
                  <div className="w-64 bg-[#1e293b] border-l border-slate-700 animate-in slide-in-from-left-2 duration-200">
                    <div className="p-4 border-b border-slate-700/50 text-[11px] font-black text-blue-400 uppercase tracking-widest">
                      {activeCategory.name}
                    </div>
                    <div className="py-2">
                      {getSubcategories(activeCategory.id).map((sub: any) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            navigate(`/shop?category=${activeCategory.id}&subcategory=${sub.id}`);
                            setIsOpen(false);
                          }}
                          className="block w-full text-left px-6 py-2 text-sm text-slate-400 hover:text-white hover:bg-blue-600 transition-colors"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}