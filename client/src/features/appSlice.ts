import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

type AppState = {
  initialized: boolean;
  token?: string;
  roles: string[];
};

const initialState: AppState = { initialized: true, token: undefined, roles: [] };

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{token: string; roles: string[]}>){
      state.token = action.payload.token;
      state.roles = action.payload.roles;
    },
    logout(state){
      state.token = undefined;
      state.roles = [];
    }
  }
});

export const { setAuth, logout } = appSlice.actions;
// Selectors (dùng any để tránh xung đột vòng lặp kiểu khi import RootState)
export const selectToken = (state: RootState) => (state.app as AppState).token;
export const selectRoles = (state: RootState) => (state.app as AppState).roles;
export default appSlice.reducer;
