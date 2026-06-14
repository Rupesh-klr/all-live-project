import { VECTORSHIFT } from './constants'
import { VectorShiftPublicPage } from './index'
import { VectorShiftDashboard } from './Dashboard'

export default {
  active: true,
  order: 2,
  ...VECTORSHIFT,
  PublicPage: VectorShiftPublicPage,
  Dashboard: VectorShiftDashboard,
}
