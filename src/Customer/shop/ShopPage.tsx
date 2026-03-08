
import { useState, useEffect } from 'react';
import { useAllProducts } from '@/hooks/useProducts';
import { useAllCategories } from '@/hooks/useCategories';
import { CategorySelect } from '@/components/category/CategorySelect';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from './ProductCard';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const urlSearch = searchParams.get('search') || undefined;
  const urlCategory = searchParams.get('category') || undefined;

  const { data: categoriesArray } = useAllCategories(true);
  const { data, isLoading } = useAllProducts({
    page,
    limit: 20,
    search: urlSearch, 
    categoryId: urlCategory,
    sortBy: 'createdAt',
    order: 'DESC',
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="min-h-screen bg-slate text-white">
      <div className="bg-slate sticky top-[104px] z-10"> 
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">
              {urlSearch ? `Results for "${urlSearch}"` : "All Products"}
            </h1>
            <p className="text-sm text-white">{data?.pagination?.total || 0} products found</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-96 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
            <button 
              onClick={() => setSearchParams({})} 
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
{products && products.map((product:any) => (
  product?.id && <ProductCard key={product.id} product={product} />
))}

            </div>
{Number(pagination?.totalPages) > 1 && (
  <div className="flex justify-center items-center gap-4 mt-12 mb-10">
    <button
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setPage(p => Math.max(1, p - 1));
      }}
      disabled={page === 1}
      className="flex items-center px-5 py-2 border-2 border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
    >
      Previous
    </button>
    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
      <span className="text-slate-500 text-sm">Page</span>
      <span className="font-black text-blue-600">{page}</span>
      <span className="text-slate-500 text-sm">of {pagination.totalPages}</span>
    </div>
    <button
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setPage(p => Math.min(pagination.totalPages, p + 1));
      }}
      disabled={page >= pagination.totalPages}
      className="flex items-center px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
    >
      Next
    </button>
  </div>
)}
</>
  )}
</div>
</div>
);
}