import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Menu } from '../types';

interface CartItem extends Menu {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (menu: Menu) => void;
  removeItem: (menuId: string) => void;
  decreaseQuantity: (menuId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      addItem: (menu: Menu) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i: CartItem) => i.id === menu.id);

        if (existingItem) {
          set({
            items: currentItems.map((i: CartItem) =>
              i.id === menu.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...currentItems, { ...menu, quantity: 1 }] });
        }
      },
      removeItem: (menuId: string) => {
        set({ items: get().items.filter((i: CartItem) => i.id !== menuId) });
      },
      decreaseQuantity: (menuId: string) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i: CartItem) => i.id === menuId);
        
        if (existingItem?.quantity === 1) {
          set({ items: currentItems.filter((i: CartItem) => i.id !== menuId) });
        } else {
          set({
            items: currentItems.map((i: CartItem) =>
              i.id === menuId ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => get().items.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0),
    }),
    {
      name: 'food-cart-storage', // Menyimpan cart di localStorage otomatis
    }
  )
);