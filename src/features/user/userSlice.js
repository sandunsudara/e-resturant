import { createSlice } from '@reduxjs/toolkit';

export function createUserInitialState() {
  return {
    name: '',
    phoneNumber: ''
  };
}

const userSlice = createSlice({
  name: 'user',
  initialState: createUserInitialState(),
  reducers: {
    clearUserDetails(state) {
      state.name = '';
      state.phoneNumber = '';
    },
    setUserDetails(state, action) {
      const { name, phoneNumber } = action.payload || {};

      if (name !== undefined) {
        state.name = String(name).trim();
      }

      if (phoneNumber !== undefined) {
        state.phoneNumber = String(phoneNumber).trim();
      }
    }
  }
});

export const { clearUserDetails, setUserDetails } = userSlice.actions;

export function selectUserDetails(state) {
  return state.user;
}

export function selectHasUserDetails(state) {
  return Boolean(state.user.name?.trim() && state.user.phoneNumber?.trim());
}

export function selectUserName(state) {
  return state.user.name;
}

export function selectUserPhoneNumber(state) {
  return state.user.phoneNumber;
}

export default userSlice.reducer;
