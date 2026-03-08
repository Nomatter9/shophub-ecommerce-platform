import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Package, Clock, CheckCircle, XCircle, RefreshCw,
  MapPin, CreditCard, ArrowLeft, Loader2, ShoppingBag, Truck,
  ArrowRight
} from 'lucide-react';
import axiosClient from '@/axiosClient';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  pending:    { label: 'Pending',    color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   icon: Clock        },
  confirmed:  { label: 'Confirmed',  color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20',    icon: CheckCircle  },
  processing: { label: 'Processing', color: 'text-violet-400',  bg: 'bg-violet-400/10',  border: 'border-violet-400/20',  icon: RefreshCw    },
  shipped:    { label: 'Shipped',    color: 'text-sky-400',     bg: 'bg-sky-400/10',     border: 'border-sky-400/20',     icon: Truck        },
  delivered:  { label: 'Delivered',  color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle  },
  cancelled:  { label: 'Cancelled',  color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     icon: XCircle      },
  refunded:   { label: 'Refunded',   color: 'text-slate-400',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20',   icon: RefreshCw    },
};

const paymentConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: 'text-amber-400',   bg: 'bg-amber-400/10'   },
  paid:     { label: 'Paid',     color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  failed:   { label: 'Failed',   color: 'text-red-400',     bg: 'bg-red-400/10'     },
  refunded: { label: 'Refunded', color: 'text-slate-400',   bg: 'bg-slate-400/10'   },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    axiosClient.get(`/orders/${id}`)
      .then(res => setOrder(res.data.order))
      .catch(err => {
        toast.error(err.response?.data?.message || 'Failed to load order');
        navigate('/orders');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const status  = statusConfig[order.status]        ?? statusConfig.pending;
  const payment = paymentConfig[order.paymentStatus] ?? paymentConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
       <div className="relative dark-card overflow-hidden mb-6 px-5 py-4">
        <button
            onClick={() => navigate('/orders')}
            className="group flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-sm absolute top-4 left-5"
        >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Orders
        </button>
        <div className="text-center py-1">
            <h1 className="text-2xl font-bold text-white">{order.orderNumber}</h1>
            <p className="text-slate-500 text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                day: 'numeric', month: 'long', year: 'numeric'
            })}
            </p>
        </div>
        <button
            onClick={() => navigate('/shop')}
            className="group flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-sm absolute top-4 right-5"
        >
            Continue Shopping
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
        <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${status.bg} ${status.border}`}>
            <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
            <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
            </div>
            <div className={`px-3 py-1.5 rounded-full ${payment.bg}`}>
            <span className={`text-xs font-semibold ${payment.color}`}>{payment.label}</span>
            </div>
        </div>
        </div>
        <div className="dark-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold text-white">
              Items ({order.items?.length ?? 0})
            </h2>
          </div>

          <div className="divide-y divide-white/5">
            {order.items?.map((item: any, i: number) => {
              const imageUrl = item.product?.images?.[0]?.url
                ? `${import.meta.env.VITE_STATIC_FILE_URL}${item.product.images[0].url}`
                : `https://picsum.photos/seed/${item.productId}/80/80`;

              return (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <img
                    src={imageUrl}
                    alt={item.product?.name ?? item.productSnapshot?.name}
                    className="w-14 h-14 rounded-lg object-cover bg-slate-800 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.productId}/80/80`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {item.product?.name ?? item.productSnapshot?.name}
                    </p>
                    {item.productSnapshot?.brand && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.productSnapshot.brand}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-0.5">
                      Qty: {item.quantity} × R{Number(item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                  <span className="font-semibold text-white whitespace-nowrap">
                    R{Number(item.totalPrice).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-4 border-t border-white/5 space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span>R{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Shipping</span>
              <span className="text-emerald-400">FREE</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-slate-400">
                <span>Discount</span>
                <span className="text-emerald-400">-R{Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-white pt-2 border-t border-white/5">
              <span>Total</span>
              <span className="text-blue-400 text-lg">R{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
        {order.shippingAddress && (
          <div className="dark-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-blue-400" />
              <h2 className="font-semibold text-white">Delivery Address</h2>
            </div>
            <div className="text-sm text-slate-400 space-y-1">
              <p className="text-white font-medium">{order.shippingAddress.recipientName}</p>
              <p>{order.shippingAddress.streetAddress}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}</p>
              <p>{order.shippingAddress.suburb ? `${order.shippingAddress.suburb}, ` : ''}{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
              <p>📞 {order.shippingAddress.phone}</p>
            </div>
          </div>
        )}
        <div className="dark-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold text-white">Payment</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Method</span>
              <span className="text-white capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className={`font-semibold ${payment.color}`}>{payment.label}</span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-slate-400">Paid At</span>
                <span className="text-white">
                  {new Date(order.paidAt).toLocaleDateString('en-ZA', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}