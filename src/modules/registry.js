/**
 * Frontend module loader — the mirror of the backend's `config/moduleLoader.js`.
 *
 * Every module folder under `src/modules/<slug>/` ships a `module.config.jsx` that
 * default-exports its registration ({ active, slug, paths, components, nav meta }).
 * Vite's `import.meta.glob` discovers them at build time. The rest of the app
 * (routes in App.jsx, the dashboard sidebar, the hub cards, onboarding) is generated
 * from this single list — so:
 *
 *   • Delete a module folder        → it disappears everywhere (routes 404, nav gone).
 *   • Set `active: false` in its     → same effect, code stays in the repo.
 *     module.config.jsx
 *
 * This is exactly how the backend behaves with `meta.active`, kept symmetric on purpose.
 */
const files = import.meta.glob('./*/module.config.jsx', { eager: true })

export const MODULES = Object.values(files)
  .map(f => f.default)
  .filter(m => m && m.active)
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

export const getModule = (slug) => MODULES.find(m => m.slug === slug)

// Convenience: slugs of all live modules, in display order.
export const MODULE_SLUGS = MODULES.map(m => m.slug)
