import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/Customer/context/CartContext';
import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, total, itemCount, clearCart } = useCart();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');
  
  const handleCheckout = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <Link to="/shop">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any) => {
                const primaryImage = item.images?.find((img: any) => img.isPrimary) || item.images?.[0];
                const imageUrl = primaryImage
                  ? `${import.meta.env.VITE_STATIC_FILE_URL}${primaryImage.url}`
                  : `https://picsum.photos/seed/${item.productId}/200`;

                return (
                  <div key={item.id} className="bg-white rounded-lg p-6 border hover:shadow-md transition-shadow">
                    <div className="flex gap-6">
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain rounded-lg border bg-gray-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.productId}/200`;
                          }}
                        />
                        {item.images?.some((img: any) => img.isPrimary) && (
                          <div className="absolute -top-1.5 -right-1.5 bg-amber-500 rounded-full p-1 shadow-lg border-2 border-white z-10">
                            <Star className="w-3 h-3 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link 
                              to={`/products/${item.productId}`}
                              className="font-bold text-lg text-gray-900 mb-1 leading-tight hover:text-blue-600 block"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-500 mb-2">{item.brand || 'Premium Brand'}</p>
                            <p className="text-xl font-black text-blue-600">
                              R{Number(item.price).toFixed(2)}
                            </p>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-6 bg-gray-50 p-3 rounded-xl">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Quantity</span>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="p-2 hover:bg-gray-100 disabled:opacity-20 transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-black text-gray-900">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock}
                                  className="p-2 hover:bg-gray-100 disabled:opacity-20 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              {item.stock < 10 && (
                                <span className="text-xs font-bold text-amber-600">Only {item.stock} left!</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total Price</p>
                            <p className="text-lg font-black text-gray-900">R{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 border sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-4 pb-4 border-b">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                    <span className="font-semibold">R{total.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold mb-6 text-gray-600">
                  <span>Total</span>
                  <span className="text-blue-600">R{total.toFixed(2)}</span>
                </div>
                <Button 
                  onClick={handleCheckout}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-semibold"
                >
                  Proceed to Checkout
                </Button>

                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>Secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo="/checkout"
      />
    </>
  );
}