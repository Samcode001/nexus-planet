import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ProximityState {
  isNearby: boolean;
}

const initialState: ProximityState = {
  isNearby: false,
};

const proximitySlice = createSlice({
  name: "proximity",
  initialState,
  reducers: {
    setIsNearby: (state, action: PayloadAction<boolean>) => {
      state.isNearby = action.payload;
    },
  },
});

export const { setIsNearby } = proximitySlice.actions;
export default proximitySlice.reducer;
