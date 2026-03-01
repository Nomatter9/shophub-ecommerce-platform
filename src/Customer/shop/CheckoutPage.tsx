import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { MapPin, Plus, CreditCard, Lock, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/Customer/context/CartContext';
import AuthModal from '@/components/auth/AuthModal';
import axiosClient from '@/axiosClient';
import { toast } from 'sonner';
import PaymentForm from '@/Customer/shop/PaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const navigate = useNavigate();
const { items, total, clearCart } = useCart();  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

 useEffect(() => {
  if (!isLoggedIn) {
    setShowAuthModal(true);
    return;
  }
  if (!items || items.length === 0) {
    toast.error("Your cart is empty");
    navigate('/cart');
    return;
  }

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get('/addresses');
        setAddresses(data.addresses || []);
        const defaultAddr = data.addresses?.find((addr: any) => addr.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      } catch (err) {
        toast.error('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [isLoggedIn]);


const handleContinueToPayment = async () => {
  if (!selectedAddressId) return toast.error('Please select a delivery address');
  if (!items || items.length === 0) return toast.error('Your cart is empty');

  setCreatingOrder(true);

  try {
    const { data } = await axiosClient.post(
      '/orders',
      {
        shippingAddressId: selectedAddressId,
        paymentMethod: 'card',
      },
    );
console.log('Order response:', data);
    setOrderId(data.order.id);
    const paymentData = await axiosClient.post(
      '/payments/create-intent',
      { orderId: data.order.id },
    );

    setClientSecret(paymentData.data.clientSecret);
    setShowPayment(true);
    toast.success('Order created! Please complete payment.');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Failed to create order');
  } finally {
    setCreatingOrder(false);
  }
};
  const handlePaymentSuccess = (orderId: number) => {
    setPaymentDone(true);
    toast.success('Payment successful!');
    clearCart(); 
    navigate(`/orders/${orderId}`);
  };

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
                  size="sm"
                  onClick={() => navigate('/account/addresses')}
                  disabled={showPayment || paymentDone}
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
                      } ${showPayment || paymentDone ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => !showPayment && setSelectedAddressId(address.id)}
                        className="sr-only"
                        disabled={showPayment || paymentDone}
                      />

                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            {address.label || 'Address'}
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-gray-700 mt-1">{address.recipientName}</p>
                          <p className="text-gray-600 text-sm mt-1">
                            {address.streetAddress}{address.addressLine2 ? `, ${address.addressLine2}` : ''}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {address.suburb ? `${address.suburb}, ` : ''}{address.city}, {address.province} {address.postalCode}
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
                Payment Details
              </h2>

              {!showPayment ? (
                <div
                  className="cursor-pointer border-2 border-blue-600 bg-blue-50 p-4 rounded-lg hover:border-blue-700"
                  onClick={() => {
                    if (!selectedAddressId) return toast.error("Select delivery address first");
                    handleContinueToPayment();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Credit / Debit Card</div>
                      <p className="text-sm text-gray-600">Secure payment with Stripe</p>
                    </div>
                  </div>
                </div>
              ) : clientSecret && orderId && !paymentDone ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm
                    clientSecret={clientSecret}
                    orderId={orderId}
                    amount={total}
                    selectedAddressId={selectedAddressId}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <p className="text-green-600 font-semibold">Payment Completed</p>
              )}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 border sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
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
                onClick={() => navigate('/orders')}
                disabled={!selectedAddressId || !paymentDone}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-semibold disabled:opacity-50"
              >
                Place Your Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}