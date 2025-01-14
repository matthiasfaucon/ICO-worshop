import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: {
    uuid: string | null;
  };
}

const initialState: UserState = {
  user: {
    uuid: null,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUUID: (state, action: PayloadAction<string>) => {
      state.user.uuid = action.payload;
    },
  },
});

export const { setUUID } = userSlice.actions;

export default userSlice.reducer;
