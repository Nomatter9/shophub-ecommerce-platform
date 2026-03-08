import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Package, Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import axiosClient from '@/axiosClient';
import { toast } from 'sonner';

interface Order {
  id: number;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  createdAt: string;
  items?: any[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:    { label: 'Pending',    color: 'text-amber-400',   bg: 'bg-amber-400/10',   icon: Clock        },
  confirmed:  { label: 'Confirmed',  color: 'text-blue-400',    bg: 'bg-blue-400/10',    icon: CheckCircle  },
  processing: { label: 'Processing', color: 'text-violet-400',  bg: 'bg-violet-400/10',  icon: RefreshCw    },
  shipped:    { label: 'Shipped',    color: 'text-sky-400',     bg: 'bg-sky-400/10',     icon: Package      },
  delivered:  { label: 'Delivered',  color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle  },
  cancelled:  { label: 'Cancelled',  color: 'text-red-400',     bg: 'bg-red-400/10',     icon: XCircle      },
  refunded:   { label: 'Refunded',   color: 'text-slate-400',   bg: 'bg-slate-400/10',   icon: RefreshCw    },
};

const paymentConfig: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Pending',  color: 'text-amber-400'   },
  paid:     { label: 'Paid',     color: 'text-emerald-400' },
  failed:   { label: 'Failed',   color: 'text-red-400'     },
  refunded: { label: 'Refunded', color: 'text-slate-400'   },
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get('/orders');
        setOrders(data.orders || []);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-7 h-7 text-blue-500" />
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>

          <div className="space-y-4">
            {orders.map((order) => {
              const status  = statusConfig[order.status]  ?? statusConfig.pending;
              const payment = paymentConfig[order.paymentStatus] ?? paymentConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="dark-card p-5 cursor-pointer hover:border-slate-600 transition-all group"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{order.orderNumber}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                          {order.items && (
                            <span className="ml-2 text-slate-600">
                              · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">

                      <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg}`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                        <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                      </div>
                      <span className={`hidden md:block text-xs font-medium ${payment.color}`}>
                        {payment.label}
                      </span>
                      <span className="font-bold text-white text-sm whitespace-nowrap">
                        R{Number(order.total).toFixed(2)}
                      </span>

                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>

                  <div className={`sm:hidden mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit ${status.bg}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                    <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
}