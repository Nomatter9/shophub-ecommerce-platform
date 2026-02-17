import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

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
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

 // Inside CartProvider in CartContext.tsx

const addToCart = (product: any, quantity: number = 1) => {
  setItems(prev => {
    const existing = prev.find(item => item.productId === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;
    const stockAvailable = product.stockQuantity ?? product.stock ?? 0;

    // Check if total would exceed stock
    if (currentQtyInCart + quantity > stockAvailable) {
      toast.error(`Cannot add more. Total in cart would exceed stock (${stockAvailable}).`);
      return prev;
    }

    if (existing) {
      toast.success(`Updated ${product.name} quantity`);
      return prev.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    }

    toast.success(`${product.name} added to cart`);
    return [...prev, {
      id: Date.now(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0]?.url || '', // We flatten the image here
      stock: stockAvailable
    }];
  });
};


  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          if (quantity > item.stock) {
            toast.error(`Only ${item.stock} items available`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.success('Cart cleared');
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};