import { useState, useEffect, useCallback } from 'react'
import {
  ExternalLink, Play, ArrowRight, Cpu, Clock, Route as RouteIcon,
  Server, Activity, Zap, Network,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../common/DashboardLayout'
import { Table } from '../../components/Table/Table'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Pagination } from '../../components/Pagination/Pagination'
import { usePagination } from '../../hooks/usePagination'
import api from '../../utils/api'
import { TELECOM, TOPOLOGY_OPTIONS, TOPOLOGY_NODES } from './constants'

const PAGE_SIZE = 5

// ── Node health table columns ──────────────────────────────────────────────────
const COLS = [
  { key: 'id',      label: 'Node ID', render: r => <span className="font-mono text-cyan-500">{r.id}</span> },
  { key: 'name',    label: 'Name' },
  { key: 'region',  label: 'Region', render: r => <span className="font-mono text-xs text-[var(--text-muted)]">{r.region}</span> },
  { key: 'latency', label: 'Latency', render: r => <span className="font-mono">{r.latency}ms</span> },
  { key: 'status',  label: 'Status', render: r => (
    <Badge role={r.status === 'active' ? 'viewer' : 'manager'} label={r.status} />
  )},
]

// ── Styled node selector — shows nodes from the active topology ────────────────
function NodeSelect({ label, value, onChange, nodes }) {
  return (
    <label className="flex-1 min-w-[140px]">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1.5">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm
                   font-mono text-[var(--text)] focus:outline-none focus:border-brand-500"
      >
        {nodes.map(n => <option key={n.id} value={n.id}>{n.id} — {n.name}</option>)}
      </select>
    </label>
  )
}

