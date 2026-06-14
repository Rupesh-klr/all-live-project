# Module: vectorshift (Frontend)

> React · Axios · Table component · Modal component · Button component

VectorShift Enterprise RAG Pipeline Builder — UI for creating, managing, and executing Retrieval-Augmented Generation pipelines. Users define a pipeline (source type → vector DB → LLM) and then run natural-language queries through it.

---

## File

| File | What it does |
|---|---|
| `Dashboard.jsx` | Pipeline list + create pipeline form + query runner |

---

## Route

```
/vectorshift
AuthGuard requiredModule="vectorshift"
```

---

## What renders

```
[← Back]

◈  VectorShift — RAG Pipeline Builder
   Interactive DAG-based AI workflow orchestration engine.

[ + New Pipeline ]

┌─────────────────┬────────────┬──────────┬────────────┬──────────┬─────────┐
│ Pipeline        │ Source     │ Vector DB│ LLM        │ Status   │ Actions │
├─────────────────┼────────────┼──────────┼────────────┼──────────┼─────────┤
│ Support FAQ     │ pdf        │ chroma   │ claude-... │ ● ready  │ Run ··· │
│ Docs Assistant  │ url        │ pinecone │ gpt-4o     │ ● ready  │ Run ··· │
└─────────────────┴────────────┴──────────┴────────────┴──────────┴─────────┘

[ Run Pipeline — Modal ]
  Query: [_________________________________]
  [ Execute ]
  ─────────────────────────────────────────
  Answer: "To reset your password..."
  Sources: page 3 (score: 0.92)
```

---

## Create pipeline

Opens a `Modal` with a form collecting:

| Field | Input type | Values |
|---|---|---|
| Pipeline name | TextBox | Free text |
| Source type | Dropdown | `pdf` `url` `s3` `text` |
| Vector DB | Dropdown | `chroma` `pinecone` `weaviate` |
| LLM | TextBox | Model ID string |
| Chunk size | TextBox (number) | Default: 512 |
| Top K | TextBox (number) | Default: 5 |

On submit:

```js
await api.post('/api/vectorshift/v1/pipelines', {
  name, sourceType, vectorDb, llm, chunkSize, topK,
})
```

On success, the pipeline list refetches.

---

## Run pipeline

Each pipeline row has a "Run" button that opens a `Modal`:

```js
async function runPipeline(id, query) {
  const { data } = await api.post(`/api/vectorshift/v1/pipelines/${id}/run`, { query })
  setResult(data.data)
  // result.answer   — the LLM's response
  // result.sources  — [{ chunk, score, page }]
  // result.latencyMs
}
```

The result is rendered in the modal below the query form.

---

## Role-gated actions

The "New Pipeline" button and the delete action check the user's role before rendering:

```jsx
const { hasRole } = useAuth()

{(hasRole('admin') || hasRole('manager')) && (
  <Button onClick={() => setCreateOpen(true)} icon={Plus}>
    New Pipeline
  </Button>
)}
```

Viewers see the table and can run pipelines — they cannot create or delete.

---

## Connecting to the live backend

```jsx
useEffect(() => {
  setLoading(true)
  api.get('/api/vectorshift/v1/pipelines')
    .then(r => setPipelines(r.data.data.pipelines))
    .catch(() => toast.error('Failed to load pipelines'))
    .finally(() => setLoading(false))
}, [])
```

---

## Backend dependency

| Endpoint | Used by |
|---|---|
| `GET /api/vectorshift/v1/pipelines` | Pipeline list table |
| `POST /api/vectorshift/v1/pipelines` | Create pipeline form |
| `POST /api/vectorshift/v1/pipelines/:id/run` | Query runner modal |
| `DELETE /api/vectorshift/v1/pipelines/:id` | Delete action (admin only) |
