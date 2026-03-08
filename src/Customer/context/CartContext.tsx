import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import axiosClient from '@/axiosClient';

interface CartItem {
  id: number;       
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  fetchCartItems: ()=> Promise<void>
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   fetchCartItems()
  }, []);

  const fetchCartItems = async ()=>{
  setLoading(true)
  try {
  const res = await axiosClient.get("/cart");
 setItems(normalizeItems(res.data.cart.items)) 

} catch (error) {
  toast.error("Failed to load cart")
}finally{
  setLoading(false)

}
}
  //  axiosClient.get('/cart')
  //     .then(res => setItems(normalizeItems(res.data.cart.items)))
  //     .catch(() => toast.error('Failed to load cart'))
  //     .finally(() => setLoading(false));

  const normalizeItems = (raw: any[]): CartItem[] =>
    raw.map(i => ({
      id: i.id,                             
      productId: i.productId,
      name: i.product?.name ?? i.name,        
      price: Number(i.product?.price ?? i.priceAtAdd ?? i.price),
      quantity: i.quantity,
      image: i.product?.images?.[0]?.url ?? '',
      stock: i.product?.stockQuantity ?? 0,
    }));

  const addToCart = async (product: any, quantity = 1) => {
    try {
      await axiosClient.post('/cart/items', { productId: product.id, quantity });
       await fetchCartItems()
      toast.success(`${product.name} added to cart`);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to add to cart');
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      await axiosClient.delete(`/items/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    try {
      await axiosClient.put(`/items/${id}`, { quantity });
      setItems(prev =>
        prev.map(i => i.id === id ? { ...i, quantity } : i)
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      await axiosClient.delete('/cart/items');
      setItems([]);
      toast.success('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount,fetchCartItems}}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};