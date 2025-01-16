import { configureStore } from "@reduxjs/toolkit";
import multiDeviceReducer from "./multiDeviceSlice";

export const multiDeviceStore = configureStore({
  reducer: {
    multiDevice: multiDeviceReducer,
  },
});

export type MultiDeviceState = ReturnType<typeof multiDeviceStore.getState>;
export type MultiDeviceDispatch = typeof multiDeviceStore.dispatch;
