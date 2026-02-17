import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/Customer/context/CartContext';
import AuthModal from '@/components/auth/AuthModal';
import axiosClient from '@/axiosClient';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartChecked, setCartChecked] = useState(false); 

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const timer = setTimeout(() => {
      setCartChecked(true); 
    }, 100); 

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!cartChecked) return; 

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    fetchAddresses();
  }, [cartChecked, items.length, isLoggedIn]); 

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/addresses');
      setAddresses(data.addresses || []);
      
      const defaultAddress = data.addresses?.find((addr: any) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    setCreatingOrder(true);
    try {
      const orderData = {
        addressId: selectedAddressId,
        items: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        total: total
      };

      const { data } = await axiosClient.post('/orders', orderData);
      
      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/orders/${data.order.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setCreatingOrder(false);
    }
  };
  if (!cartChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600">Please login to continue with checkout</p>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => navigate('/cart')}
          redirectTo="/checkout"
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
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/account/addresses')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No addresses found</p>
                  <Button onClick={() => navigate('/account/addresses')}>
                    Add Delivery Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAddressId === address.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="sr-only"
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            {address.label || 'Address'}
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mt-1">{address.recipientName}</p>
                          <p className="text-gray-600 text-sm mt-1">
                            {address.streetAddress}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {address.suburb && `${address.suburb}, `}
                            {address.city}, {address.province} {address.postalCode}
                          </p>
                          <p className="text-gray-600 text-sm">{address.phone}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className="block p-4 rounded-lg border-2 border-blue-600 bg-blue-50 cursor-pointer">
                  <input type="radio" name="payment" value="card" checked readOnly className="sr-only" />
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Credit/Debit Card</div>
                      <p className="text-sm text-gray-600">Pay securely with your card</p>
                    </div>
                  </div>
                </label>

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4" />
                    <span>Secure payment processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 border sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4 pb-4 border-b">
                {items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">R{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>R0.00</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={!selectedAddressId || creatingOrder}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg"
              >
                {creatingOrder ? 'Processing...' : 'Place Order'}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}