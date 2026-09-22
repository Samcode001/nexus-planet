import { createSlice } from "@reduxjs/toolkit";

interface SocketState {
  socket: WebSocket | null;
}

const initialState: SocketState = {
  socket: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocketData: (state, action) => {
      state.socket = action.payload.socket;
    },
  },
});

export const { setSocketData } = socketSlice.actions;
export default socketSlice.reducer;
