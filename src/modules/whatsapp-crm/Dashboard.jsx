import { useState, useEffect, useCallback, useRef } from 'react'
import {
  MessageSquare, Send, Lock, RefreshCw, GitBranch,
  ExternalLink, Users, Play, Pause, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../common/DashboardLayout'
import { Button } from '../../components/Button/Button'
import api from '../../utils/api'
import { WHATSAPP as W } from './constants'

const TABS = ['Inbox', 'Workflows']

const fmt = (ts) => {
  if (!ts) return ''
  const diff = Date.now() - ts
  if (diff < 60_000) return 'now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  return `${Math.floor(diff / 86_400_000)}d`
}

export function WhatsAppDashboard() {
  const [tab, setTab] = useState('Inbox')
  const [contacts, setContacts] = useState(W.demoContacts)
  const [activeId, setActiveId] = useState(W.demoContacts[0]?.id)
  const [messages, setMessages] = useState([])
  const [windowOpen, setWindowOpen] = useState(true)
  const [templates, setTemplates] = useState(W.demoTemplates)
  const [workflows, setWorkflows] = useState(W.demoWorkflows)
  const [live, setLive] = useState(false)
  const [composerText, setComposerText] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [sending, setSending] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const threadRef = useRef(null)

  const loadContacts = useCallback(async () => {
    try {
      const { data } = await api.get(W.endpoints.contacts)
      if (data?.data) { setContacts(data.data); setLive(true) }
    } catch { setLive(false) }
  }, [])

  const loadMessages = useCallback(async (id) => {
    if (!id) return
    try {
      const { data } = await api.get(W.endpoints.messages(id))
      setMessages(data.data.messages || [])
      setWindowOpen(data.data.windowOpen)
      setContacts(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
    } catch {
      setMessages([])
    }
  }, [])

  const loadTemplates = useCallback(async () => {
    try {
      const { data } = await api.get(W.endpoints.templates)
      if (data?.data) setTemplates(data.data)
    } catch {}
  }, [])

  const loadWorkflows = useCallback(async () => {
    try {
      const { data } = await api.get(W.endpoints.workflows)
      if (data?.data) setWorkflows(data.data)
    } catch {}
  }, [])

  useEffect(() => { loadContacts(); loadTemplates(); loadWorkflows() }, [loadContacts, loadTemplates, loadWorkflows])

  useEffect(() => { if (activeId) loadMessages(activeId) }, [activeId, loadMessages])

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [messages])

  async function sendMsg() {
    if (!activeId) return
    setSending(true)
    try {
      const payload = windowOpen
        ? { type: 'text', text: composerText }
        : { type: 'template', templateId: selectedTemplate }
      const { data } = await api.post(W.endpoints.messages(activeId), payload)
      setMessages(prev => [...prev, data.data.message])
      setWindowOpen(data.data.windowOpen)
      setComposerText('')
      toast.success('Sent')
    } catch (err) {
      if (err.response?.status === 403) toast.error('Window closed — select a template instead')
      else toast.error(err.response?.data?.message || 'Send failed — start the backend')
    } finally {
      setSending(false)
    }
  }

  async function simulateInbound() {
    if (!activeId) return
    setSimulating(true)
    try {
      const { data } = await api.post(W.endpoints.inbound(activeId), { text: 'Yes, please continue 👍' })
      setMessages(prev => [...prev, data.data.message])
      setWindowOpen(true)
      setContacts(prev => prev.map(c => c.id === activeId ? { ...c, windowOpen: true } : c))
      toast.success('Inbound simulated — 24h window reopened')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Simulate failed — start the backend')
    } finally {
      setSimulating(false)
    }
  }

  async function toggleWorkflow(id) {
    try {
      const { data } = await api.patch(W.endpoints.toggleWorkflow(id))
      setWorkflows(prev => prev.map(w => w.id === id ? data.data : w))
    } catch {
      toast.error('Toggle failed — start the backend')
    }
  }

  const activeContact = contacts.find(c => c.id === activeId)

  return (
    <DashboardLayout
      slug={W.slug}
      title={W.name}
      subtitle="Live WhatsApp inbox — send free-form text inside the 24h window, approved templates outside it."
      actions={
        <a href={W.liveDemoUrl} target={W.liveDemoUrl?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <Button variant="outline" icon={ExternalLink} iconPos="right">Live Demo</Button>
        </a>
      }
    >
      <div className="max-w-6xl space-y-6">

        {/* Live banner */}
        <div className="card p-4 flex items-center gap-3 border-l-2" style={{ borderLeftColor: W.color }}>
          <MessageSquare size={16} style={{ color: W.color }} />
          <p className="text-xs text-[var(--text-muted)] flex-1">
            API at <span className="font-mono text-[var(--text)]">{W.apiBase}</span> — 24h window enforced server-side; free-form blocked outside it, template required.
          </p>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{live ? 'api live' : 'offline'}</span>
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--border)]">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest border-b-2 -mb-px transition-colors ${
                tab === t ? '' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              style={tab === t ? { borderBottomColor: W.color, color: W.color, borderBottom: `2px solid ${W.color}` } : {}}
            >
              <span className="flex items-center gap-1.5">
                {t === 'Inbox' ? <MessageSquare size={11} /> : <GitBranch size={11} />}
                {t}
              </span>
            </button>
          ))}
        </div>

        {/* ── INBOX TAB ── */}
        {tab === 'Inbox' && (
          <div className="card overflow-hidden" style={{ height: 560 }}>
            <div className="flex h-full">

              {/* Contact list */}
              <div className="w-72 shrink-0 border-r border-[var(--border)] flex flex-col overflow-y-auto">
                <div className="px-3 py-2.5 border-b border-[var(--border)] shrink-0">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                    <Users size={10} /> Contacts ({contacts.length})
                  </span>
                </div>
                {contacts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`w-full text-left px-3 py-3 border-b border-[var(--border)] hover:bg-[var(--bg-2)] transition-colors ${activeId === c.id ? 'bg-[var(--bg-2)]' : ''}`}
                    style={activeId === c.id ? { borderLeft: `2px solid ${W.color}` } : {}}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-[var(--text)] truncate">{c.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {c.unread > 0 && (
                          <span className="text-[9px] font-bold bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">{c.unread}</span>
                        )}
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${c.windowOpen ? 'bg-green-500' : 'bg-red-400'}`}
                          title={c.windowOpen ? 'Window open' : 'Window closed'}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] truncate">{c.phone}</p>
                    {c.preview && (
                      <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5 opacity-70">{c.preview}</p>
                    )}
                    {c.lastTs && (
                      <p className="text-[9px] text-[var(--text-muted)] mt-0.5 opacity-50">{fmt(c.lastTs)}</p>
                    )}
                  </button>
                ))}
              </div>

              {/* Conversation panel */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] shrink-0">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{activeContact?.name || '—'}</p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)]">{activeContact?.phone || ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${windowOpen ? 'border-green-500/30 text-green-500 bg-green-500/10' : 'border-red-400/30 text-red-400 bg-red-400/10'}`}>
                      {windowOpen ? '✓ 24h window open' : '✗ window closed'}
                    </span>
                    <button
                      onClick={simulateInbound}
                      disabled={simulating || !live}
                      title={live ? 'Simulate an inbound reply to reopen the 24h window' : 'Start the backend to use this'}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-40 flex items-center gap-1 transition-colors"
                    >
                      {simulating ? <RefreshCw size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                      Sim Inbound
                    </button>
                  </div>
                </div>

                {/* Message thread */}
                <div ref={threadRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare size={28} className="text-[var(--text-muted)] mb-2 opacity-30" />
                      <p className="text-xs text-[var(--text-muted)] opacity-60">
                        {live ? 'No messages in this conversation.' : 'Start the backend to load conversations.'}
                      </p>
                    </div>
                  ) : (
                    messages.map((m, i) => (
                      <div key={m.id || i} className={`flex ${m.dir === 'out' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[72%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                            m.dir === 'out'
                              ? 'rounded-tr-sm text-white'
                              : 'rounded-tl-sm bg-[var(--bg-2)] text-[var(--text)] border border-[var(--border)]'
                          }`}
                          style={m.dir === 'out' ? { background: W.color } : {}}
                        >
                          {m.type === 'template' && (
                            <p className="text-[9px] font-mono uppercase tracking-widest mb-1 opacity-60">template</p>
                          )}
                          <span>{m.text}</span>
                          <p className={`text-[9px] mt-1 text-right ${m.dir === 'out' ? 'opacity-60' : 'text-[var(--text-muted)]'}`}>
                            {fmt(m.ts)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Composer */}
                <div className="border-t border-[var(--border)] px-4 py-3 shrink-0">
                  {windowOpen ? (
                    <div className="flex gap-2">
                      <textarea
                        value={composerText}
                        onChange={e => setComposerText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (composerText.trim()) sendMsg() } }}
                        placeholder={live ? 'Type a message… (Enter to send)' : 'Start the backend to send messages'}
                        disabled={!live}
                        rows={2}
                        className="flex-1 resize-none bg-[var(--bg-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-brand-500 disabled:opacity-50"
                      />
                      <Button
                        icon={Send}
                        loading={sending}
                        onClick={sendMsg}
                        disabled={!composerText.trim() || !live}
                      >Send</Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        <Lock size={10} className="shrink-0" />
                        <span>24-hour window closed — only approved templates can be sent. Hit <strong>Sim Inbound</strong> to reopen it.</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={selectedTemplate}
                            onChange={e => setSelectedTemplate(e.target.value)}
                            disabled={!live}
                            className="w-full appearance-none bg-[var(--bg-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-mono text-[var(--text)] focus:outline-none focus:border-brand-500 pr-8 disabled:opacity-50"
                          >
                            <option value="">Select template…</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                        </div>
                        <Button
                          icon={Send}
                          loading={sending}
                          onClick={sendMsg}
                          disabled={!selectedTemplate || !live}
                          variant="outline"
                        >Send Template</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WORKFLOWS TAB ── */}
        {tab === 'Workflows' && (
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-muted)]">
              Toggle workflows active/paused — changes hit <span className="font-mono text-[var(--text)]">PATCH {W.apiBase}/workflows/:id</span>.
            </p>
            {workflows.map(w => (
              <div key={w.id} className="card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)]">{w.name}</p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                    <span className="text-[var(--text)]">trigger:</span> {w.trigger}
                    &nbsp;<span className="opacity-40">→</span>&nbsp;
                    <span className="text-[var(--text)]">action:</span> {w.action}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-[var(--text-muted)] whitespace-nowrap shrink-0">
                  {w.runs.toLocaleString()} runs
                </span>
                <button
                  onClick={() => toggleWorkflow(w.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors ${
                    w.active
                      ? 'border-green-500/30 text-green-500 bg-green-500/10 hover:bg-green-500/20'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-2)]'
                  }`}
                >
                  {w.active ? <><Pause size={10} /> Active</> : <><Play size={10} /> Paused</>}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
