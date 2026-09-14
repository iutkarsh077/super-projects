import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "../features/UserSlices"
import ChatSessionSlice from "../features/ChatSessionSlice";
const store = configureStore({
    reducer: {
        user: UserSlice,
        chatSessions: ChatSessionSlice,
    }
})

export default store;
