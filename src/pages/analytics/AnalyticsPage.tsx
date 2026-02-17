// pages/analytics/AnalyticsPage.tsx
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Package } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="bg-bg-card border-b border-border-subtle px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-gray-400 mt-2">Track your store performance and insights</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-card hover:shadow-glow transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-accent-green/10 text-accent-green p-3 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-accent-green text-sm font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>+24%</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">Total Revenue</p>
            <p className="text-3xl font-bold text-white mt-2">R 168.5K</p>
            <p className="text-xs text-gray-500 mt-2">from last month</p>
          </div>

          <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-card hover:shadow-glow transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-accent-blue/10 text-accent-blue p-3 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-accent-green text-sm font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>+12%</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">Total Orders</p>
            <p className="text-3xl font-bold text-white mt-2">1,428</p>
            <p className="text-xs text-gray-500 mt-2">from last month</p>
          </div>

          <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-card hover:shadow-glow transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-accent-pink/10 text-accent-pink p-3 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-accent-green text-sm font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>+8%</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">Total Customers</p>
            <p className="text-3xl font-bold text-white mt-2">892</p>
            <p className="text-xs text-gray-500 mt-2">from last month</p>
          </div>

          <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-card hover:shadow-glow transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-accent-yellow/10 text-accent-yellow p-3 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-accent-red text-sm font-semibold">
                <TrendingDown className="w-4 h-4" />
                <span>-2%</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">Conversion Rate</p>
            <p className="text-3xl font-bold text-white mt-2">3.2%</p>
            <p className="text-xs text-gray-500 mt-2">from last month</p>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-card">
            <h3 className="text-xl font-semibold text-white mb-4">Revenue Overview</h3>
            <div className="h-80 bg-gradient-to-br from-primary/20 via-accent-pink/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
              <p className="text-gray-400">Chart Coming Soon</p>
            </div>
          </div>

          <div className="bg-bg-card rounded-2xl p-6 border border-border-subtle shadow-card">
            <h3 className="text-xl font-semibold text-white mb-4">Top Products</h3>
            <div className="h-80 bg-gradient-to-br from-accent-green/20 via-accent-yellow/20 to-accent-pink/20 rounded-xl flex items-center justify-center">
              <p className="text-gray-400">Chart Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}