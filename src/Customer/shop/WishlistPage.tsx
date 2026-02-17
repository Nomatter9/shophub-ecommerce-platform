import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/Customer/context/CartContext';
import axiosClient from '@/axiosClient';
import { toast } from 'sonner';
import AuthModal from '@/components/auth/AuthModal';

interface WishlistItem {
  id: number;
  productId: number;
  userId: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    compareAtPrice: string;
    stockQuantity: number;
    isActive: boolean;
    images: Array<{
      id: number;
      url: string;
      altText: string;
    }>;
    category: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [movingToCart, setMovingToCart] = useState(false);
  
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, [isLoggedIn]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/wishlist');
      setWishlist(data.wishlist || []);
    } catch (error: any) {
      toast.error('Failed to load wishlist');
      console.error('Wishlist error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await axiosClient.delete(`/wishlist/${itemId}`);
      toast.success('Removed from wishlist');
      setWishlist(prev => prev.filter(item => item.id !== itemId));
    } catch (error: any) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm('Clear your entire wishlist?')) return;
    
    try {
      await axiosClient.delete('/wishlist');
      toast.success('Wishlist cleared');
      setWishlist([]);
    } catch (error: any) {
      toast.error('Failed to clear wishlist');
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    const product = {
      id: item.product.id,
      name: item.product.name,
      price: parseFloat(item.product.price),
      stockQuantity: item.product.stockQuantity,
      images: item.product.images,
    };
    
    addToCart(product, 1);
  };

  const handleMoveAllToCart = async () => {
    if (movingToCart) return; 
    
    setMovingToCart(true);
    
    try {
      let addedCount = 0;
      const itemsToAdd: WishlistItem[] = [];
            wishlist.forEach(item => {
        if (item.product.stockQuantity > 0 && item.product.isActive) {
          handleAddToCart(item);
          itemsToAdd.push(item);
          addedCount++;
        }
      });
      
      if (addedCount > 0) {
        await axiosClient.delete('/wishlist');
        setWishlist([]);
        
        toast.success(
          `${addedCount} ${addedCount === 1 ? 'item' : 'items'} moved to cart and wishlist cleared!`,
          { duration: 3000 }
        );
      } else {
        toast.error('No items available to add');
      }
    } catch (error: any) {
      toast.error('Failed to clear wishlist');
    } finally {
      setMovingToCart(false);
    }
  };

  const handleAddSingleToCartAndRemove = async (item: WishlistItem) => {
    try {
      handleAddToCart(item);
            await axiosClient.delete(`/wishlist/${item.id}`);
      setWishlist(prev => prev.filter(i => i.id !== item.id));
      
      toast.success('Moved to cart!');
    } catch (error: any) {
      toast.error('Failed to remove from wishlist');
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Heart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login to view wishlist</h2>
            <p className="text-gray-600">Save your favorite items for later</p>
          </div>
        </div>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => navigate('/shop')}
          redirectTo="/wishlist"
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Start adding items you love!</p>
          <Link to="/shop">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-gray-600 mt-1">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/shop')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            
            {wishlist.length > 0 && (
              <>
                <Button
                  onClick={handleMoveAllToCart}
                  disabled={movingToCart}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {movingToCart ? 'Moving...' : 'Move All to Cart'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleClearWishlist}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Wishlist
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const primaryImage = item.product.images?.[0];
            const imageUrl = primaryImage?.url
            //@ts-ignore
              ? `${import.meta.env.VITE_STATIC_FILE_URL}${primaryImage.url}`
              : `https://picsum.photos/seed/${item.product.id}/300`;

            const price = parseFloat(item.product.price);
            const compareAtPrice = parseFloat(item.product.compareAtPrice || '0');
            const discount = compareAtPrice > price
              ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
              : 0;

            return (
              <div key={item.id} className="bg-white rounded-lg border hover:shadow-lg transition-all group relative">
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
                <Link to={`/products/${item.product.id}`} className="block">
                  <div className="aspect-square overflow-hidden bg-gray-100 rounded-t-lg relative">
                    <img
                      src={imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     
                    />
                    
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                        -{discount}%
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/products/${item.product.id}`}>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 min-h-[48px]">
                      {item.product.name}
                    </h3>
                  </Link>

                  {item.product.category && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.product.category.name}
                    </p>
                  )}

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      R{price.toFixed(2)}
                    </span>
                    {compareAtPrice > price && (
                      <span className="text-sm text-gray-500 line-through">
                        R{compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    {item.product.stockQuantity > 0 ? (
                      <span className="text-xs text-green-600 font-semibold">
                        In Stock ({item.product.stockQuantity})
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-semibold">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleAddSingleToCartAndRemove(item)}
                    disabled={item.product.stockQuantity === 0 || !item.product.isActive}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Move to Cart
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}