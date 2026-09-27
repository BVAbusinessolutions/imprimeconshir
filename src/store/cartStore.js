import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store del carrito de compras.
 * Persiste en localStorage automáticamente.
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      /** Agrega un producto o incrementa su cantidad */
      addItem: (product) => {
        const { items } = get();
        const existing = items.find((i) => i.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      /** Elimina un ítem del carrito por ID */
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      /** Actualiza la cantidad de un ítem */
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      /** Vacía el carrito */
      clearCart: () => set({ items: [] }),

      /** Total de artículos en el carrito */
      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      /** Precio total del carrito */
      totalPrice: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-storage', // key en localStorage
    }
  )
);

export default useCartStore;
