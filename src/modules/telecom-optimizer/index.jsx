import { ModulePublicPage } from '../common/ModulePublicPage'
import { TELECOM } from './constants'

export function TelecomPublicPage() {
  // ModulePublicPage reads `config.tech` as the {name,emoji,role} stack.
  return <ModulePublicPage config={{ ...TELECOM, tech: TELECOM.tech_stack }} />
}
