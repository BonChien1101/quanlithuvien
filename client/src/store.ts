import { configureStore } from '@reduxjs/toolkit';
import appReducer from './features/appSlice';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
// Typed hook giúp tránh lỗi unknown khi truy cập state
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
