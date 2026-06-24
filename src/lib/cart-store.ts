import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  vendorId: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity: qty }] };
        }),
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "afrimarket-cart",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return window.localStorage;
        const noop: Storage = {
          length: 0,
          clear: () => {},
          getItem: () => null,
          key: () => null,
          removeItem: () => {},
          setItem: () => {},
        };
        return noop;
      }),
    },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
