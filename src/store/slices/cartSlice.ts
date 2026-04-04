import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  isHydrated: boolean;
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  isHydrated: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (!existingItem) {
        state.totalQuantity += newItem.quantity;
        state.totalAmount = Math.round((state.totalAmount + newItem.price * newItem.quantity) * 100) / 100;
        state.items.push(newItem);
      } else {
        state.totalQuantity += newItem.quantity;
        state.totalAmount = Math.round((state.totalAmount + existingItem.price * newItem.quantity) * 100) / 100;
        existingItem.quantity += newItem.quantity;
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount = Math.round((state.totalAmount - existingItem.price * existingItem.quantity) * 100) / 100;
        state.items = state.items.filter((item) => item.id !== id);
      }
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
    hydrateCart(state, action: PayloadAction<CartState>) {
      return {
        ...action.payload,
        isHydrated: true
      };
    },
    setHydrated(state) {
      state.isHydrated = true;
    }
  },
});

export const { addToCart, removeFromCart, clearCart, hydrateCart, setHydrated } = cartSlice.actions;
export default cartSlice.reducer;
