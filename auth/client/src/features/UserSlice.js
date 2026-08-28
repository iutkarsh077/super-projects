import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    userinfo: {}
}

const UserSlice = createSlice({
    name: "userinfo",
    initialState,

    reducers: {
        AddUserInfo: (state, action) => {
            const userDetails = action.payload;
            state.userinfo = userDetails.userDetails;
        },

        LogoutUser: (state, action) => {
            console.log("Logged out user")
            state.userinfo = null;
        }
    }
})

export const { AddUserInfo, LogoutUser } = UserSlice.actions;

export default UserSlice.reducer