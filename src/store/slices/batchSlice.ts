import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SpyderBatch } from '@/services/api';

interface BatchState {
  batches: SpyderBatch[];
  selectedBatch: SpyderBatch | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

const initialState: BatchState = {
  batches: [],
  selectedBatch: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  },
};

const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    setBatches: (state, action: PayloadAction<{ items: SpyderBatch[]; pagination: BatchState['pagination'] }>) => {
      state.batches = action.payload.items;
      state.pagination = action.payload.pagination;
    },
    setSelectedBatch: (state, action: PayloadAction<SpyderBatch | null>) => {
      state.selectedBatch = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addBatch: (state, action: PayloadAction<SpyderBatch>) => {
      state.batches.push(action.payload);
      state.pagination.totalItems += 1;
      state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.pageSize);
    },
    updateBatch: (state, action: PayloadAction<SpyderBatch>) => {
      const index = state.batches.findIndex(batch => batch.id === action.payload.id);
      if (index !== -1) {
        state.batches[index] = action.payload;
      }
    },
    deleteBatch: (state, action: PayloadAction<string>) => {
      state.batches = state.batches.filter(batch => batch.id !== action.payload);
      state.pagination.totalItems -= 1;
      state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.pageSize);
    },
    setPagination: (state, action: PayloadAction<BatchState['pagination']>) => {
      state.pagination = action.payload;
    },
  },
});

export const {
  setBatches,
  setSelectedBatch,
  setLoading,
  setError,
  addBatch,
  updateBatch,
  deleteBatch,
  setPagination,
} = batchSlice.actions;

export default batchSlice.reducer; 