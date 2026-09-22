import { configureStore } from "@reduxjs/toolkit";
import socketReducer from "./socket/socketSlice";
import proximityReducer from "./Proximity/proximitySlice";
import userReducer from "./user/userSlice";

export const store = configureStore({
  reducer: {
    socket: socketReducer,
    proximity: proximityReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ← disable serializable warnings
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
