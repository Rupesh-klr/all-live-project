# Portfolio Hub — Frontend

> React 18 · Vite · Tailwind CSS · Axios · CryptoJS · React Router v6

Single-page application that hosts all portfolio module dashboards behind a shared auth layer. One login gives access to every module the user has been granted. The login page scrolls all active backend modules in a live banner pulled from the API.

---

## What this is

This is not boilerplate. It demonstrates:

- **Shared auth across all modules** — one JWT pair, one login, one token refresh cycle
- **ENCRY_MIDDLE_PROTECTION encryption** — passwords are AES-256 encrypted client-side before any network call; backend middleware decrypts transparently
- **Auto-refresh with request queue** — if a token expires mid-session, the Axios interceptor refreshes it silently and retries every queued request in order
- **CSS-var theming** — dark/light mode with zero Tailwind class duplication; persists to `localStorage`
- **Component-first architecture** — every UI primitive (Button, TextBox, Table, Modal, Dropdown, Tooltip, Badge) is reusable, type-safe, and theme-aware
- **Module-gated routing** — each route checks `user.moduleAccess` before rendering; redirect to dashboard if access denied

---

## Requirements

| Tool | Min version |
|---|---|
| Node.js | 18.x |
| npm | 9.x |
| Backend (`all-live-project-api-center`) | running |

---

## Setup

```bash
git clone <repo>
cd all-live-project

npm install

cp .env.example .env
# fill in VITE_API_BASE_URL and VITE_ENCRY_MIDDLE_KEY

npm run dev        # Vite dev server → http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

> **Critical:** `VITE_ENCRY_MIDDLE_KEY` must be byte-for-byte identical to `ENCRY_MIDDLE_KEY` in the backend `.env`. A mismatch causes all login attempts to fail with "Invalid encrypted payload".

---

## Environment Variables

```env
# Backend URL — no trailing slash
VITE_API_BASE_URL=http://localhost:5000

# AES passphrase — MUST match ENCRY_MIDDLE_KEY in backend .env
VITE_ENCRY_MIDDLE_KEY=change_me_32char_aes_passphrase!!
```

---

## Project Layout

```
all-live-project/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── .env.example
├── doc/
│   └── ARCHITECTURE.md
└── src/
    ├── main.jsx                           ← Entry point — renders App in StrictMode
    ├── App.jsx                            ← Router + all providers + all routes
    ├── index.css                          ← CSS custom properties + base styles
    ├── contexts/
    │   ├── AuthContext.jsx                ← login() / logout() / user / isAuthenticated
    │   └── ThemeContext.jsx               ← toggle() / isDark — .dark class on <html>
    ├── utils/
    │   ├── api.js                         ← Axios instance — Bearer interceptor + 401 refresh
    │   └── encryption.js                  ← encryptField() / encryptPassword()
    ├── components/
    │   ├── Button/Button.jsx              ← variant · size · loading · icon
    │   ├── TextBox/TextBox.jsx            ← label · error · hint · password toggle
    │   ├── Table/Table.jsx                ← columns[{ key, label, render }] · loading skeleton
    │   ├── Dropdown/Dropdown.jsx          ← outside-click close · keyboard accessible
    │   ├── Tooltip/Tooltip.jsx            ← 4 positions · configurable delay
    │   ├── Modal/Modal.jsx                ← portal · Escape key · backdrop
    │   └── Badge/Badge.jsx                ← role → color variant
    ├── modules/
    │   ├── auth/
    │   │   ├── Login.jsx                  ← 3-factor login + scrolling module banner
    │   │   ├── AuthGuard.jsx              ← Route wrapper — redirects if not authed
    │   │   └── README.md
    │   ├── telecom-optimizer/
    │   │   ├── Dashboard.jsx
    │   │   └── README.md
    │   ├── vectorshift/
    │   │   ├── Dashboard.jsx
    │   │   └── README.md
    │   ├── banking-core/
    │   │   ├── Dashboard.jsx
    │   │   └── README.md
    │   └── whatsapp-crm/
    │       ├── Dashboard.jsx
    │       └── README.md
    └── pages/
        ├── Dashboard.jsx                  ← Authenticated home — module cards
        ├── Guide.jsx                      ← Public how-to guide
        ├── PrivacyPolicy.jsx              ← Public privacy policy
        └── Terms.jsx                      ← Public terms & conditions
