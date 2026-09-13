import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null
}


const UserSlice = createSlice({
    name: "UserInfoSlice",
    initialState,
    reducers: {
        loggedInUser: (state, action) => {
            state.user = action.payload.user
        }
    }
})

export const { loggedInUser } = UserSlice.actions;

export default UserSlice.reducer;