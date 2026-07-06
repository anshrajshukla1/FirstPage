import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";
import { syncUserApi } from "@/services/auth-service";

// ── State ──────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// ── Async thunks ───────────────────────────────────────────────────────

export const syncUser = createAsyncThunk(
  "auth/syncUser",
  async (
    payload: {
      firebaseUid: string;
      email: string;
      displayName: string;
      photoUrl: string | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const user = await syncUserApi(payload);
      return user;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to sync user";
      return rejectWithValue(message);
    }
  },
);

// ── Slice ──────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(syncUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setToken, setLoading, setError, clearError, logout } =
  authSlice.actions;

export default authSlice.reducer;