```

---

## Routes

| Path | Guard | Component |
|---|---|---|
| `/login` | Public | `Login` |
| `/guide` | Public | `Guide` |
| `/privacy` | Public | `PrivacyPolicy` |
| `/terms` | Public | `Terms` |
| `/dashboard` | Auth required | `Dashboard` |
| `/telecom-optimizer` | Auth + module access | `TelecomDashboard` |
| `/vectorshift` | Auth + module access | `VectorShiftDashboard` |
| `/banking-core` | Auth + module access | `BankingDashboard` |
| `/whatsapp-crm` | Auth + module access | `WhatsAppDashboard` |
| `/` | — | Redirect to `/dashboard` |

Module access is checked in `AuthGuard`:

```jsx
// user.moduleAccess: [] means all modules
// user.moduleAccess: ['telecom-optimizer'] means only that module
<AuthGuard requiredModule="telecom-optimizer">
  <TelecomDashboard />
</AuthGuard>
```

---

## Authentication Flow

```
User submits Login form
  └─ AuthContext.login(identifier, password)
       ├─ encryptPassword(password)
       │    └─ "ENCRY_MIDDLE_PROTECTION:" + CryptoJS.AES.encrypt(password, KEY)
       └─ api.post('/api/auth/v1/login', { identifier, password: encrypted })
            └─ Response: { accessToken, refreshToken, user }
                 ├─ localStorage.setItem('accessToken', ...)
                 ├─ localStorage.setItem('refreshToken', ...)
                 ├─ localStorage.setItem('user', JSON.stringify(user))
                 └─ setUser(user) → isAuthenticated becomes true

Every API call
  └─ Request interceptor: config.headers.Authorization = 'Bearer ' + accessToken

401 on any request (token expired)
  └─ Response interceptor
       ├─ Queue all concurrent requests
       ├─ api.post('/api/auth/v1/refresh', { refreshToken })
       │    ├─ Success → save new pair → drain queue with new token → retry original
       │    └─ Failure → localStorage.clear() → window.location.href = '/login'
       └─ Queued requests resume transparently — caller never sees the 401
```

---

## Password Encryption

```js
// src/utils/encryption.js

import CryptoJS from 'crypto-js'
const KEY = import.meta.env.VITE_ENCRY_MIDDLE_KEY

export function encryptField(plaintext) {
  return 'ENCRY_MIDDLE_PROTECTION:' + CryptoJS.AES.encrypt(String(plaintext), KEY).toString()
}

export function encryptPassword(password) {
  return encryptField(password)
}
```

The prefix `ENCRY_MIDDLE_PROTECTION:` is the trigger the backend middleware looks for. Any request body or query param starting with this prefix is decrypted before the controller runs — not just the password field.

---

## Theming

All visual tokens are CSS custom properties defined in `src/index.css`:

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

`ThemeContext.toggle()` flips the `.dark` class on `document.documentElement`. The preference is saved to `localStorage` and restored on page load.

**Rule:** No component hardcodes a colour. All use `var(--*)` or Tailwind classes that map to these vars via `tailwind.config.js`.

---

## Components

All components are named exports, live in their own subfolder, and accept standard HTML props via spread (`...rest`).

### Button

```jsx
import { Button } from '../components/Button/Button'

<Button variant="primary" size="md" loading={false} icon={ChevronRight} iconPos="right" fullWidth>
  Sign in
</Button>
```

| Prop | Type | Options | Default |
|---|---|---|---|
| `variant` | string | `primary` `ghost` `danger` `outline` | `primary` |
| `size` | string | `sm` `md` `lg` | `md` |
| `loading` | bool | — | `false` |
| `icon` | LucideIcon | any | — |
| `iconPos` | string | `left` `right` | `left` |
| `fullWidth` | bool | — | `false` |

### TextBox

```jsx
import { TextBox } from '../components/TextBox/TextBox'

