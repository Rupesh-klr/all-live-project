import { MessageSquare, Webhook, Users, GitBranch, Bell, Shield } from 'lucide-react'

const apiBase = '/api/whatsapp-crm/v1'

/** Automated WhatsApp CRM Engine — module-owned data (nav + public page). */
export const WHATSAPP = {
  slug: 'whatsapp-crm',
  name: 'Automated WhatsApp CRM Engine',
  shortName: 'WhatsApp CRM',
  emoji: '💬',
  color: '#22c55e',
  icon: MessageSquare,
  status: 'live',
  tech: ['Node.js', 'WhatsApp API', 'MongoDB'],
  summary: 'Scalable CRM with WhatsApp Business API + event-driven webhooks.',
  highlights: ['High-concurrency webhooks', 'Custom workflow automation'],

  publicPath: '/whatsapp-crm',
  dashboardPath: '/whatsapp-crm/dashboard',
  loginPath: '/whatsapp-crm/login',

  // ── Dashboard wiring ────────────────────────────────────────
  liveDemoUrl: import.meta.env.VITE_WHATSAPP_LIVE_URL || '/whatsapp-crm',
  apiBase,
  endpoints: {
    contacts:       `${apiBase}/contacts`,
    messages:       (id) => `${apiBase}/contacts/${id}/messages`,
    inbound:        (id) => `${apiBase}/contacts/${id}/inbound`,
    templates:      `${apiBase}/templates`,
    workflows:      `${apiBase}/workflows`,
    toggleWorkflow: (id) => `${apiBase}/workflows/${id}`,
  },
  demoContacts: [
    { id: 'C1', name: 'Priya Sharma', phone: '+91 98765 43210', windowOpen: true,  unread: 2, preview: 'Thanks, also need the invoice.',                  lastTs: Date.now() - 5 * 60 * 1000 },
    { id: 'C2', name: 'Rajan Mehta',  phone: '+91 87654 32109', windowOpen: true,  unread: 0, preview: 'You: Yes, in stock. Want me to reserve one?',      lastTs: Date.now() - 3 * 60 * 60 * 1000 },
    { id: 'C5', name: 'Sara Khan',    phone: '+91 90000 11122', windowOpen: true,  unread: 1, preview: 'Is there a student discount?',                     lastTs: Date.now() - 20 * 60 * 60 * 1000 },
    { id: 'C3', name: 'Anita Patel',  phone: '+91 76543 21098', windowOpen: false, unread: 0, preview: 'You: Of course — I will share the steps.',         lastTs: Date.now() - 26 * 60 * 60 * 1000 },
    { id: 'C4', name: 'Vikram Nair',  phone: '+91 65432 10987', windowOpen: false, unread: 0, preview: 'Interested in the annual plan.',                   lastTs: Date.now() - 3 * 24 * 60 * 60 * 1000 },
  ],
  demoTemplates: [
    { id: 't_reengage', name: 'Re-engagement', body: 'Hi {{name}}, we have an update on your request. Reply here to continue the conversation.' },
    { id: 't_invoice',  name: 'Invoice ready', body: 'Hi {{name}}, your invoice is ready. Tap below to view and download it.' },
    { id: 't_offer',    name: 'Special offer', body: 'Hi {{name}}, a special offer is waiting on your account. Reply YES to learn more.' },
  ],
  demoWorkflows: [
    { id: 'w1', name: 'Welcome on opt-in',  trigger: 'New contact opt-in',     action: 'Send welcome template',       active: true,  runs: 412 },
    { id: 'w2', name: 'Keyword: PRICE',     trigger: 'Inbound matches "price"', action: 'Send pricing template',       active: true,  runs: 1290 },
    { id: 'w3', name: 'Cart abandonment',   trigger: 'No reply in 6h',          action: 'Send re-engagement template', active: false, runs: 88 },
    { id: 'w4', name: 'CSAT after resolve', trigger: 'Ticket resolved',         action: 'Send CSAT survey',            active: true,  runs: 233 },
  ],

  tagline:
    'Scalable CRM built on WhatsApp Business API. High-concurrency webhook ingestion, contact lifecycle management, outbound messaging, and no-code workflow automation.',
  stats: [
    { value: 'Real-time', label: 'Webhook Processing' },
    { value: 'HMAC',      label: 'Webhook Security' },
    { value: '24h',       label: 'Conversation Window' },
  ],
  about: {
    description:
      "A production-architecture WhatsApp CRM handling inbound webhooks, contact deduplication, outbound message dispatch, and automated workflow triggers. Built on Meta's WhatsApp Business API.",
    impact:
      'This is the architecture used by enterprise CRM teams managing thousands of WhatsApp conversations. HMAC verification, 24-hour window enforcement, and contact deduplication are all hard production requirements.',
    points: [
      { icon: Webhook,   title: 'HMAC-Verified Webhooks',    detail: 'Inbound events verified with X-Hub-Signature-256. Replay attacks and spoofed requests blocked at middleware.' },
      { icon: Users,     title: 'Contact Deduplication',     detail: 'Inbound messages upsert contacts by phone number. No duplicates regardless of message volume.' },
      { icon: GitBranch, title: 'Workflow Automation',       detail: 'No-code engine: keyword match → send template, opt-in → welcome message, schedule → bulk send.' },
      { icon: Bell,      title: '24-Hour Window Enforcement', detail: 'WhatsApp only allows free-form messages within 24h of last contact. System enforces template-only for expired windows.' },
    ],
  },
  tech_stack: [
    { name: 'Node.js',      emoji: '⚡', role: 'API + webhook handler' },
    { name: 'WhatsApp API', emoji: '💬', role: 'Meta Business API' },
    { name: 'MongoDB',      emoji: '🍃', role: 'Contact + workflow storage' },
    { name: 'React',        emoji: '⚛️', role: 'CRM dashboard UI' },
  ],
  features: [
    { icon: Webhook,       title: 'Verified Webhook Ingestion', detail: "POST /webhook verifies HMAC, deduplicates contact, stores message, triggers workflow engine — all within Meta's 5-second SLA." },
    { icon: Users,         title: 'Contact Management',         detail: 'Full contact list with conversation preview, unread count, opt-out status, and last seen timestamp.' },
    { icon: MessageSquare, title: 'Outbound Dispatch',          detail: 'Send text or template messages to any contact. Template enforced when outside the 24-hour conversation window.' },
    { icon: GitBranch,     title: 'Workflow Engine',            detail: 'Define trigger + action pairs. Toggle active/paused without redeployment. Runs tracked per workflow.' },
  ],
}
