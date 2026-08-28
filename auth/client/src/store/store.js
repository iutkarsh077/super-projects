import { configureStore } from "@reduxjs/toolkit";
import UserDetailApi from "./GetUser";
import UserSlice from "../features/UserSlice";

const store = configureStore({
    reducer: {
        [UserDetailApi.reducerPath]: UserDetailApi.reducer,
        users: UserSlice
    },

    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(UserDetailApi.middleware);
    }
})



export default store;