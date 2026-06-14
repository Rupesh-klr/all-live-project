import { ModulePublicPage } from '../common/ModulePublicPage'
import { VECTORSHIFT } from './constants'

export function VectorShiftPublicPage() {
  return <ModulePublicPage config={{ ...VECTORSHIFT, tech: VECTORSHIFT.tech_stack }} />
}
