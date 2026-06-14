import { useState, useEffect, useCallback } from 'react'
import {
  ExternalLink, Send, RefreshCw, Check, Clock, Loader2, ArrowRight,
  Wallet, ShieldCheck, AlertCircle, FileText, BarChart2, TrendingUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../common/DashboardLayout'
import { SubTabs } from '../common/SubTabs'
import { Button } from '../../components/Button/Button'
import { Table } from '../../components/Table/Table'
import { Pagination } from '../../components/Pagination/Pagination'
import api from '../../utils/api'
import { BANKING as B } from './constants'

const TABS = [
  { id: 'accounts',   label: 'Accounts',      icon: Wallet       },
  { id: 'transfer',   label: 'Transfer',       icon: Send         },
  { id: 'ledger',     label: 'Ledger',         icon: FileText     },
  { id: 'risk',       label: 'Risk Monitor',   icon: AlertCircle  },
  { id: 'compliance', label: 'Compliance',     icon: ShieldCheck  },
]

const TX_STEPS = ['pending', 'processing', 'settled']
const statusColor = { settled: 'text-green-500', processing: 'text-amber-500', pending: 'text-blue-400', failed: 'text-red-500' }
const sevColor    = { high: '#ef4444', medium: '#f59e0b', low: '#64748b' }
const sevBg       = { high: '#ef444415', medium: '#f59e0b15', low: '#64748b15' }
const kycColor    = { verified: 'text-green-500', pending: 'text-amber-500', failed: 'text-red-500' }
const amlColor    = { clear: 'text-green-500', review: 'text-amber-500', flagged: 'text-red-500' }

const newKey = () => 'idem_' + (crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 12))
const money  = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const LEDGER_COLS = [
  { key: 'id',     label: 'TX ID',  render: r => <span className="font-mono text-amber-400 text-xs">{r.id}</span> },
  { key: 'from',   label: 'From',   render: r => <span className="font-mono text-xs">{r.from}</span> },
  { key: 'to',     label: 'To',     render: r => <span className="font-mono text-xs">{r.to}</span> },
  { key: 'amount', label: 'Amount', align: 'right', render: r => <span className="font-mono text-xs">{money(r.amount)} {r.currency}</span> },
  { key: 'status', label: 'Status', render: r => <span className={`font-mono text-[10px] font-bold uppercase ${statusColor[r.status]}`}>{r.status}</span> },
]

const COMPLIANCE_COLS = [
  { key: 'accountId', label: 'Account',    render: r => <span className="font-mono text-amber-400 text-xs">{r.accountId}</span> },
  { key: 'name',      label: 'Name',       render: r => <span className="text-xs">{r.name}</span> },
  { key: 'kyc',       label: 'KYC',        render: r => <span className={`font-mono text-[10px] font-bold uppercase ${kycColor[r.kycStatus]}`}>{r.kycStatus}</span> },
  { key: 'aml',       label: 'AML',        render: r => <span className={`font-mono text-[10px] font-bold uppercase ${amlColor[r.amlFlag]}`}>{r.amlFlag}</span> },
  { key: 'risk',      label: 'Risk Score', render: r => <RiskBar score={r.riskScore} /> },
  { key: 'reviewed',  label: 'Last Review',render: r => <span className="text-[10px] text-[var(--text-muted)] font-mono">{r.lastReviewed || '—'}</span> },
]

function RiskBar({ score }) {
  const color = score > 70 ? '#ef4444' : score > 40 ? '#f59e0b' : '#22c55e'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 bg-[var(--bg-2)] rounded-full overflow-hidden border border-[var(--border)]">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="font-mono text-[10px]" style={{ color }}>{score}</span>
    </div>
  )
}

