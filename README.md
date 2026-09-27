# Leave Manager Portal — Interactive Manager Build

React + Vite implementation of the latest Manager wireframes, with the main controls wired for realistic front-end interaction.

## Run in VS Code

```powershell
cd leave-manager-portal
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173/`.

## Main routes

- `/login` — Manager sign-in / logout destination
- `/` — Manager Home
- `/approvals` — Leave approvals
- `/approvals/:requestId` — Request + team impact / coverage review
- `/team` — Team overview
- `/calendar` — Team leave calendar with Week / Month views
- `/employee-details` — Employee details + expandable hierarchy structure
- `/leave-dashboard` — Employee leave taken dashboard
- `/my-leave` — Manager's own leave
- `/my-leave/apply` — Interactive leave date selection and working-day calculation
- `/my-leave/:requestId` — Personal leave request tracking / cancellation
- `/profile` — Profile & system preferences

## Main interactions included

- Sidebar and account-menu logout
- Login page after logout
- Notification dropdown and read state
- Navigation buttons and table actions
- Approval / rejection confirmation and persisted mock decisions
- Coverage-setting switches
- Week / Month calendar switching
- Calendar leave chips and month date selection
- Employee hierarchy expand / collapse
- Employee and leave-dashboard CSV export
- Dashboard filters and Percentage / Number toggle
- Personal leave application and cancellation
- Profile photo View / Change / Delete menu
- WhatsApp Linked / De-linked selector
- Email notification toggle
- Profile Save / Discard behavior
- Password-change and sign-in-activity dialogs

## Calendar logic

The leave form calculates leave from the employee's assigned working pattern rather than simply counting calendar dates. For a Mon–Fri employee, Friday to Monday counts as **2 working leave days**; Saturday and Sunday remain visible but are excluded. The implementation also supports half-day calculation on the first or last working day and keeps public-holiday handling separate for later backend/calendar integration.

## UI palette

- Navy / main text: `#0F172A`
- Primary blue: `#2563EB`
- Primary hover: `#1D4ED8`
- Active navigation: `#EFF6FF`
- App background: `#F6F8FB`
- Card surface: `#FFFFFF`
- Border: `#E2E8F0`
- Secondary text: `#64748B`
- Success / Linked / Approved: `#16A34A`
- Warning / Pending: `#D97706`
- Danger / Rejected / De-linked: `#DC2626`

## Notes

This package still uses local mock data so the Manager UI can be reviewed without a backend. Mock workflow state is stored in browser `localStorage` where useful. The data layer in `src/data/mockData.js` can later be replaced with API/database calls without redesigning the screens.
