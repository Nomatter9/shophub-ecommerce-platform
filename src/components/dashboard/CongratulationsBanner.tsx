// components/dashboard/CongratulationsBanner.tsx
export default function CongratulationsBanner() {
  return (
    <div className="bg-gradient-to-br from-[#3b4a8c] via-[#2d3666] to-[#1f2851] rounded-2xl p-6 shadow-card relative overflow-hidden h-full">
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white mb-2">
          Congratulations Jhon 🎉
        </h2>
        <p className="text-white/80 text-sm mb-6">
          You are the best seller of this month
        </p>
        <p className="text-5xl font-bold text-white mb-2">$168.5K</p>
        <p className="text-white/70 text-sm mb-6">58% of sales target</p>
        <button className="bg-accent-pink hover:bg-accent-pink/90 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors">
          View Details
        </button>
      </div>
      
      <div className="absolute bottom-8 right-8">
        <div className="relative">
          <div className="text-7xl">🎁</div>
          <div className="absolute -top-2 -right-2 text-3xl">✨</div>
        </div>
      </div>
    </div>
  );
}