<TextBox
  label="Password"
  type="password"          // shows Eye/EyeOff toggle automatically
  icon={Lock}
  value={password}
  onChange={e => setPassword(e.target.value)}
  error={errors.password}
  hint="Minimum 8 characters"
/>
```

| Prop | Type | Notes |
|---|---|---|
| `type` | string | `password` enables the show/hide toggle |
| `icon` | LucideIcon | Rendered left-side inside the input |
| `error` | string | Shows red border + red text below |
| `hint` | string | Shows grey text below (hidden when `error` is set) |
| `required` | bool | Appends red asterisk to label |

### Table

```jsx
import { Table } from '../components/Table/Table'

const columns = [
  { key: 'id',     label: 'ID',     render: r => <code>{r.id}</code> },
  { key: 'name',   label: 'Name' },
  { key: 'status', label: 'Status', align: 'right' },
]

<Table
  columns={columns}
  rows={data}
  loading={loading}
  emptyMessage="No records found."
  onRowClick={row => navigate(`/detail/${row.id}`)}
/>
```

| Prop | Type | Notes |
|---|---|---|
| `columns` | array | Each: `{ key, label, render?, width?, align? }` |
| `rows` | array | Any shape — `col.key` or `col.render` extracts the value |
| `loading` | bool | Shows a spinner row instead of data |
| `onRowClick` | function | Makes rows hoverable and clickable |

### Modal

```jsx
import { Modal } from '../components/Modal/Modal'

<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm action">
  <p>Are you sure?</p>
  <Button variant="danger" onClick={handleConfirm}>Delete</Button>
</Modal>
```

Renders via React portal — not inside the component tree. Closes on backdrop click or `Escape` key.

### Tooltip

```jsx
import { Tooltip } from '../components/Tooltip/Tooltip'

<Tooltip content="Sign out" position="bottom" delay={400}>
  <button onClick={logout}><LogOut size={15} /></button>
</Tooltip>
```

`position`: `top` (default) / `right` / `bottom` / `left`

### Badge

```jsx
import { Badge } from '../components/Badge/Badge'

<Badge role="admin" />          // → red
<Badge role="manager" />        // → amber
<Badge role="viewer" />         // → grey
<Badge role="admin" label="Owner" />   // override text
```

### Dropdown

```jsx
import { Dropdown } from '../components/Dropdown/Dropdown'

<Dropdown
  trigger={<Button variant="ghost">Options</Button>}
  items={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete },
  ]}
/>
```

Closes on outside click. Items receive any standard props.

---

## Adding a Module

1. Create `src/modules/<name>/Dashboard.jsx`
2. Register the route in `src/App.jsx`:

```jsx
import { MyDashboard } from './modules/my-module/Dashboard'

// inside <Routes>
<Route
  path="/my-module"
  element={<AuthGuard requiredModule="my-module"><MyDashboard /></AuthGuard>}
/>
```

3. Add a module card in `src/pages/Dashboard.jsx` (`MODULES` array)
4. Ensure the backend has `src/modules/my-module/app.js` with `meta.active = true`

---

## Modules Reference

| Module | Route | README |
|---|---|---|
| auth | `/login` | [src/modules/auth/README.md](src/modules/auth/README.md) |
| telecom-optimizer | `/telecom-optimizer` | [src/modules/telecom-optimizer/README.md](src/modules/telecom-optimizer/README.md) |
| vectorshift | `/vectorshift` | [src/modules/vectorshift/README.md](src/modules/vectorshift/README.md) |
| banking-core | `/banking-core` | [src/modules/banking-core/README.md](src/modules/banking-core/README.md) |
| whatsapp-crm | `/whatsapp-crm` | [src/modules/whatsapp-crm/README.md](src/modules/whatsapp-crm/README.md) |

---

## Further Reading

- [doc/ARCHITECTURE.md](doc/ARCHITECTURE.md) — Context tree, auth flow, theming, Axios interceptor internals, encryption protocol
