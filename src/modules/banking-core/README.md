# Module: banking-core (Frontend)

> **🔗 Live demo:** https://all-live-project-rupesh-klr.holistichealervedika.com/banking-core

> React · Axios · Table component · Badge component · Modal component

Distributed Banking Core dashboard — account overview, transaction submission with idempotency, and real-time status polling. Demonstrates async fire-and-poll UX for Kafka-backed transactions.

---

## File

| File | What it does |
|---|---|
| `Dashboard.jsx` | Account table + transaction form + status tracker |

---

## Route

```
/banking-core
AuthGuard requiredModule="banking-core"
```

---

## What renders

```
[← Back]

🏦  Distributed Banking Core
    Fault-tolerant banking system — 99.9% reliability.

[ + New Transaction ]

┌─────────┬──────────────┬──────────────┬──────────┬────────┐
│ Account │ Holder       │ Balance      │ Currency │ Status │
├─────────┼──────────────┼──────────────┼──────────┼────────┤
│ ACC001  │ Alice Sharma │ $50,000.00   │ USD      │ active │
│ ACC002  │ Bob Mehta    │ $12,500.00   │ USD      │ active │
└─────────┴──────────────┴──────────────┴──────────┴────────┘

[ Transaction Status Tracker ]
  Transaction ID: [TXN_xyz789_________]  [ Check Status ]
  Status: ● settled   Settled: 08:00:05
```

Account table is only visible to `admin` and `manager` roles — `viewer` sees the status tracker only.

---

## Submit transaction (Modal)

Opens a `Modal` with:

| Field | Notes |
|---|---|
| From account | Dropdown from accounts list |
| To account | Dropdown (excludes fromAccount) |
| Amount | Number input, 2 decimal places |
| Currency | Dropdown: USD / EUR / GBP / INR |
| Reference | Optional memo text |
| Idempotency key | Auto-generated UUID — user can override |

On submit:

```js
async function submitTransaction(form) {
  const { data } = await api.post('/api/banking-core/v1/transactions', {
    fromAccount:    form.from,
    toAccount:      form.to,
    amount:         parseFloat(form.amount),
    currency:       form.currency,
    reference:      form.reference,
    idempotencyKey: form.idempotencyKey || crypto.randomUUID(),
  })
  setTransactionId(data.data.transactionId)
  setStatus('pending')
  startPolling(data.data.transactionId)
}
```

Response is `202 Accepted` — the transaction is queued, not yet settled.

---

## Status polling

After submission, polls the status endpoint every 2 seconds until `settled` or `failed`:

```js
function startPolling(txnId) {
  const interval = setInterval(async () => {
    const { data } = await api.get(`/api/banking-core/v1/transactions/${txnId}/status`)
    setStatus(data.data.status)
    if (['settled', 'failed'].includes(data.data.status)) {
      clearInterval(interval)
    }
  }, 2000)
}
```

Status lifecycle shown as a progress indicator:
```
● pending → ◌ processing → ● settled
                         → ✕ failed
```

---

## Idempotency key

The form auto-generates a UUID as the idempotency key. The user can copy it to retry the same transaction on network failure — the backend returns the original result without reprocessing.

---

## Role-gated UI

```jsx
const { hasRole } = useAuth()

// Account table — admin and manager only
{(hasRole('admin') || hasRole('manager')) && (
  <Table columns={ACCOUNT_COLS} rows={accounts} ... />
)}

// New Transaction button — all authenticated users
<Button onClick={() => setTxnOpen(true)}>New Transaction</Button>
```

---

## Backend dependency

| Endpoint | Used by |
|---|---|
| `GET /api/banking-core/v1/accounts` | Account table (admin/manager) |
| `POST /api/banking-core/v1/transactions` | Transaction submit form |
| `GET /api/banking-core/v1/transactions/:id/status` | Status poller |
