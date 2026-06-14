# Module: auth (Frontend)

> React · Axios · CryptoJS · React Router v6

Shared authentication UI — the single entry point for all portfolio modules. One account, one login, one token refresh cycle — shared by every module dashboard.

---

## Files

| File | What it does |
|---|---|
| `Login.jsx` | Login page — module banner + 3-factor form + active modules list |
| `AuthGuard.jsx` | Route wrapper — redirects unauthenticated users back to `/login` |

---

## Login Page (`Login.jsx`)

### What renders

```
┌─────────────────────────────────────────────────────┐
│ header: portfolio.hub logo          ☀️/🌙 toggle    │
├─────────────────────────────────────────────────────┤
│ [scrolling module banner — fetched from /api/modules]│
├─────────────────────────────────────────────────────┤
│                                                     │
│  ❯ portfolio.hub~                                   │
│  Sign in                                            │
│  Access any active module with one login            │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ Username / Email / Phone         [User icon]  │  │
│  ├───────────────────────────────────────────────┤  │
│  │ Password                         [Lock icon]  │  │
│  └───────────────────────────────────────────────┘  │
│  [ Sign in ───────────────────────────────────── →] │
│                                                     │
│  Active modules (4)                                 │
│  ● telecom-optimizer   High-efficiency routing...   │
│  ● vectorshift         RAG pipeline builder...      │
│  ● banking-core        Distributed banking...       │
│  ● whatsapp-crm        WhatsApp CRM engine...       │
│                                                     │
│  © 2026 Portfolio Hub · All systems operational     │
└─────────────────────────────────────────────────────┘
```

### Module banner

Fetched on mount from `GET /api/modules` — non-critical, failure silently hides the banner:

```js
useEffect(() => {
  api.get('/api/modules')
    .then(r => setModules(r.data?.data?.modules || []))
    .catch(() => { /* banner is decorative — hide on error */ })
}, [])
```

Each module card in the scrolling banner shows:
- Module name (monospace, brand color)
- Short description
- Default users with role badges

The banner duplicates the list (`[...modules, ...modules]`) for seamless CSS marquee loop. Hover pauses the animation.

### 3-factor identifier

The identifier field accepts username, email, or phone number. The backend resolves which one it is — the frontend sends it as-is in the `identifier` field.

### Password encryption

```js
// AuthContext.login() — called when form submits
const { data } = await api.post('/api/auth/v1/login', {
  identifier,
  password: encryptPassword(password),   // ← AES encrypted before network
})
```

`encryptPassword` (from `src/utils/encryption.js`):

```js
export function encryptPassword(password) {
  return 'ENCRY_MIDDLE_PROTECTION:' + CryptoJS.AES.encrypt(password, KEY).toString()
}
```

The raw password string is never in a network request.

### Redirect preservation

After login, the user is redirected to the page they originally tried to access:

```js
const from = location.state?.from?.pathname || '/dashboard'
// ...
navigate(from, { replace: true })
```

`AuthGuard` stores the blocked path in `location.state.from` before redirecting to `/login`.

---

## AuthGuard (`AuthGuard.jsx`)

Protects any route. Used like this in `App.jsx`:

```jsx
<Route path="/telecom-optimizer" element={
  <AuthGuard requiredModule="telecom-optimizer">
    <TelecomDashboard />
  </AuthGuard>
} />
```

### What it checks

1. **Is the user authenticated?** (`isAuthenticated` from `AuthContext`)
   - No → redirect to `/login`, save current path in `location.state.from`
2. **Does the user have access to this module?** (only if `requiredModule` is provided)
   - `canAccess(module)` returns `true` if `user.moduleAccess` is empty (all modules) or includes the module name
   - No access → redirect to `/dashboard`

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | ReactNode | Yes | The protected page component |
| `requiredModule` | string | No | Module slug to check in `user.moduleAccess` |

### Loading state

While `AuthContext` is restoring the session from `localStorage` (initial app load), `AuthGuard` renders nothing to avoid a flash of the login redirect. The `loading` flag from `AuthContext` gates this.

---

## AuthContext API

Exposed via `useAuth()`:

```js
const {
  user,            // { _id, username, email, role, moduleAccess, displayName, ... }
  loading,         // true while session is being restored from localStorage
  isAuthenticated, // !!user
  login,           // async (identifier, password) → user object
  logout,          // async () → clears localStorage, calls /api/auth/v1/logout
  hasRole,         // (role: string) → boolean
  canAccess,       // (module: string) → boolean
} = useAuth()
```

`canAccess` logic:

```js
const canAccess = (module) =>
  !user?.moduleAccess?.length || user.moduleAccess.includes(module)
// Empty moduleAccess = access all modules
```

---

## Session persistence

On app load, `AuthProvider` reads from `localStorage`:

```js
useEffect(() => {
  const token = localStorage.getItem('accessToken')
  const stored = localStorage.getItem('user')
  if (token && stored) {
    try { setUser(JSON.parse(stored)) } catch { /* corrupt — ignore */ }
  }
  setLoading(false)
}, [])
```

The user object is stored at login and cleared at logout. The access token is stored separately (used by the Axios interceptor).

---

## Backend endpoints used

| Endpoint | Called by |
|---|---|
| `POST /api/auth/v1/login` | `AuthContext.login()` |
| `POST /api/auth/v1/logout` | `AuthContext.logout()` (best-effort — error is swallowed) |
| `POST /api/auth/v1/refresh` | Axios 401 interceptor in `src/utils/api.js` |
| `GET /api/modules` | Login page banner fetch |
