import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Direction } from "../../types/common";

interface ProximityState {
  isNearby: boolean;
  joyDirection: Direction;
  isMobileView: boolean;
}

const initialState: ProximityState = {
  isNearby: false,
  joyDirection: undefined,
  isMobileView: false,
};

const proximitySlice = createSlice({
  name: "proximity",
  initialState,
  reducers: {
    setIsNearby: (state, action: PayloadAction<boolean>) => {
      state.isNearby = action.payload;
    },
    setJoyDirection: (state, action: PayloadAction<Direction>) => {
      state.joyDirection = action.payload;
    },
    setIsMobileVIew: (state, action: PayloadAction<boolean>) => {
      state.isMobileView = action.payload;
    },
  },
});

export const { setIsNearby, setJoyDirection, setIsMobileVIew } =
  proximitySlice.actions;
export default proximitySlice.reducer;
