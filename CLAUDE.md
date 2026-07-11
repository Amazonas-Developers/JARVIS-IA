# Chat con LM Studio

Cliente de chat en el navegador para un servidor **LM Studio** remoto (API compatible con OpenAI), con historial de conversaciones persistente y búsqueda web opcional vía **Tavily**.

## Origen del proyecto

Migrado el **2026-07-06** desde un único archivo standalone (`../lm-studio-chat.html`, HTML + CSS + JS vanilla en ~800 líneas) a un proyecto React. El archivo original se conserva en la carpeta padre como referencia. La funcionalidad es 1:1 con el original y **se mantienen las mismas claves de localStorage**, así que el historial guardado con la versión HTML sigue funcionando aquí.

## Stack

| Tecnología | Versión | Notas |
|---|---|---|
| React | 19.2 | |
| Vite | 8.1 | Plugin `@vitejs/plugin-react` |
| Tailwind CSS | 4.3 | Vía `@tailwindcss/vite`; sin `tailwind.config.js` (config CSS-first con `@theme`) |
| React Router | 8.1 | Modo declarativo con `HashRouter` (rutas `/#/...` para hosting estático en Netlify), importar desde `react-router` |
| Redux Toolkit | 2.12 | Estado global de autenticación (`authSlice`); `appSlice` sigue de ejemplo |
| TypeScript | 6.0 | Estricto; alias `@/` → `src/` (definido en `tsconfig.json` y `vite.config.ts`) |
| highlight.js | 11.x | Resaltado de código; build `lib/common` (~40 lenguajes) + tema `github-dark` |
| react-markdown + remark-gfm | 10.x / 4.x | Texto enriquecido en respuestas del asistente (tablas, listas, negritas...) |
| axios | 1.x | Instancia `http` en `libs/http.ts` para backend con sesiones (aún sin uso real) |
| lucide-react | última | Iconos de toda la UI (botones, paneles, páginas) |
| pdfjs-dist + mammoth + SheetJS (xlsx, tarball CDN oficial) + jszip | últimas | Extracción de adjuntos en el navegador; carga diferida con `import()` |

## Comandos

```bash
npm run dev       # servidor de desarrollo
npm run build     # tsc (verificación de tipos) + build de producción en dist/
npm run preview   # sirve el build de producción
```

No hay tests ni linter configurados todavía.

## Estructura

```
src/
├── main.tsx                 # Entry: StrictMode + Redux Provider + BrowserRouter
├── App.tsx                  # Solo renderiza AppRoutes
├── styles/index.css         # Tailwind + tema (@theme) + globales (scrollbar, body)
├── routes/
│   ├── AppRoutes.tsx        # Definición central de rutas
│   ├── ProtectedRoute.tsx   # Guard/layout: exige sesión (Outlet), si no redirige a /login
│   ├── PublicOnlyRoute.tsx  # Guard/layout inverso: si HAY sesión redirige a /dashboard (/, /login)
│   └── pages/               # Solo-invitados: / y /login · Protegidas: /dashboard y * (404)
├── components/
│   ├── brand/               # Logo Amazonas 365 (BrandLogo PNG, BrandMark SVG, BrandWordmark)
│   ├── ui/                  # Primitivas reutilizables (Button con velo, Field, ThemeToggle)
│   ├── layout/              # Sidebar (conversaciones), Header (estado conexión)
│   ├── config/              # ConfigPanel (modelo, conexión, toggle búsqueda web)
│   └── chat/                # ChatWindow, MessageBubble, ChatInput, CodeBlock, MarkdownContent
├── hooks/
│   ├── useChat.ts           # Estado central: conversaciones, mensajes, envío al modelo
│   ├── useConnection.ts     # Comprobación de conexión y lista de modelos
│   └── useSettings.ts       # Configuración (URL, temperatura, tokens, Tavily)
├── libs/
│   ├── lmStudio.ts          # Cliente API LM Studio (/v1/models, /v1/chat/completions)
│   ├── tavily.ts            # Búsqueda web + formateo de resultados como contexto
│   ├── attachments.ts       # Adjuntos: detección de tipo, extracción de texto, escalado de imágenes
│   ├── preview.ts           # Sandbox: detección HTML/SVG, doc para iframe, exportar a PDF
│   ├── conversations.ts     # Títulos, ids, export/import de conversaciones
│   ├── env.ts               # Acceso tipado a variables de entorno (único punto de lectura)
│   ├── http.ts              # Instancia axios con withCredentials (sesiones express-session)
│   ├── auth.ts              # Cliente de auth del backend (login/isAuth/logout)
│   ├── storage.ts           # Todo el acceso a localStorage (claves centralizadas)
│   └── utils.ts             # getErrorMessage, ids de mensajes UI
├── store/                   # Redux Toolkit (preparado para uso futuro)
│   ├── index.ts             # configureStore + tipos RootState/AppDispatch
│   ├── hooks.ts             # useAppSelector / useAppDispatch tipados
│   └── slices/appSlice.ts   # Slice de ejemplo (plantilla para nuevos slices)
└── types/
    ├── chat.ts              # ChatMessage, UiMessage, Conversation...
    └── api.ts               # Tipos de las APIs de LM Studio y Tavily
```

