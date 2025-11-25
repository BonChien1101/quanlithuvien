import { configureStore } from '@reduxjs/toolkit';
import reducer, { setAuth, logout } from '../features/appSlice';

test('setAuth sets token and roles then logout clears', () => {
  const store = configureStore({ reducer: { app: reducer }});
  store.dispatch(setAuth({ token: 'abc', roles: ['ADMIN','LIBRARIAN'] }));
  let state = store.getState().app;
  expect(state.token).toBe('abc');
  expect(state.roles).toContain('ADMIN');
  store.dispatch(logout());
  state = store.getState().app;
  expect(state.token).toBeUndefined();
  expect(state.roles).toHaveLength(0);
});
