import { useState, useEffect, useCallback } from 'react'
import {
  ExternalLink, Send, RefreshCw, Check, Clock, Loader2, ArrowRight,
  Wallet, ShieldCheck, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../common/DashboardLayout'
import { Button } from '../../components/Button/Button'
import { Table } from '../../components/Table/Table'
import { Pagination } from '../../components/Pagination/Pagination'
import api from '../../utils/api'
import { BANKING as B } from './constants'

const TX_STEPS = ['pending', 'processing', 'settled']
const statusColor = { settled: 'text-green-500', processing: 'text-amber-500', pending: 'text-blue-400', failed: 'text-red-500' }

const newKey = () => 'idem_' + (crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 12))
const money = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const LEDGER_COLS = [
  { key: 'id',     label: 'TX ID',  render: r => <span className="font-mono text-amber-400">{r.id}</span> },
  { key: 'from',   label: 'From',   render: r => <span className="font-mono text-xs">{r.from}</span> },
  { key: 'to',     label: 'To',     render: r => <span className="font-mono text-xs">{r.to}</span> },
  { key: 'amount', label: 'Amount', align: 'right', render: r => <span className="font-mono">{money(r.amount)} {r.currency}</span> },
  { key: 'status', label: 'Status', render: r => <span className={`font-mono text-[10px] font-bold uppercase ${statusColor[r.status]}`}>{r.status}</span> },
]

