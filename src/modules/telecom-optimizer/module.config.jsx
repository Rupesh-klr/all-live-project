import { TELECOM } from './constants'
import { TelecomPublicPage } from './index'
import { TelecomDashboard } from './Dashboard'

/**
 * Module registration — discovered by src/modules/registry.js.
 * Set `active: false` (or delete this folder) to remove the module from the entire
 * frontend: routes, sidebar, hub cards and onboarding. Mirrors the backend's meta.active.
 */
export default {
  active: true,
  order: 1,
  ...TELECOM,
  PublicPage: TelecomPublicPage,
  Dashboard: TelecomDashboard,
}
