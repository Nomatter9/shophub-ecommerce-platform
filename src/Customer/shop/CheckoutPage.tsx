import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
  MapPin, Plus, CreditCard, Lock, Loader2,
  CheckCircle, Package, ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/Customer/context/CartContext';
import { useUser } from '@/Customer/context/UserContext';
import AuthModal from '@/components/auth/AuthModal';
import axiosClient from '@/axiosClient';
import { toast } from 'sonner';
import PaymentForm from '@/Customer/shop/PaymentForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useUser();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!user;

  const cartItems: any[] = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal = cartItems.reduce(
    (sum: number, item: any) => sum + Number(item.price) * item.quantity,
    0,
  );
  const orderTotal = subtotal;

  useEffect(() => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const { data } = await axiosClient.get('/addresses');
        setAddresses(data.addresses || []);
        const def = data.addresses?.find((a: any) => a.isDefault);
        if (def) setSelectedAddressId(def.id);
      } catch {
        toast.error('Failed to load addresses');
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [isLoggedIn]);

  const handlePayNow = async () => {
    if (!stripePromise) {
      toast.error('Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to .env');
      return;
    }
    if (!selectedAddressId) return toast.error('Please select a delivery address');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) return toast.error('Your cart is empty');

    setLoading(true);
    setError(null);

    try {
      // 1. Create the order
      const { data } = await axiosClient.post('/orders', {
        shippingAddressId: selectedAddressId,
        paymentMethod: 'card',
      });
      const newOrderId = data.order?.id ?? data.id;
      if (!newOrderId) throw new Error('Order ID missing from response');
      setOrderId(newOrderId);

      const paymentData = await axiosClient.post('/payments/create-intent', {
        orderId: newOrderId,
      });
      setClientSecret(paymentData.data.clientSecret);
      setModalOpen(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to initialize payment';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paidOrderId: number) => {
    setPaymentSuccess(true);
    setModalOpen(false);
    clearCart();
    toast.success('Payment successful!');
    navigate(`/orders/${paidOrderId}`);
  };

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600">Please login to continue</p>
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

  // ── Success screen ─────────────────────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-md">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your order has been placed and is being processed.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-500">Order Total</p>
            <p className="text-2xl font-bold text-gray-900">R{orderTotal.toFixed(2)}</p>
          </div>
          <Button
            onClick={() => (window.location.href = '/')}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Package className="w-5 h-5 mr-2" /> Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // ── Main checkout UI ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left col: Address + Order Items */}
          <div className="lg:col-span-3 space-y-6">

            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </h2>
                <Button size="sm" onClick={() => navigate('/account/addresses')}>
                  <Plus className="w-4 h-4 mr-1" /> Add New
                </Button>
              </div>

              {loadingAddresses ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No addresses found. Add one to continue.</p>
                  <Button onClick={() => navigate('/account/addresses')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Delivery Address
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
                          <p className="text-gray-500 text-sm mt-1">
                            {address.streetAddress}
                            {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {address.suburb ? `${address.suburb}, ` : ''}
                            {address.city}, {address.province} {address.postalCode}
                          </p>
                          <p className="text-gray-500 text-sm">📞 {address.phone}</p>
                        </div>
                        {selectedAddressId === address.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5" />
                Order Items
              </h2>
              <div className="divide-y">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    <img
                      src={
                        item.image
                          ? `${import.meta.env.VITE_STATIC_FILE_URL}${item.image}`
                          : `https://picsum.photos/seed/${item.id}/80/80`
                      }
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/80/80`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 whitespace-nowrap">
                      R{(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col: Summary + Pay Button */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span className="text-blue-600">R{orderTotal.toFixed(2)}</span>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-3">{error}</p>
              )}

              <Button
                onClick={handlePayNow}
                disabled={loading || !selectedAddressId || addresses.length === 0}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Connecting to Stripe...</>
                ) : (
                  <><CreditCard className="w-5 h-5 mr-2" /> Pay R{orderTotal.toFixed(2)}</>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-400">
                <Lock className="w-3 h-3" />
                <span>Secured by Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Payment Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Complete Payment
            </DialogTitle>
            <DialogDescription>
              Total: <span className="font-semibold text-gray-900">R{orderTotal.toFixed(2)}</span>
            </DialogDescription>
          </DialogHeader>

          {stripePromise && clientSecret && orderId ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                orderId={orderId}
                amount={orderTotal}
                selectedAddressId={selectedAddressId}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          ) : (
            <p className="text-gray-500 text-sm">Loading payment form...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}