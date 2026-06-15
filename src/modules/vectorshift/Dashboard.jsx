import { useState, useEffect } from 'react'
import {
  ExternalLink, Play, Plus, FileText, GitBranch, Database, Bot,
  ArrowRight, Search, Sparkles, X, BarChart2, BookOpen, Layers,
  Trash2, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../common/DashboardLayout'
import { SubTabs } from '../common/SubTabs'
import { Button } from '../../components/Button/Button'
import { Badge } from '../../components/Badge/Badge'
import api from '../../utils/api'
import { VECTORSHIFT as V } from './constants'

const TABS = [
  { id: 'pipelines',  label: 'Pipelines',      icon: GitBranch },
  { id: 'query',      label: 'Query Runner',    icon: Search    },
  { id: 'knowledge',  label: 'Knowledge Base',  icon: BookOpen  },
  { id: 'models',     label: 'Models',          icon: Bot       },
  { id: 'metrics',    label: 'Metrics',         icon: BarChart2 },
]

const STEPS = [
  { key: 'source',   label: 'Source',    icon: FileText  },
  { key: 'chunker',  label: 'Chunking',  icon: GitBranch },
  { key: 'vectorDb', label: 'Vector DB', icon: Database  },
  { key: 'llm',      label: 'LLM',       icon: Bot       },
]

const TIER_COLOR = { enterprise: '#8b5cf6', standard: '#3b82f6' }
const PROVIDER_EMOJI = { Anthropic: '🤖', OpenAI: '🟢', Mistral: '⚡' }

export function VectorShiftDashboard() {
  const [activeTab, setActiveTab] = useState('pipelines')

  // ── Pipelines ──────────────────────────────────────────────────────────────
  const [pipelines,   setPipelines]   = useState(V.demoPipelines)
  const [selectedId,  setSelectedId]  = useState(V.demoPipelines[0]?.id)
  const [options,     setOptions]     = useState(V.builderFallback)
  const [live,        setLive]        = useState(false)
  const [showForm,    setShowForm]    = useState(false)
  const [form, setForm] = useState({ name: '', source: 'Notion', chunker: 'Semantic', vectorDb: 'Pinecone', llm: 'claude-opus-4-8', topK: 4 })
  const [creating,    setCreating]    = useState(false)

  // ── Query ──────────────────────────────────────────────────────────────────
  const [query,       setQuery]       = useState('')
  const [running,     setRunning]     = useState(false)
  const [result,      setResult]      = useState(null)
  const [useMmr,      setUseMmr]      = useState(false)

  // ── Knowledge ─────────────────────────────────────────────────────────────
  const [chunks,      setChunks]      = useState([])
  const [kSearch,     setKSearch]     = useState('')
  const [kForm,       setKForm]       = useState({ source: '', text: '', page: 1 })
  const [addingChunk, setAddingChunk] = useState(false)
  const [showKForm,   setShowKForm]   = useState(false)

  // ── Models ─────────────────────────────────────────────────────────────────
  const [models,      setModels]      = useState([])

  // ── Metrics ────────────────────────────────────────────────────────────────
  const [metrics,     setMetrics]     = useState(null)

  const selected = pipelines.find(p => p.id === selectedId) || pipelines[0]

  // ── Boot ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [pRes, oRes] = await Promise.all([
          api.get(`${V.endpoints.pipelines}?page=1&limit=20`),
          api.get(V.endpoints.options),
        ])
        if (pRes.data?.data?.length) { setPipelines(pRes.data.data); setSelectedId(pRes.data.data[0].id) }
        if (oRes.data?.data) setOptions(oRes.data.data)
        setLive(true)
      } catch { setLive(false) }
    })()
  }, [])

  useEffect(() => {
    if (activeTab === 'knowledge') loadKnowledge()
    if (activeTab === 'models')    loadModels()
    if (activeTab === 'metrics')   loadMetrics()
  }, [activeTab])

  // ── Pipeline actions ───────────────────────────────────────────────────────
  async function createPipeline() {
    if (!form.name.trim()) return toast.error('Give the pipeline a name')
    setCreating(true)
    try {
      const { data } = await api.post(V.endpoints.create, form)
      setPipelines(p => [data.data, ...p])
      setSelectedId(data.data.id)
      setShowForm(false)
      toast.success('Pipeline created')
    } catch (err) { toast.error(err.response?.data?.message || 'Create failed') }
    finally { setCreating(false) }
  }

  async function deletePipeline(id) {
    try {
      await api.delete(`${V.endpoints.pipelines}/${id}`)
      const next = pipelines.filter(p => p.id !== id)
      setPipelines(next)
      if (selectedId === id) setSelectedId(next[0]?.id)
      toast.success('Deleted')
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  // ── Query action ───────────────────────────────────────────────────────────
  async function runQuery() {
    if (!query.trim() || !selected) return
    setRunning(true); setResult(null)
    try {
      const { data } = await api.post(V.endpoints.run(selected.id), { query, mmr: useMmr, lambda: 0.6 })
      setResult(data.data)
      setPipelines(ps => ps.map(p => p.id === selected.id ? { ...p, queries: (p.queries || 0) + 1 } : p))
    } catch (err) { toast.error(err.response?.data?.message || 'Query failed') }
    finally { setRunning(false) }
  }

  // ── Knowledge actions ──────────────────────────────────────────────────────
  async function loadKnowledge() {
    try {
      const { data } = await api.get(V.endpoints.knowledge + (kSearch ? `?search=${encodeURIComponent(kSearch)}` : ''))
      setChunks(data.data || [])
    } catch { /* offline */ }
  }

  useEffect(() => { if (activeTab === 'knowledge') loadKnowledge() }, [kSearch])

  async function addChunk() {
    if (!kForm.text.trim()) return toast.error('Chunk text is required')
    setAddingChunk(true)
    try {
      const { data } = await api.post(V.endpoints.knowledge, kForm)
      setChunks(cs => [...cs, data.data])
      setKForm({ source: '', text: '', page: 1 })
      setShowKForm(false)
      toast.success('Chunk added')
    } catch (err) { toast.error(err.response?.data?.message || 'Add failed') }
    finally { setAddingChunk(false) }
  }

  // ── Models / Metrics ───────────────────────────────────────────────────────
  async function loadModels()  {
    try { const { data } = await api.get(V.endpoints.models);  setModels(data.data  || []) } catch { /* offline */ }
  }
  async function loadMetrics() {
    try { const { data } = await api.get(V.endpoints.metrics); setMetrics(data.data || null) } catch { /* offline */ }
  }

  const Sel = ({ label, field, opts }) => (
    <label className="flex-1 min-w-[130px]">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">{label}</span>
      <select value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] focus:outline-none">
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )

  return (
    <DashboardLayout
      slug={V.slug} title={V.name}
      subtitle="DAG-based AI workflow orchestration — pipeline builder, RAG query runner, knowledge management, and live metrics."
      actions={
        <a href={V.liveDemoUrl} target={V.liveDemoUrl.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <Button variant="outline" icon={ExternalLink} iconPos="right">Live Demo</Button>
        </a>
      }
    >
      <div className="max-w-5xl">
        {/* Status banner */}
        <div className="card p-4 flex items-center gap-3 border-l-2 mb-6" style={{ borderLeftColor: V.color }}>
          <Layers size={16} style={{ color: V.color }} />
          <p className="text-sm text-[var(--text)]">Keyword-overlap RAG · no external vector DB needed</p>
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">{live ? 'API live' : 'demo mode'}</span>
          </div>
        </div>

        <SubTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} color={V.color} />

        {/* ── Tab: Pipelines ── */}
        {activeTab === 'pipelines' && (
          <section className="space-y-4">
            {/* Pipeline cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pipelines.map(p => (
                <button key={p.id} onClick={() => setSelectedId(p.id)}
                  className={`card p-4 text-left transition-all group ${
                    selectedId === p.id ? 'ring-2' : 'hover:border-[var(--border-hover)]'
                  }`}
                  style={selectedId === p.id ? { '--tw-ring-color': V.color } : {}}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--text)] truncate">{p.name}</span>
                    <Badge role={p.status === 'running' ? 'viewer' : 'manager'} label={p.status} />
                  </div>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {[p.source, p.chunker, p.vectorDb, p.llm].map(tag => (
                      <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-muted)]">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    <span>topK: {p.topK}</span>
                    <span className="font-mono" style={{ color: V.color }}>{p.queries?.toLocaleString()} queries</span>
                  </div>
                  {live && (
                    <button onClick={e => { e.stopPropagation(); deletePipeline(p.id) }}
                      className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-red-400 hover:text-red-500 flex items-center gap-1">
                      <Trash2 size={10} /> delete
                    </button>
                  )}
                </button>
              ))}
              <button onClick={() => setShowForm(!showForm)}
                className="card p-4 flex flex-col items-center justify-center gap-2 border-dashed hover:border-[var(--text-muted)] transition-colors min-h-[100px]">
                <Plus size={20} className="text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">New pipeline</span>
              </button>
            </div>

            {/* Create form */}
            {showForm && (
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--text)]">New Pipeline</h3>
                  <button onClick={() => setShowForm(false)}><X size={16} className="text-[var(--text-muted)]" /></button>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Name</span>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Sales Docs RAG"
                    className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Sel label="Source"    field="source"   opts={options.sources   || []} />
                  <Sel label="Chunker"   field="chunker"  opts={options.chunkers  || []} />
                  <Sel label="Vector DB" field="vectorDb" opts={options.vectorDbs || []} />
                  <Sel label="LLM"       field="llm"      opts={options.llmModels || []} />
                  <label className="min-w-[80px]">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Top-K</span>
                    <input type="number" min={1} max={10} value={form.topK}
                      onChange={e => setForm(f => ({ ...f, topK: +e.target.value }))}
                      className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none" />
                  </label>
                </div>
                {/* DAG preview */}
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon
                    return (
                      <div key={s.key} className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${V.color}15`, border: `1px solid ${V.color}40` }}>
                            <Icon size={14} style={{ color: V.color }} />
                          </div>
                          <span className="text-[9px] font-mono text-[var(--text-muted)]">{form[s.key] || s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && <ArrowRight size={12} className="text-[var(--text-muted)]" />}
                      </div>
                    )
                  })}
                </div>
                <Button icon={Plus} loading={creating} onClick={createPipeline} style={{ background: V.color, color: '#fff', border: 'none' }}>
                  Create Pipeline
                </Button>
              </div>
            )}
          </section>
        )}

        {/* ── Tab: Query Runner ── */}
        {activeTab === 'query' && (
          <section className="space-y-4">
            {/* Pipeline selector */}
            <div className="flex gap-2 overflow-x-auto">
              {pipelines.map(p => (
                <button key={p.id} onClick={() => setSelectedId(p.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono whitespace-nowrap transition-colors ${
                    selectedId === p.id ? 'text-white border-transparent' : 'border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-2)]'
                  }`}
                  style={selectedId === p.id ? { background: V.color } : {}}>
                  {p.name}
                </button>
              ))}
            </div>

            <div className="card p-5 space-y-4">
              <div className="flex gap-2">
                <input value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && query.trim()) runQuery() }}
                  placeholder="Ask something — e.g. 'How does billing work?'"
                  className="flex-1 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-[var(--text)] focus:outline-none" />
                <Button icon={Play} loading={running} onClick={runQuery} disabled={!query.trim()} style={{ background: V.color, color: '#fff', border: 'none' }}>
                  Run
                </Button>
              </div>

              {/* Retrieval strategy toggle */}
              <button
                onClick={() => setUseMmr(v => !v)}
                className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                title="Maximal Marginal Relevance — diversifies retrieved chunks to cut redundancy"
              >
                <span className={`relative w-7 h-4 rounded-full transition-colors ${useMmr ? '' : 'bg-[var(--bg-2)] border border-[var(--border)]'}`} style={useMmr ? { background: V.color } : {}}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${useMmr ? 'left-3.5' : 'left-0.5'}`} />
                </span>
                MMR re-ranking {useMmr ? 'on' : 'off'}
                <span className="text-[var(--text-muted)]">· diversifies sources (λ=0.6)</span>
              </button>

              {selected && (
                <div className="text-[10px] font-mono text-[var(--text-muted)]">
                  <span className="text-green-500 font-bold">POST</span>{' '}{V.endpoints.run(selected.id)}{' '}
                  · pipeline: {selected.name} · model: {selected.llm} · topK: {selected.topK}
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-[var(--bg-2)] border border-[var(--border)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} style={{ color: V.color }} />
                      <span className="text-xs font-bold text-[var(--text)]">Answer</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        {result.retrieval && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-muted)]">
                            {result.retrieval}
                          </span>
                        )}
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${result.grounded ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                          {result.grounded ? 'grounded' : 'low confidence'}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text)] leading-relaxed">{result.answer}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-2">Source Chunks ({result.sources?.length})</p>
                    <div className="space-y-2">
                      {result.sources?.map((s, i) => (
                        <div key={i} className="rounded-lg border border-[var(--border)] p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-[var(--text-muted)]">{s.source} p.{s.page}</span>
                            <div className="ml-auto flex items-center gap-1.5">
                              <div className="h-1 w-16 bg-[var(--bg-2)] rounded-full overflow-hidden border border-[var(--border)]">
                                <div className="h-full rounded-full" style={{ width: `${s.score * 100}%`, background: V.color }} />
                              </div>
                              <span className="font-mono text-[10px]" style={{ color: V.color }}>{s.score.toFixed(2)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">{s.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 text-[10px] font-mono text-[var(--text-muted)]">
                    <span>model: {result.model}</span>
                    <span>vectorDb: {result.vectorDb}</span>
                    <span>~{result.tokens} tokens</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Tab: Knowledge Base ── */}
        {activeTab === 'knowledge' && (
          <section className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input value={kSearch} onChange={e => setKSearch(e.target.value)}
                  placeholder="Search chunks…"
                  className="w-full pl-8 pr-3 py-2 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none" />
              </div>
              <Button icon={Plus} onClick={() => setShowKForm(!showKForm)} style={{ background: V.color, color: '#fff', border: 'none' }}>
                Add Chunk
              </Button>
            </div>

            {showKForm && (
              <div className="card p-4 space-y-3">
                <div className="flex gap-3">
                  <label className="flex-1">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Source file</span>
                    <input value={kForm.source} onChange={e => setKForm(f => ({ ...f, source: e.target.value }))}
                      placeholder="e.g. onboarding.md"
                      className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] focus:outline-none" />
                  </label>
                  <label className="w-20">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Page</span>
                    <input type="number" min={1} value={kForm.page} onChange={e => setKForm(f => ({ ...f, page: +e.target.value }))}
                      className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] focus:outline-none" />
                  </label>
                </div>
                <label>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Chunk text</span>
                  <textarea value={kForm.text} onChange={e => setKForm(f => ({ ...f, text: e.target.value }))}
                    rows={3} placeholder="Paste knowledge chunk here…"
                    className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] resize-none focus:outline-none" />
                </label>
                <div className="flex gap-2">
                  <Button icon={Plus} loading={addingChunk} onClick={addChunk} style={{ background: V.color, color: '#fff', border: 'none' }}>Add</Button>
                  <Button variant="ghost" onClick={() => setShowKForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {chunks.length === 0 && (
                <div className="card p-8 text-center text-sm text-[var(--text-muted)]">
                  {kSearch ? 'No chunks match your search.' : 'No knowledge chunks — connect the API or add one above.'}
                </div>
              )}
              {chunks.map((c, i) => (
                <div key={c.id || i} className="card p-3 flex gap-3">
                  <div className="w-1 rounded-full shrink-0" style={{ background: V.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">{c.source}</span>
                      <span className="font-mono text-[9px] text-[var(--text-muted)]">p.{c.page}</span>
                      <span className="font-mono text-[9px] text-[var(--text-muted)] ml-auto">{c.id}</span>
                    </div>
                    <p className="text-xs text-[var(--text)] leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Tab: Models ── */}
        {activeTab === 'models' && (
          <section>
            {models.length === 0 ? (
              <div className="card p-8 text-center text-sm text-[var(--text-muted)]">Connect the API to load model registry.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {models.map(m => (
                  <div key={m.id} className="card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{PROVIDER_EMOJI[m.provider] || '🤖'}</span>
                      <div>
                        <p className="text-sm font-bold text-[var(--text)]">{m.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{m.provider}</p>
                      </div>
                      <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded text-white" style={{ background: TIER_COLOR[m.tier] || '#64748b' }}>
                        {m.tier}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                      <div className="bg-[var(--bg-2)] rounded-lg p-2 border border-[var(--border)]">
                        <div className="font-bold font-mono text-[var(--text)]">{(m.contextWindow / 1000).toFixed(0)}k</div>
                        <div className="text-[var(--text-muted)]">context</div>
                      </div>
                      <div className="bg-[var(--bg-2)] rounded-lg p-2 border border-[var(--border)]">
                        <div className="font-bold font-mono text-[var(--text)]">{(m.maxOutput / 1000).toFixed(0)}k</div>
                        <div className="text-[var(--text-muted)]">max out</div>
                      </div>
                      <div className="bg-[var(--bg-2)] rounded-lg p-2 border border-[var(--border)]">
                        <div className="font-bold font-mono" style={{ color: V.color }}>{m.avgLatencyMs}ms</div>
                        <div className="text-[var(--text-muted)]">avg latency</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {m.strengths.map(s => (
                        <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-muted)]">{s}</span>
                      ))}
                    </div>
                    {m.note && <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{m.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Tab: Metrics ── */}
        {activeTab === 'metrics' && (
          <section className="space-y-6">
            {!metrics ? (
              <div className="card p-8 text-center text-sm text-[var(--text-muted)]">Connect the API to load live metrics.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MCard label="Total Queries"       value={metrics.totalQueries.toLocaleString()}    color={V.color} />
                  <MCard label="Session Queries"     value={metrics.liveSessionQueries}               color={V.color} />
                  <MCard label="Avg Top Similarity"  value={metrics.avgTopSimilarity.toFixed(2)}      color="#22c55e" />
                  <MCard label="Knowledge Chunks"    value={metrics.knowledgeChunks}                  color="#8b5cf6" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Top queries */}
                  <div className="card p-4">
                    <h3 className="text-sm font-bold text-[var(--text)] mb-3">Top Queries</h3>
                    <div className="space-y-2">
                      {metrics.topQueries.map((q, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-[var(--text-muted)] w-4">{i + 1}</span>
                          <span className="flex-1 text-xs text-[var(--text)] truncate">{q.query}</span>
                          <span className="font-mono text-xs" style={{ color: V.color }}>{q.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pipeline usage */}
                  <div className="card p-4">
                    <h3 className="text-sm font-bold text-[var(--text)] mb-3">Pipeline Usage</h3>
                    <div className="space-y-2">
                      {metrics.pipelineStats.map(p => {
                        const max = Math.max(...metrics.pipelineStats.map(x => x.totalQueries), 1)
                        return (
                          <div key={p.id}>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-[var(--text-muted)] truncate">{p.name}</span>
                              <span className="font-mono ml-2 shrink-0" style={{ color: V.color }}>{p.totalQueries.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 bg-[var(--bg-2)] rounded-full overflow-hidden border border-[var(--border)]">
                              <div className="h-full rounded-full" style={{ width: `${(p.totalQueries / max) * 100}%`, background: V.color }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}

function MCard({ label, value, color }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-mono font-bold" style={{ color }}>{value}</div>
      <div className="text-[11px] text-[var(--text-muted)] mt-1">{label}</div>
    </div>
  )
}
