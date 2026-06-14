import { ModulePublicPage } from '../common/ModulePublicPage'
import { BANKING } from './constants'

export function BankingPublicPage() {
  return <ModulePublicPage config={{ ...BANKING, tech: BANKING.tech_stack }} />
}
