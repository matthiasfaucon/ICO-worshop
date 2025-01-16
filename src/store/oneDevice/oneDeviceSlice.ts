import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OneDeviceState {
  user: string | null;
  settings: Record<string, any>;
}

const initialState: OneDeviceState = {
  user: null,
  settings: {},
};

const oneDeviceSlice = createSlice({
  name: "oneDevice",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<string>) {
      state.user = action.payload;
    },
    updateSettings(state, action: PayloadAction<Record<string, any>>) {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

export const { setUser, updateSettings } = oneDeviceSlice.actions;

export default oneDeviceSlice.reducer;
