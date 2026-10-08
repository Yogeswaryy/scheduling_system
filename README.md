# Leave Management – Manager Portal (React)

    npm install
    npm run dev        # http://localhost:5173
    npm run build      # static build in dist/

Demo login: any password. Data is mock (src/lib/seed.js) and saved in the browser (localStorage);
Profile > "Reset demo data" restores it. "Today" is fixed to 6 Oct 2026 (src/lib/dates.js, USE_REAL_DATE).

Where things live
- src/lib/calc.js      all business rules (leave days, balances, staffing impact, cover suggestions, analytics)
- src/store/           state + actions (approve / reject / cancel / submit). Swap these for API calls.
- src/pages/           Home, Approvals, Calendar, History, Apply, RequestDetails, Team, Analytics, Policy, Profile, Login
- src/lib/constants.js leave types, holidays, roster (HR-managed in the real system)
