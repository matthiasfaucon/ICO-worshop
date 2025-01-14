import { configureStore } from '@reduxjs/toolkit'
import userReducer from './reducers/users'

export const makeStore = () => {
  return configureStore({
    reducer: userReducer,
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']