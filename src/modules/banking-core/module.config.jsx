import { BANKING } from './constants'
import { BankingPublicPage } from './index'
import { BankingDashboard } from './Dashboard'

export default {
  active: true,
  order: 3,
  ...BANKING,
  PublicPage: BankingPublicPage,
  Dashboard: BankingDashboard,
}
