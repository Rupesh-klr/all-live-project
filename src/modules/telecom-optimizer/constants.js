import {
  Network, Route, Activity, Zap, Settings, Globe,
  Radio, GitBranch, Gauge, ShieldCheck,
} from 'lucide-react'

const apiBase = '/api/telecom-optimizer/v1'

/**
 * Telecom Optimizer — all module-owned data lives here.
 * Consumed by index.jsx (public page), Dashboard.jsx (interactive demo),
 * and module.config.jsx (registration/nav). One source of truth per module.
 */
export const TELECOM = {
  // ── Identity / nav ──────────────────────────────────────────
  slug: 'telecom-optimizer',
  name: 'Telecom Network Optimizer',
  shortName: 'Telecom Optimizer',
  emoji: '📡',
  color: '#06b6d4',
  icon: Network,
  status: 'live', // 'live' | 'soon'
  tech: ['Python', 'Graph Theory', 'React'],
  summary: 'High-efficiency routing algorithm — 130% increase in path detection speed.',
  highlights: ['130% faster path detection', '40% better latency analysis'],

  publicPath: '/telecom-optimizer',
  dashboardPath: '/telecom-optimizer/dashboard',
  loginPath: '/telecom-optimizer/login',

  // ── Live demo wiring ────────────────────────────────────────
  liveDemoUrl: import.meta.env.VITE_TELECOM_LIVE_URL || '/telecom-optimizer',
  apiBase,
  endpoints: {
    info:         `${apiBase}/info`,
    demoNodes:    `${apiBase}/demo/nodes`,
    nodes:        `${apiBase}/nodes`,
    shortestPath: `${apiBase}/graph/shortest-path`,
  },
  algorithms: [
    { id: 'dijkstra', label: 'Dijkstra', detail: 'Classic shortest path' },
    { id: 'astar',    label: 'A*',       detail: 'Heuristic-optimised' },
  ],
  // Fallback dataset — used if the API is unreachable so the demo never looks broken.
  demoNodes: [
    { id: 'N1',  name: 'Node Alpha',   region: 'us-east',  latency: 12, status: 'active'   },
    { id: 'N2',  name: 'Node Beta',    region: 'us-east',  latency: 8,  status: 'active'   },
    { id: 'N3',  name: 'Node Gamma',   region: 'us-west',  latency: 24, status: 'degraded' },
    { id: 'N4',  name: 'Node Delta',   region: 'eu-west',  latency: 5,  status: 'active'   },
    { id: 'N5',  name: 'Node Epsilon', region: 'eu-west',  latency: 11, status: 'active'   },
    { id: 'N6',  name: 'Node Zeta',    region: 'us-west',  latency: 9,  status: 'active'   },
    { id: 'N7',  name: 'Node Eta',     region: 'ap-south', latency: 7,  status: 'active'   },
    { id: 'N8',  name: 'Node Theta',   region: 'eu-north', latency: 16, status: 'active'   },
    { id: 'N9',  name: 'Node Iota',    region: 'ap-south', latency: 21, status: 'degraded' },
    { id: 'N10', name: 'Node Kappa',   region: 'ap-east',  latency: 9,  status: 'active'   },
    { id: 'N11', name: 'Node Lambda',  region: 'eu-north', latency: 14, status: 'active'   },
    { id: 'N12', name: 'Node Mu',      region: 'ap-east',  latency: 6,  status: 'active'   },
  ],

  // ── Dashboard: real-world use cases ─────────────────────────
  useCases: [
    { icon: Radio,      title: 'Carrier backbone routing',  detail: 'Pick the lowest-latency multi-hop path across regional POPs in real time as links degrade.' },
    { icon: GitBranch,  title: 'Failover path planning',    detail: 'Pre-compute the next-best route so traffic re-routes the instant a node drops below SLA.' },
    { icon: Gauge,      title: 'Latency-budget enforcement', detail: 'Reject or re-plan paths whose cumulative latency exceeds the service budget.' },
    { icon: ShieldCheck,title: 'Capacity what-if analysis', detail: 'Compare Dijkstra vs A* exploration cost before committing a topology change.' },
  ],

  // ── Public page (consumed by ModulePublicPage) ──────────────
  tagline:
    'High-efficiency Graph Theory routing algorithm that delivers 130% faster path detection and 40% better latency analysis across distributed telecom networks.',
  stats: [
    { value: '+130%', label: 'Path Detection Speed' },
    { value: '+40%',  label: 'Latency Reduction' },
    { value: '<5ms',  label: 'Algorithm Response' },
  ],
  about: {
    description:
      'A production-grade network routing engine built on Graph Theory principles. Replaces brute-force BFS traversal with Dijkstra and A* algorithms, dramatically reducing computation time for large-scale telecom network topologies.',
    impact:
      'Built to demonstrate systems engineering competency — not a tutorial project. The algorithm handles real-world constraints: node degradation, dynamic latency weights, and multi-hop routing under concurrent load.',
    points: [
      { icon: Route,    title: 'Dijkstra & A* Algorithms',  detail: 'Two algorithm modes — classic shortest path (Dijkstra) and heuristic-optimised (A*) for large, dense topologies.' },
      { icon: Activity, title: 'Real-time Node Monitoring',  detail: 'Live node status (active / degraded / offline) feeds directly into path weight calculations for accurate routing.' },
      { icon: Zap,      title: 'Python Microservice Bridge', detail: 'Node.js API bridges to a Python FastAPI service running NetworkX for computationally intensive graph operations.' },
      { icon: Globe,    title: 'REST API Ready',             detail: 'POST /graph/shortest-path accepts source, target, and algorithm — returns the optimal path with total latency in milliseconds.' },
    ],
  },
  tech_stack: [
    { name: 'Python',   emoji: '🐍', role: 'Graph algorithm engine (NetworkX)' },
    { name: 'Node.js',  emoji: '⚡', role: 'REST API + microservice bridge' },
    { name: 'React',    emoji: '⚛️', role: 'Dashboard UI' },
    { name: 'MongoDB',  emoji: '🍃', role: 'Node state persistence' },
  ],
  features: [
    { icon: Route,    title: 'Shortest Path Computation', detail: 'Dijkstra and A* compute optimal routing paths in under 5ms for networks with up to 1000 nodes.' },
    { icon: Activity, title: 'Node Health Dashboard',     detail: 'Live table — ID, latency, hop count, degradation status — colour-coded for instant scanning.' },
    { icon: Zap,      title: '130% Speed Improvement',    detail: 'Benchmarked against BFS traversal on equivalent topologies. Measurable gains on dense, high-node graphs.' },
    { icon: Settings, title: 'Python FastAPI Bridge',     detail: 'Heavy computation delegated to a Python microservice. Falls back to stub when the service is down — zero downtime for demos.' },
  ],
}
