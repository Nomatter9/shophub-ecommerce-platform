import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAllProducts } from '@/hooks/useProducts';

export default function HomePage() {
  const { data, isLoading } = useAllProducts();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const carouselProducts = data?.products?.slice(0, 4) || [];
  const gridProducts = data?.products?.slice(4, 8) || []; 

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === carouselProducts.length - 1 ? 0 : prev + 1));
  }, [carouselProducts.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselProducts.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused || carouselProducts.length === 0) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, carouselProducts.length]);

  const getImageUrl = (imageUrl: string | undefined, productId: any) => {
    if (!imageUrl) return `https://picsum.photos/seed/${productId}/1600/600`;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${import.meta.env.VITE_STATIC_FILE_URL}${imageUrl}`;
  };

  if (isLoading) return <div className="h-[450px] bg-gray-100 animate-pulse" />;
return (
  <div className="bg-[#f4f4f4] min-h-screen">
    <section 
      className="relative w-full overflow-hidden py-4 md:py-6" 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4"> 
        <div className="relative w-full aspect-[2/1] md:aspect-[4/1] overflow-hidden rounded-xl shadow-sm bg-white">
          <div 
            className="flex h-full transition-transform duration-1000 ease-in-out" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselProducts.map((product: any) => (
              <Link 
                to={`/products/${product.id}`} 
                key={product.id} 
                className="w-full h-full flex-shrink-0 relative group"
              >
                <img 
                  src={getImageUrl(product.images?.[0]?.url, product.id)} 
                  className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105"
                  alt={product.name}
                />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent flex items-center">
                  <div className="px-8 md:px-12 w-full">
                    <div className="max-w-xs md:max-w-md space-y-1 md:space-y-2">
                      <h2 className="text-xl md:text-3xl font-bold text-white leading-tight">
                        {product.name}
                      </h2>
                      <p className="text-blue-400 font-black text-lg md:text-2xl">
                        R{Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); prevSlide(); }} 
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 text-white/50 hover:text-white bg-black/10 hover:bg-black/30 rounded-full transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); nextSlide(); }} 
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 text-white/50 hover:text-white bg-black/10 hover:bg-black/30 rounded-full transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
      <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Trending Collections</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {gridProducts.map((product: any) => (
          <Link 
            key={product.id} 
            to={`/products/${product.id}`} 
            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
              <img
                src={getImageUrl(product.images?.[0]?.url, product.id)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
             <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Info Section */}
            <div className="p-6 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {product.brand || 'Premium Selection'}
              </span>
              <h4 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h4>
              <div className="flex items-center justify-between pt-2">
                <p className="text-2xl font-black text-gray-900">
                  R{Number(product.price).toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
         <div className="bg-gray-50 border-t py-12 text-center">
        <p className="text-gray-600 italic">Not finding what you're looking for?</p>
        <Link to="/shop" className="text-blue-600 font-bold hover:underline mt-2 inline-block">
          View all Products
        </Link>
      </div>
    </div>
  );
}
