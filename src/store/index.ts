import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';

/*
  Store de Redux Toolkit, configurado y conectado en main.tsx.
  Hoy el estado de la app vive en hooks locales (src/hooks); este store
  queda listo para migrar estado global en el futuro:
    1. Crear un slice en src/store/slices/<nombre>Slice.ts
    2. Registrarlo aquí en `reducer`
    3. Consumirlo con useAppSelector / useAppDispatch (src/store/hooks.ts)
*/
export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
