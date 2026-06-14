# Module: whatsapp-crm (Frontend)

> React · Axios · Table component · Modal component · Badge component

Automated WhatsApp CRM Engine dashboard — contact list with conversation preview, outbound message compose, and workflow management. Designed for CRM agents who need high-volume WhatsApp conversation management.

---

## File

| File | What it does |
|---|---|
| `Dashboard.jsx` | Contact list + message compose + workflow panel |

---

## Route

```
/whatsapp-crm
AuthGuard requiredModule="whatsapp-crm"
```

---

## What renders

```
[← Back]

💬  Automated WhatsApp CRM Engine
    Scalable CRM with WhatsApp Business API + event-driven webhooks.

[ Contacts ]  [ Workflows ]                    [ + Send Message ]

Contact List
┌──────────────────┬────────────────┬──────────┬─────────────────────┐
│ Name             │ Phone          │ Status   │ Last Message        │
├──────────────────┼────────────────┼──────────┼─────────────────────┤
│ Rahul Verma      │ +91 9876543210 │ ● unread │ Hello, I need sup…  │
│ Priya Singh      │ +91 9123456789 │ ● active │ Thank you!          │
└──────────────────┴────────────────┴──────────┴─────────────────────┘

Workflow List
┌───────────────────────┬─────────────────────┬───────────┬────────┐
│ Workflow              │ Trigger             │ Action    │ Status │
├───────────────────────┼─────────────────────┼───────────┼────────┤
│ New Lead Welcome      │ keyword: hello      │ template  │ active │
│ Opt-in Confirmation   │ opt_in              │ send_text │ active │
└───────────────────────┴─────────────────────┴───────────┴────────┘
```

---

## Contact list

Fetched from `GET /api/whatsapp-crm/v1/contacts`:

```js
useEffect(() => {
  api.get('/api/whatsapp-crm/v1/contacts', { params: { page: 1, limit: 20 } })
    .then(r => setContacts(r.data.data.contacts))
    .catch(() => toast.error('Failed to load contacts'))
}, [])
```

Status badges:
- `active` → grey (viewed, active conversation)
- `unread` → amber (new message waiting)
- `opted-out` → red (do not contact)

Clicking a contact row opens a conversation detail panel (or modal) showing message history from `GET /api/whatsapp-crm/v1/contacts/:id`.

---

## Send message (Modal)

Opens on "Send Message" button (admin/manager only):

```jsx
{(hasRole('admin') || hasRole('manager')) && (
  <Button onClick={() => setSendOpen(true)} icon={MessageSquare}>
    Send Message
  </Button>
)}
```

Modal fields:
- Contact selector (search by name or phone number)
- Message type: `text` or `template`
- For `text`: free-text input (only valid within 24-hour conversation window)
- For `template`: template name + component variables

On submit:

```js
async function sendMessage(form) {
  const payload = form.type === 'text'
    ? { to: form.phone, type: 'text', text: form.message }
    : { to: form.phone, type: 'template', template: form.template }

  await api.post('/api/whatsapp-crm/v1/messages/send', payload)
  toast.success('Message sent')
  setSendOpen(false)
}
```

---

## Workflow panel

Toggled via tab or separate section. Lists workflows from `GET /api/whatsapp-crm/v1/workflows`.

Each workflow row has an active/paused toggle (admin/manager only):

```js
async function toggleWorkflow(id, currentActive) {
  await api.patch(`/api/whatsapp-crm/v1/workflows/${id}`, {
    active: !currentActive,
  })
  refetchWorkflows()
}
```

---

## Unread count indicator

`contact.unread > 0` adds a badge on the contact row and contributes to the module's nav badge (if you add one in `Dashboard.jsx`):

```jsx
{contact.unread > 0 && (
  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
    {contact.unread}
  </span>
)}
```

---

## Role-gated UI

| Action | Visible to |
|---|---|
| Contact list | All authenticated users |
| Conversation detail | All authenticated users |
| Send message button | admin, manager |
| Create workflow | admin only |
| Toggle workflow active | admin, manager |
| Delete workflow | admin only |

---

## Backend dependency

| Endpoint | Used by |
|---|---|
| `GET /api/whatsapp-crm/v1/contacts` | Contact list table |
| `GET /api/whatsapp-crm/v1/contacts/:id` | Contact detail / message history |
| `POST /api/whatsapp-crm/v1/messages/send` | Send message modal |
| `GET /api/whatsapp-crm/v1/workflows` | Workflow panel list |
| `PATCH /api/whatsapp-crm/v1/workflows/:id` | Toggle workflow active/paused |
