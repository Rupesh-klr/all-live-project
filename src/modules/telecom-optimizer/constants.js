import {
  Network, Route, Activity, Zap, Settings, Globe,
  Radio, GitBranch, Gauge, ShieldCheck,
} from 'lucide-react'

const apiBase = '/api/telecom-optimizer/v1'

/**
 * 5 topology templates — offline fallback node lists and selector metadata.
 * Node data here mirrors the backend constants exactly (same ids, names, regions).
 * x/y coordinates are omitted on the frontend — only the backend needs them for A*.
 */
export const TOPOLOGY_OPTIONS = [
  { id: 'backbone',     name: 'Multi-Region Backbone', desc: '12 nodes · mixed WAN',          defaultSource: 'N4',  defaultTarget: 'N10' },
  { id: 'metro-ring',   name: 'City Metro Ring',       desc: '8 nodes · city fiber ring',     defaultSource: 'MR1', defaultTarget: 'MR5' },
  { id: 'hub-spoke',    name: 'Hub & Spoke ISP',       desc: '9 nodes · PoP architecture',   defaultSource: 'E4',  defaultTarget: 'E2'  },
  { id: 'linear-chain', name: 'Submarine Cable',       desc: '8 nodes · trans-oceanic trunk', defaultSource: 'LC1', defaultTarget: 'LC5' },
  { id: 'cdn-mesh',     name: 'Global CDN Mesh',       desc: '10 nodes · intercontinental',  defaultSource: 'G1',  defaultTarget: 'G10' },
]

export const TOPOLOGY_NODES = {
  'backbone': [
    { id: 'N1',  name: 'Node Alpha',   region: 'us-east',  latency: 12, status: 'active'   },
    { id: 'N2',  name: 'Node Beta',    region: 'us-east',  latency:  8, status: 'active'   },
    { id: 'N3',  name: 'Node Gamma',   region: 'us-west',  latency: 24, status: 'degraded' },
    { id: 'N4',  name: 'Node Delta',   region: 'eu-west',  latency:  5, status: 'active'   },
    { id: 'N5',  name: 'Node Epsilon', region: 'eu-west',  latency: 11, status: 'active'   },
    { id: 'N6',  name: 'Node Zeta',    region: 'us-west',  latency:  9, status: 'active'   },
    { id: 'N7',  name: 'Node Eta',     region: 'ap-south', latency:  7, status: 'active'   },
    { id: 'N8',  name: 'Node Theta',   region: 'eu-north', latency: 16, status: 'active'   },
    { id: 'N9',  name: 'Node Iota',    region: 'ap-south', latency: 21, status: 'degraded' },
    { id: 'N10', name: 'Node Kappa',   region: 'ap-east',  latency:  9, status: 'active'   },
    { id: 'N11', name: 'Node Lambda',  region: 'eu-north', latency: 14, status: 'active'   },
    { id: 'N12', name: 'Node Mu',      region: 'ap-east',  latency:  6, status: 'active'   },
  ],
  'metro-ring': [
    { id: 'MR1', name: 'Downtown Core',    region: 'city-center', latency:  5, status: 'active'   },
    { id: 'MR2', name: 'East Exchange',    region: 'east',        latency:  8, status: 'active'   },
    { id: 'MR3', name: 'Northeast Hub',    region: 'northeast',   latency: 11, status: 'active'   },
    { id: 'MR4', name: 'Industrial Zone',  region: 'southeast',   latency:  7, status: 'active'   },
    { id: 'MR5', name: 'South Campus',     region: 'south',       latency:  9, status: 'active'   },
    { id: 'MR6', name: 'West Residential', region: 'west',        latency: 18, status: 'degraded' },
    { id: 'MR7', name: 'Airport PoP',      region: 'northwest',   latency:  6, status: 'active'   },
    { id: 'MR8', name: 'University Node',  region: 'north',       latency: 12, status: 'active'   },
  ],
  'hub-spoke': [
    { id: 'H1',  name: 'Core Backbone Hub', region: 'core',      latency:  3, status: 'active'   },
    { id: 'SP1', name: 'North PoP',         region: 'north',     latency:  7, status: 'active'   },
    { id: 'SP2', name: 'East PoP',          region: 'east',      latency:  8, status: 'active'   },
    { id: 'SP3', name: 'South PoP',         region: 'south',     latency:  6, status: 'active'   },
    { id: 'SP4', name: 'West PoP',          region: 'west',      latency:  7, status: 'active'   },
    { id: 'E1',  name: 'NE Edge Node',      region: 'northeast', latency: 14, status: 'active'   },
    { id: 'E2',  name: 'SE Edge Node',      region: 'southeast', latency: 12, status: 'degraded' },
    { id: 'E3',  name: 'SW Edge Node',      region: 'southwest', latency: 19, status: 'active'   },
    { id: 'E4',  name: 'NW Edge Node',      region: 'northwest', latency: 11, status: 'active'   },
  ],
  'linear-chain': [
    { id: 'LC1', name: 'West Landing Station', region: 'na-west',  latency:  4, status: 'active'   },
    { id: 'LC2', name: 'Amplifier Station A',  region: 'mid-pac',  latency:  8, status: 'active'   },
    { id: 'LC3', name: 'Mid-Ocean Junction',   region: 'mid-pac',  latency:  7, status: 'active'   },
    { id: 'LC4', name: 'Amplifier Station B',  region: 'mid-pac',  latency:  8, status: 'active'   },
    { id: 'LC5', name: 'East Landing Station', region: 'ap-east',  latency:  4, status: 'active'   },
    { id: 'LC6', name: 'Branch Entry Point',   region: 'mid-pac',  latency: 11, status: 'active'   },
    { id: 'LC7', name: 'Branch Amplifier',     region: 'mid-pac',  latency: 16, status: 'degraded' },
    { id: 'LC8', name: 'Branch Landing',       region: 'ap-south', latency:  9, status: 'active'   },
  ],
  'cdn-mesh': [
    { id: 'G1',  name: 'NA-East (New York)',     region: 'na-east',    latency:  4, status: 'active' },
    { id: 'G2',  name: 'NA-West (Los Angeles)',  region: 'na-west',    latency:  5, status: 'active' },
    { id: 'G3',  name: 'SA (São Paulo)',          region: 'south-am',   latency: 13, status: 'active' },
    { id: 'G4',  name: 'EU-West (London)',        region: 'eu-west',    latency:  6, status: 'active' },
    { id: 'G5',  name: 'EU-Central (Frankfurt)',  region: 'eu-central', latency:  5, status: 'active' },
    { id: 'G6',  name: 'ME (Dubai)',              region: 'me',          latency:  9, status: 'active' },
    { id: 'G7',  name: 'AP-IN (Mumbai)',          region: 'ap-south',   latency: 10, status: 'active' },
    { id: 'G8',  name: 'AP-SG (Singapore)',       region: 'ap-sea',     latency:  8, status: 'active' },
    { id: 'G9',  name: 'AP-JP (Tokyo)',           region: 'ap-east',    latency:  7, status: 'active' },
    { id: 'G10', name: 'AP-AU (Sydney)',          region: 'au',          latency: 11, status: 'active' },
  ],
}

