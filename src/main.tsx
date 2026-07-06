import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// HashRouter: las rutas van tras "#" (/#/dashboard), así el hosting estático
// (Netlify) siempre sirve index.html y no hay 404 al recargar o entrar directo.
import { HashRouter } from 'react-router';
import { Provider } from 'react-redux';
import { store } from '@/store';
import App from '@/App';
import '@/styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </StrictMode>,
);
