import { useState, useEffect, useCallback, useRef } from 'react'
import {
  MessageSquare, Send, Lock, RefreshCw, GitBranch,
  ExternalLink, Users, Play, Pause, BarChart2, Megaphone,
  FileText, Search, Plus, CheckCircle, Circle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../common/DashboardLayout'
import { SubTabs } from '../common/SubTabs'
import { Button } from '../../components/Button/Button'
import api from '../../utils/api'
import { WHATSAPP as W } from './constants'

const TABS = [
  { id: 'inbox',     label: 'Inbox',     icon: MessageSquare },
  { id: 'contacts',  label: 'Contacts',  icon: Users        },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone    },
  { id: 'templates', label: 'Templates', icon: FileText     },
  { id: 'analytics', label: 'Analytics', icon: BarChart2    },
]

const fmt = (ts) => {
  if (!ts) return ''
  const d = Date.now() - ts
  if (d < 60000) return 'now'
  if (d < 3600000) return `${Math.floor(d / 60000)}m`
  if (d < 86400000) return `${Math.floor(d / 3600000)}h`
  return `${Math.floor(d / 86400000)}d`
}

const audienceLabel = { all: 'All contacts', window_open: 'Window open', window_closed: 'Window closed' }

export function WhatsAppDashboard() {
  const [activeTab, setActiveTab] = useState('inbox')

  // ── Shared data ────────────────────────────────────────────────────────────
  const [contacts,  setContacts]  = useState(W.demoContacts)
  const [templates, setTemplates] = useState(W.demoTemplates)
  const [workflows, setWorkflows] = useState(W.demoWorkflows)
  const [campaigns, setCampaigns] = useState(W.demoCampaigns)
  const [live,      setLive]      = useState(false)

  // ── Inbox state ────────────────────────────────────────────────────────────
  const [activeId,        setActiveId]        = useState(W.demoContacts[0]?.id)
  const [messages,        setMessages]        = useState([])
  const [windowOpen,      setWindowOpen]      = useState(true)
  const [composerText,    setComposerText]    = useState('')
  const [selectedTpl,     setSelectedTpl]     = useState('')
  const [sending,         setSending]         = useState(false)
  const [simulating,      setSimulating]      = useState(false)
  const threadRef = useRef(null)

  // ── Contacts state ─────────────────────────────────────────────────────────
  const [contactSearch, setContactSearch] = useState('')
  const [windowFilter,  setWindowFilter]  = useState('all')

  // ── Campaigns state ────────────────────────────────────────────────────────
  const [campForm,    setCampForm]    = useState({ name: '', templateId: 't_reengage', audience: 'all' })
  const [creating,    setCreating]    = useState(false)
  const [sending2,    setSending2]    = useState(null)

  // ── Analytics state ────────────────────────────────────────────────────────
  const [analytics, setAnalytics] = useState(null)

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [cRes, tRes, wRes, campRes] = await Promise.all([
          api.get(W.endpoints.contacts),
          api.get(W.endpoints.templates),
          api.get(W.endpoints.workflows),
          api.get(W.endpoints.campaigns),
        ])
        if (cRes.data?.data)    setContacts(cRes.data.data)
        if (tRes.data?.data)    setTemplates(tRes.data.data)
        if (wRes.data?.data)    setWorkflows(wRes.data.data)
        if (campRes.data?.data) setCampaigns(campRes.data.data)
        setLive(true)
      } catch { setLive(false) }
    })()
  }, [])

  const loadMessages = useCallback(async (id) => {
    if (!id) return
    try {
      const { data } = await api.get(W.endpoints.messages(id))
      setMessages(data.data.messages || [])
      setWindowOpen(data.data.windowOpen)
    } catch {
      const c = contacts.find(x => x.id === id)
      setMessages([])
      setWindowOpen(c?.windowOpen ?? true)
    }
  }, [contacts])

  useEffect(() => { loadMessages(activeId) }, [activeId])

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics()
  }, [activeTab])

  // ── Inbox actions ──────────────────────────────────────────────────────────
  async function sendMessage() {
    if (!windowOpen && !selectedTpl) return
    setSending(true)
    try {
      const body = windowOpen
        ? { type: 'text', text: composerText.trim() }
        : { type: 'template', templateId: selectedTpl }
      const { data } = await api.post(W.endpoints.messages(activeId), body)
      setMessages(m => [...m, data.data.message])
      setWindowOpen(data.data.windowOpen)
      setComposerText('')
      setContacts(cs => cs.map(c => c.id === activeId
        ? { ...c, preview: data.data.message.text, lastTs: data.data.message.ts } : c))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Send failed')
    } finally { setSending(false) }
  }

  async function simInbound() {
    setSimulating(true)
    try {
      const { data } = await api.post(W.endpoints.inbound(activeId))
      setMessages(m => [...m, data.data.message])
      setWindowOpen(true)
      setContacts(cs => cs.map(c => c.id === activeId ? { ...c, windowOpen: true } : c))
    } catch { toast.error('Sim inbound failed') }
    finally { setSimulating(false) }
  }

  // ── Workflow toggle ────────────────────────────────────────────────────────
  async function toggleWorkflow(id) {
    try {
      const { data } = await api.patch(W.endpoints.toggleWorkflow(id))
      setWorkflows(ws => ws.map(w => w.id === id ? data.data : w))
    } catch { toast.error('Toggle failed') }
  }

  // ── Campaign actions ───────────────────────────────────────────────────────
  async function createCampaign() {
    if (!campForm.name.trim()) return toast.error('Campaign name is required')
    setCreating(true)
    try {
      const { data } = await api.post(W.endpoints.campaigns, campForm)
      setCampaigns(cs => [data.data, ...cs])
      setCampForm({ name: '', templateId: 't_reengage', audience: 'all' })
      toast.success('Campaign created')
    } catch (err) { toast.error(err.response?.data?.message || 'Create failed') }
    finally { setCreating(false) }
  }

  async function sendCampaign(id) {
    setSending2(id)
    try {
      const { data } = await api.patch(W.endpoints.sendCampaign(id))
      setCampaigns(cs => cs.map(c => c.id === id ? data.data : c))
      toast.success(`Sent to ${data.data.sentCount} contacts`)
    } catch (err) { toast.error(err.response?.data?.message || 'Send failed') }
    finally { setSending2(null) }
  }

  // ── Analytics ──────────────────────────────────────────────────────────────
  async function loadAnalytics() {
    try {
      const { data } = await api.get(W.endpoints.analytics)
      setAnalytics(data.data)
    } catch { /* offline — analytics won't show */ }
  }

  const activeContact = contacts.find(c => c.id === activeId)
  const filteredContacts = contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(contactSearch.toLowerCase()) || c.phone.includes(contactSearch)
    const matchWindow = windowFilter === 'all' ? true : windowFilter === 'open' ? c.windowOpen : !c.windowOpen
    return matchSearch && matchWindow
  })

  return (
    <DashboardLayout
      slug={W.slug} title={W.name}
      subtitle="WhatsApp Business API — 24h window enforcement, bulk campaigns, no-code workflow automation."
      actions={
        <a href={W.liveDemoUrl} target={W.liveDemoUrl.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <Button variant="outline" icon={ExternalLink} iconPos="right">Live Demo</Button>
        </a>
      }
    >
      <div className="max-w-6xl">
        {/* Status banner */}
        <div className="card p-4 flex items-center gap-3 border-l-2 mb-6" style={{ borderLeftColor: W.color }}>
          <MessageSquare size={16} style={{ color: W.color }} />
          <p className="text-sm text-[var(--text)]">WhatsApp 24h window · inbox · campaigns · workflows</p>
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">{live ? 'API live' : 'demo mode'}</span>
          </div>
        </div>

        <SubTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} color={W.color} />

        {/* ── Tab: Inbox ── */}
        {activeTab === 'inbox' && (
          <div className="flex gap-0 border border-[var(--border)] rounded-xl overflow-hidden" style={{ height: 520 }}>
            {/* Contact list */}
            <div className="w-72 shrink-0 border-r border-[var(--border)] flex flex-col">
              <div className="p-3 border-b border-[var(--border)]">
                <span className="text-xs font-bold text-[var(--text)]">Conversations</span>
                <span className="ml-2 font-mono text-[10px] text-[var(--text-muted)]">{contacts.length} contacts</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {contacts.map(c => (
                  <button key={c.id} onClick={() => setActiveId(c.id)}
                    className={`w-full text-left px-3 py-2.5 border-b border-[var(--border)] transition-colors hover:bg-[var(--bg-2)] ${
                      activeId === c.id ? 'bg-[var(--bg-2)]' : ''
                    }`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${c.windowOpen ? 'bg-green-500' : 'bg-zinc-500'}`} />
                      <span className="text-xs font-semibold text-[var(--text)] truncate">{c.name}</span>
                      {c.unread > 0 && (
                        <span className="ml-auto shrink-0 text-[9px] font-mono bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">{c.unread}</span>
                      )}
                      <span className="ml-auto shrink-0 text-[10px] text-[var(--text-muted)]">{fmt(c.lastTs)}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] truncate pl-4">{c.preview}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Thread + composer */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              {activeContact && (
                <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{activeContact.name}</p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)]">{activeContact.phone}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className={`w-1.5 h-1.5 rounded-full ${windowOpen ? 'bg-green-500' : 'bg-zinc-500'}`} />
                    <span className="text-[10px] text-[var(--text-muted)]">{windowOpen ? '24h window open' : 'window closed'}</span>
                  </div>
                  <Button variant="ghost" size="sm" icon={RefreshCw} loading={simulating} onClick={simInbound}>Sim Inbound</Button>
                </div>
              )}

              {/* Thread */}
              <div ref={threadRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.dir === 'out' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[72%] px-3 py-2 rounded-xl text-xs ${
                      m.dir === 'out'
                        ? 'text-white rounded-br-sm'
                        : 'bg-[var(--bg-2)] border border-[var(--border)] text-[var(--text)] rounded-bl-sm'
                    }`} style={m.dir === 'out' ? { background: W.color } : {}}>
                      {m.text}
                      {m.type === 'template' && (
                        <span className="block text-[8px] opacity-60 mt-0.5 font-mono uppercase tracking-widest">template</span>
                      )}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)]">
                    No messages yet — send one below
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="p-3 border-t border-[var(--border)]">
                {windowOpen ? (
                  <div className="flex gap-2">
                    <textarea value={composerText} onChange={e => setComposerText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (composerText.trim()) sendMessage() } }}
                      placeholder="Type a message… (Enter to send)"
                      rows={2}
                      className="flex-1 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] resize-none focus:outline-none focus:border-[var(--brand-500)]" />
                    <Button icon={Send} loading={sending} onClick={sendMessage} disabled={!composerText.trim()}>Send</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-amber-500">
                      <Lock size={12} /><span>24h window closed — template required</span>
                    </div>
                    <div className="flex gap-2">
                      <select value={selectedTpl} onChange={e => setSelectedTpl(e.target.value)}
                        className="flex-1 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--text)] focus:outline-none">
                        <option value="">Select template…</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <Button icon={Send} loading={sending} onClick={sendMessage} disabled={!selectedTpl}>Send Template</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Contacts ── */}
        {activeTab === 'contacts' && (
          <section className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input value={contactSearch} onChange={e => setContactSearch(e.target.value)}
                  placeholder="Search name or phone…"
                  className="w-full pl-8 pr-3 py-2 bg-[var(--bg-2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none" />
              </div>
              <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
                {['all','open','closed'].map(f => (
                  <button key={f} onClick={() => setWindowFilter(f)}
                    className={`px-3 py-2 text-xs font-mono capitalize transition-colors ${
                      windowFilter === f ? 'text-white' : 'text-[var(--text-muted)] bg-[var(--bg-2)] hover:text-[var(--text)]'
                    }`}
                    style={windowFilter === f ? { background: W.color } : {}}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="card divide-y divide-[var(--border)]">
              {filteredContacts.length === 0 && (
                <p className="py-6 text-center text-sm text-[var(--text-muted)]">No contacts match your filter.</p>
              )}
              {filteredContacts.map(c => (
                <div key={c.id} className="flex items-center gap-4 px-4 py-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${c.windowOpen ? 'bg-green-500' : 'bg-zinc-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)]">{c.name}</p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)]">{c.phone}</p>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {(c.tags || []).map(tag => (
                      <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-muted)]">{tag}</span>
                    ))}
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${c.windowOpen ? 'text-green-400 bg-green-500/10' : 'text-zinc-400 bg-zinc-500/10'}`}>
                    {c.windowOpen ? 'window open' : 'window closed'}
                  </span>
                  <button onClick={() => { setActiveId(c.id); setActiveTab('inbox') }}
                    className="text-[10px] font-mono px-2 py-1 rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                    Open chat
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Tab: Campaigns ── */}
        {activeTab === 'campaigns' && (
          <section className="space-y-6">
            {/* Create form */}
            <div className="card p-5">
              <h3 className="text-sm font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                <Plus size={14} style={{ color: W.color }} />New Campaign
              </h3>
              <div className="flex flex-wrap gap-3 items-end">
                <label className="flex-1 min-w-[160px]">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Name</span>
                  <input value={campForm.name} onChange={e => setCampForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Campaign name…"
                    className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none" />
                </label>
                <label className="min-w-[160px]">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Template</span>
                  <select value={campForm.templateId} onChange={e => setCampForm(f => ({ ...f, templateId: e.target.value }))}
                    className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none">
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </label>
                <label className="min-w-[140px]">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-1">Audience</span>
                  <select value={campForm.audience} onChange={e => setCampForm(f => ({ ...f, audience: e.target.value }))}
                    className="w-full bg-[var(--bg-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none">
                    <option value="all">All contacts</option>
                    <option value="window_open">Window open</option>
                    <option value="window_closed">Window closed</option>
                  </select>
                </label>
                <Button icon={Plus} loading={creating} onClick={createCampaign} style={{ background: W.color, color: '#fff', border: 'none' }}>
                  Create
                </Button>
              </div>
            </div>

            {/* Campaign list */}
            <div className="space-y-3">
              {campaigns.map(c => {
                const tpl = templates.find(t => t.id === c.templateId)
                return (
                  <div key={c.id} className="card p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)]">{c.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {tpl?.name || c.templateId} · {audienceLabel[c.audience]}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      {c.status === 'sent' ? (
                        <>
                          <span className="font-mono text-[var(--text-muted)]">{c.sentCount} sent</span>
                          <span className="font-mono" style={{ color: W.color }}>{c.openRate}% open</span>
                          <span className="flex items-center gap-1 text-green-500"><CheckCircle size={12} />sent</span>
                        </>
                      ) : (
                        <span className="flex items-center gap-1 text-[var(--text-muted)]"><Circle size={12} />draft</span>
                      )}
                    </div>
                    {c.status === 'draft' && (
                      <Button size="sm" icon={Send} loading={sending2 === c.id} onClick={() => sendCampaign(c.id)}
                        style={{ background: W.color, color: '#fff', border: 'none', fontSize: '12px', padding: '4px 12px' }}>
                        Send
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Tab: Templates ── */}
        {activeTab === 'templates' && (
          <section>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(t => (
                <div key={t.id} className="card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText size={14} style={{ color: W.color }} />
                    <span className="text-sm font-semibold text-[var(--text)]">{t.name}</span>
                    {t.category && (
                      <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-muted)]">
                        {t.category}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-2)] rounded-lg p-3 leading-relaxed font-mono">
                    {t.body}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                    <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[var(--bg-2)] border border-[var(--border)] rounded">{t.id}</span>
                    <span>· pre-approved · usable outside 24h window</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Tab: Analytics ── */}
        {activeTab === 'analytics' && (
          <section className="space-y-6">
            {!analytics ? (
              <div className="card p-8 text-center text-sm text-[var(--text-muted)]">
                Loading analytics — connect the backend API to see live data.
              </div>
            ) : (
              <>
                {/* KPI grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="Total Contacts"    value={analytics.totalContacts}           color={W.color} />
                  <StatCard label="Window Open Rate"  value={`${analytics.windowOpenRate}%`}    color="#22c55e" />
                  <StatCard label="Total Messages"    value={analytics.totalMessages}            color={W.color} />
                  <StatCard label="Response Rate"     value={`${analytics.responseRate}%`}       color="#22c55e" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Message breakdown */}
                  <div className="card p-4">
                    <h3 className="text-sm font-bold text-[var(--text)] mb-3">Message Breakdown</h3>
                    <div className="space-y-2">
                      <Bar label="Inbound"   value={analytics.inbound}       total={analytics.totalMessages} color="#22c55e" />
                      <Bar label="Outbound"  value={analytics.outbound}      total={analytics.totalMessages} color={W.color} />
                      <Bar label="Templates" value={analytics.templatesSent} total={analytics.totalMessages} color="#8b5cf6" />
                    </div>
                  </div>

                  {/* Window status */}
                  <div className="card p-4">
                    <h3 className="text-sm font-bold text-[var(--text)] mb-3">Window Status</h3>
                    <div className="space-y-3">
                      <Bar label="Open"   value={analytics.contactsByWindow.open}   total={analytics.totalContacts} color="#22c55e" />
                      <Bar label="Closed" value={analytics.contactsByWindow.closed} total={analytics.totalContacts} color="#64748b" />
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-[var(--bg-2)] border border-[var(--border)]">
                      <p className="text-xs text-[var(--text-muted)]">
                        Active workflows: <span className="font-bold text-[var(--text)]">{analytics.activeWorkflows}</span>
                        {' · '}Total workflow runs: <span className="font-bold" style={{ color: W.color }}>{analytics.totalWorkflowRuns.toLocaleString()}</span>
                      </p>
                      {analytics.topWorkflow && (
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Top workflow: <span className="font-bold text-[var(--text)]">{analytics.topWorkflow.name}</span>
                          {' '}({analytics.topWorkflow.runs.toLocaleString()} runs)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Workflow table */}
                <div className="card divide-y divide-[var(--border)]">
                  <div className="px-4 py-2 flex items-center">
                    <span className="text-xs font-bold text-[var(--text)]">Workflow Performance</span>
                  </div>
                  {workflows.map(w => (
                    <div key={w.id} className="flex items-center gap-4 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[var(--text)]">{w.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{w.trigger} → {w.action}</p>
                      </div>
                      <span className="font-mono text-sm font-bold" style={{ color: W.color }}>{w.runs.toLocaleString()}</span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">runs</span>
                      <button onClick={() => toggleWorkflow(w.id)}
                        className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                          w.active ? 'border-green-500/30 text-green-500 bg-green-500/10' : 'border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-2)]'
                        }`}>
                        {w.active ? <Play size={10} /> : <Pause size={10} />}
                        {w.active ? 'active' : 'paused'}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-mono font-bold" style={{ color }}>{value}</div>
      <div className="text-[11px] text-[var(--text-muted)] mt-1">{label}</div>
    </div>
  )
}

function Bar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round(value / total * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className="font-mono" style={{ color }}>{value} ({pct}%)</span>
      </div>
      <div className="h-1.5 bg-[var(--bg-2)] rounded-full overflow-hidden border border-[var(--border)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
