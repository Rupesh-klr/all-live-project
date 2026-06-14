import { useState, useEffect, useCallback } from 'react'
import {
  ExternalLink, Play, ArrowRight, Cpu, Clock, Route as RouteIcon,
  Server, Activity, Zap, Network, GitCompare, History, Map,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../common/DashboardLayout'
import { SubTabs } from '../common/SubTabs'
import { Table } from '../../components/Table/Table'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Pagination } from '../../components/Pagination/Pagination'
import { usePagination } from '../../hooks/usePagination'
import api from '../../utils/api'
import { TELECOM, TOPOLOGY_OPTIONS, TOPOLOGY_NODES, TOPOLOGY_EDGES } from './constants'

const PAGE_SIZE = 5

const TABS = [
  { id: 'runner',    label: 'Path Runner',    icon: RouteIcon },
  { id: 'health',    label: 'Node Health',    icon: Server    },
  { id: 'topology',  label: 'Topology Map',   icon: Map       },
  { id: 'benchmark', label: 'Algorithm Bench',icon: GitCompare },
  { id: 'history',   label: 'Path History',   icon: History   },
]

const NODE_COLS = [
  { key: 'id',      label: 'Node ID', render: r => <span className="font-mono text-cyan-500">{r.id}</span> },
  { key: 'name',    label: 'Name' },
  { key: 'region',  label: 'Region',  render: r => <span className="font-mono text-xs text-[var(--text-muted)]">{r.region}</span> },
  { key: 'latency', label: 'Latency', render: r => <span className="font-mono">{r.latency}ms</span> },
  { key: 'status',  label: 'Status',  render: r => <Badge role={r.status === 'active' ? 'viewer' : 'manager'} label={r.status} /> },
]

const HIST_COLS = [
  { key: 'route',     label: 'Route',     render: r => <span className="font-mono text-xs text-[var(--text)]">{r.source} → {r.target}</span> },
  { key: 'algorithm', label: 'Algorithm', render: r => <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: TELECOM.color }}>{r.algorithm}</span> },
  { key: 'topo',      label: 'Topology',  render: r => <span className="font-mono text-xs text-[var(--text-muted)]">{r.topologyId}</span> },
  { key: 'lat',       label: 'Latency',   render: r => <span className="font-mono text-xs">{r.totalLatency}ms</span> },
  { key: 'hops',      label: 'Hops',      render: r => <span className="font-mono text-xs">{r.hops}</span> },
  { key: 'explored',  label: 'Explored',  render: r => <span className="font-mono text-xs">{r.nodesExplored}</span> },
  { key: 'time',      label: 'When',      render: r => <span className="text-xs text-[var(--text-muted)]">{relTime(r.ts)}</span> },
]

function relTime(ts) {
  const d = Date.now() - ts
  if (d < 60000) return 'just now'
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  return `${Math.floor(d / 3600000)}h ago`
}

function NodeSelect({ label, value, onChange, nodes }) {
  return (
    <label className="flex-1 min-w-[140px]">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1.5">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm
                   font-mono text-[var(--text)] focus:outline-none focus:border-brand-500">
        {nodes.map(n => <option key={n.id} value={n.id}>{n.id} — {n.name}</option>)}
      </select>
    </label>
  )
}

// ── Topology Map SVG ──────────────────────────────────────────────────────────
const STATUS_COLOR = { active: '#22c55e', degraded: '#f59e0b', offline: '#ef4444' }
const W = 420, H = 320, PAD = 28