export function BankingDashboard() {
  const [activeTab, setActiveTab] = useState('accounts')
  const [live, setLive] = useState(false)

  // ── Accounts ───────────────────────────────────────────────────────────────
  const [accounts, setAccounts] = useState(B.demoAccounts)

  // ── Transfer ───────────────────────────────────────────────────────────────
  const [form, setForm]       = useState({ from: 'ACC-1001', to: 'ACC-1002', amount: 1000, idempotencyKey: newKey() })
  const [submitting, setSubmitting] = useState(false)
  const [activeTx,   setActiveTx]   = useState(null)

  // ── Ledger ─────────────────────────────────────────────────────────────────
  const [ledger,     setLedger]     = useState([])
  const [ledgerMeta, setLedgerMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 6 })

  // ── Risk ───────────────────────────────────────────────────────────────────
  const [alerts,    setAlerts]    = useState([])
  const [riskLoading, setRiskLoading] = useState(false)

  // ── Compliance ─────────────────────────────────────────────────────────────
  const [compliance,     setCompliance]     = useState([])
  const [complianceLoading, setComplianceLoading] = useState(false)

  // ── Boot ───────────────────────────────────────────────────────────────────
  const loadAccounts = useCallback(async () => {
    try { const { data } = await api.get(`${B.endpoints.accounts}?page=1&limit=20`); if (data?.data) { setAccounts(data.data); setLive(true) } }
    catch { setLive(false) }
  }, [])

  const loadLedger = useCallback(async (page = 1) => {
    try { const { data } = await api.get(`${B.endpoints.transactions}?page=${page}&limit=6`); setLedger(data.data); setLedgerMeta(data.pagination) }
    catch { /* offline */ }
  }, [])

  useEffect(() => { loadAccounts(); loadLedger(1) }, [loadAccounts, loadLedger])

  useEffect(() => {
    if (activeTab === 'risk') loadRisk()
    if (activeTab === 'compliance') loadComplianceData()
  }, [activeTab])

  // ── Settlement poller ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeTx || activeTx.status === 'settled' || activeTx.status === 'failed') return
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(B.endpoints.status(activeTx.id))
        setActiveTx(data.data)
        if (data.data.status === 'settled') { loadAccounts(); loadLedger(1) }
      } catch { /* ignore */ }
    }, 800)
    return () => clearTimeout(t)
  }, [activeTx])

  // ── Transfer action ────────────────────────────────────────────────────────
  async function submit() {
    if (!form.amount || +form.amount <= 0) return toast.error('Enter a valid amount')
    if (form.from === form.to) return toast.error('Source and destination must differ')
    setSubmitting(true)
    try {
      const { data } = await api.post(B.endpoints.transactions, { ...form, amount: +form.amount })
      setActiveTx(data.data)
      setForm(f => ({ ...f, idempotencyKey: newKey() }))
      toast.success('Transaction accepted (202)')
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed') }
    finally { setSubmitting(false) }
  }

  // ── Risk / Compliance ──────────────────────────────────────────────────────
  async function loadRisk() {
    setRiskLoading(true)
    try { const { data } = await api.get(B.endpoints.riskAlerts); setAlerts(data.data || []) }
    catch { /* offline */ }
    finally { setRiskLoading(false) }
  }

  async function loadComplianceData() {
    setComplianceLoading(true)
    try { const { data } = await api.get(B.endpoints.compliance); setCompliance(data.data || []) }
    catch { /* offline */ }
    finally { setComplianceLoading(false) }
  }

  const accountOptions = accounts.map(a => ({ value: a.id, label: `${a.id} · ${a.name} (${a.currency})` }))

  return (
    <DashboardLayout
      slug={B.slug} title={B.name}
      subtitle="Async 202-accepted settlement · idempotent transactions · rule-based risk alerts · KYC/AML compliance."
      actions={
        <a href={B.liveDemoUrl} target={B.liveDemoUrl.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <Button variant="outline" icon={ExternalLink} iconPos="right">Live Demo</Button>
        </a>
      }
    >
      <div className="max-w-5xl">
        {/* Status banner */}
        <div className="card p-4 flex items-center gap-3 border-l-2 mb-6" style={{ borderLeftColor: B.color }}>
          <TrendingUp size={16} style={{ color: B.color }} />
          <p className="text-sm text-[var(--text)]">Async settlement · idempotency · risk scoring · KYC/AML</p>
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">{live ? 'API live' : 'demo data'}</span>
          </div>
        </div>

        <SubTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} color={B.color} />

        {/* ── Tab: Accounts ── */}
        {activeTab === 'accounts' && (
          <section>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map(a => (
                <div key={a.id} className="card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">{a.id}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-muted)]">{a.type}</span>
                  </div>
                  <p className="text-sm font-semibold text-[var(--text)]">{a.name}</p>
                  <div>
                    <div className="text-xl font-mono font-bold" style={{ color: B.color }}>{money(a.balance)}</div>
                    <div className="text-xs font-mono text-[var(--text-muted)]">{a.currency}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Tab: Transfer ── */}
        {activeTab === 'transfer' && (
          <section className="card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Send size={15} style={{ color: B.color }} />
              <h2 className="text-sm font-bold text-[var(--text)]">Submit Transfer</h2>
              <span className="text-xs text-[var(--text-muted)]">— returns 202 immediately, then poll to settled</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">From</span>
                <select value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                  className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none">
                  {accountOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <label>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">To</span>
                <select value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                  className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none">
                  {accountOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <label>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Amount</span>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none" />
              </label>
              <label>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Idempotency Key</span>
                <div className="flex gap-2">
                  <input value={form.idempotencyKey} readOnly
                    className="flex-1 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-[10px] font-mono text-[var(--text-muted)] focus:outline-none" />
                  <button onClick={() => setForm(f => ({ ...f, idempotencyKey: newKey() }))}
                    className="px-2 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-2)]"><RefreshCw size={12} /></button>
                </div>
              </label>
            </div>

            <Button icon={Send} loading={submitting} onClick={submit} style={{ background: B.color, color: '#fff', border: 'none' }}>
              Submit Transaction (202)
            </Button>

            {/* Settlement stepper */}
            {activeTx && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {TX_STEPS.map((s, i) => {
                    const idx   = TX_STEPS.indexOf(activeTx.status)
                    const done  = i <= idx
                    const curr  = i === idx
                    return (
                      <div key={s} className="flex items-center gap-2 shrink-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          done ? 'text-white' : 'border border-[var(--border)] text-[var(--text-muted)]'
                        }`} style={done ? { background: B.color } : {}}>
                          {done ? (curr && activeTx.status !== 'settled' ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />) : i + 1}
                        </div>
                        <span className={`text-xs capitalize ${curr ? 'font-bold text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>{s}</span>
                        {i < TX_STEPS.length - 1 && <ArrowRight size={12} className="text-[var(--text-muted)]" />}
                      </div>
                    )
                  })}
                </div>

                <div className="rounded-lg bg-[var(--bg-2)] border border-[var(--border)] p-3 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">TX ID</span><span className="text-amber-400">{activeTx.id}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Amount</span><span>{money(activeTx.amount)} {activeTx.currency}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Status</span><span className={statusColor[activeTx.status]}>{activeTx.status}</span></div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Tab: Ledger ── */}
        {activeTab === 'ledger' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                <FileText size={15} style={{ color: B.color }} /> Transaction Ledger
              </h2>
              <Button variant="ghost" icon={RefreshCw} onClick={() => loadLedger(ledgerMeta.page)}>Refresh</Button>
            </div>
            <Table columns={LEDGER_COLS} rows={ledger} emptyMessage="No transactions yet — submit one in the Transfer tab." />
            <Pagination page={ledgerMeta.page} totalPages={ledgerMeta.totalPages} total={ledgerMeta.total}
              pageSize={ledgerMeta.limit} onPage={loadLedger} />
          </section>
        )}

        {/* ── Tab: Risk Monitor ── */}
        {activeTab === 'risk' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} style={{ color: B.color }} />
                <h2 className="text-sm font-bold text-[var(--text)]">Risk Alerts</h2>
                {alerts.length > 0 && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    {alerts.filter(a => a.severity === 'high').length} high severity
                  </span>
                )}
              </div>
              <Button variant="ghost" icon={RefreshCw} loading={riskLoading} onClick={loadRisk}>Refresh</Button>
            </div>

            {alerts.length === 0 && !riskLoading ? (
              <div className="card p-8 text-center text-sm text-[var(--text-muted)]">
                No risk alerts — connect the API to load live alerts.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(a => (
                  <div key={a.id} className="card p-4 flex gap-4"
                    style={{ borderLeft: `3px solid ${sevColor[a.severity]}`, background: sevBg[a.severity] }}>
                    <AlertCircle size={16} style={{ color: sevColor[a.severity], flexShrink: 0, marginTop: 2 }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
                          style={{ color: sevColor[a.severity], background: sevBg[a.severity], border: `1px solid ${sevColor[a.severity]}40` }}>
                          {a.type}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">{a.accountId}</span>
                        <span className="ml-auto text-[10px] text-[var(--text-muted)]">{relTime(a.ts)}</span>
                      </div>
                      <p className="text-xs text-[var(--text)] leading-relaxed">{a.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Tab: Compliance ── */}
        {activeTab === 'compliance' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} style={{ color: B.color }} />
                <h2 className="text-sm font-bold text-[var(--text)]">KYC / AML Compliance</h2>
              </div>
              <Button variant="ghost" icon={RefreshCw} loading={complianceLoading} onClick={loadComplianceData}>Refresh</Button>
            </div>

            {compliance.length === 0 && !complianceLoading ? (
              <div className="card p-8 text-center text-sm text-[var(--text-muted)]">
                Connect the API to load compliance data.
              </div>
            ) : (
              <Table columns={COMPLIANCE_COLS} rows={compliance} loading={complianceLoading} emptyMessage="No compliance data." />
            )}

            <div className="mt-4 card p-3 flex flex-wrap gap-4 text-[10px] text-[var(--text-muted)]">
              <span className="text-green-500 font-mono">● verified</span>
              <span className="text-amber-500 font-mono">● pending</span>
              <span className="text-red-500 font-mono">● flagged</span>
              <span className="ml-2">Risk score: green &lt;40 · amber 40–70 · red &gt;70</span>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}

function relTime(ts) {
  if (!ts) return '—'
  const d = Date.now() - ts
  if (d < 60000)   return 'just now'
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`
  if (d < 86400000)return `${Math.floor(d / 3600000)}h ago`
  return `${Math.floor(d / 86400000)}d ago`
}
