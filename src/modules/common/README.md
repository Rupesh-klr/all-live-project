# `src/modules/common/` — Shared Module Components

Everything in this folder is **reused by all 4 modules**. If you are adding a new module,
you do **not** copy this code — you import it. If you change something here, it changes
across all modules instantly.

---

## What lives here

```
src/modules/common/
├── ModulePublicPage.jsx    ← public landing page template (no auth required)
├── OnboardingModal.jsx     ← welcome popup shown once per session after login
└── README.md               ← this file
```

---

## `ModulePublicPage.jsx`

The shared **5-section portfolio landing page** used by every module's `index.jsx`.

### How to use it

```jsx
// src/modules/your-module/index.jsx
import { ModulePublicPage } from '../common/ModulePublicPage'

const CONFIG = {
  name:          'Your Module Name',
  slug:          'your-module',               // must match the URL segment
  dashboardPath: '/your-module/dashboard',
  color:         '#06b6d4',                   // brand accent colour (hex)
  icon:          SomeLucideIcon,
  tagline:       'One-line pitch shown in hero',
  stats: [
    { value: '+130%', label: 'Speed' },       // up to 3 stats in hero
  ],
  about: {
    description: 'Two sentences. What it is.',
    impact:      'Two sentences. Why it matters / what it proves.',
    points: [                                  // 4 detail cards on right side
      { icon: SomeIcon, title: 'Feature A', detail: 'Implementation detail.' },
    ],
  },
  tech: [                                      // 4 tech stack tiles
    { name: 'Node.js', emoji: '⚡', role: 'REST API + microservice bridge' },
  ],
  features: [                                  // 4 feature cards
    { icon: SomeIcon, title: 'Feature', detail: 'What it does and why.' },
  ],
}

export function YourModulePublicPage() {
  return <ModulePublicPage config={CONFIG} />
}
```

### Sections

| # | ID | What it shows |
|---|---|---|
| 1 | `#hero` | Name, tagline, 3 stats, CTA buttons, icon card |
| 2 | `#about` | Description + impact + 4 detail cards |
| 3 | `#tech` | 4 tech stack tiles with emoji |
| 4 | `#features` | 4 feature cards |
| 5 | `#try-it` | 2 credential cards (admin + viewer) with copy buttons |

### Auth-aware navbar behaviour

| State | Navbar shows |
|---|---|
| Not logged in | Sign In → `/{slug}/login` · Sign Up → `/signup` |
| Logged in | Username · Role badge · Logout button · Open Dashboard |

### Login routing

All login links inside `ModulePublicPage` point to `/{config.slug}/login` — **not** `/login`.
This means after logging in from a module page, the user lands on that module's dashboard,
not the generic `/dashboard`.

The root `/login` still exists for the generic case.

### Glass styling

- Page background: fixed radial glow (`config.color` at 12% opacity, top-center)
- Dot-grid overlay (8% opacity, same color)
- Each section: `backdrop-blur-sm` + semi-transparent background
- Cards: thin accent-colored border (`config.color` at 15–20% opacity)

---

## `OnboardingModal.jsx`

A **welcome popup** that appears once per browser session immediately after a user logs in,
signs up, or starts a guest session.

### Trigger logic

```js
// Shows when:
isAuthenticated === true
  AND
sessionStorage.getItem('portfolio_onboarded') === null

// Hidden after:
sessionStorage.setItem('portfolio_onboarded', '1')
```

`sessionStorage` (not `localStorage`) — clears when the tab closes, so the user sees it
on every new browser session. If you want it only once ever, change to `localStorage`.

### What the modal shows

- "Live Project — Portfolio Hub" live badge
- Welcome message with the user's display name
- Role badge (admin / viewer / guest)
- Guest expiry warning if `user.role === 'guest'`
- 4 module cards — each clickable → navigates to that module's `/dashboard`
- "Explore All Modules" → navigates to `/dashboard` (the hub)
- "Stay Here" / "Dismiss" → closes modal, stays on current page

### Adding a new module to the onboarding

Open `OnboardingModal.jsx` and add an entry to the `MODULES` array at the top:

```js
{
  slug:          'your-module',
  name:          'Your Module Name',
  emoji:         '🔧',
  color:         '#06b6d4',
  tagline:       'One-line description',
  publicPath:    '/your-module',
  dashboardPath: '/your-module/dashboard',
},
```

---

## How modules connect to common

```
App.jsx
  └── <OnboardingModal />           ← global, fires after any login/signup
  └── <Route path="/telecom-optimizer"  element={<TelecomPublicPage />} />
  └── <Route path="/telecom-optimizer/login"  element={<Login defaultRedirect="/telecom-optimizer/dashboard" />} />
  └── <Route path="/telecom-optimizer/dashboard"  element={<AuthGuard><TelecomDashboard /></AuthGuard>} />

modules/telecom-optimizer/index.jsx
  └── returns <ModulePublicPage config={CONFIG} />   ← from common/

modules/common/ModulePublicPage.jsx
  └── uses useAuth() → isAuthenticated, user, logout
  └── links to /{config.slug}/login (not /login)
  └── links to config.dashboardPath when authenticated
```

---

## Adding a new module — full checklist

```
Frontend (all-live-project):
  1. Create src/modules/your-module/index.jsx       ← public page config
  2. Create src/modules/your-module/Dashboard.jsx   ← protected dashboard
  3. Add to App.jsx — 3 routes:
       /your-module               → YourModulePublicPage (public)
       /your-module/login         → Login with defaultRedirect
       /your-module/dashboard     → AuthGuard > YourModuleDashboard
  4. Add to OnboardingModal.jsx → MODULES array

Backend (all-live-project-api-center):
  1. Create src/modules/your-module/app.js          ← routes + meta
  2. Set meta.active = true to enable auto-loading
  → Module loader picks it up automatically, no other changes needed
```
