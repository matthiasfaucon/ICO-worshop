"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";

interface OneDeviceState {
  user: string | null;
  settings: Record<string, any>;
}

type OneDeviceAction =
  | { type: "SET_USER"; payload: string }
  | { type: "UPDATE_SETTINGS"; payload: Record<string, any> };

const initialState: OneDeviceState = {
  user: null,
  settings: {},
};

const oneDeviceReducer = (state: OneDeviceState, action: OneDeviceAction): OneDeviceState => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
};

const OneDeviceContext = createContext<{
  state: OneDeviceState;
  dispatch: React.Dispatch<OneDeviceAction>;
} | undefined>(undefined);

export const OneDeviceProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(oneDeviceReducer, initialState);

  return (
    <OneDeviceContext.Provider value={{ state, dispatch }}>
      {children}
    </OneDeviceContext.Provider>
  );
};

export const useOneDevice = () => {
  const context = useContext(OneDeviceContext);
  if (!context) {
    throw new Error("useOneDevice must be used within a OneDeviceProvider");
  }
  return context;
};
