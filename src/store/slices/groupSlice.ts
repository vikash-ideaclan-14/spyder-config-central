import { createSlice, Dispatch, PayloadAction } from '@reduxjs/toolkit';
import { groupApi, CreateSpyedGroupInput,  SpyderGroup, SpyderGroupsResponse, UpdateSpyedGroupInput } from '@/services/api';

interface GroupState {
  groupsData: SpyderGroupsResponse;
  selectedGroup: SpyderGroup | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groupsData: {
    spyedGroups: {
      items: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 10,
        sortBy: null,
        sortOrder: null,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  },
  selectedGroup: null,
  loading: false,
  error: null,
};

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<SpyderGroupsResponse>) => {
      state.groupsData = action.payload
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
      state.groupsData.spyedGroups.items.push(action.payload);
    },
    updateGroup: (state, action: PayloadAction<SpyderGroup>) => {
      const index = state.groupsData.spyedGroups.items.findIndex(group => group.id === action.payload.id);
      if (index !== -1) {
        state.groupsData.spyedGroups.items[index] = action.payload;
      }
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      state.groupsData.spyedGroups.items = state.groupsData.spyedGroups.items.filter(group => group.id !== action.payload);
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

export const createGroupData = (values: CreateSpyedGroupInput) => {
  return async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    const response = await groupApi.createGroup(values);
    dispatch(addGroup(response.createSpyedGroup));
    dispatch(setLoading(false));
  };
};

export const updateGroupData = (values: UpdateSpyedGroupInput) => {
  return async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    const response = await groupApi.updateGroup(values.id, values);
    console.log("edited group", response);
    // dispatch(updateGroup(response.updateSpyedGroup));
    dispatch(setLoading(false));
  };
};