export function TelecomDashboard() {
  // ── Topology selection ──────────────────────────────────────────────────────
  const [topologyId, setTopologyId] = useState('backbone')
  const activeTopo = TOPOLOGY_OPTIONS.find(t => t.id === topologyId) || TOPOLOGY_OPTIONS[0]
  const fallbackNodes = TOPOLOGY_NODES[topologyId] || TOPOLOGY_NODES['backbone']

  // ── Node table (server-paginated, falls back to local template data) ──────────
  const [serverMode, setServerMode]     = useState(true)
  const [nodes, setNodes]               = useState([])
  const [pageMeta, setPageMeta]         = useState({ page: 1, totalPages: 1, total: 0, limit: PAGE_SIZE })
  const [nodesLoading, setNodesLoading] = useState(true)
  const clientPager = usePagination(fallbackNodes, PAGE_SIZE)

  const loadNodes = useCallback(async (page = 1, topoId = topologyId) => {
    setNodesLoading(true)
    try {
      const { data } = await api.get(`${TELECOM.endpoints.nodes}?page=${page}&limit=${PAGE_SIZE}&topology=${topoId}`)
      setNodes(data.data)
      setPageMeta(data.pagination)
      setServerMode(true)
    } catch {
      setServerMode(false)
    } finally {
      setNodesLoading(false)
    }
  }, [topologyId])

  useEffect(() => { loadNodes(1, topologyId) }, [topologyId])

  // ── Shortest-path runner ──────────────────────────────────────────────────────
  const [source, setSource]       = useState(activeTopo.defaultSource)
  const [target, setTarget]       = useState(activeTopo.defaultTarget)
  const [algorithm, setAlgorithm] = useState('dijkstra')
  const [running, setRunning]     = useState(false)
  const [result, setResult]       = useState(null)

  function changeTopology(t) {
    setTopologyId(t.id)
    setSource(t.defaultSource)
    setTarget(t.defaultTarget)
    setResult(null)
    clientPager.setPage(1)
  }

  async function runShortestPath() {
    setRunning(true)
    const t0 = performance.now()
    try {
      const { data } = await api.post(TELECOM.endpoints.shortestPath, { source, target, algorithm, topologyId })
      setResult({ ...data.data, clientMs: Math.round(performance.now() - t0) })
    } catch (err) {
      setResult(null)
      toast.error(err.response?.data?.message || 'Could not reach the compute API — is the backend running?')
    } finally {
      setRunning(false)
    }
  }

  const nodeOptions = serverMode ? nodes : fallbackNodes
  const rows = serverMode ? nodes : clientPager.pageItems

  return (
    <DashboardLayout
      slug={TELECOM.slug}
      title={TELECOM.name}
      subtitle="Real Dijkstra / A* running in Node.js — pick a topology template, choose two nodes, run the path."
      actions={
        <a href={TELECOM.liveDemoUrl} target={TELECOM.liveDemoUrl.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <Button variant="outline" icon={ExternalLink} iconPos="right">Live Demo</Button>
        </a>
      }
    >
      <div className="max-w-5xl space-y-8">

        {/* Live demo banner */}
        <div className="card p-5 flex items-center gap-4 border-l-2" style={{ borderLeftColor: TELECOM.color }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${TELECOM.color}15` }}>
            <Activity size={18} style={{ color: TELECOM.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text)]">5 topology templates — all computed in Node.js, no Python needed</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Hits the real backend at
              <span className="font-mono text-[var(--text)]"> {TELECOM.apiBase}</span>. Falls back to bundled template data when offline.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${serverMode ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
              {serverMode ? 'API live' : 'offline demo'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {TELECOM.stats.map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-2xl font-mono font-bold" style={{ color: TELECOM.color }}>{s.value}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Use cases */}
        <section>
          <h2 className="text-sm font-bold text-[var(--text)] mb-3 flex items-center gap-2">
            <Zap size={15} style={{ color: TELECOM.color }} /> Where this is used
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {TELECOM.useCases.map(uc => {
              const Icon = uc.icon
              return (
                <div key={uc.title} className="card p-4 flex gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${TELECOM.color}15` }}>
                    <Icon size={15} style={{ color: TELECOM.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)] mb-0.5">{uc.title}</p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{uc.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Interactive shortest-path runner */}
        <section className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <RouteIcon size={16} style={{ color: TELECOM.color }} />
            <h2 className="text-sm font-bold text-[var(--text)]">Shortest-Path Runner</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Select a topology template, pick two nodes and an algorithm — the API computes the optimal route by total latency.
          </p>

          {/* Topology selector */}
          <div className="mb-5">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-2">
              <Network size={10} className="inline mr-1" />Network Topology
            </span>
            <div className="flex flex-wrap gap-2">
              {TOPOLOGY_OPTIONS.map(t => (
                <button
                  key={t.id}
                  onClick={() => changeTopology(t)}
                  title={t.desc}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    topologyId === t.id
                      ? 'text-white border-transparent'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--bg-2)]'
                  }`}
                  style={topologyId === t.id ? { background: TELECOM.color } : {}}
                >
                  {t.name}
                  <span className={`ml-1.5 text-[9px] ${topologyId === t.id ? 'opacity-70' : 'opacity-40'}`}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <NodeSelect label="Source" value={source} onChange={setSource} nodes={nodeOptions.length ? nodeOptions : fallbackNodes} />
            <ArrowRight size={16} className="text-[var(--text-muted)] mb-2.5 hidden sm:block" />
            <NodeSelect label="Target" value={target} onChange={setTarget} nodes={nodeOptions.length ? nodeOptions : fallbackNodes} />
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Algorithm</span>
              <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
                {TELECOM.algorithms.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAlgorithm(a.id)}
                    className={`px-3 py-2 text-xs font-mono transition-colors ${
                      algorithm === a.id ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--bg-2)]'
                    }`}
                    style={algorithm === a.id ? { background: TELECOM.color } : undefined}
                    title={a.detail}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <Button icon={Play} loading={running} onClick={runShortestPath}>Run</Button>
          </div>

          {/* Request line (API-console feel) */}
          <div className="rounded-lg bg-[var(--bg-2)] border border-[var(--border)] px-3 py-2 font-mono text-[11px] text-[var(--text-muted)] overflow-x-auto">
            <span className="text-green-500 font-bold">POST</span>{' '}
            {TELECOM.endpoints.shortestPath}
            <span className="text-[var(--text-muted)]">{' '}{JSON.stringify({ source, target, algorithm, topologyId })}</span>
          </div>

          {/* Result */}
          {result && (
            <div className="mt-4 space-y-4">
              {/* Path */}
              <div className="flex flex-wrap items-center gap-1.5">
                {result.path.map((id, i) => (
                  <span key={`${id}-${i}`} className="flex items-center gap-1.5">
                    <span className="font-mono text-xs px-2 py-1 rounded-lg border"
                          style={{ borderColor: `${TELECOM.color}40`, color: TELECOM.color, background: `${TELECOM.color}10` }}>
                      {id}
                    </span>
                    {i < result.path.length - 1 && <ArrowRight size={12} className="text-[var(--text-muted)]" />}
                  </span>
                ))}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Metric icon={Clock}     label="Total latency"  value={`${result.totalLatency}ms`} />
                <Metric icon={RouteIcon} label="Hops"           value={result.hops} />
                <Metric icon={Cpu}       label="Nodes explored" value={result.nodesExplored} />
                <Metric icon={Server}    label="Round-trip"     value={`${result.clientMs}ms`} />
              </div>

              {/* Segments */}
              <div className="rounded-lg bg-[var(--bg-2)] border border-[var(--border)] divide-y divide-[var(--border)]">
                {result.segments.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs font-mono">
                    <span className="text-[var(--text-muted)]">{s.from} <ArrowRight size={10} className="inline" /> {s.to}</span>
                    <span className="text-[var(--text)]">{s.latency}ms</span>
                  </div>
                ))}
                {result.segments.length === 0 && (
                  <div className="px-3 py-2 text-xs font-mono text-[var(--text-muted)]">Source equals target — zero-hop path.</div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Node health table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
              <Server size={15} style={{ color: TELECOM.color }} /> Network Node Health
              <span className="font-mono text-[10px] text-[var(--text-muted)] font-normal">({activeTopo.name})</span>
            </h2>
            {!serverMode && (
              <span className="font-mono text-[10px] text-amber-500">offline — showing bundled template data</span>
            )}
          </div>
          <Table columns={COLS} rows={rows} loading={nodesLoading} emptyMessage="No nodes found." />
          {serverMode ? (
            <Pagination
              page={pageMeta.page} totalPages={pageMeta.totalPages}
              total={pageMeta.total} pageSize={pageMeta.limit}
              onPage={(p) => loadNodes(p, topologyId)} loading={nodesLoading}
            />
          ) : (
            <Pagination
              page={clientPager.page} totalPages={clientPager.totalPages}
              total={clientPager.total} pageSize={clientPager.pageSize}
              onPage={clientPager.setPage}
            />
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1">
        <Icon size={12} />
        <span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-lg font-mono font-bold text-[var(--text)]">{value}</div>
    </div>
  )
}
