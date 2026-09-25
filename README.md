# Leave Management — Manager Portal

React (Vite) implementation of the Manager role screens from the
"Leave Management_latest" Canva wireframes, built with mock data so
it runs standalone. Structured for easy integration into the larger
Employee / HR / IT system.

## Screens included

- **Home** (`/`) — KPI cards, requests awaiting approval, week-at-a-glance, coverage settings
- **Approvals** (`/approvals`) — full list of pending requests
- **Request + Team Impact** (`/approvals/:requestId`) — hierarchy, coverage/replacement analysis, staffing impact, Approve/Reject
- **Leave Calendar** (`/calendar`) — weekly team leave grid
- **Team** (`/team`) — expandable employee & role hierarchy
- **Leave Taken Dashboard** (`/leave-dashboard`) — utilisation, trends, low-balance alerts
- **My Leave** (`/my-leave`, `/my-leave/apply`, `/my-leave/:requestId`) — the manager's own leave (routed to a higher approver — managers cannot self-approve)
- **Profile** (`/profile`) — account & communication preferences

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to /dist
```

## Project structure

```
src/
  components/   Sidebar, Layout, StatCard, StatusBadge (shared UI)
  pages/        One component per screen above
  data/         mockData.js — all sample data in one place
  App.jsx       Routes (react-router-dom)
  main.jsx      Entry point
```

## Wiring up to real data

Everything reads from `src/data/mockData.js`. To connect to the real
Employee / HR / IT backend:

1. Replace the exports in `mockData.js` with API calls (e.g. React
   Query, SWR, or plain `fetch`/`axios`) — the shape of each export
   is documented by how it's used in the matching page component.
2. `currentManager` should come from your auth/session context
   instead of being hardcoded.
3. The Approve/Reject buttons in `RequestReview.jsx` and the Submit
   button in `ApplyLeave.jsx` currently just navigate — swap in your
   real mutation calls there.

## Notes from the wireframe redlines

- Managers' core areas are **Home, Approvals, Leave Calendar, Team**
  — the rest (Leave Taken Dashboard, My Leave, Profile) support those.
- A manager is also an employee: their own leave lives under **My
  Leave**, kept separate from the **Approvals** queue.
- Managers can never approve their own leave — it's always routed to
  the next reporting manager or a configured higher-level approver.
