import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import batchReducer from './slices/batchSlice';
import configReducer from './slices/configSlice';
import countryReducer from './slices/countrySlice';
import groupReducer from './slices/groupSlice';

export const store = configureStore({
  reducer: {
    batch: batchReducer,
    config: configReducer,
    country: countryReducer,
    group: groupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk = (dispatch: AppDispatch, getState: () => RootState) => Promise<void>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 