import { Layers, Database, Bot, Zap, GitBranch, Search } from 'lucide-react'

const apiBase = '/api/vectorshift/v1'

/** VectorShift — module-owned data (nav + public page + dashboard). */
export const VECTORSHIFT = {
  slug: 'vectorshift',
  name: 'VectorShift — RAG Pipeline Builder',
  shortName: 'VectorShift',
  emoji: '🧠',
  color: '#8b5cf6',
  icon: Layers,
  status: 'live',
  tech: ['React', 'FastAPI', 'Vector DBs'],
  summary: 'Interactive DAG-based AI workflow orchestration engine.',
  highlights: ['DAG pipeline builder', 'High-performance RAG execution'],

  publicPath: '/vectorshift',
  dashboardPath: '/vectorshift/dashboard',
  loginPath: '/vectorshift/login',

  // ── Dashboard wiring ────────────────────────────────────────
  liveDemoUrl: import.meta.env.VITE_VECTORSHIFT_LIVE_URL || '/vectorshift',
  apiBase,
  endpoints: {
    options:    `${apiBase}/options`,
    pipelines:  `${apiBase}/pipelines`,
    run:        (id) => `${apiBase}/pipelines/${id}/run`,
    create:     `${apiBase}/pipelines`,
  },
  // Offline fallbacks so the builder still renders if the API is down.
  builderFallback: {
    sources:   ['PDF Upload', 'Web URL', 'S3 Bucket', 'Notion'],
    chunkers:  ['Recursive', 'Semantic', 'Fixed-size'],
    vectorDbs: ['Chroma', 'Pinecone', 'Weaviate'],
    llmModels: ['claude-opus-4-8', 'claude-fable-5', 'gpt-4o', 'mistral-large'],
  },
  demoPipelines: [
    { id: 'pl_faq',  name: 'Customer FAQ RAG',    source: 'Notion',  chunker: 'Semantic',  vectorDb: 'Pinecone', llm: 'claude-opus-4-8', topK: 4, status: 'running', queries: 1284 },
    { id: 'pl_docs', name: 'Product Docs Search', source: 'Web URL', chunker: 'Recursive', vectorDb: 'Chroma',   llm: 'gpt-4o',          topK: 5, status: 'running', queries: 4810 },
  ],
  sampleQueries: [
    'How does billing work?',
    'Is my data encrypted?',
    'What is the API rate limit?',
    'How does autoscaling handle failover?',
  ],

  tagline:
    'Enterprise-grade Retrieval-Augmented Generation pipeline orchestration. Build, configure, and execute AI document pipelines with a declarative DAG interface and multi-vector DB support.',
  stats: [
    { value: 'DAG',    label: 'Pipeline Architecture' },
    { value: '<400ms', label: 'Avg. Query Latency' },
    { value: '3+',     label: 'Vector DB Connectors' },
  ],
  about: {
    description:
      'A full-stack RAG pipeline management system. Users define pipelines as directed acyclic graphs connecting a document source (PDF, URL, S3) to a vector store (Chroma, Pinecone, Weaviate) to an LLM inference endpoint.',
    impact:
      'This is the architecture behind production LLM-powered enterprise products. The pipeline definition is declarative — no code required to create a new pipeline. FastAPI handles the compute-heavy vector operations.',
    points: [
      { icon: GitBranch, title: 'DAG Pipeline Definition', detail: 'Source type → chunking strategy → vector DB → LLM. Declarative pipeline creation with no code required per pipeline.' },
      { icon: Database,  title: 'Multi-Vector DB Support', detail: 'Connects to Chroma, Pinecone, and Weaviate. Swap the vector store without changing any pipeline definition.' },
      { icon: Bot,       title: 'LLM Agnostic',            detail: 'Pass any LLM identifier — Claude, GPT-4o, Mistral. The Python service handles inference against whatever model is configured.' },
      { icon: Search,    title: 'Source Attribution',       detail: 'Every answer includes source chunks with similarity scores and page numbers — required for enterprise accuracy auditing.' },
    ],
  },
  tech_stack: [
    { name: 'React',      emoji: '⚛️', role: 'Pipeline builder UI' },
    { name: 'FastAPI',    emoji: '🚀', role: 'Vector ops + LLM inference' },
    { name: 'Vector DBs', emoji: '🗄️', role: 'Chroma / Pinecone / Weaviate' },
    { name: 'Node.js',    emoji: '⚡', role: 'REST API + FastAPI bridge' },
  ],
  features: [
    { icon: GitBranch, title: 'Visual Pipeline Builder',  detail: 'Create RAG pipelines via form — source type, vector DB, LLM model, chunk size, top-K retrieval, all in one step.' },
    { icon: Search,    title: 'Semantic Query Execution', detail: 'POST a natural language query to any pipeline. Returns LLM answer, source chunks, similarity scores, and latency.' },
    { icon: Database,  title: 'Pipeline CRUD',            detail: 'Full create/list/update/delete. Role-gated — viewers run pipelines, managers create, admins delete.' },
    { icon: Zap,       title: 'FastAPI Bridge + Stub',    detail: 'Heavy vector ops and LLM calls handled by Python FastAPI. Falls back to stub response so demos never break.' },
  ],
}
