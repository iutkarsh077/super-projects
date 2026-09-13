import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "../features/UserSlices"
const store = configureStore({
    reducer: {
        user: UserSlice
    }
})

export default store;