## Configuración por variables de entorno

La URL del servidor, la temperatura, el máx. de tokens y la API key de Tavily **no se editan en la GUI**: se configuran en `.env` (plantilla documentada en `.env.example`) y solo el selector de **Modelo** queda visible para el usuario.

| Variable | Uso | Fallback interno |
|---|---|---|
| `VITE_LM_STUDIO_URL` | URL del servidor LM Studio | `http://192.168.1.50:1234` |
| `VITE_TEMPERATURE` | Temperatura del modelo | `0.7` |
| `VITE_MAX_TOKENS` | Máx. tokens por respuesta | `1024` |
| `VITE_TAVILY_API_KEY` | Key de búsqueda web | vacío (la UI avisa si se activa la búsqueda sin key) |
| `VITE_API_URL` | Backend api_jarvis365 (axios `http`) | vacío (peticiones relativas al origen / proxy) |
| `VITE_API_PREFIX` | Prefijo de la API del backend | `/api_jarvis/v1` (prod; en dev del backend es `/api_jarvis_dev/v1`) |

Reglas: leer siempre vía `src/libs/env.ts` (nunca `import.meta.env` directo); los tipos de las variables están en `src/vite-env.d.ts`; se inyectan **en build**, así que cambiar el `.env` exige reiniciar `npm run dev`; al ser una SPA los valores acaban en el bundle JS (no poner secretos sensibles).

## Arquitectura y decisiones

