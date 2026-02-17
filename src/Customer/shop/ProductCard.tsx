import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/Customer/context/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import axiosClient from '@/axiosClient';

export function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<number | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (isLoggedIn) {
      checkWishlistStatus();
    }
  }, [isLoggedIn, product.id]);

  const checkWishlistStatus = async () => {
    try {
      const { data } = await axiosClient.get(`/wishlist/check/${product.id}`);
      setInWishlist(data.inWishlist);
      setWishlistItemId(data.wishlistItemId);
    } catch (error) {
      toast.error("Failed to add to wish list")
    }
  };

  const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];

  const getImageUrl = (url: string | undefined) => {
    if (!url) return `https://picsum.photos/seed/${product.id}/300`;
    if (url.startsWith('http')) return url;
    //@ts-ignore
    const baseUrl = import.meta.env.VITE_STATIC_FILE_URL?.replace(/\/$/, '') || '';
    return `${baseUrl}/${url.replace(/^\//, '')}`;
  };

  const imageUrl = getImageUrl(primaryImage?.url);

  const discount = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error('Please login to add to wishlist');
      return;
    }

    setWishlistLoading(true);
    try {
      if (inWishlist && wishlistItemId) {
        await axiosClient.delete(`/wishlist/${wishlistItemId}`);
        setInWishlist(false);
        setWishlistItemId(null);
        toast.success('Removed from wishlist');
      } else {
        const { data } = await axiosClient.post('/wishlist', { productId: product.id });
        setInWishlist(true);
        setWishlistItemId(data.wishlistItem.id);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border hover:shadow-lg transition-all group overflow-hidden relative">
      <button
        onClick={handleToggleWishlist}
        disabled={wishlistLoading}
        className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className={`w-5 h-5 transition-all ${
            inWishlist 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-400 hover:text-red-500'
          } ${wishlistLoading ? 'animate-pulse' : ''}`}
        />
      </button>
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/300`;
            }}
          />
        </div>
                {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold shadow-sm">
            -{discount}%
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute bottom-2 left-2 bg-amber-500 text-white p-1.5 rounded-lg shadow-sm">
            <Star className="w-4 h-4 fill-white" />
          </div>
        )}
      </Link>
      <div className="p-4">
        <Link to={`/products/${product.id}`} className="block group-hover:text-blue-600">
          <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[48px]">{product.name}</h3>
          {product.brand && <p className="text-sm text-gray-500 mt-1">{product.brand}</p>}
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900">
            R{Number(product.price).toFixed(2)}
          </span>
          {product.compareAtPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              R{Number(product.compareAtPrice).toFixed(2)}
            </span>
          )}
        </div>

        <div className="mt-1 text-xs">
          {product.stockQuantity > 0 ? (
            <span className="text-green-600 font-medium">In stock ({product.stockQuantity})</span>
          ) : (
            <span className="text-red-600 font-medium">Out of stock</span>
          )}
        </div>

        <Button
          onClick={(e) => {
            e.preventDefault();
            addToCart(product, 1);
          }}
          disabled={product.stockQuantity === 0}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}