import { useState, useEffect } from 'react'
import {
  ExternalLink, Play, Plus, FileText, GitBranch, Database, Bot,
  ArrowRight, Search, Sparkles, X, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../common/DashboardLayout'
import { Button } from '../../components/Button/Button'
import { Badge } from '../../components/Badge/Badge'
import api from '../../utils/api'
import { VECTORSHIFT as V } from './constants'

const STEPS = [
  { key: 'source',   label: 'Source',    icon: FileText },
  { key: 'chunker',  label: 'Chunking',  icon: GitBranch },
  { key: 'vectorDb', label: 'Vector DB', icon: Database },
  { key: 'llm',      label: 'LLM',       icon: Bot },
]

export function VectorShiftDashboard() {
  const [pipelines, setPipelines] = useState(V.demoPipelines)
  const [selectedId, setSelectedId] = useState(V.demoPipelines[0]?.id)
  const [options, setOptions] = useState(V.builderFallback)
  const [live, setLive] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', source: 'Notion', chunker: 'Semantic', vectorDb: 'Pinecone', llm: 'claude-opus-4-8', topK: 4 })
  const [creating, setCreating] = useState(false)

  const [query, setQuery] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)

  const selected = pipelines.find(p => p.id === selectedId) || pipelines[0]

  useEffect(() => {
    (async () => {
      try {
        const [pRes, oRes] = await Promise.all([
          api.get(`${V.endpoints.pipelines}?page=1&limit=20`),
          api.get(V.endpoints.options),
        ])
        if (pRes.data?.data?.length) {
          setPipelines(pRes.data.data)
          setSelectedId(pRes.data.data[0].id)
        }
        if (oRes.data?.data) setOptions(oRes.data.data)
        setLive(true)
      } catch {
        setLive(false) // offline — builder still renders from fallbacks
      }
    })()
  }, [])

  async function createPipeline() {
    if (!form.name.trim()) return toast.error('Give the pipeline a name')
    setCreating(true)
    try {
      const { data } = await api.post(V.endpoints.create, form)
      setPipelines(p => [data.data, ...p])
      setSelectedId(data.data.id)
      setShowForm(false)
      setForm(f => ({ ...f, name: '' }))
      toast.success('Pipeline created')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create pipeline (is the API running?)')
    } finally {
      setCreating(false)
    }
  }

  async function runQuery(q) {
    const text = (q ?? query).trim()
    if (!text) return toast.error('Type a question first')
    if (q != null) setQuery(q)
    setRunning(true); setResult(null)
    const t0 = performance.now()
    try {
      const { data } = await api.post(V.endpoints.run(selected.id), { query: text })
      setResult({ ...data.data, clientMs: Math.round(performance.now() - t0) })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Query failed — start the backend to run RAG')
    } finally {
      setRunning(false)
    }
  }

  return (
    <DashboardLayout
      slug={V.slug}
      title={V.name}
      subtitle="Design a Retrieval-Augmented Generation pipeline, then run a semantic query against the live engine."
      actions={
        <a href={V.liveDemoUrl} target={V.liveDemoUrl.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <Button variant="outline" icon={ExternalLink} iconPos="right">Live Demo</Button>
        </a>
      }
    >
      <div className="max-w-5xl space-y-8">

        {/* Live banner */}
        <div className="card p-4 flex items-center gap-3 border-l-2" style={{ borderLeftColor: V.color }}>
          <Sparkles size={16} style={{ color: V.color }} />
          <p className="text-xs text-[var(--text-muted)] flex-1">
            Retrieval runs on the real engine at <span className="font-mono text-[var(--text)]">{V.apiBase}</span> — keyword-grounded over an indexed knowledge base.
          </p>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{live ? 'engine live' : 'offline'}</span>
          </span>
        </div>

        {/* Pipelines */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
              <GitBranch size={15} style={{ color: V.color }} /> Pipelines
            </h2>
            <Button size="sm" variant="ghost" icon={showForm ? X : Plus} onClick={() => setShowForm(s => !s)}>
              {showForm ? 'Cancel' : 'New Pipeline'}
            </Button>
          </div>

          {/* New pipeline builder form */}
          {showForm && (
            <div className="card p-4 mb-3 space-y-3">
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Pipeline name (e.g. Support KB RAG)"
                className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-brand-500"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Select label="Source"    value={form.source}   opts={options.sources}   onChange={v => setForm(f => ({ ...f, source: v }))} />
                <Select label="Chunking"  value={form.chunker}  opts={options.chunkers}  onChange={v => setForm(f => ({ ...f, chunker: v }))} />
                <Select label="Vector DB" value={form.vectorDb} opts={options.vectorDbs} onChange={v => setForm(f => ({ ...f, vectorDb: v }))} />
                <Select label="LLM"       value={form.llm}      opts={options.llmModels} onChange={v => setForm(f => ({ ...f, llm: v }))} />
              </div>
              <Button size="sm" icon={Plus} loading={creating} onClick={createPipeline}>Create pipeline</Button>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pipelines.map(p => (
              <button
                key={p.id}
                onClick={() => { setSelectedId(p.id); setResult(null) }}
                className={`card p-4 text-left transition-all ${selected?.id === p.id ? 'ring-1' : 'hover:-translate-y-0.5'}`}
                style={selected?.id === p.id ? { boxShadow: `0 0 0 1px ${V.color}`, borderColor: V.color } : undefined}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-[var(--text)] truncate">{p.name}</span>
                  <span className={`font-mono text-[9px] uppercase font-bold ${p.status === 'running' ? 'text-green-500' : 'text-gray-500'}`}>{p.status}</span>
                </div>
                <p className="font-mono text-[10px] text-[var(--text-muted)]">{p.vectorDb} · {p.llm}</p>
                <p className="font-mono text-[10px] text-[var(--text-muted)] mt-1">{p.queries?.toLocaleString?.() ?? p.queries} queries</p>
              </button>
            ))}
          </div>
        </section>

        {/* DAG visualization of the selected pipeline */}
        {selected && (
          <section>
            <h2 className="text-sm font-bold text-[var(--text)] mb-3 flex items-center gap-2">
              <Database size={15} style={{ color: V.color }} /> Pipeline DAG — {selected.name}
            </h2>
            <div className="card p-5 flex items-center gap-2 overflow-x-auto">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.key} className="flex items-center gap-2 shrink-0">
                    <div className="rounded-xl border px-4 py-3 min-w-[120px] text-center" style={{ borderColor: `${V.color}40`, background: `${V.color}08` }}>
                      <Icon size={16} style={{ color: V.color }} className="mx-auto mb-1.5" />
                      <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-muted)]">{step.label}</p>
                      <p className="text-xs font-semibold text-[var(--text)] mt-0.5">{selected[step.key]}</p>
                    </div>
                    {i < STEPS.length - 1 && <ArrowRight size={14} className="text-[var(--text-muted)] shrink-0" />}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Query runner */}
        <section className="card p-5">
          <h2 className="text-sm font-bold text-[var(--text)] mb-1 flex items-center gap-2">
            <Search size={15} style={{ color: V.color }} /> Semantic Query
          </h2>
          <p className="text-xs text-[var(--text-muted)] mb-3">Ask a question — the pipeline retrieves the most relevant chunks and grounds an answer in them.</p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {V.sampleQueries.map(q => (
              <button key={q} onClick={() => runQuery(q)} className="text-[11px] font-mono px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-brand-500 transition-colors">
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runQuery() }}
              rows={2}
              placeholder="Type a question and hit Run (⌘/Ctrl+Enter)…"
              className="flex-1 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] resize-none focus:outline-none focus:border-brand-500"
            />
            <Button icon={Play} loading={running} onClick={() => runQuery()} className="self-stretch">Run</Button>
          </div>

          <div className="mt-2 rounded-lg bg-[var(--bg-2)] border border-[var(--border)] px-3 py-1.5 font-mono text-[10px] text-[var(--text-muted)] overflow-x-auto">
            <span className="text-green-500 font-bold">POST</span> {V.apiBase}/pipelines/{selected?.id}/run
          </div>

          {running && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
              <Loader2 size={13} className="animate-spin" /> retrieving chunks · ranking · synthesising…
            </div>
          )}

          {result && (
            <div className="mt-4 space-y-4">
              {/* Answer */}
              <div className="rounded-xl border p-4" style={{ borderColor: `${V.color}30`, background: `${V.color}08` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Bot size={14} style={{ color: V.color }} />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">{result.model}</span>
                  {!result.grounded && <Badge role="guest" label="low confidence" />}
                </div>
                <p className="text-sm text-[var(--text)] leading-relaxed">{result.answer}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-[10px] font-mono text-[var(--text-muted)]">
                  <span>{result.sources.length} sources</span>
                  <span>~{result.tokens} tokens</span>
                  <span>{result.vectorDb}</span>
                  <span>{result.clientMs}ms round-trip</span>
                </div>
              </div>

              {/* Source chunks */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-2">Retrieved chunks</p>
                <div className="space-y-2">
                  {result.sources.map(s => (
                    <div key={s.id} className="card p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[11px] text-[var(--text)]">{s.source} · p.{s.page}</span>
                        <span className="font-mono text-[10px]" style={{ color: V.color }}>{(s.score * 100).toFixed(0)}% match</span>
                      </div>
                      <div className="h-1 rounded-full bg-[var(--bg-2)] mb-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.score * 100}%`, background: V.color }} />
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

function Select({ label, value, opts, onChange }) {
  return (
    <label className="block">
      <span className="block text-[9px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs font-mono text-[var(--text)] focus:outline-none focus:border-brand-500"
      >
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}
