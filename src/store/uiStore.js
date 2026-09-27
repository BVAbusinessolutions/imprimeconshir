import { create } from 'zustand';

/**
 * Store global de UI (modales, sidebars, notificaciones, etc.)
 */
const useUIStore = create((set) => ({
  // Sidebar del carrito
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  // Modal genérico
  modal: { open: false, type: null, data: null },
  openModal: (type, data = null) => set({ modal: { open: true, type, data } }),
  closeModal: () => set({ modal: { open: false, type: null, data: null } }),

  // Sidebar de admin/nav móvil
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));

export default useUIStore;
