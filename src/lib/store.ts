import { configureStore } from '@reduxjs/toolkit'
import userReducer from './reducers/users'
import gameReducer from './reducers/game'

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      game: gameReducer,
    },
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']