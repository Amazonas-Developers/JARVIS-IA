import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/*
  Slice de ejemplo para dejar Redux configurado y funcionando.
  Sirve de plantilla: duplica este archivo para crear nuevos slices
  (p. ej. settingsSlice, conversationsSlice) y regístralos en store/index.ts.
*/

interface AppState {
  /** Nombre visible de la app (ejemplo de estado global). */
  appName: string;
  /** Marcador para futuras banderas globales de la UI. */
  sidebarVisible: boolean;
}

const initialState: AppState = {
  appName: 'Chat con LM Studio',
  sidebarVisible: true,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSidebarVisible(state, action: PayloadAction<boolean>) {
      state.sidebarVisible = action.payload;
    },
  },
});

export const { setSidebarVisible } = appSlice.actions;
export default appSlice.reducer;
