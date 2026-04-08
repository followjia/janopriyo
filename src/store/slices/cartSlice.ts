import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  others?: string;
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
      const existingItem = state.items.find(
        (item) => 
          item.id === newItem.id && 
          item.color === newItem.color && 
          item.size === newItem.size && 
          item.others === newItem.others
      );

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
    removeFromCart(state, action: PayloadAction<{ id: string; color?: string; size?: string; others?: string } | string>) {
      const payloadWasString = typeof action.payload === 'string';
      const payloadObject = payloadWasString
        ? { id: action.payload }
        : action.payload;
      const { id, color, size, others } = payloadObject;

      const matchingItems = state.items.filter((item) => {
        if (payloadWasString) {
          return item.id === id;
        }
        return (
          item.id === id &&
          item.color === color &&
          item.size === size &&
          item.others === others
        );
      });

      if (matchingItems.length > 0) {
        const removedQuantity = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
        const removedAmount = matchingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        state.totalQuantity -= removedQuantity;
        state.totalAmount = Math.round((state.totalAmount - removedAmount) * 100) / 100;
        state.items = state.items.filter((item) => {
          if (payloadWasString) {
            return item.id !== id;
          }
          return !(
            item.id === id &&
            item.color === color &&
            item.size === size &&
            item.others === others
          );
        });
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
