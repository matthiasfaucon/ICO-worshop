import { combineReducers, configureStore } from "@reduxjs/toolkit";
import oneDeviceReducer from "./oneDevice/oneDeviceSlice";
import multiDeviceReducer from "./multiDevice/multiDeviceSlice";

const rootReducer = combineReducers({
  oneDevice: oneDeviceReducer,
  multiDevice: multiDeviceReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
