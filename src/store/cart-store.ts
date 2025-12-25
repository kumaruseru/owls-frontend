/**
 * Cart Store using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import Cookies from 'js-cookie';

export interface CartItem {
    id: number;
    product: {
        id: number;
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
    error: string | null;

    fetchCart: () => Promise<void>;
    addToCart: (productId: number, quantity?: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    removeFromCart: (productId: number) => Promise<void>;
    clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: null,
            isLoading: false,
            error: null,

            fetchCart: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.get('/cart/');
                    set({ cart: response.data });
                } catch (error: any) {
                    set({ error: error.response?.data?.message || 'Failed to fetch cart' });
                } finally {
                    set({ isLoading: false });
                }
            },

            addToCart: async (productId: number, quantity: number = 1) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/cart/add/', { product_id: productId, quantity });
                    set({ cart: response.data.cart });
                } catch (error: any) {
                    set({ error: error.response?.data?.error || 'Failed to add to cart' });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            updateQuantity: async (productId: number, quantity: number) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/cart/update/', { product_id: productId, quantity });
                    set({ cart: response.data.cart });
                } catch (error: any) {
                    set({ error: error.response?.data?.error || 'Failed to update cart' });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            removeFromCart: async (productId: number) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/cart/remove/', { product_id: productId });
                    set({ cart: response.data.cart });
                } catch (error: any) {
                    set({ error: error.response?.data?.error || 'Failed to remove from cart' });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            clearCart: async () => {
                set({ isLoading: true, error: null });
                try {
                    await api.post('/cart/clear/');
                    set({ cart: null });
                } catch (error: any) {
                    set({ error: error.response?.data?.error || 'Failed to clear cart' });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ cart: state.cart }),
        }
    )
);
