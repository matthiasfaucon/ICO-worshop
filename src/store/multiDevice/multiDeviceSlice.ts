import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MultiDeviceState {
  players: string[];
  currentGame: string | null;
}

const initialState: MultiDeviceState = {
  players: [],
  currentGame: null,
};

const multiDeviceSlice = createSlice({
  name: "multiDevice",
  initialState,
  reducers: {
    addPlayer(state, action: PayloadAction<string>) {
      state.players.push(action.payload);
    },
    setCurrentGame(state, action: PayloadAction<string>) {
      state.currentGame = action.payload;
    },
  },
});

export const { addPlayer, setCurrentGame } = multiDeviceSlice.actions;

export default multiDeviceSlice.reducer;
