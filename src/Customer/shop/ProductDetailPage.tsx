import { useParams, useNavigate } from 'react-router-dom';
import { useAllProducts } from '@/hooks/useProducts'; 
import { useCart } from '@/Customer/context/CartContext';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import axiosClient from '@/axiosClient';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { data, isLoading } = useAllProducts();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<number | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  const isLoggedIn = !!localStorage.getItem('token');

  const product = data?.products?.find((p: any) => p.id === Number(id));

  useEffect(() => {
    if (isLoggedIn && product) {
      checkWishlistStatus();
    }
  }, [isLoggedIn, product?.id]);

  const checkWishlistStatus = async () => {
    try {
      const { data } = await axiosClient.get(`/wishlist/check/${product.id}`);
      setInWishlist(data.inWishlist);
      setWishlistItemId(data.wishlistItemId);
    } catch (error) {
    toast.error("Failed to add to wish list")    }
  };

  const handleToggleWishlist = async () => {
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center">
    <h2 className="text-2xl font-bold">Product not found</h2>
    <Button onClick={() => navigate('/shop')} className="mt-4">Back to Shop</Button>
  </div>;

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    //@ts-ignore
    return `${import.meta.env.VITE_STATIC_FILE_URL}${url}`;
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-white border rounded-xl overflow-hidden shadow-sm">
              <img 
                src={product.images?.[selectedImage]?.url ? getImageUrl(product.images[selectedImage].url) : `https://picsum.photos/seed/${product.id}/600`}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images?.map((img: any, index: number) => (
                <button 
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square border rounded-md overflow-hidden p-1 bg-white transition-all ${selectedImage === index ? 'ring-2 ring-blue-600 border-transparent' : 'hover:border-blue-300'}`}
                >
                  <img src={getImageUrl(img.url)} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="border-b pb-6">
              <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-2">{product.brand || 'Premium Brand'}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-4xl font-black text-gray-900">R{Number(product.price).toFixed(2)}</span>
                {product.compareAtPrice > product.price && (
                  <span className="text-xl text-gray-400 line-through">R{Number(product.compareAtPrice).toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <p className="font-bold text-gray-800">About this item</p>
                <p className="text-gray-600 leading-relaxed">{product.description || "No description available for this product."}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>Free delivery on orders over R500</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span>12-Month Limited Warranty</span>
                </div>
              </div>
              <div className="pt-4">
                <p className={`text-sm font-bold mb-4 ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                   {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => addToCart(product, 1)}
                    disabled={product.stockQuantity === 0}
                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg"
                  >
                    <ShoppingCart className="mr-2 w-5 h-5" /> Add to Cart
                  </Button>

                  <Button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    variant="outline"
                    className={`h-14 w-14 border-2 transition-all ${
                      inWishlist 
                        ? 'border-red-500 bg-red-50 hover:bg-red-100' 
                        : 'border-gray-300 hover:border-red-500 hover:bg-red-50'
                    }`}
                    title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart 
                      className={`w-6 h-6 transition-all ${
                        inWishlist 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-400'
                      } ${wishlistLoading ? 'animate-pulse' : ''}`}
                    />
                  </Button>
                </div>
                {inWishlist && (
                  <p className="text-sm text-red-600 font-medium mt-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-red-500" />
                    This item is in your wishlist
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}