function TopoMap({ topologyId }) {
  const nodes  = TOPOLOGY_NODES[topologyId] || []
  const edges  = TOPOLOGY_EDGES[topologyId] || []
  const [hovered, setHovered] = useState(null)

  const px = (x) => PAD + (x / 8) * (W - PAD * 2)
  const py = (y) => PAD + (y / 8) * (H - PAD * 2)

  const pos = Object.fromEntries(nodes.map(n => [n.id, { x: px(n.x), y: py(n.y), ...n }]))

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="rounded-lg border border-[var(--border)] bg-[var(--bg-2)]">
        {/* edges */}
        {edges.map(([a, b], i) => {
          const pa = pos[a], pb = pos[b]
          if (!pa || !pb) return null
          return (
            <line key={i}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke="var(--border)" strokeWidth="1.5" />
          )
        })}
        {/* nodes */}
        {nodes.map(n => {
          const p = pos[n.id]
          const col = STATUS_COLOR[n.status] || STATUS_COLOR.active
          const isH = hovered === n.id
          return (
            <g key={n.id} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}>
              <circle cx={p.x} cy={p.y} r={isH ? 14 : 10}
                fill={`${col}22`} stroke={col} strokeWidth={isH ? 2 : 1.5}
                style={{ transition: 'r 0.15s' }} />
              <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="7" fontFamily="monospace" fill={col} fontWeight="600">
                {n.id}
              </text>
              {isH && (
                <foreignObject x={p.x + 14} y={p.y - 20} width="120" height="44">
                  <div className="bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-1 shadow-lg text-[10px]"
                    style={{ lineHeight: '1.4' }}>
                    <div className="font-semibold text-[var(--text)]">{n.name}</div>
                    <div className="text-[var(--text-muted)]">{n.region} · {n.latency}ms</div>
                  </div>
                </foreignObject>
              )}
            </g>
          )
        })}
      </svg>
      {/* Legend */}
      <div className="flex gap-4 mt-2">
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full" style={{ background: c }} />
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