/**
 * Edges for each topology — parallel to TOPOLOGY_NODES, used for SVG map rendering.
 * Format: [sourceId, targetId] pairs (weights omitted — not needed for drawing).
 */
export const TOPOLOGY_EDGES = {
  'backbone': [
    ['N1','N2'],['N1','N4'],['N2','N3'],['N2','N5'],['N3','N6'],
    ['N4','N5'],['N4','N8'],['N5','N6'],['N5','N9'],['N6','N7'],
    ['N7','N10'],['N8','N9'],['N8','N11'],['N9','N10'],['N9','N12'],['N10','N12'],
  ],
  'metro-ring': [
    ['MR1','MR2'],['MR2','MR3'],['MR3','MR4'],['MR4','MR5'],
    ['MR5','MR6'],['MR6','MR7'],['MR7','MR8'],['MR8','MR1'],
    ['MR1','MR5'],['MR3','MR7'],['MR2','MR6'],
  ],
  'hub-spoke': [
    ['H1','SP1'],['H1','SP2'],['H1','SP3'],['H1','SP4'],
    ['SP1','E1'],['SP1','E4'],['SP2','E1'],['SP2','E2'],
    ['SP3','E2'],['SP3','E3'],['SP4','E3'],['SP4','E4'],
    ['E1','E2'],['E3','E4'],
  ],
  'linear-chain': [
    ['LC1','LC2'],['LC2','LC3'],['LC3','LC4'],['LC4','LC5'],
    ['LC2','LC6'],['LC6','LC7'],['LC7','LC8'],['LC8','LC4'],
  ],
  'cdn-mesh': [
    ['G1','G4'],['G1','G2'],['G2','G8'],['G2','G3'],['G3','G4'],
    ['G4','G5'],['G4','G6'],['G5','G6'],['G5','G9'],
    ['G6','G7'],['G6','G9'],['G7','G8'],['G7','G9'],
    ['G8','G9'],['G8','G10'],['G9','G10'],
  ],
}

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
  tech: ['Node.js', 'Graph Theory', 'React'],
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
    benchmark:    `${apiBase}/graph/benchmark`,
    history:      `${apiBase}/graph/history`,
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
      { icon: Zap,      title: 'Node.js-Native Algorithms',   detail: 'Dijkstra + A* run 100% in Node.js — no Python required. Optional Python FastAPI bridge available for heavy-compute extensions.' },
      { icon: Globe,    title: 'REST API Ready',             detail: 'POST /graph/shortest-path accepts source, target, and algorithm — returns the optimal path with total latency in milliseconds.' },
    ],
  },
  tech_stack: [
    { name: 'Node.js',  emoji: '⚡', role: 'Dijkstra + A* algorithms + REST API' },
    { name: 'React',    emoji: '⚛️', role: 'Interactive dashboard UI' },
    { name: 'MongoDB',  emoji: '🍃', role: 'Node state persistence' },
    { name: 'Python',   emoji: '🐍', role: 'Optional heavy-compute bridge (NetworkX)' },
  ],
  features: [
    { icon: Route,    title: 'Shortest Path Computation', detail: 'Dijkstra and A* compute optimal routing paths in under 5ms for networks with up to 1000 nodes.' },
    { icon: Activity, title: 'Node Health Dashboard',     detail: 'Live table — ID, latency, hop count, degradation status — colour-coded for instant scanning.' },
    { icon: Zap,      title: '130% Speed Improvement',    detail: 'Benchmarked against BFS traversal on equivalent topologies. Measurable gains on dense, high-node graphs.' },
    { icon: Settings, title: 'Python FastAPI Bridge',     detail: 'Heavy computation delegated to a Python microservice. Falls back to stub when the service is down — zero downtime for demos.' },
  ],
}
