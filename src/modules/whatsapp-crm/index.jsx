import { ModulePublicPage } from '../common/ModulePublicPage'
import { WHATSAPP } from './constants'

export function WhatsAppPublicPage() {
  return <ModulePublicPage config={{ ...WHATSAPP, tech: WHATSAPP.tech_stack }} />
}
