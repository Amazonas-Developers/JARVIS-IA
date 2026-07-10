import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthStatus, AuthUser } from '@/types/auth';
import { fetchCurrentUser, loginRequest, logoutRequest } from '@/libs/auth';
import { getErrorMessage } from '@/libs/utils';

/*
  Estado global de autenticación (variable global de la app en Redux).
  Consumirlo con useAppSelector((s) => s.auth) o con el hook useAuth.
*/

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  /** true mientras se procesa el formulario de login. */
  loginPending: boolean;
  /** Mensaje de error del login (para mostrarlo en el formulario). */
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  loginPending: false,
  error: null,
};

/** Comprueba si hay sesión activa (al arrancar la app y tras recargar). */
export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  return fetchCurrentUser();
});

/** Inicia sesión con email y contraseña. */
export const login = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await loginRequest(email, password);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

/** Cierra la sesión (ignora errores de red: localmente se limpia igual). */
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await logoutRequest();
  } catch {
    // La sesión se limpia en el cliente aunque el servidor no responda.
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.status = 'checking';
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.user = action.payload;
        state.status = 'authenticated';
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
      })
      // login
      .addCase(login.pending, (state) => {
        state.loginPending = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthUser>) => {
        state.loginPending = false;
        state.user = action.payload;
        state.status = 'authenticated';
      })
      .addCase(login.rejected, (state, action) => {
        state.loginPending = false;
        state.status = 'unauthenticated';
        state.error = action.payload ?? 'No se pudo iniciar sesión.';
      })
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
