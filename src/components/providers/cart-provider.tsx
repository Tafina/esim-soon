"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface CartContextType {
  sessionId: string;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (packageCode: string, quantity?: number) => Promise<void>;
  removeFromCart: (packageCode: string) => Promise<void>;
  updateQuantity: (packageCode: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function generateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("simlak_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem("simlak_session_id", sessionId);
  }
  return sessionId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setSessionId(generateSessionId());
  }, []);

  const cart = useQuery(
    api.cart.getCart,
    sessionId ? { sessionId } : "skip"
  );

  const addToCartMutation = useMutation(api.cart.addToCart);
  const removeFromCartMutation = useMutation(api.cart.removeFromCart);
  const updateCartItemMutation = useMutation(api.cart.updateCartItem);
  const clearCartMutation = useMutation(api.cart.clearCart);

  const addToCart = async (packageCode: string, quantity = 1) => {
    if (!sessionId) return;
    await addToCartMutation({ sessionId, packageCode, quantity });
    setIsCartOpen(true);
  };

  const removeFromCart = async (packageCode: string) => {
    if (!sessionId) return;
    await removeFromCartMutation({ sessionId, packageCode });
  };

  const updateQuantity = async (packageCode: string, quantity: number) => {
    if (!sessionId) return;
    await updateCartItemMutation({ sessionId, packageCode, quantity });
  };

  const clearCart = async () => {
    if (!sessionId) return;
    await clearCartMutation({ sessionId });
  };

  return (
    <CartContext.Provider
      value={{
        sessionId,
        itemCount: cart?.itemCount ?? 0,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
