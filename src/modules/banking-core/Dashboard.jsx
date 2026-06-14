import { Landmark, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button/Button'
import { Table } from '../../components/Table/Table'

const TXS = [
  { id: 'TX001', from: 'ACC-001', to: 'ACC-009', amount: '$4,200.00', status: 'settled', ts: '2026-06-14 03:21' },
  { id: 'TX002', from: 'ACC-007', to: 'ACC-003', amount: '$890.50',   status: 'pending', ts: '2026-06-14 03:25' },
  { id: 'TX003', from: 'ACC-002', to: 'ACC-011', amount: '$12,000.00',status: 'settled', ts: '2026-06-14 03:27' },
]

const statusColor = { settled: 'text-green-500', pending: 'text-amber-500', failed: 'text-red-500' }

const COLS = [
  { key: 'id',     label: 'TX ID',  render: r => <span className="font-mono text-amber-400">{r.id}</span> },
  { key: 'from',   label: 'From' },
  { key: 'to',     label: 'To' },
  { key: 'amount', label: 'Amount', align: 'right' },
  { key: 'status', label: 'Status', render: r => (
    <span className={`font-mono text-[10px] font-bold uppercase ${statusColor[r.status]}`}>{r.status}</span>
  )},
  { key: 'ts', label: 'Timestamp', render: r => <span className="font-mono text-xs text-[var(--text-muted)]">{r.ts}</span> },
]

export function BankingDashboard() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/dashboard')} className="mb-6">Back</Button>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Landmark size={22} className="text-amber-500" />
          <h1 className="text-xl font-bold text-[var(--text)]">Distributed Banking Core</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Fault-tolerant banking system — 99.9% reliability, Kafka + OAuth2 + JWT.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Reliability', value: '99.9%', color: 'text-green-500' },
            { label: 'Transactions', value: '3',    color: 'text-amber-500' },
            { label: 'Security',    value: 'OAuth2', color: 'text-brand-500' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className={`text-xl font-mono font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <Table columns={COLS} rows={TXS} emptyMessage="No transactions." />
      </div>
    </div>
  )
}
