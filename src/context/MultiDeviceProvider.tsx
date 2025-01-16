"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";

interface MultiDeviceState {
  players: string[];
  currentGame: string | null;
}

type MultiDeviceAction =
  | { type: "ADD_PLAYER"; payload: string }
  | { type: "SET_CURRENT_GAME"; payload: string };

const initialState: MultiDeviceState = {
  players: [],
  currentGame: null,
};

const multiDeviceReducer = (state: MultiDeviceState, action: MultiDeviceAction): MultiDeviceState => {
  switch (action.type) {
    case "ADD_PLAYER":
      return { ...state, players: [...state.players, action.payload] };
    case "SET_CURRENT_GAME":
      return { ...state, currentGame: action.payload };
    default:
      return state;
  }
};

const MultiDeviceContext = createContext<{
  state: MultiDeviceState;
  dispatch: React.Dispatch<MultiDeviceAction>;
} | undefined>(undefined);

export const MultiDeviceProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(multiDeviceReducer, initialState);

  return (
    <MultiDeviceContext.Provider value={{ state, dispatch }}>
      {children}
    </MultiDeviceContext.Provider>
  );
};

export const useMultiDevice = () => {
  const context = useContext(MultiDeviceContext);
  if (!context) {
    throw new Error("useMultiDevice must be used within a MultiDeviceProvider");
  }
  return context;
};
