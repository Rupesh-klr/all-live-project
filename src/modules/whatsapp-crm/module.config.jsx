import { WHATSAPP } from './constants'
import { WhatsAppPublicPage } from './index'
import { WhatsAppDashboard } from './Dashboard'

export default {
  active: true,
  order: 4,
  ...WHATSAPP,
  PublicPage: WhatsAppPublicPage,
  Dashboard: WhatsAppDashboard,
}
