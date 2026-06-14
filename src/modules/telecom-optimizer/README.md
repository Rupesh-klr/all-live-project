# Module: telecom-optimizer (Frontend)

> React · Lucide React · Table component · Badge component

Telecom Network Optimizer dashboard — visualises network nodes, latency, hop counts, and node health. Demonstrates Graph Theory applied to live network topology with summary stats and an interactive data table.

---

## File

| File | What it does |
|---|---|
| `Dashboard.jsx` | Full module view — stats cards + node table |

---

## Route

```
/telecom-optimizer
AuthGuard requiredModule="telecom-optimizer"
```

Users without `telecom-optimizer` in their `moduleAccess` array are redirected to `/dashboard`.

---

## What renders

```
[← Back]

⬡  Telecom Network Optimizer
   High-efficiency routing algorithm — Graph Theory based. 130% faster path detection.

┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  +130%        │  │  +40%         │  │  4            │
│  Path Speed   │  │  Latency Impr.│  │  Active Nodes │
└───────────────┘  └───────────────┘  └───────────────┘

┌──────────┬──────────────┬─────────┬──────┬───────────┐
│ Node ID  │ Name         │ Latency │ Hops │ Status    │
├──────────┼──────────────┼─────────┼──────┼───────────┤
│ N1       │ Node Alpha   │ 12ms    │ 3    │ ● active  │
│ N2       │ Node Beta    │ 8ms     │ 2    │ ● active  │
│ N3       │ Node Gamma   │ 24ms    │ 5    │ ● degraded│
│ N4       │ Node Delta   │ 5ms     │ 1    │ ● active  │
└──────────┴──────────────┴─────────┴──────┴───────────┘
```

---

## Component usage

### Stats cards

Three metric cards with colored values:

```jsx
const stats = [
  { label: 'Path Speed',     value: '+130%', color: 'text-cyan-500' },
  { label: 'Latency Impr.',  value: '+40%',  color: 'text-green-500' },
  { label: 'Active Nodes',   value: '4',     color: 'text-brand-500' },
]
```

### Table columns

```jsx
const COLS = [
  { key: 'id',      label: 'Node ID', render: r => (
    <span className="font-mono text-brand-500">{r.id}</span>
  )},
  { key: 'name',    label: 'Name' },
  { key: 'latency', label: 'Latency' },
  { key: 'hops',    label: 'Hops' },
  { key: 'status',  label: 'Status', render: r => (
    <Badge
      role={r.status === 'active' ? 'viewer' : 'manager'}
      label={r.status}
    />
  )},
]
```

Node ID is rendered in `font-mono text-brand-500` — visual signal that it's a system identifier.

Status uses `Badge` with a role-to-color mapping:
- `viewer` → grey (for `active` nodes — neutral indicator)
- `manager` → amber (for `degraded` nodes — attention indicator)

---

## Connecting to the live backend

The current `DEMO_NODES` array is hard-coded for demonstration. To connect to the real API:

```jsx
// Replace the static DEMO_NODES with:
const [nodes, setNodes]   = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  api.get('/api/telecom-optimizer/v1/nodes')
    .then(r => setNodes(r.data.data.nodes))
    .catch(() => toast.error('Failed to load nodes'))
    .finally(() => setLoading(false))
}, [])
```

Pass `nodes` and `loading` to `<Table>` — the Table component handles the loading skeleton automatically.

---

## Shortest-path action (next step)

To wire the shortest-path endpoint:

```jsx
async function runShortestPath(source, target) {
  const { data } = await api.post('/api/telecom-optimizer/v1/graph/shortest-path', {
    source, target, algorithm: 'dijkstra',
  })
  // data.data.path = ["N1", "N2", "N4"]
  // data.data.totalLatency = "13ms"
}
```

Render the result as a highlighted path on the node table or a separate path visualiser.

---

## Backend dependency

| Endpoint | Used by |
|---|---|
| `GET /api/telecom-optimizer/v1/nodes` | Node table data |
| `POST /api/telecom-optimizer/v1/graph/shortest-path` | Path computation action |
