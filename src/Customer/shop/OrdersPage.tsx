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
  pending:    { label: 'Pending',    color: 'text-amber-400',  bg: 'bg-amber-400/10',  icon: Clock },
  confirmed:  { label: 'Confirmed',  color: 'text-blue-400',   bg: 'bg-blue-400/10',   icon: CheckCircle },
  processing: { label: 'Processing', color: 'text-violet-400', bg: 'bg-violet-400/10', icon: RefreshCw },
  shipped:    { label: 'Shipped',    color: 'text-sky-400',    bg: 'bg-sky-400/10',    icon: Package },
  delivered:  { label: 'Delivered',  color: 'text-emerald-400',bg: 'bg-emerald-400/10',icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'text-red-400',    bg: 'bg-red-400/10',    icon: XCircle },
  refunded:   { label: 'Refunded',   color: 'text-slate-400',  bg: 'bg-slate-400/10',  icon: RefreshCw },
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

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-slate-900 border border-slate-800 rounded-2xl">
            <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-300 mb-2">No orders yet</h2>
            <p className="text-slate-500 mb-6">Once you place an order, it will appear here.</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-5 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Order #{order.orderNumber}</p>
                        <p className="text-slate-400 text-sm mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-slate-400 text-xs">Total</p>
                        <p className="font-bold text-white">R{Number(order.total).toFixed(2)}</p>
                      </div>

                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg}`}>
                        <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                        <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}