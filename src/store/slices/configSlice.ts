import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SpyderConfig } from '@/services/api';
import { configApi } from '@/services/api';
import { AppThunk } from '@/store';

interface ConfigState {
  configs: SpyderConfig[];
  selectedConfig: SpyderConfig | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConfigState = {
  configs: [],
  selectedConfig: null,
  loading: false,
  error: null,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfigs: (state, action: PayloadAction<SpyderConfig[]>) => {
      state.configs = action.payload;
    },
    setSelectedConfig: (state, action: PayloadAction<SpyderConfig | null>) => {
      state.selectedConfig = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addConfig: (state, action: PayloadAction<SpyderConfig>) => {
      state.configs = [action.payload, ...state.configs, ];
    },
    updateConfig: (state, action: PayloadAction<SpyderConfig>) => {
      const index = state.configs.findIndex(config => config.id === action.payload.id);
      if (index !== -1) {
        state.configs[index] = action.payload;
      }
    },
    deleteConfig: (state, action: PayloadAction<string>) => {
      state.configs = state.configs.filter(config => config.id !== action.payload);
    },
  },
});

export const {
  setConfigs,
  setSelectedConfig,
  setLoading,
  setError,
  addConfig,
  updateConfig,
  deleteConfig,
} = configSlice.actions;

// Thunk actions
export const createConfig = (values: any): AppThunk => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await configApi.createConfig(values);
    dispatch(addConfig(response));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError('Failed to create config'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchConfigs = (page: number, pageSize: number): AppThunk => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await configApi.getConfigs(page, pageSize);
    dispatch(setConfigs(response.spyderConfigs.items));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError('Failed to fetch configs'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchConfigById = (id: string): AppThunk => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await configApi.getConfigById(id);
    dispatch(setSelectedConfig(response));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError('Failed to fetch configs'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateConfigById = (id: string, values: Omit<SpyderConfig, 'id' | 'createdAt' | 'updatedAt'>): AppThunk => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await configApi.updateConfig(id, values);
    dispatch(updateConfig(response));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError('Failed to update config'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteConfigById = (id: string): AppThunk => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    await configApi.deleteConfig(id);
    dispatch(deleteConfig(id));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError('Failed to delete config'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export default configSlice.reducer; 