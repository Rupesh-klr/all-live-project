import { MessageSquare, ArrowLeft, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button/Button'
import { Table } from '../../components/Table/Table'

const CONTACTS = [
  { id: 'C1', name: 'Priya Sharma',   phone: '+91 98765 43210', last: '2 min ago',  status: 'active' },
  { id: 'C2', name: 'Rajan Mehta',    phone: '+91 87654 32109', last: '1 hr ago',   status: 'idle' },
  { id: 'C3', name: 'Anita Patel',    phone: '+91 76543 21098', last: '3 hrs ago',  status: 'idle' },
  { id: 'C4', name: 'Vikram Nair',    phone: '+91 65432 10987', last: '1 day ago',  status: 'inactive' },
]

const COLS = [
  { key: 'name',  label: 'Contact' },
  { key: 'phone', label: 'Phone', render: r => <span className="font-mono text-xs">{r.phone}</span> },
  { key: 'last',  label: 'Last Message', render: r => <span className="text-[var(--text-muted)]">{r.last}</span> },
  { key: 'status', label: 'Status', render: r => {
    const c = { active: 'text-green-500', idle: 'text-amber-500', inactive: 'text-gray-500' }
    return <span className={`font-mono text-[10px] font-bold uppercase ${c[r.status]}`}>{r.status}</span>
  }},
  { key: 'actions', label: '', render: () => (
    <Button size="sm" variant="ghost" icon={Send}>Message</Button>
  )},
]

export function WhatsAppDashboard() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/dashboard')} className="mb-6">Back</Button>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={22} className="text-green-500" />
          <h1 className="text-xl font-bold text-[var(--text)]">Automated WhatsApp CRM Engine</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Scalable CRM with WhatsApp Business API — event-driven webhook processing.
        </p>
        <Table columns={COLS} rows={CONTACTS} emptyMessage="No contacts." />
      </div>
    </div>
  )
}
