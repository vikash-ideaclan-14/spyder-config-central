import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SpyderGroup } from '@/services/api';

interface GroupState {
  groups: SpyderGroup[];
  selectedGroup: SpyderGroup | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  selectedGroup: null,
  loading: false,
  error: null,
};

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<SpyderGroup[]>) => {
      state.groups = action.payload;
    },
    setSelectedGroup: (state, action: PayloadAction<SpyderGroup | null>) => {
      state.selectedGroup = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addGroup: (state, action: PayloadAction<SpyderGroup>) => {
      state.groups.push(action.payload);
    },
    updateGroup: (state, action: PayloadAction<SpyderGroup>) => {
      const index = state.groups.findIndex(group => group.id === action.payload.id);
      if (index !== -1) {
        state.groups[index] = action.payload;
      }
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter(group => group.id !== action.payload);
    },
  },
});

export const {
  setGroups,
  setSelectedGroup,
  setLoading,
  setError,
  addGroup,
  updateGroup,
  deleteGroup,
} = groupSlice.actions;

export default groupSlice.reducer; 