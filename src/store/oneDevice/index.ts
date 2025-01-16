import { configureStore } from "@reduxjs/toolkit";
import oneDeviceReducer from "./oneDeviceSlice";

export const oneDeviceStore = configureStore({
  reducer: {
    oneDevice: oneDeviceReducer,
  },
});

export type OneDeviceState = ReturnType<typeof oneDeviceStore.getState>;
export type OneDeviceDispatch = typeof oneDeviceStore.dispatch;
