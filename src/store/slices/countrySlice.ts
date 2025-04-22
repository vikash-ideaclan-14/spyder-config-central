import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Country } from '@/services/api';

interface CountryState {
  countries: Country[];
  selectedCountry: Country | null;
  loading: boolean;
  error: string | null;
}

const initialState: CountryState = {
  countries: [],
  selectedCountry: null,
  loading: false,
  error: null,
};

const countrySlice = createSlice({
  name: 'country',
  initialState,
  reducers: {
    setCountries: (state, action: PayloadAction<Country[]>) => {
      state.countries = action.payload;
    },
    setSelectedCountry: (state, action: PayloadAction<Country | null>) => {
      state.selectedCountry = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addCountry: (state, action: PayloadAction<Country>) => {
      state.countries.push(action.payload);
    },
    updateCountry: (state, action: PayloadAction<Country>) => {
      const index = state.countries.findIndex(country => country.id === action.payload.id);
      if (index !== -1) {
        state.countries[index] = action.payload;
      }
    },
    deleteCountry: (state, action: PayloadAction<string>) => {
      state.countries = state.countries.filter(country => country.id !== action.payload);
    },
  },
});

export const {
  setCountries,
  setSelectedCountry,
  setLoading,
  setError,
  addCountry,
  updateCountry,
  deleteCountry,
} = countrySlice.actions;

export default countrySlice.reducer; 