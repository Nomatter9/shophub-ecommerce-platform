import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { CreditCard, Lock, ShoppingBag, Loader2, CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { useCart } from '@/Customer/context/CartContext';

const API_URL = import.meta.env.VITE_API_URL;
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// ---------- Static demo items (student can replace these) ----------
const DEMO_ITEMS = [
  { id: 1, name: 'Wireless Bluetooth Headphones', price: 899.99, quantity: 1, image: 'https://picsum.photos/seed/headphones/80/80' },
  { id: 2, name: 'USB-C Fast Charger 65W', price: 349.50, quantity: 2, image: 'https://picsum.photos/seed/charger/80/80' },
  { id: 3, name: 'Laptop Stand - Aluminium', price: 499.00, quantity: 1, image: 'https://picsum.photos/seed/stand/80/80' },
];

// ---------- Stripe PaymentForm (rendered inside Elements provider) ----------
function StripePaymentForm({ amount, onSuccess }: { amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch {
      toast.error('Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-lg disabled:opacity-50"
      >
        {processing ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
        ) : (
          `Pay R${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

// ---------- Main Checkout Page ----------
export default function CheckoutPage() {
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use real cart if available, otherwise show demo items
  const hasRealCart = cartItems && cartItems.length > 0;
  const displayItems = hasRealCart
    ? cartItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || `https://picsum.photos/seed/${item.id}/80/80`,
      }))
    : DEMO_ITEMS;

  const subtotal = displayItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const orderTotal = subtotal;

  // Call backend to create a real Stripe PaymentIntent
  const handlePayNow = async () => {
    if (!stripePromise) {
      toast.error('Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to .env');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`${API_URL}/payments/checkout`, {
        amount: orderTotal,
      });

      setClientSecret(data.clientSecret);
      setModalOpen(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to initialize payment';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setModalOpen(false);
    if (hasRealCart) clearCart();
    toast.success('Payment successful!');
  };

  // ---------- Success screen ----------
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

  // ---------- Checkout page ----------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5" />
                Order Items
                {!hasRealCart && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                    Demo
                  </span>
                )}
              </h2>

              <div className="divide-y">
                {displayItems.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 whitespace-nowrap">
                      R{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary + Pay Button */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({displayItems.length} items)</span>
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
                disabled={loading}
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

      {/* ---------- Stripe Payment Modal ---------- */}
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

          {stripePromise && clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm amount={orderTotal} onSuccess={handlePaymentSuccess} />
            </Elements>
          ) : (
            <p className="text-gray-500 text-sm">Loading payment form...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
