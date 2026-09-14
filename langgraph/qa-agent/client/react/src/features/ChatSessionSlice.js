import { createSlice } from "@reduxjs/toolkit";

const ChatSessionSlice = createSlice({
  name: "chatSessions",
  initialState: { sessions: [] },
  reducers: {
    setChatSessions: (state, action) => {
      state.sessions = action.payload;
    },
    clearChatSessions: (state) => {
      state.sessions = [];
    },
  },
});

export const { setChatSessions, clearChatSessions } = ChatSessionSlice.actions;
export default ChatSessionSlice.reducer;
