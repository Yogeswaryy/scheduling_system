import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { seedState } from '../lib/seed';
import { MANAGER, typeById } from '../lib/constants';
import { leaveDates } from '../lib/calc';
import { nowISO, TODAY } from '../lib/dates';

const KEY = 'lms-manager-portal-v1';
const StoreCtx = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.version === 1) {
        // Keep existing browser demo data, while applying current display labels.
        if (Array.isArray(s.leaveTypes)) {
          s.leaveTypes = s.leaveTypes.map((t) =>
            t.id === 'maternity' ? { ...t, name: 'Parental Leave', short: 'Parental', chip: 'Parental', analytics: 'Parental' } : t
          );
        }
        s.settings = {
          leavePrivacy: 'namesAndType',
          workingPattern: 'Monday to Friday',
          unavailableDates: '',
          canEditWorkingPattern: true,
          rosterStatus: 'published',
          rosterPublishedAt: `${TODAY}T09:00:00`,
          ...s.settings,
        };
        // Keep the current saved demo aligned with the three-day pending-request example.
        const jasonPending = s.requests?.find(
          (request) => request.employeeId === 'e9' && request.typeId === 'unpaid' && request.status === 'pending' && request.start === '2026-10-15'
        );
        if (jasonPending) {
          jasonPending.start = '2026-10-14';
          jasonPending.end = '2026-10-16';
          jasonPending.dates = ['2026-10-14', '2026-10-15', '2026-10-16'];
        }
        // Add three pending examples to existing saved demo sessions so the
        // four-row preview and View more state can be reviewed immediately.
        const extraPending = [
          { id: 'LR-DEMO-201', employeeId: 'e1', typeId: 'annual', start: '2026-10-19', end: '2026-10-20', dates: ['2026-10-19', '2026-10-20'], submittedAt: '2026-10-06T09:20:00', attachment: null },
          { id: 'LR-DEMO-202', employeeId: 'e2', typeId: 'sick', start: '2026-10-21', end: '2026-10-21', dates: ['2026-10-21'], submittedAt: '2026-10-06T11:05:00', attachment: 'medical-certificate.pdf' },
          { id: 'LR-DEMO-203', employeeId: 'e7', typeId: 'emergency', start: '2026-10-22', end: '2026-10-23', dates: ['2026-10-22', '2026-10-23'], submittedAt: '2026-10-07T14:30:00', attachment: null },
        ];
        extraPending.forEach((request) => {
          const alreadyExists = s.requests?.some(
            (current) => current.id === request.id || (current.employeeId === request.employeeId && current.typeId === request.typeId && current.start === request.start && current.end === request.end)
          );
          if (!alreadyExists) {
            s.requests.push({
              ...request,
              status: 'pending',
              reason: '',
              history: [{ action: 'Submitted', at: request.submittedAt, by: request.employeeId }],
            });
          }
        });
        return s;
      }
    }
  } catch (e) {
    /* storage unavailable: fall through to seed */
  }
  return seedState();
}

function reducer(state, a) {
  switch (a.type) {
    case 'decide': {
      const status = a.decision; // approved | rejected | cancelled
      const cur = state.requests.find((r) => r.id === a.id);
      // ignore repeats / invalid transitions (approve+reject only from pending; cancel from pending or approved)
      if (!cur || (status === 'cancelled' ? !['pending', 'approved'].includes(cur.status) : cur.status !== 'pending')) return state;
      const action = { approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled' }[status];
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === a.id
            ? { ...r, status, reason: a.reason || r.reason, history: [...r.history, { action, at: a.at, by: a.by }] }
            : r
        ),
      };
    }
    case 'submit':
      return { ...state, requests: [a.request, ...state.requests] };
    case 'reschedule': {
      const cur = state.requests.find((r) => r.id === a.id);
      if (!cur || !['pending', 'approved'].includes(cur.status)) return state;
      const shift = Math.round((new Date(`${a.start}T12:00:00`) - new Date(`${cur.start}T12:00:00`)) / 86400000);
      const dates = cur.dates.map((d) => {
        const dt = new Date(`${d}T12:00:00`);
        dt.setDate(dt.getDate() + shift);
        const pad = (n) => String(n).padStart(2, '0');
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
      });
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === a.id
            ? { ...r, start: a.start, end: a.end, dates, history: [...r.history, { action: 'Rescheduled', at: a.at, by: MANAGER.id }] }
            : r
        ),
      };
    }
    case 'settings':
      return { ...state, settings: { ...state.settings, ...a.patch } };
    case 'login':
      return { ...state, session: { ...state.session, loggedIn: true, lastLogin: a.at } };
    case 'logout':
      return { ...state, session: { ...state.session, loggedIn: false } };
    case 'signOutDevice':
      return { ...state, session: { ...state.session, devices: state.session.devices.filter((d) => d.id !== a.id) } };
    case 'reset':
      return seedState();
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [toasts, setToasts] = useState([]);
  const [decision, setDecision] = useState(null); // {kind:'approve'|'reject', id}
  const tid = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }, [state]);

  const toast = useCallback((msg, tone = 'ok') => {
    tid.current += 1;
    const id = tid.current;
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const actions = useMemo(
    () => ({
      approve: (id) => {
        dispatch({ type: 'decide', id, decision: 'approved', at: nowISO(), by: MANAGER.id });
        toast('Request approved');
      },
      reject: (id, reason) => {
        dispatch({ type: 'decide', id, decision: 'rejected', reason, at: nowISO(), by: MANAGER.id });
        toast('Request rejected', 'warn');
      },
      cancel: (id) => {
        dispatch({ type: 'decide', id, decision: 'cancelled', at: nowISO(), by: MANAGER.id });
        toast('Leave request cancelled', 'warn');
      },
      submit: ({ typeId, start, end, attachment }) => {
        const type = typeById(typeId);
        const dates = leaveDates(start, end, type, state.holidays);
        const at = nowISO();
        const n = String(state.requests.length + 21).padStart(3, '0');
        const request = {
          id: `LR-${TODAY.replace(/-/g, '')}-${n}`,
          employeeId: MANAGER.id,
          typeId,
          start,
          end,
          dates,
          status: 'pending',
          submittedAt: at,
          history: [{ action: 'Submitted', at, by: MANAGER.id }],
          attachment: attachment || null,
          reason: '',
        };
        dispatch({ type: 'submit', request });
        return request;
      },
      reschedule: (id, start, end) => {
        dispatch({ type: 'reschedule', id, start, end, at: nowISO() });
        toast('Leave request moved');
      },
      saveSettings: (patch) => dispatch({ type: 'settings', patch }),
      login: () => dispatch({ type: 'login', at: nowISO() }),
      logout: () => dispatch({ type: 'logout' }),
      signOutDevice: (id) => dispatch({ type: 'signOutDevice', id }),
      reset: () => {
        try {
          localStorage.removeItem(KEY);
        } catch (e) {
          /* ignore */
        }
        dispatch({ type: 'reset' });
        toast('Demo data reset');
      },
      requestApprove: (id) => setDecision({ kind: 'approve', id }),
      requestReject: (id) => setDecision({ kind: 'reject', id }),
      closeDecision: () => setDecision(null),
      toast,
    }),
    [state.holidays, state.requests.length, toast]
  );

  const value = useMemo(() => ({ state, actions, toasts, decision }), [state, actions, toasts, decision]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);
