/**
 * Badge — inline status/role chip
 * Props: role (admin|manager|viewer|guest), label (override text), className
 */
export function Badge({ role, label, className = '' }) {
  const map = {
    admin:   'tag-admin',
    manager: 'tag-manager',
    viewer:  'tag-viewer',
    guest:   'tag-guest',
  }
  return (
    <span className={`${map[role] || 'badge bg-gray-500/10 text-gray-500 border border-gray-500/20'} ${className}`}>
      {label || role}
    </span>
  )
}
