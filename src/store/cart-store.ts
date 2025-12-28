/**
 * Cart Store using Zustand
 * Advanced Implementation: Debounced updates, Optimistic UI, Robust Recalculations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

// --- TYPES ---

export interface CartItem {
    id: number;
    product: {
        id: string; // Product.id is now UUID string
        name: string;
        slug: string;
        price: number;
        sale_price: number | null;
        current_price: number;
        primary_image: string | null;
        stock: number;
    };
    quantity: number;
    subtotal: number;
}

export interface Cart {
    id: number;
    items: CartItem[];
    total_items: number;
    subtotal: number;
}

interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    updatingItems: Record<string, boolean>; // productId -> boolean
    debounceTimers: Record<string, NodeJS.Timeout>;
    error: string | null;

    fetchCart: (silent?: boolean) => Promise<void>;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
}

// --- MODULE STATE ---


// --- HELPERS ---

const recalculateCart = (cart: Cart): Cart => {
    const items = cart.items.map(item => ({
        ...item,
        subtotal: item.product.current_price * item.quantity
    }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const total_items = items.reduce((sum, item) => sum + item.quantity, 0); // Sum quantities or just count items? Usually sum quantities.

    return {
        ...cart,
        items,
        subtotal,
        total_items
    };
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: null,
            isLoading: false,
            updatingItems: {}, // Visual loading state (spinners)
            debounceTimers: {}, // Internal: Timer IDs for debouncing
            error: null,

            fetchCart: async (silent = false) => {
                if (!silent) set({ isLoading: true, error: null });
                try {
                    const response = await api.get('/cart/');

                    set((state) => {
                        const serverCart = response.data;
                        const currentCart = state.cart;

                        // Smart Merge: If user is actively updating items (debouncing), 
                        // we must PRESERVE their local state and not overwrite it with potentially stale server data.
                        const debouncingIds = Object.keys(state.debounceTimers || {});

                        if (!currentCart || debouncingIds.length === 0) {
                            return { cart: serverCart };
                        }

                        const mergedItems = serverCart.items.map((serverItem: CartItem) => {
                            // If this item is active, keep local version
                            if (debouncingIds.includes(serverItem.product.id)) {
                                const localItem = currentCart.items.find((i: CartItem) => i.product.id === serverItem.product.id);
                                return localItem || serverItem;
                            }
                            return serverItem;
                        });

                        // Recalculate totals since we might have mixed local/server items
                        const mergedCart = { ...serverCart, items: mergedItems };
                        return { cart: recalculateCart(mergedCart) };
                    });

                } catch (error: any) {
                    set({ error: error.response?.data?.message || 'Failed to fetch cart' });
                } finally {
                    if (!silent) set({ isLoading: false });
                }
            },

            addToCart: async (productId: string, quantity: number = 1) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/cart/add/', { product_id: productId, quantity });
                    set({ cart: response.data.cart });
                } catch (error: any) {
                    const msg = error.response?.data?.error || 'Failed to add to cart';
                    set({ error: msg });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            updateQuantity: async (productId: string, quantity: number) => {
                const prevCart = get().cart;
                if (!prevCart) return;

                // 1. Validation: Check minimum
                if (quantity < 1) return;

                // 2. Validation: Check Stock
                const item = prevCart.items.find(i => i.product.id === productId);
                if (item && quantity > item.product.stock) {
                    set({ error: `Only ${item.product.stock} items available` });
                    return;
                }

                // 3. Optimistic Update (Immediate Feedback)
                let optimisticCart = {
                    ...prevCart,
                    items: prevCart.items.map(i =>
                        i.product.id === productId ? { ...i, quantity } : i
                    )
                };
                optimisticCart = recalculateCart(optimisticCart);

                // Set optimistic state immediately
                set({
                    cart: optimisticCart,
                    error: null,
                    updatingItems: { ...get().updatingItems, [productId]: true } // Show spinner
                });

                // 4. Debounce API Call
                // Clear existing timer for this product
                const existingTimers = get().debounceTimers;
                if (existingTimers[productId]) {
                    clearTimeout(existingTimers[productId]);
                }

                // Create new timer
                const timerId = setTimeout(async () => {
                    try {
                        const cartItemId = item ? item.id : null;
                        if (cartItemId) {
                            await api.patch(`/cart/items/${cartItemId}/`, { quantity });
                            // Silent sync to ensure data integrity
                            await get().fetchCart(true);
                        }
                    } catch (error: any) {
                        // Revert on serious error
                        set({ cart: prevCart, error: error.response?.data?.error || 'Failed to update' });
                    } finally {
                        // Clear loading state
                        const { [productId]: _, ...rest } = get().updatingItems;
                        set({ updatingItems: rest });

                        // Cleanup timer from state
                        const currentTimers = get().debounceTimers;
                        const { [productId]: __, ...restTimers } = currentTimers;
                        set({ debounceTimers: restTimers });
                    }
                }, 600); // 600ms delay

                // Save timer ID
                set({ debounceTimers: { ...existingTimers, [productId]: timerId } });
            },

            removeFromCart: async (productId: string) => {
                const prevCart = get().cart;
                if (!prevCart) return;

                const item = prevCart.items.find(i => i.product.id === productId);
                if (!item) return;

                // 1. Optimistic Update
                let optimisticCart = {
                    ...prevCart,
                    items: prevCart.items.filter(i => i.product.id !== productId),
                };
                optimisticCart = recalculateCart(optimisticCart);

                set({
                    cart: optimisticCart,
                    updatingItems: { ...get().updatingItems, [productId]: true },
                    error: null
                });


                try {
                    await api.delete(`/cart/items/${item.id}/`);
                    // Sync
                    await get().fetchCart(true);
                } catch (error: any) {
                    set({ cart: prevCart, error: error.response?.data?.error || 'Failed to remove' });
                } finally {
                    const { [productId]: _, ...rest } = get().updatingItems;
                    set({ updatingItems: rest });
                }
            },

            clearCart: async () => {
                const prevCart = get().cart;
                // Optimistic Clear
                set({ cart: null, isLoading: false, error: null });

                try {
                    await api.post('/cart/clear/');
                } catch (error: any) {
                    // Revert on error
                    set({ cart: prevCart, error: error.response?.data?.error || 'Failed to clear cart' });
                }
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ cart: state.cart }),
        }
    )
);
