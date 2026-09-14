import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    currentChatSessionId: null
}


const UserSlice = createSlice({
    name: "UserInfoSlice",
    initialState,
    reducers: {
        loggedInUser: (state, action) => {
            state.user = JSON.parse(localStorage.getItem("authUser")) || null;
        },
        addCurrentChatSession: (state, action) => {
            state.currentChatSessionId = action.payload.id
        }
    }
})

export const { loggedInUser, addCurrentChatSession } = UserSlice.actions;

export default UserSlice.reducer;