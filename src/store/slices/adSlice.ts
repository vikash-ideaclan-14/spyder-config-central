import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ad, adApi, AdsResponse } from '@/services/api';
import { AppThunk } from '..';

interface AdState {
  adsData: AdsResponse;
  selectedAd: Ad | null;
  loading: boolean;
  error: string | null;
  filters: {
    batchId: string | null;
    companyName: string | null;
    countryName: string | null;
    domainName: string | null;
    languageName: string | null;
    vendorName: string | null;
  };
  appliedFilters: Record<string, string | null>;
}

const initialState: AdState = {
  adsData: {
    ads: {
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
  selectedAd: null,
  loading: false,
  error: null,
  filters: {
    batchId: null,
    companyName: null,
    countryName: null,
    domainName: null,
    languageName: null,
    vendorName: null
  },
  appliedFilters: {}
};

const adSlice = createSlice({
  name: 'ad',
  initialState,
  reducers: {
    setAds: (state, action: PayloadAction<AdsResponse>) => {
      state.adsData = action.payload;
    },
    setSelectedAd: (state, action: PayloadAction<Ad | null>) => {
      state.selectedAd = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<AdState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setAppliedFilters: (state, action: PayloadAction<Record<string, string | null>>) => {
      state.appliedFilters = action.payload;
    },
    removeFilter: (state, action: PayloadAction<string>) => {
      const { [action.payload]: removed, ...remaining } = state.appliedFilters;
      state.appliedFilters = remaining;
      state.filters = { ...state.filters, [action.payload]: null };
    },
    clearAllFilters: (state) => {
      state.filters = {
        batchId: null,
        companyName: null,
        countryName: null,
        domainName: null,
        languageName: null,
        vendorName: null
      };
      state.appliedFilters = {};
    },
    addAd: (state, action: PayloadAction<Ad>) => {
      state.adsData.ads.items.unshift(action.payload);
      state.adsData.ads.pagination.total += 1;
    },
    updateAd: (state, action: PayloadAction<Ad>) => {
      const index = state.adsData.ads.items.findIndex(ad => ad.id === action.payload.id);
      if (index !== -1) {
        state.adsData.ads.items[index] = action.payload;
      }
    },
    deleteAd: (state, action: PayloadAction<string>) => {
      state.adsData.ads.items = state.adsData.ads.items.filter(ad => ad.id !== action.payload);
      state.adsData.ads.pagination.total -= 1;
    }
  }
});

export const {
  setAds,
  setSelectedAd,
  setLoading,
  setError,
  setFilters,
  setAppliedFilters,
  removeFilter,
  clearAllFilters,
  addAd,
  updateAd,
  deleteAd
} = adSlice.actions;

export default adSlice.reducer;
