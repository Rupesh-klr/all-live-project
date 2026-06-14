import { Layers, ArrowLeft, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button/Button'
import { Table } from '../../components/Table/Table'

const PIPELINES = [
  { id: 'P1', name: 'Customer FAQ RAG',   nodes: 6, status: 'running', queries: '1.2k' },
  { id: 'P2', name: 'Document Indexer',   nodes: 4, status: 'stopped', queries: '340' },
  { id: 'P3', name: 'Product Recommender',nodes: 8, status: 'running', queries: '4.8k' },
]

const COLS = [
  { key: 'id',    label: 'ID',      render: r => <span className="font-mono text-purple-400">{r.id}</span> },
  { key: 'name',  label: 'Pipeline' },
  { key: 'nodes', label: 'DAG Nodes' },
  { key: 'queries', label: 'Queries' },
  { key: 'status', label: 'Status', render: r => (
    <span className={`font-mono text-[10px] font-bold uppercase ${r.status === 'running' ? 'text-green-500' : 'text-gray-500'}`}>
      {r.status}
    </span>
  )},
]

export function VectorShiftDashboard() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/dashboard')} className="mb-6">Back</Button>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Layers size={22} className="text-purple-500" />
            <h1 className="text-xl font-bold text-[var(--text)]">VectorShift — RAG Pipeline Builder</h1>
          </div>
          <Button icon={Plus} size="sm">New Pipeline</Button>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Interactive DAG-based AI workflow orchestration with vector database indexing.
        </p>
        <Table columns={COLS} rows={PIPELINES} emptyMessage="No pipelines yet." />
      </div>
    </div>
  )
}
