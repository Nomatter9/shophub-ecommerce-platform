import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "@/Customer/context/CartContext";
import axiosClient from "@/axiosClient";
import { CheckCircle, Package, Truck, ArrowRight, Loader2 } from "lucide-react";

function ConfettiField() {
  const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];
  return (
    <>
      {Array.from({ length: 30 }, (_, i) => {
        const size = 6 + Math.random() * 12;
        return (
          <div
            key={i}
            style={{
              position: "fixed",
              left: `${Math.random() * 100}%`,
              top: "-20px",
              width: `${size}px`,
              height: `${size}px`,
              background: colors[i % colors.length],
              borderRadius: i % 3 === 0 ? "2px" : "50%",
              opacity: 0,
              animation: `confettiFall ${3 + Math.random() * 4}s ease-in ${Math.random() * 3}s forwards`,
              zIndex: 9999,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { fetchCartItems } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    fetchCartItems();
    if (orderId) {
      axiosClient.get(`/orders/${orderId}`)
        .then(res => setOrder(res.data.order))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
    const t = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(t);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1224] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const rows = [
    { label: "Order Number", value: order?.orderNumber ?? "—",      mono: true  },
    { label: "Date",         value: order ? new Date(order.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : "—" },
    { label: "Payment",      value: order?.paymentMethod ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1) : "Card" },
    { label: "Status",       value: "confirmed", badge: true },
  ];

  return (
    <div className="min-h-screen bg-[#0B1224] py-12 px-4 relative overflow-hidden">
      <div className="fixed top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-green-500/[0.07] blur-3xl pointer-events-none animate-float-bg" />

      {showConfetti && <ConfettiField />}

      <div className="max-w-[520px] mx-auto relative z-10 flex flex-col gap-4">
        <div className="animate-fade-slide-up dark-card p-10 text-center">
          <div className="animate-pop-in animate-glow-pulse w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-11 h-11 text-green-500" />
          </div>
          <h1 className="text-[1.75rem] font-bold text-slate-100 tracking-tight mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-slate-500 text-[0.95rem]">
            Thank you! Your order is confirmed and being processed.
          </p>
        </div>
        <div className="animate-fade-slide-up-d1 dark-card p-6">
          <h2 className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-widest mb-4">
            <Package className="w-3.5 h-3.5 text-blue-500" />
            Order Details
          </h2>

          <div className="flex flex-col">
            {rows.map((row, i) => (
              <div
                key={i}
                className={`flex justify-between items-center py-2.5 ${i < rows.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <span className="text-slate-500 text-sm">{row.label}</span>
                {row.badge ? (
                  <span className="text-xs font-semibold text-green-400 bg-green-500/15 border border-green-500/30 px-3 py-0.5 rounded-full">
                    Confirmed
                  </span>
                ) : (
                  <span className={`text-sm font-medium text-slate-200 ${row.mono ? "font-mono" : ""}`}>
                    {row.value}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-500/[0.08] border border-blue-500/20 rounded-xl flex justify-between items-center">
            <span className="text-slate-400 font-medium">Total Paid</span>
            <span className="text-blue-400 text-2xl font-bold font-mono">
              R{Number(order?.total ?? 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="animate-fade-slide-up-d3 dark-card p-4 flex items-center gap-3 border-blue-500/20">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-blue-300 text-sm font-semibold">Estimated Delivery</p>
            <p className="text-slate-500 text-xs">3–5 business days.</p>
          </div>
        </div>

        <div className="animate-fade-slide-up-d4 flex flex-col gap-3">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-700 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,130,246,0.4)] text-white text-[0.95rem] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
          >
            View Order <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-transparent hover:bg-white/[0.06] hover:-translate-y-0.5 border border-white/10 rounded-xl text-slate-400 text-[0.95rem] font-medium transition-all duration-200"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}