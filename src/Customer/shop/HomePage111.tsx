import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Gift, Zap } from 'lucide-react';
import { useAllProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/Customer/shop/ProductCard';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  // Fetch featured products
  const { data: featuredData } = useAllProducts({
    page: 1,
    limit: 8,
    // isFeatured: true,
  });

  // Fetch new arrivals
  const { data: newArrivalsData } = useAllProducts({
    page: 1,
    limit: 8,
    sortBy: 'createdAt',
    order: 'DESC',
  });

  const featuredProducts = featuredData?.products || [];
  const newArrivals = newArrivalsData?.products || [];

  return (
    <div className="bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-pink-400 to-red-400 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold mb-4">Flash sale.</h1>
              <p className="text-3xl mb-2">Valentine's Day Gifting</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 inline-block">
                <p className="text-4xl font-bold">save up to 50%</p>
              </div>
              <p className="mt-4 text-sm">Valid 9 February Only</p>
              <Link to="/shop?filter=valentines">
                <Button className="mt-6 bg-white text-red-500 hover:bg-gray-100 text-lg px-8 py-6">
                  Shop Now <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
            <div className="hidden lg:block">
              <img
                src="/images/valentines-hero.png"
                alt="Valentine's Day"
                className="w-96 h-96 object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400?text=Valentine';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Fast Delivery</h3>
                <p className="text-sm text-gray-600">Same day in selected areas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Quality Products</h3>
                <p className="text-sm text-gray-600">Verified sellers only</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Great Deals</h3>
                <p className="text-sm text-gray-600">Daily offers & promotions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Trending Now</h3>
                <p className="text-sm text-gray-600">Popular products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Brands */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Brands</h2>
          <div className="flex items-center gap-8 overflow-x-auto pb-4">
            {['chenshia', 'imou', 'ESTÉE LAUDER', 'CLINIQUE', 'new balance'].map((brand) => (
              <Link
                key={brand}
                to={`/shop?brand=${encodeURIComponent(brand)}`}
                className="flex-shrink-0 hover:opacity-75 transition"
              >
                <div className="h-16 px-8 flex items-center justify-center bg-gray-50 rounded-lg border">
                  <span className="text-xl font-bold text-gray-700">{brand}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/shop?filter=featured">
              <Button variant="outline">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product:any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
            <Link to="/shop?filter=new">
              <Button variant="outline">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product:any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}