export function BankingDashboard() {
  const [accounts, setAccounts] = useState(B.demoAccounts)
  const [live, setLive] = useState(false)

  const [form, setForm] = useState({ from: 'ACC-1001', to: 'ACC-1002', amount: 1000, idempotencyKey: newKey() })
  const [submitting, setSubmitting] = useState(false)
  const [activeTx, setActiveTx] = useState(null)

  const [ledger, setLedger] = useState([])
  const [ledgerMeta, setLedgerMeta] = useState({ page: 1, totalPages: 1, total: 0, limit: 6 })

  const loadAccounts = useCallback(async () => {
    try {
      const { data } = await api.get(`${B.endpoints.accounts}?page=1&limit=20`)
      if (data?.data) { setAccounts(data.data); setLive(true) }
    } catch { setLive(false) }
  }, [])

  const loadLedger = useCallback(async (page = 1) => {
    try {
      const { data } = await api.get(`${B.endpoints.transactions}?page=${page}&limit=6`)
      setLedger(data.data); setLedgerMeta(data.pagination)
    } catch { /* offline — ledger stays empty */ }
  }, [])

  useEffect(() => { loadAccounts(); loadLedger(1) }, [loadAccounts, loadLedger])

  // Poll the active transaction until it settles (or fails).
  useEffect(() => {
    if (!activeTx || activeTx.status === 'settled' || activeTx.status === 'failed') return
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(B.endpoints.status(activeTx.id))
        setActiveTx(data.data)
        if (data.data.status === 'settled') { loadAccounts(); loadLedger(1) }
      } catch { /* ignore transient poll error */ }
    }, 1200)
    return () => clearTimeout(t)
  }, [activeTx, loadAccounts, loadLedger])

  async function submit() {
    setSubmitting(true)
    try {
      const { data } = await api.post(B.endpoints.transactions, {
        from: form.from, to: form.to, amount: Number(form.amount), idempotencyKey: form.idempotencyKey,
      })
      setActiveTx(data.data)
      if (data.data.idempotentReplay) toast('Idempotent replay — original transaction returned, no double charge', { icon: '♻️' })
      else toast.success(`Accepted — ${data.data.id}`)
      loadLedger(1)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed — start the backend to process transactions')
    } finally {
      setSubmitting(false)
    }
  }

  const activeIdx = activeTx ? TX_STEPS.indexOf(activeTx.status) : -1

  return (
    <DashboardLayout
      slug={B.slug}
      title={B.name}
      subtitle="Submit a transfer — it's accepted asynchronously, then settles through the real state machine. Retries are idempotent."
      actions={
        <a href={B.liveDemoUrl} target={B.liveDemoUrl.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <Button variant="outline" icon={ExternalLink} iconPos="right">Live Demo</Button>
        </a>
      }
    >
      <div className="max-w-5xl space-y-8">

        {/* Live banner */}
        <div className="card p-4 flex items-center gap-3 border-l-2" style={{ borderLeftColor: B.color }}>
          <ShieldCheck size={16} style={{ color: B.color }} />
          <p className="text-xs text-[var(--text-muted)] flex-1">
            Transactions POST to <span className="font-mono text-[var(--text)]">{B.apiBase}/transactions</span> → 202 Accepted → poll until settled.
          </p>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{live ? 'core live' : 'offline'}</span>
          </span>
        </div>

        {/* Accounts */}
        <section>
          <h2 className="text-sm font-bold text-[var(--text)] mb-3 flex items-center gap-2">
            <Wallet size={15} style={{ color: B.color }} /> Accounts
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map(a => (
              <div key={a.id} className="card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">{a.id}</span>
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text-muted)]">{a.type}</span>
                </div>
                <p className="text-sm font-semibold text-[var(--text)] truncate">{a.name}</p>
                <p className="text-lg font-mono font-bold mt-1" style={{ color: B.color }}>
                  {money(a.balance)} <span className="text-xs text-[var(--text-muted)]">{a.currency}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Transfer + live status */}
        <section className="grid lg:grid-cols-2 gap-4">
          {/* Transfer form */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-[var(--text)] mb-4 flex items-center gap-2">
              <Send size={15} style={{ color: B.color }} /> New Transfer
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <AccountSelect label="From" value={form.from} accounts={accounts} onChange={v => setForm(f => ({ ...f, from: v }))} />
                <AccountSelect label="To"   value={form.to}   accounts={accounts} onChange={v => setForm(f => ({ ...f, to: v }))} />
              </div>
              <label className="block">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Amount</span>
                <input
                  type="number" min="0" step="0.01" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono text-[var(--text)] focus:outline-none focus:border-brand-500"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Idempotency Key</span>
                <div className="flex gap-2">
                  <input
                    value={form.idempotencyKey}
                    onChange={e => setForm(f => ({ ...f, idempotencyKey: e.target.value }))}
                    className="flex-1 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-muted)] focus:outline-none focus:border-brand-500"
                  />
                  <button onClick={() => setForm(f => ({ ...f, idempotencyKey: newKey() }))} title="Regenerate" className="px-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]">
                    <RefreshCw size={13} />
                  </button>
                </div>
              </label>
              <div className="flex gap-2">
                <Button icon={Send} loading={submitting} onClick={submit} fullWidth>Submit (202)</Button>
                <Button variant="ghost" onClick={submit} title="Submit again with the same key">Retry</Button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono leading-relaxed">
                Tip: hit <span className="text-[var(--text)]">Retry</span> with the same key — the core returns the original transaction, never a double charge.
              </p>
            </div>
          </div>

          {/* Live status */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-[var(--text)] mb-4 flex items-center gap-2">
              <Clock size={15} style={{ color: B.color }} /> Settlement Status
            </h2>
            {!activeTx ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <Wallet size={28} className="text-[var(--text-muted)] mb-2 opacity-50" />
                <p className="text-xs text-[var(--text-muted)]">Submit a transfer to watch it settle live.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-sm text-[var(--text)]">{activeTx.id}</span>
                  <span className="font-mono text-sm">{money(activeTx.amount)} {activeTx.currency}</span>
                </div>

                {activeTx.status === 'failed' ? (
                  <div className="flex items-center gap-2 text-red-500 text-sm"><AlertCircle size={16} /> Transaction failed</div>
                ) : (
                  <div className="flex items-center justify-between">
                    {TX_STEPS.map((step, i) => {
                      const done = i < activeIdx, active = i === activeIdx
                      return (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors`}
                                 style={{
                                   borderColor: done || active ? B.color : 'var(--border)',
                                   background: done ? B.color : 'transparent',
                                 }}>
                              {done ? <Check size={14} className="text-white" />
                                : active ? <Loader2 size={14} className="animate-spin" style={{ color: B.color }} />
                                : <span className="text-[10px] font-mono text-[var(--text-muted)]">{i + 1}</span>}
                            </div>
                            <span className={`text-[10px] font-mono uppercase ${done || active ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>{step}</span>
                          </div>
                          {i < TX_STEPS.length - 1 && (
                            <div className="flex-1 h-0.5 mx-1 rounded-full" style={{ background: done ? B.color : 'var(--border)' }} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="mt-5 rounded-lg bg-[var(--bg-2)] border border-[var(--border)] px-3 py-2 font-mono text-[10px] text-[var(--text-muted)] break-all">
                  key: {activeTx.idempotencyKey || '—'}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Ledger */}
        <section>
          <h2 className="text-sm font-bold text-[var(--text)] mb-3 flex items-center gap-2">
            <ArrowRight size={15} style={{ color: B.color }} /> Transaction Ledger
          </h2>
          <Table columns={LEDGER_COLS} rows={ledger} emptyMessage="No transactions yet — submit one above." />
          <Pagination
            page={ledgerMeta.page} totalPages={ledgerMeta.totalPages}
            total={ledgerMeta.total} pageSize={ledgerMeta.limit}
            onPage={loadLedger}
          />
        </section>
      </div>
    </DashboardLayout>
  )
}

function AccountSelect({ label, value, accounts, onChange }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-2 py-2 text-xs font-mono text-[var(--text)] focus:outline-none focus:border-brand-500"
      >
        {accounts.map(a => <option key={a.id} value={a.id}>{a.id} · {a.currency}</option>)}
      </select>
    </label>
  )
}
