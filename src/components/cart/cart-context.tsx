'use client';

import { createContext, useContext, useOptimistic, useTransition, ReactNode } from 'react';
import { Cart, CartItem } from '@/types';
import { addItem, removeItem, updateItemQuantity } from '@/lib/shopify/actions';

type CartContextType = {
  cart: Cart | null;
  isPending: boolean;
  addToCart: (variantId: string) => void;
  updateQuantity: (lineId: string, variantId: string, quantity: number) => void;
  removeFromCart: (lineId: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  initialCart,
}: {
  children: ReactNode;
  initialCart: Cart | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCart, setOptimisticCart] = useOptimistic(initialCart);

  const handleAddToCart = (variantId: string) => {
    startTransition(async () => {
      await addItem(variantId);
    });
  };

  const handleUpdateQuantity = (lineId: string, variantId: string, quantity: number) => {
    if (optimisticCart) {
      setOptimisticCart({
        ...optimisticCart,
        lines: quantity === 0
          ? optimisticCart.lines.filter((l) => l.id !== lineId)
          : optimisticCart.lines.map((l) =>
              l.id === lineId ? { ...l, quantity } : l
            ),
      });
    }

    startTransition(async () => {
      await updateItemQuantity(lineId, variantId, quantity);
    });
  };

  const handleRemoveFromCart = (lineId: string) => {
    if (optimisticCart) {
      setOptimisticCart({
        ...optimisticCart,
        lines: optimisticCart.lines.filter((l) => l.id !== lineId),
        totalQuantity: optimisticCart.totalQuantity - 1,
      });
    }

    startTransition(async () => {
      await removeItem(lineId);
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart,
        isPending,
        addToCart: handleAddToCart,
        updateQuantity: handleUpdateQuantity,
        removeFromCart: handleRemoveFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
