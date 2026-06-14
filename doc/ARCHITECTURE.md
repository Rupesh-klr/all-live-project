# Frontend Architecture — all-live-project

## Technology Choices

| Concern | Solution | Why |
|---|---|---|
| Build | Vite | Sub-second HMR, ESM-native, zero config for React |
| UI framework | React 18 | Concurrent mode, ecosystem maturity |
| Styling | Tailwind CSS v3 + CSS custom properties | Utility classes for layout/spacing, CSS vars for theming |
| Routing | React Router v6 | Nested routes, loader pattern, `Navigate` guard |
| HTTP | Axios | Interceptors for auto-Bearer attach + 401 refresh |
| Encryption | CryptoJS | Same library on frontend and backend — identical encrypt/decrypt |
| Notifications | react-hot-toast | Non-blocking, theme-aware toasts |

---

## Context Architecture

```
<ThemeProvider>          ← CSS .dark class on <html>, persists to localStorage
  <AuthProvider>         ← accessToken, refreshToken, user object, login/logout
    <BrowserRouter>
      <Routes>
        Public routes (no guard)
        <AuthGuard>      ← Checks token + optional moduleAccess
          Protected routes
        </AuthGuard>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
</ThemeProvider>
```

`ThemeContext` and `AuthContext` are independent — theme works without auth, auth works in any theme.

---

## Authentication Flow

```
User submits login form
  └─ AuthContext.login(identifier, password)
       ├─ encryptPassword(password)     ← CryptoJS AES + ENCRY_MIDDLE_PROTECTION: prefix
       └─ POST /api/auth/v1/login       ← { identifier, password: "ENCRY_MIDDLE_PROTECTION:..." }
            └─ Response: { accessToken, refreshToken, user }
                 ├─ localStorage.setItem('accessToken', ...)
                 ├─ localStorage.setItem('refreshToken', ...)
                 └─ setUser(user)

Every API request
  └─ Axios request interceptor
       └─ config.headers.Authorization = 'Bearer ' + accessToken

On 401 response
  └─ Axios response interceptor
       ├─ Queue pending requests
       ├─ POST /api/auth/v1/refresh  ← { refreshToken }
       │    ├─ Success → update localStorage, drain queue, retry original
       │    └─ Failure → clearAuth(), navigate('/login')
       └─ Resume queued requests with new token
```

---

## Theming System

All colors are defined as CSS custom properties in `src/index.css`:

```css
:root {
  --bg:          #f9fafb;
  --bg-2:        #f3f4f6;
  --text:        #111827;
  --text-muted:  #6b7280;
  --border:      #e5e7eb;
}

html.dark {
  --bg:          #0f1117;
  --bg-2:        #1a1d27;
  --text:        #f3f4f6;
  --text-muted:  #6b7280;
  --border:      #1f2937;
}
```

`ThemeContext.toggle()` adds/removes the `.dark` class on `document.documentElement`. The preference is saved to `localStorage` so it persists across sessions.

No component hardcodes a color — all use `var(--*)` or Tailwind classes that reference these vars.

---

## Component Architecture

Components live in `src/components/<Name>/<Name>.jsx`. Each exports a named export (no default export) for import consistency.

```
components/
  Button/
    Button.jsx    ← variant, size, loading, icon, iconPos, fullWidth
  TextBox/
    TextBox.jsx   ← label, type, icon, error, password toggle
  Table/
    Table.jsx     ← columns[{ key, label, render }], rows, loading, emptyMessage
  Dropdown/
    Dropdown.jsx  ← trigger, items[{ label, onClick }], outside-click close
  Tooltip/
    Tooltip.jsx   ← children, content, position (top/right/bottom/left), delay
  Modal/
    Modal.jsx     ← isOpen, onClose, title, children — portal + Escape key
  Badge/
    Badge.jsx     ← role (admin/manager/viewer), optional label override
```

**Removal guide:** If you remove a component, grep for its import path before deleting. The `Table`, `Badge`, and `Button` components are used by all 4 module dashboards and the Login page.

---

## Module System

Each module is a self-contained folder under `src/modules/`:

```
modules/
  <name>/
    Dashboard.jsx   ← Main view for this module
    README.md       ← Module-specific docs
```

The module is registered in `src/App.jsx` with a protected route. The `AuthGuard` receives `requiredModule="<name>"` to enforce per-module access control based on the user's `moduleAccess` array from the JWT.

To add a module:
1. Create `src/modules/<name>/Dashboard.jsx`
2. Add the route in `App.jsx`
3. Ensure the backend has an active module with the same name (so it appears in the login banner)

---

## Encryption (ENCRY_MIDDLE_PROTECTION)

```
src/utils/encryption.js

const KEY = import.meta.env.VITE_ENCRY_MIDDLE_KEY

export function encryptField(plaintext) {
  return 'ENCRY_MIDDLE_PROTECTION:' + CryptoJS.AES.encrypt(String(plaintext), KEY).toString()
}

export function encryptPassword(password) {
  return encryptField(password)
}
```

The backend's `encryptionMiddleware` scans every field in `req.body` and `req.query`. Any value starting with `ENCRY_MIDDLE_PROTECTION:` is decrypted before the controller runs.

**Important:** `VITE_ENCRY_MIDDLE_KEY` must be byte-for-byte identical to `ENCRY_MIDDLE_KEY` in the backend `.env`.

---

## Axios API Utility

```
src/utils/api.js

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

// Request interceptor — attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      // ... queue + refresh + retry logic
    }
    return Promise.reject(error)
  }
)
```

All modules import `api` from here — no module creates its own Axios instance.