export function TelecomDashboard() {
  const [activeTab, setActiveTab] = useState('runner')

  // ── Shared topology state ──────────────────────────────────────────────────
  const [topologyId, setTopologyId] = useState('backbone')
  const activeTopo    = TOPOLOGY_OPTIONS.find(t => t.id === topologyId) || TOPOLOGY_OPTIONS[0]
  const fallbackNodes = TOPOLOGY_NODES[topologyId] || TOPOLOGY_NODES['backbone']

  // ── Node health (server-paginated, falls back to bundled data) ─────────────
  const [serverMode, setServerMode]     = useState(true)
  const [nodes, setNodes]               = useState([])
  const [pageMeta, setPageMeta]         = useState({ page: 1, totalPages: 1, total: 0, limit: PAGE_SIZE })
  const [nodesLoading, setNodesLoading] = useState(true)
  const clientPager = usePagination(fallbackNodes, PAGE_SIZE)

  const loadNodes = useCallback(async (page = 1, topoId = topologyId) => {
    setNodesLoading(true)
    try {
      const { data } = await api.get(`${TELECOM.endpoints.nodes}?page=${page}&limit=${PAGE_SIZE}&topology=${topoId}`)
      setNodes(data.data); setPageMeta(data.pagination); setServerMode(true)
    } catch { setServerMode(false) }
    finally { setNodesLoading(false) }
  }, [topologyId])

  useEffect(() => { loadNodes(1, topologyId) }, [topologyId])

  // ── Path runner ────────────────────────────────────────────────────────────
  const [source, setSource]       = useState(activeTopo.defaultSource)
  const [target, setTarget]       = useState(activeTopo.defaultTarget)
  const [algorithm, setAlgorithm] = useState('dijkstra')
  const [running, setRunning]     = useState(false)
  const [result, setResult]       = useState(null)

  function changeTopology(t) {
    setTopologyId(t.id); setSource(t.defaultSource); setTarget(t.defaultTarget)
    setResult(null); clientPager.setPage(1)
  }

  async function runShortestPath() {
    setRunning(true)
    const t0 = performance.now()
    try {
      const { data } = await api.post(TELECOM.endpoints.shortestPath, { source, target, algorithm, topologyId })
      setResult({ ...data.data, clientMs: Math.round(performance.now() - t0) })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reach the compute API')
    } finally { setRunning(false) }
  }

  // ── Benchmark ──────────────────────────────────────────────────────────────
  const [benchSrc, setBenchSrc]     = useState(activeTopo.defaultSource)
  const [benchTgt, setBenchTgt]     = useState(activeTopo.defaultTarget)
  const [benching, setBenching]     = useState(false)
  const [benchResult, setBenchResult] = useState(null)

  async function runBenchmark() {
    setBenching(true)
    try {
      const { data } = await api.post(TELECOM.endpoints.benchmark, { source: benchSrc, target: benchTgt, topologyId })
      setBenchResult(data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Benchmark failed — is the backend running?')
    } finally { setBenching(false) }
  }

  // ── History ────────────────────────────────────────────────────────────────
  const [history, setHistory]         = useState([])
  const [histLoading, setHistLoading] = useState(false)

  async function loadHistory() {
    setHistLoading(true)
    try {
      const { data } = await api.get(TELECOM.endpoints.history)
      setHistory(data.data || [])
    } catch { /* empty — backend not reached yet */ }
    finally { setHistLoading(false) }
  }

  useEffect(() => { if (activeTab === 'history') loadHistory() }, [activeTab])

  const nodeOptions = serverMode ? nodes : fallbackNodes
  const tableRows   = serverMode ? nodes : clientPager.pageItems

  return (
    <DashboardLayout
      slug={TELECOM.slug} title={TELECOM.name}
      subtitle="Real Dijkstra / A* in Node.js — 5 topology templates, SVG map, side-by-side algorithm benchmark."
      actions={
        <a href={TELECOM.liveDemoUrl} target={TELECOM.liveDemoUrl.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <Button variant="outline" icon={ExternalLink} iconPos="right">Live Demo</Button>
        </a>
      }
    >
      <div className="max-w-5xl">
        {/* Status banner */}
        <div className="card p-4 flex items-center gap-3 border-l-2 mb-6" style={{ borderLeftColor: TELECOM.color }}>
          <Activity size={16} style={{ color: TELECOM.color }} />
          <p className="text-sm text-[var(--text)]">
            5 topology templates · Dijkstra + A* · all in Node.js
            <span className="font-mono text-[var(--text-muted)]"> {TELECOM.apiBase}</span>
          </p>
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${serverMode ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">{serverMode ? 'API live' : 'offline'}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {TELECOM.stats.map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-2xl font-mono font-bold" style={{ color: TELECOM.color }}>{s.value}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Topology selector — shared across tabs */}
        <div className="card p-4 mb-6">
          <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-2">
            <Network size={10} className="inline mr-1" />Network Topology
          </span>
          <div className="flex flex-wrap gap-2">
            {TOPOLOGY_OPTIONS.map(t => (
              <button key={t.id} onClick={() => changeTopology(t)} title={t.desc}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                  topologyId === t.id
                    ? 'text-white border-transparent'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--bg-2)]'
                }`}
                style={topologyId === t.id ? { background: TELECOM.color } : {}}>
                {t.name}
                <span className={`ml-1.5 text-[9px] ${topologyId === t.id ? 'opacity-70' : 'opacity-40'}`}>{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <SubTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} color={TELECOM.color} />

        {/* ── Tab: Path Runner ── */}
        {activeTab === 'runner' && (
          <section className="card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <RouteIcon size={16} style={{ color: TELECOM.color }} />
              <h2 className="text-sm font-bold text-[var(--text)]">Shortest-Path Runner</h2>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">— {activeTopo.name}</span>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <NodeSelect label="Source" value={source} onChange={setSource} nodes={nodeOptions.length ? nodeOptions : fallbackNodes} />
              <ArrowRight size={16} className="text-[var(--text-muted)] mb-2.5 hidden sm:block" />
              <NodeSelect label="Target" value={target} onChange={setTarget} nodes={nodeOptions.length ? nodeOptions : fallbackNodes} />
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1.5">Algorithm</span>
                <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
                  {TELECOM.algorithms.map(a => (
                    <button key={a.id} onClick={() => setAlgorithm(a.id)} title={a.detail}
                      className={`px-3 py-2 text-xs font-mono transition-colors ${
                        algorithm === a.id ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--bg-2)]'
                      }`}
                      style={algorithm === a.id ? { background: TELECOM.color } : undefined}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button icon={Play} loading={running} onClick={runShortestPath}>Run</Button>
            </div>

            <div className="rounded-lg bg-[var(--bg-2)] border border-[var(--border)] px-3 py-2 font-mono text-[11px] text-[var(--text-muted)]">
              <span className="text-green-500 font-bold">POST</span>{' '}{TELECOM.endpoints.shortestPath}{' '}
              <span>{JSON.stringify({ source, target, algorithm, topologyId })}</span>
            </div>

            {result && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {result.path.map((id, i) => (
                    <span key={`${id}-${i}`} className="flex items-center gap-1.5">
                      <span className="font-mono text-xs px-2 py-1 rounded-lg border"
                        style={{ borderColor: `${TELECOM.color}40`, color: TELECOM.color, background: `${TELECOM.color}10` }}>{id}</span>
                      {i < result.path.length - 1 && <ArrowRight size={12} className="text-[var(--text-muted)]" />}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Metric icon={Clock}     label="Total latency"  value={`${result.totalLatency}ms`} color={TELECOM.color} />
                  <Metric icon={RouteIcon} label="Hops"           value={result.hops}               color={TELECOM.color} />
                  <Metric icon={Cpu}       label="Nodes explored" value={result.nodesExplored}       color={TELECOM.color} />
                  <Metric icon={Server}    label="Round-trip"     value={`${result.clientMs}ms`}     color={TELECOM.color} />
                </div>
                <div className="rounded-lg bg-[var(--bg-2)] border border-[var(--border)] divide-y divide-[var(--border)]">
                  {result.segments.map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs font-mono">
                      <span className="text-[var(--text-muted)]">{s.from} <ArrowRight size={10} className="inline" /> {s.to}</span>
                      <span className="text-[var(--text)]">{s.latency}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Tab: Node Health ── */}
        {activeTab === 'health' && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <Server size={15} style={{ color: TELECOM.color }} /> Network Node Health
                <span className="font-mono text-[10px] text-[var(--text-muted)] font-normal">({activeTopo.name})</span>
              </h2>
              {!serverMode && <span className="font-mono text-[10px] text-amber-500">offline — showing bundled data</span>}
            </div>
            <Table columns={NODE_COLS} rows={tableRows} loading={nodesLoading} emptyMessage="No nodes." />
            {serverMode ? (
              <Pagination page={pageMeta.page} totalPages={pageMeta.totalPages} total={pageMeta.total}
                pageSize={pageMeta.limit} onPage={(p) => loadNodes(p, topologyId)} loading={nodesLoading} />
            ) : (
              <Pagination page={clientPager.page} totalPages={clientPager.totalPages}
                total={clientPager.total} pageSize={clientPager.pageSize} onPage={clientPager.setPage} />
            )}
          </section>
        )}

        {/* ── Tab: Topology Map ── */}
        {activeTab === 'topology' && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Map size={15} style={{ color: TELECOM.color }} />
              <h2 className="text-sm font-bold text-[var(--text)]">Topology Visualisation</h2>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">— {activeTopo.name} · {activeTopo.desc}</span>
            </div>
            <div className="card p-4">
              <TopoMap topologyId={topologyId} />
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                {activeTopo.desc} · Hover a node for details. Edges show direct latency links between PoPs.
              </p>
            </div>
          </section>
        )}

        {/* ── Tab: Algorithm Bench ── */}
        {activeTab === 'benchmark' && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <GitCompare size={15} style={{ color: TELECOM.color }} />
              <h2 className="text-sm font-bold text-[var(--text)]">Algorithm Benchmark</h2>
              <span className="text-xs text-[var(--text-muted)]">Run both algorithms on the same pair — see exploration difference</span>
            </div>
            <div className="card p-5 space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <NodeSelect label="Source" value={benchSrc} onChange={setBenchSrc} nodes={nodeOptions.length ? nodeOptions : fallbackNodes} />
                <ArrowRight size={16} className="text-[var(--text-muted)] mb-2.5 hidden sm:block" />
                <NodeSelect label="Target" value={benchTgt} onChange={setBenchTgt} nodes={nodeOptions.length ? nodeOptions : fallbackNodes} />
                <Button icon={Zap} loading={benching} onClick={runBenchmark} style={{ background: TELECOM.color, color: '#fff', border: 'none' }}>
                  Run Benchmark
                </Button>
              </div>

              {benchResult && (
                <div className="space-y-4">
                  {/* Winner badge */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-2)]">
                    <Zap size={16} style={{ color: TELECOM.color }} />
                    <div>
                      <span className="text-sm font-bold text-[var(--text)] capitalize">{benchResult.winner}</span>
                      <span className="text-xs text-[var(--text-muted)] ml-2">
                        explores {benchResult.explorationSavingPct}% fewer nodes ·{' '}
                        {benchResult.sameOptimal ? 'both find the same optimal path' : 'different paths found'}
                      </span>
                    </div>
                  </div>

                  {/* Side-by-side */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: 'dijkstra', label: 'Dijkstra', color: '#64748b' },
                      { key: 'astar',    label: 'A*',       color: TELECOM.color },
                    ].map(({ key, label, color }) => {
                      const r = benchResult[key]
                      const isWinner = benchResult.winner === key
                      return (
                        <div key={key} className="card p-4 space-y-3"
                          style={isWinner ? { borderColor: color, borderWidth: 1.5 } : {}}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold" style={{ color }}>{label}</span>
                            {isWinner && <span className="text-[9px] px-1.5 py-0.5 rounded font-mono text-white" style={{ background: color }}>WINNER</span>}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <KV k="Nodes explored" v={r.nodesExplored} accent={color} />
                            <KV k="Total latency"  v={`${r.totalLatency}ms`} accent={color} />
                            <KV k="Hops"           v={r.hops} accent={color} />
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            {r.path.map((id, i) => (
                              <span key={i} className="flex items-center gap-0.5">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border"
                                  style={{ color, borderColor: `${color}40`, background: `${color}10` }}>{id}</span>
                                {i < r.path.length - 1 && <ArrowRight size={9} className="text-[var(--text-muted)]" />}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-xs text-[var(--text-muted)]">
                    A* uses a Euclidean heuristic (H_SCALE=3, admissible — guaranteed optimal). Fewer nodes
                    explored means faster termination on larger topologies.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Tab: Path History ── */}
        {activeTab === 'history' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History size={15} style={{ color: TELECOM.color }} />
                <h2 className="text-sm font-bold text-[var(--text)]">Path History</h2>
                <span className="text-xs text-[var(--text-muted)]">last 20 computations this session</span>
              </div>
              <Button variant="ghost" icon={Activity} onClick={loadHistory} loading={histLoading}>Refresh</Button>
            </div>
            {history.length === 0 && !histLoading ? (
              <div className="card p-8 text-center">
                <History size={24} className="mx-auto mb-2 text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-muted)]">No paths computed yet this session.</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Run a path in the Path Runner tab — it will appear here.</p>
              </div>
            ) : (
              <Table columns={HIST_COLS} rows={history} loading={histLoading} emptyMessage="No history yet." />
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}

function Metric({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1">
        <Icon size={12} /><span className="text-[10px] font-mono uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-lg font-mono font-bold" style={{ color }}>{value}</div>
    </div>
  )
}

function KV({ k, v, accent }) {
  return (
    <div>
      <div className="text-[10px] text-[var(--text-muted)] mb-0.5">{k}</div>
      <div className="font-mono text-xs font-bold" style={{ color: accent }}>{v}</div>
    </div>
  )
}
