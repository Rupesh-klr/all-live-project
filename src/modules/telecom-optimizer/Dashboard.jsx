import { useState } from 'react'
import { Network, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button/Button'
import { Table } from '../../components/Table/Table'
import { Badge } from '../../components/Badge/Badge'

const DEMO_NODES = [
  { id: 'N1', name: 'Node Alpha',  latency: '12ms', hops: 3, status: 'active' },
  { id: 'N2', name: 'Node Beta',   latency: '8ms',  hops: 2, status: 'active' },
  { id: 'N3', name: 'Node Gamma',  latency: '24ms', hops: 5, status: 'degraded' },
  { id: 'N4', name: 'Node Delta',  latency: '5ms',  hops: 1, status: 'active' },
]

const COLS = [
  { key: 'id',      label: 'Node ID', render: r => <span className="font-mono text-brand-500">{r.id}</span> },
  { key: 'name',    label: 'Name' },
  { key: 'latency', label: 'Latency' },
  { key: 'hops',    label: 'Hops' },
  { key: 'status',  label: 'Status', render: r => (
    <Badge role={r.status === 'active' ? 'viewer' : 'manager'} label={r.status} />
  )},
]

export function TelecomDashboard() {
  const navigate = useNavigate()
  const [loading] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/dashboard')} className="mb-6">
        Back
      </Button>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Network size={22} className="text-cyan-500" />
          <h1 className="text-xl font-bold text-[var(--text)]">Telecom Network Optimizer</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          High-efficiency routing algorithm — Graph Theory based. 130% faster path detection.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Path Speed',     value: '+130%', color: 'text-cyan-500' },
            { label: 'Latency Impr.',  value: '+40%',  color: 'text-green-500' },
            { label: 'Active Nodes',   value: '4',     color: 'text-brand-500' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <Table columns={COLS} rows={DEMO_NODES} loading={loading} emptyMessage="No nodes found." />
      </div>
    </div>
  )
}
