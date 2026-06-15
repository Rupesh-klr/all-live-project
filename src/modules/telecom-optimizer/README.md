# Telecom Optimizer — Frontend Module (reference pattern)

> **🔗 Live demo:** https://all-live-project-rupesh-klr.holistichealervedika.com/telecom-optimizer

This is the **reference module**. Every other module copies this exact shape. The whole
frontend is *folder-driven*: this folder registers itself, and if you delete it (or set
`active: false`), it vanishes from routes, the dashboard sidebar, the hub, and onboarding —
with zero edits anywhere else. That mirrors the backend's `config/moduleLoader.js`.

---

## File layout (the pattern to clone)

```
modules/telecom-optimizer/
├── constants.js        ← ALL module data (nav meta + public page + dashboard config)
├── index.jsx           ← public landing page  → <ModulePublicPage config={...} />
├── Dashboard.jsx       ← the interactive working demo (auth-protected)
├── module.config.jsx   ← registration the loader keys on (active flag + components)
└── README.md
```

| File | Responsibility |
|------|----------------|
| `constants.js`      | Single source of truth. Pure data. No components rendered here. |
| `index.jsx`         | Thin: passes constants to the shared `common/ModulePublicPage`. |
| `Dashboard.jsx`     | The demo. Wrapped in `common/DashboardLayout`. Talks to the live API. |
| `module.config.jsx` | `export default { active, order, ...DATA, PublicPage, Dashboard }`. |

---

## How it plugs into the app

`src/modules/registry.js` discovers every `modules/*/module.config.jsx` via Vite
`import.meta.glob` and builds the `MODULES` list. Consumed by:

- `src/App.jsx` — generates `publicPath`, `loginPath`, `dashboardPath` routes.
- `modules/common/DashboardLayout.jsx` — sidebar.
- `pages/Dashboard.jsx` — hub cards.
- `modules/common/OnboardingModal.jsx` — welcome grid.

**Enable / disable:** flip `active` in `module.config.jsx`.
**Remove:** delete the folder. Both ends drop it automatically.

---

## The Dashboard (interactive demo)

Everything below the chrome hits the **real backend** at `/api/telecom-optimizer/v1`:

- **Live-demo banner** — `liveDemoUrl` (env `VITE_TELECOM_LIVE_URL`) + a live/offline pill.
- **Use cases** — `constants.useCases`.
- **Shortest-Path runner** — pick source/target/algorithm → `POST /graph/shortest-path`.
  Shows the computed path, total latency, hops, nodes explored, and client round-trip ms,
  plus the exact endpoint + JSON body (API-console feel).
- **Node Health table** — server-paginated via `GET /nodes?page=&limit=`, rendered with the
  shared `components/Pagination`. Falls back to `constants.demoNodes` (client-paginated via
  `hooks/usePagination`) if the API is down, so the demo never looks broken.

---

## Shared pieces it reuses (do not reinvent)

- `modules/common/DashboardLayout` — sidebar + top nav + "coming soon" notification bell.
- `components/Pagination` + `hooks/usePagination` — paging.
- `components/Table`, `Button`, `Badge` — UI primitives.
- `utils/api` — axios instance with Bearer token + 401 refresh.
- `config/app.config` — env-driven identity (`footerLine()`), no hard-coded names.

---

## Clone this for a new module

```
1. cp -r telecom-optimizer  my-module
2. Edit constants.js  → MY_MODULE = { slug:'my-module', name, color, icon, paths, ... }
3. index.jsx          → <ModulePublicPage config={{ ...MY_MODULE, tech: MY_MODULE.tech_stack }} />
4. Dashboard.jsx      → <DashboardLayout slug="my-module" ...>  your demo here
5. module.config.jsx  → export default { active:true, order:N, ...MY_MODULE, PublicPage, Dashboard }
```
No edits to App.jsx, the sidebar, the hub, or onboarding.
