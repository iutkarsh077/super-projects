import { createSlice } from "@reduxjs/toolkit";

const initialCartState = {
  products: [],
};

const CartSlice = createSlice({
  name: "cartProducts",
  initialState: initialCartState,
  reducers: {
    addProducts: (state, action) => {
        const item = action.payload;
        console.log(item);
      state.products.push(item);
    },
    removeProduct: (state, action) =>{
        state.products = state.products.filter((item)=> item.id !== action.payload);
    }
  },
});

export const { addProducts, removeProduct } = CartSlice.actions;
export default CartSlice.reducer;
