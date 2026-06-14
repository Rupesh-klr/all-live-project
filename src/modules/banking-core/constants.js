import { Landmark, Shield, Zap, RefreshCw, BarChart, Lock } from 'lucide-react'

const apiBase = '/api/banking-core/v1'

/** Distributed Banking Core — module-owned data (nav + public page + dashboard). */
export const BANKING = {
  slug: 'banking-core',
  name: 'Distributed Banking Core',
  shortName: 'Banking Core',
  emoji: '🏦',
  color: '#f59e0b',
  icon: Landmark,
  status: 'live',
  tech: ['Node.js', 'Kafka', 'MongoDB'],
  summary: 'Fault-tolerant banking system — 99.9% reliability.',
  highlights: ['Kafka event streaming', 'Idempotent transactions'],

  publicPath: '/banking-core',
  dashboardPath: '/banking-core/dashboard',
  loginPath: '/banking-core/login',

  // ── Dashboard wiring ────────────────────────────────────────
  liveDemoUrl: import.meta.env.VITE_BANKING_LIVE_URL || '/banking-core',
  apiBase,
  endpoints: {
    accounts:     `${apiBase}/accounts`,
    transactions: `${apiBase}/transactions`,
    status:       (id) => `${apiBase}/transactions/${id}/status`,
  },
  demoAccounts: [
    { id: 'ACC-1001', name: 'Operating Account', currency: 'USD', balance: 184230.55, type: 'checking' },
    { id: 'ACC-1002', name: 'Payroll Reserve',   currency: 'USD', balance: 92450.00,  type: 'reserve'  },
    { id: 'ACC-1003', name: 'Tax Holding',        currency: 'USD', balance: 38900.75,  type: 'holding'  },
    { id: 'ACC-2001', name: 'EU Settlement',      currency: 'EUR', balance: 47820.10,  type: 'settlement' },
    { id: 'ACC-3001', name: 'APAC Treasury',      currency: 'SGD', balance: 210500.00, type: 'treasury' },
    { id: 'ACC-4001', name: 'Merchant Float',     currency: 'GBP', balance: 15640.20,  type: 'float'    },
  ],

  tagline:
    'Fault-tolerant distributed banking system with Kafka event streaming, idempotent transaction submission, and a 99.9% reliability design. Async fire-and-poll transaction model.',
  stats: [
    { value: '99.9%', label: 'Reliability Target' },
    { value: 'Async', label: 'Transaction Model' },
    { value: 'Kafka', label: 'Event Streaming' },
  ],
  about: {
    description:
      'A distributed banking core demonstrating event-driven architecture. Transaction submission is fully asynchronous — POST returns 202 Accepted, the transaction is published to Kafka, processed by a consumer, and the client polls for settled status.',
    impact:
      'This is the pattern used in production banking systems at scale. The idempotency key prevents double-charges on retry. The async model means the API never blocks on slow DB writes or network latency.',
    points: [
      { icon: Zap,       title: 'Kafka Event Streaming', detail: 'Transactions published to a Kafka topic. Consumer processes debit/credit and updates status. API never blocks.' },
      { icon: RefreshCw, title: 'Idempotent Submission', detail: 'Client provides idempotencyKey. Same key submitted twice returns the first result — safe to retry on network failure.' },
      { icon: Shield,    title: 'Role-Based Access',     detail: 'Account list: admin/manager only. Transaction submit: all authenticated roles. Audit log: auditor only.' },
      { icon: BarChart,  title: 'Status Polling',        detail: 'GET /transactions/:id/status — poll every 2 seconds. Lifecycle: pending → processing → settled | failed.' },
    ],
  },
  tech_stack: [
    { name: 'Node.js',  emoji: '⚡', role: 'REST API + Kafka producer' },
    { name: 'Kafka',    emoji: '📨', role: 'Event streaming backbone' },
    { name: 'MongoDB',  emoji: '🍃', role: 'Account + transaction storage' },
    { name: 'React',    emoji: '⚛️', role: 'Banking dashboard UI' },
  ],
  features: [
    { icon: Zap,       title: 'Async Transaction Processing', detail: 'POST /transactions returns 202 immediately. Transaction queued to Kafka, consumer settles asynchronously — no blocking.' },
    { icon: RefreshCw, title: 'Idempotency Keys',             detail: 'Client-generated UUID per transaction prevents duplicates on retry. Backend returns the first result on replay.' },
    { icon: Landmark,  title: 'Account Management',           detail: 'Multi-currency account registry with balance tracking. Admin/manager role required to view all accounts.' },
    { icon: Lock,      title: 'JWT + Role Security',          detail: 'Every endpoint requires Bearer token. Account access gated to admin/manager. Transaction submit open to all authenticated roles.' },
  ],
}