- **Autenticación con estado global en Redux.** El backend real es `api_jarvis365` (Express + express-session, sesión por cookie). El flujo: `LoginPage` despacha el thunk `login({email,password})` → `POST {VITE_API_PREFIX}/auth/login` vía la instancia axios `http` (withCredentials); al arrancar, `App.tsx` despacha `checkAuth()` → `GET .../auth/isAuth` para restaurar la sesión tras recargar; `logout()` → `GET .../auth/logout`. El estado (`user`, `status`, `loginPending`, `error`) vive en `store/slices/authSlice.ts` y se lee con el hook `useAuth`. `ProtectedRoute` es un layout (`<Route element={<ProtectedRoute/>}>` + `Outlet`): TODAS las rutas salvo `/` y `/login` cuelgan de él — las páginas nuevas se añaden dentro del grupo protegido en `AppRoutes.tsx` y quedan protegidas automáticamente. Si no hay sesión redirige a `/login`. Su inverso `PublicOnlyRoute` envuelve `/` y `/login`: si YA hay sesión redirige a `/dashboard`, de modo que un usuario autenticado no puede volver a la landing ni al login. La verificación inicial de sesión la gestiona `App.tsx`: mientras `status` es idle/checking muestra una pantalla de carga a pantalla completa (`components/ui/LoadingScreen.tsx`) antes de renderizar cualquier ruta, evitando el parpadeo de la landing antes de redirigir. El botón de cerrar sesión y el nombre del usuario están en el Header. Endpoints/estructura verificados contra el backend real. Nota: el backend espera **email** (no user); su login devuelve el usuario y `isAuth` devuelve `dataUser`.
- **El resto del estado, en hooks (no en Redux).** `useChat` / `useConnection` / `useSettings` y `DashboardPage` los orquesta pasando props. Para migrar más estado global: crear slice en `src/store/slices/`, registrarlo en `src/store/index.ts` y consumir con los hooks tipados de `src/store/hooks.ts` (`appSlice` sigue como plantilla de ejemplo).
- **Mensajes persistidos vs. mensajes de UI.** `ChatMessage` (user/assistant) es lo que se guarda y se envía al modelo. `UiMessage` añade tipos efímeros (`system`, `error`, `web`) que solo se muestran en pantalla y nunca se persisten. Al usar búsqueda web, el contexto se antepone como mensaje `system` únicamente en la petición, sin ensuciar el historial.
- **Archivos adjuntos (todo tipo).** El clip del `ChatInput` acepta cualquier archivo; `libs/attachments.ts` los procesa EN el navegador: imágenes → data URL reescalada a ≤1024px JPEG que se envía al modelo como content part `image_url` (los Gemma del servidor tienen visión; ver `toApiMessages` en lmStudio.ts); PDF (pdfjs-dist) / Word .docx (mammoth) / Excel-ODS (SheetJS→CSV) / texto-código / ZIP (jszip lista el contenido) → texto truncado a 60k chars que se añade a `ChatMessage.content`; video/audio/RAR/otros binarios → solo metadatos. `content` es lo que ve el modelo y `displayContent` lo que ve el usuario (+ chips con `attachments` y miniaturas con `images`). `buildModelContent` antepone una instrucción explícita («el contenido ya está incluido, NO pidas que se suba de nuevo») porque los modelos pequeños respondían «súbeme el archivo» al no reconocer el contenido incrustado. Las librerías pesadas van en chunks aparte (`import()` dinámico). Ojo: las imágenes se persisten como data URL en localStorage — conversaciones con muchas imágenes pueden acercarse a la cuota (~5-10 MB).
- **Sandbox de vista previa + exportar a PDF — todo DENTRO de la app (sin pestañas nuevas).** Si un bloque de código del asistente es HTML/SVG (`libs/preview.ts` → `isPreviewable`), el `CodeBlock` muestra: «Vista previa» (iframe inline en la burbuja), «Ampliar» (`PreviewModal`, overlay a pantalla casi completa sobre el chat con re-ejecutar/PDF/cerrar, Escape para salir) y «PDF». Los iframes son sandbox aislados (`allow-scripts allow-modals` — sin `allow-same-origin`, sin acceso al documento padre ni a la sesión). El PDF (`printDocToPdf`) NO abre pestañas: monta un iframe oculto en la propia página que se autoimprime (con un `<script>` inyectado) y avisa por `postMessage` para retirarse → el navegador ofrece «Guardar como PDF». Fragmentos HTML se envuelven en una página mínima; documentos completos se usan tal cual; SVG se centra.
- **Animaciones y micro-interacciones** (guía UI/UX Pro Max): keyframes y utilidades en `index.css` (`animate-fade-up`, `animate-scale-in`, `animate-fade-in`, `.delay-1..5` para entradas escalonadas, `.aurora-blob` para el fondo decorativo, `.card-hover` para elevación al pasar el cursor). Todo con transform/opacity (60fps) y duraciones 200-300ms. `components/brand/AuroraBackground.tsx` pinta manchas de color de marca desenfocadas (gradient-mesh) en bienvenida y login. **Respeta `prefers-reduced-motion`** (media query que anula animaciones/transiciones) y hay `:focus-visible` accesible global. Las burbujas del chat entran con `animate-fade-up`.
- **Tailwind 4 CSS-first con tema Amazonas 365 (jarvis365.net).** No hay `tailwind.config.js`; toda la arquitectura vive en `src/styles/index.css`: (1) tokens crudos `--a365-*` por modo (`:root` = claro con verdes/blancos/grises, `.dark` = oscuro con toques verdes), (2) `@theme inline` los expone como utilidades (`bg-panel`, `text-muted`, `border-line`, `bg-accent-strong`...) que se re-colorean solas al cambiar de tema, (3) tokens fijos (`brand` #327B32, `lime` #B8CE30 — extraídos del logo oficial — y `code/code-header/code-line` para bloques de código siempre oscuros) y la utilidad `.glass` (glassmorphism: fondo translúcido + blur + color de borde incluido; usar `glass border`, sin `border-line`). El fondo del `body` lleva resplandores radiales de marca que dan textura al glass.
- **Modo claro/oscuro**: clase `dark` en `<html>` (`@custom-variant dark` en index.css). `useTheme` la conmuta y persiste en localStorage (`a365_theme`); un script inline en `index.html` aplica el tema guardado antes del primer render (anti-parpadeo) — si se cambia la clave hay que tocar ambos sitios. El botón `ThemeToggle` está en el Header del dashboard. Sin preferencia guardada se respeta `prefers-color-scheme`.
- **Identidad visual**: `components/brand/Logo.tsx` — `BrandLogo` usa el PNG oficial descargado de jarvis365.net (`src/assets/amazonas365-logo.png`, hero de la bienvenida), `BrandMark` es el isotipo (anillo verde + hoja lima) recreado en SVG (login) y `BrandWordmark` combina isotipo + texto (header del dashboard). Iconos: lucide-react en botones y elementos (los `Button` aceptan un icono como child y tienen "velo" hover vía `::after`).
- **localStorage centralizado** en `src/libs/storage.ts` (objeto `STORAGE_KEYS`). No usar `localStorage` directo fuera de ese archivo. Claves activas: `lmstudio_conversations_v1`, `lmstudio_current_conversation_id`, `web_search_enabled`. (Las claves `lmstudio_url` y `tavily_key` del HTML original quedaron obsoletas al pasar esos valores al `.env` y simplemente se ignoran.)
- **`useChat` usa refs** (`messagesRef`, `currentIdRef`) además de estado para leer valores actuales dentro de flujos async (evita closures obsoletos durante el envío).
- **Texto enriquecido en mensajes `assistant`**: `MarkdownContent.tsx` renderiza el Markdown con react-markdown + remark-gfm (negritas, títulos, listas, tablas, citas, hr, código inline). Los estilos de esos elementos viven en `styles/index.css` bajo `.markdown-body` (no se usa @tailwindcss/typography). Los bloques ```` ```código ```` se interceptan en el componente `pre` y se delegan en `CodeBlock.tsx`, que resalta con highlight.js — usa el lenguaje del fence si existe y es conocido, y si no lo autodetecta con `highlightAuto`. Un fence sin cerrar (respuesta cortada) también se trata como código (CommonMark). El HTML resaltado lo genera highlight.js a partir de texto plano (seguro para `dangerouslySetInnerHTML`); react-markdown no interpreta HTML crudo del modelo. El resto de tipos de mensaje (user/system/error/web) siguen siendo texto plano con `whitespace-pre-wrap`.

## Comportamiento clave (heredado del original)

- **Cambio de modelo desde el frontend con intercambio de memoria**: `fetchModels` intenta en orden `GET /api/v1/models` (todos los modelos + instancias cargadas), `GET /api/v0/models` (modelos + estado) y `/v1/models` (solo cargados, LM Studio antiguo), filtrando embeddings. El selector marca ● cargado / ○ disponible. Al enviar con un modelo NO cargado, `useChat` primero descarga las instancias en memoria con `POST /api/v1/models/unload {instance_id}` (libera la VRAM — sin esto la carga del segundo modelo da HTTP 400 por memoria insuficiente) y después la petición de chat dispara la carga JIT del nuevo (requiere «Just-in-Time model loading» activo en Developer del servidor). La UI avisa de la descarga/carga y `connection.refresh()` re-lee los estados tras cada respuesta. Flujo completo verificado contra el servidor real (unload instantáneo; carga JIT del 12B ≈ 56 s).

- Al cargar: restaura la última conversación abierta (o la más reciente, o crea una nueva) y comprueba la conexión automáticamente contra `VITE_LM_STUDIO_URL`.
- Las conversaciones nuevas vacías **no** aparecen en el sidebar hasta que tienen al menos un mensaje.
- Enter envía, Shift+Enter hace salto de línea; el textarea crece hasta 160px.
- Export descarga un `.json` con todas las conversaciones; import fusiona y renombra ids duplicados para no sobrescribir.
- Si la búsqueda web falla, se avisa y se continúa sin contexto web (no bloquea el envío).

## Historial

> Añadir una entrada por cada sesión de trabajo relevante, la más reciente arriba.

### 2026-07-08 — Mejora visual (UI/UX), fix de adjuntos y sandbox de código
- Sistema de animaciones en `index.css` (fade-up/scale-in/fade-in, delays escalonados, `.card-hover`, `.aurora-blob`) siguiendo la skill UI/UX Pro Max: transform/opacity, 200-300ms, `prefers-reduced-motion` y `:focus-visible` accesibles.
- `AuroraBackground` (gradient-mesh de marca) en bienvenida y login; entradas escalonadas y hover-lift en las tarjetas; micro-interacciones en botones, sidebar y ThemeToggle; burbujas del chat con fade-up.
- Fix del bug de adjuntos: `buildModelContent` reencuadra el contenido con una instrucción explícita para que el modelo NO pida subir de nuevo el archivo ya incrustado; los binarios/errores de extracción se señalan aparte.
- Sandbox: `libs/preview.ts` + `CodeBlock` con «Vista previa» (iframe sandbox aislado que ejecuta el HTML/SVG generado, con re-ejecutar) y «PDF» (imprimir a «Guardar como PDF»). Lógica de preview verificada con Node.
- Sandbox 100% dentro de la app: además del preview inline, «Ampliar» abre `PreviewModal` (overlay sobre el chat) y el PDF (`printDocToPdf`) imprime desde un iframe oculto en la misma página — ya no se abren pestañas nuevas.

### 2026-07-08 — Guard de invitados + pantalla de carga de sesión
- `PublicOnlyRoute` (layout): un usuario ya autenticado que va a `/` o `/login` es redirigido a `/dashboard` (no vuelve a la landing ni al login).
- `App.tsx` muestra `LoadingScreen` (pantalla completa, marca Amazonas 365) mientras se comprueba la sesión al arrancar; elimina el parpadeo de la landing antes de la redirección. `LoadingScreen` reutilizado también en `ProtectedRoute`.

### 2026-07-08 — Autenticación real (api_jarvis365) + Redux + rutas protegidas
- Conectado el login al backend real `api_jarvis365`: `POST /api_jarvis/v1/auth/login` con `{ email, password }` (antes se asumía `user`); `GET .../auth/isAuth` para restaurar sesión y `GET .../auth/logout`.
- Estado global de auth en Redux (`authSlice` con thunks `login`/`logout`/`checkAuth`); hook `useAuth`; nuevo `libs/auth.ts` y tipos `types/auth.ts`.
- `/dashboard` protegida con `ProtectedRoute` (cargador durante la verificación, redirect a `/login` si no hay sesión); `App.tsx` verifica la sesión al arrancar; Header con nombre de usuario y botón de logout.
- Nueva variable `VITE_API_PREFIX` (`/api_jarvis/v1`). Endpoints y respuestas verificados contra el backend real (login 404/JSON con `message`, isAuth 401 sin sesión).
- Pendiente al desplegar: añadir el dominio Netlify del chat IA al CORS del backend (`src/config/origins.js`).

### 2026-07-08 — Adjuntar archivos de todo tipo en el chat
- Botón de clip en `ChatInput` (acepta múltiples archivos de cualquier tipo) con chips de estado (procesando/listo/error) y quitables.
- `libs/attachments.ts`: imágenes → visión (content parts `image_url`, reescaladas a 1024px JPEG); PDF/Word/Excel/CSV/texto/código → texto extraído en el navegador e inyectado al mensaje; ZIP → listado de contenido; video/audio/RAR → metadatos.
- `ChatMessage` ganó `displayContent`/`attachments`/`images`; `toApiMessages` en lmStudio.ts arma el formato multimodal OpenAI; burbujas del usuario muestran miniaturas y chips.
- Extractores verificados con Node (Excel→CSV, ZIP→listado, DOCX→texto); pdfjs/mammoth/xlsx/jszip en chunks diferidos.

### 2026-07-08 — Intercambio de modelos: descargar el anterior antes de cargar el nuevo
- Cambiar a un modelo no cargado daba HTTP 400: la carga JIT intentaba montar el segundo modelo con el primero aún en VRAM.
- `fetchModels` ahora prefiere `GET /api/v1/models` (API REST v1), que expone las instancias cargadas; nuevo `unloadModel()` llama a `POST /api/v1/models/unload {instance_id}`.
- Antes de enviar con un modelo sin cargar, `useChat` descarga todas las instancias en memoria («Liberando memoria del servidor...») y luego el chat completion dispara la carga JIT del nuevo. Si el unload falla se avisa pero se intenta igual.
- Verificado contra el servidor real: unload instantáneo, recarga JIT del gemma-4-12b-qat en 56 s, servidor restaurado a su estado original.

### 2026-07-08 — Cambio de modelo desde el frontend (API nativa + carga JIT)
- Antes solo se listaban los modelos ya cargados (`/v1/models`) y había que cambiar de modelo en la máquina del servidor. Ahora `fetchModels` usa `GET /api/v0/models` (API nativa de LM Studio): todos los modelos descargados con su estado, con fallback al endpoint antiguo.
- Selector con indicador ● cargado / ○ disponible; aviso de carga JIT bajo el panel cuando el modelo elegido no está cargado; mensaje de espera especial al enviar («Cargando el modelo...»).
- Preferencia por modelos cargados al autoseleccionar; `connection.refresh()` re-lee estados tras cada respuesta.
- Verificado contra el servidor real: la API nativa responde con 5 modelos (1 cargado). Requiere «Just-in-Time model loading» activado en LM Studio (Developer) para que la carga remota funcione.

### 2026-07-06 — HashRouter para Netlify
- `BrowserRouter` → `HashRouter` en `main.tsx`: las rutas van tras `#` (`/#/dashboard`), con lo que el hosting estático de Netlify siempre sirve `index.html` y no hay 404 al recargar o entrar por URL directa.
- Alternativa si algún día se quieren URLs limpias: volver a `BrowserRouter` + archivo `public/_redirects` con `/* /index.html 200`.

### 2026-07-06 — Rediseño Amazonas 365: tema claro/oscuro + glassmorphism + iconos
- Nueva arquitectura CSS basada en jarvis365.net: tokens `--a365-*` por modo mapeados con `@theme inline`; claro = verdes/blancos/grises, oscuro = base oscura con toques verdes. Colores de marca extraídos del logo oficial (#327B32 / #B8CE30).
- Modo claro/oscuro con `useTheme` + `ThemeToggle` en el header del dashboard; persiste en localStorage (`a365_theme`) con script anti-parpadeo en index.html.
- Glassmorphism (`.glass`) en header, panel de configuración, footer del chat, tarjetas de bienvenida y card del login; el body lleva resplandores de marca de fondo.
- Instalado lucide-react; iconos en todos los botones/elementos y velo hover en `Button`. Logo oficial descargado del sitio (assets) + isotipo recreado en SVG (`components/brand/Logo.tsx`).
- Los bloques de código quedan siempre oscuros (tokens fijos `code*`) para conservar el resaltado en modo claro.

### 2026-07-06 — Tres rutas: bienvenida, login y dashboard
- `/` es ahora `WelcomePage` (landing con features y CTAs); el cliente de chat completo se movió a `/dashboard` (`ChatPage` renombrada a `DashboardPage`, sin cambios de lógica).
- Nueva `/login` (`LoginPage`): formulario estilizado (usuario/correo + contraseña) que hace `POST /auth/login` con la instancia axios `http` (cookie de sesión de express-session) y navega a `/dashboard` si responde OK.
- El dashboard NO está protegido todavía: sin backend de sesiones se puede entrar directo (ver pendientes).

### 2026-07-06 — Instancia axios para autenticación por sesión (uso futuro)
- Añadido axios con la instancia `http` (`src/libs/http.ts`): `withCredentials: true` para enviar/recibir la cookie de sesión de un backend con express-session.
- Nueva variable `VITE_API_URL` (vacía = mismo origen / proxy de Vite); interceptor que normaliza errores usando el `message` que devuelva el servidor.
- Los requisitos del backend (cors con `credentials: true` y origin exacto, `sameSite`/`secure` de la cookie) están documentados en el propio archivo.
- Todavía no la consume ningún componente; el chat con LM Studio sigue usando `fetch` en `libs/lmStudio.ts`.

### 2026-07-06 — Texto enriquecido (Markdown) en las respuestas
- Añadidos react-markdown + remark-gfm: las respuestas del asistente renderizan negritas, títulos, listas, tablas, citas, separadores y código inline.
- El resaltado de sintaxis se conserva: los ```` ```fences ```` se interceptan vía el componente `pre` y siguen pasando por `CodeBlock` (highlight.js + autodetección).
- Nuevo `MarkdownContent.tsx`; estilos `.markdown-body` en `index.css`; eliminado `libs/codeBlocks.ts` (el parser manual ya no hace falta).

### 2026-07-06 — Toggle de internet integrado en el panel de configuración
- El checkbox «Activar acceso a internet» se movió a la misma fila que los botones «Comprobar conexión» / «Vaciar esta conversación» (dentro de `ConfigPanel`).
- Eliminado el componente `WebSearchPanel` (su aviso de key faltante ahora vive en `ConfigPanel`).

### 2026-07-06 — Configuración por variables de entorno y GUI simplificada
- URL del servidor, temperatura, máx. tokens y API key de Tavily pasan a `.env` (`VITE_*`), con acceso centralizado en `src/libs/env.ts` y tipos en `src/vite-env.d.ts`.
- Eliminados de la GUI los campos correspondientes: solo queda el selector de **Modelo**, los botones (Comprobar conexión / Vaciar conversación) y el toggle de búsqueda web.
- El panel de búsqueda web avisa si se activa sin `VITE_TAVILY_API_KEY` configurada.
- `storage.ts` ya no guarda URL ni key de Tavily (claves antiguas ignoradas); creados `.env` (local) y `.env.example` (plantilla versionable).

### 2026-07-06 — Resaltado de sintaxis en código generado por el modelo
- Añadido highlight.js (build `common`): bloques ```` ```lang ```` en respuestas del asistente se renderizan como `CodeBlock` con resaltado.
- Detección automática de lenguaje (`highlightAuto`) cuando el fence no declara lenguaje o no se reconoce.
- Cada bloque muestra el lenguaje detectado y un botón «Copiar».
- Nuevos archivos: `src/libs/codeBlocks.ts` (parser) y `src/components/chat/CodeBlock.tsx`.

### 2026-07-06 — Migración inicial
- Migrado `lm-studio-chat.html` (vanilla) a React 19 + Vite 8 + TypeScript 6 + Tailwind CSS 4.
- CSS separado del markup: tema en `@theme` (index.css) + utilidades Tailwind en componentes.
- Añadidos React Router 8 (rutas `/` y 404) y Redux Toolkit (configurado, sin uso real todavía).
- Estructura creada: `components/`, `hooks/`, `libs/`, `routes/`, `store/`, `types/`, `styles/`.
- Paridad funcional completa con el HTML original; mismas claves de localStorage.

## Ideas / pendientes

- [ ] Usar streaming (`stream: true`) para mostrar la respuesta del modelo token a token.
- [ ] Migrar configuración y/o conversaciones a Redux cuando crezca la app.
- [ ] Añadir ESLint + Prettier.
- [ ] Sidebar plegable en pantallas pequeñas (el slice `app` ya tiene `sidebarVisible`).
- [ ] Recrear el icono engranaje+circuitos (imagen de referencia del usuario) como SVG propio; hoy ese motivo se representa con lucide (`Cog`/`Cpu`) en la bienvenida.
