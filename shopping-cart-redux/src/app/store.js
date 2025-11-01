import { configureStore } from "@reduxjs/toolkit";
import CartReducer from "../features/cart"
const store = configureStore({
    reducer: {
        cartProducts: CartReducer
    }
});

export default store;