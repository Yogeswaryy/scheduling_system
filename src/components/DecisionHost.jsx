import { useEffect, useState } from 'react';
import { useStore } from '../store/StoreContext';
import { analyseRequest } from '../lib/calc';
import { fmtDM, fmtDMY } from '../lib/dates';
import { Modal } from './ui';

function analyseWarnings(state, req) {
  const a = analyseRequest(state, req);
  const w = [];
  if (a.below.length) w.push(`Staffing would fall below the minimum on ${a.below.map((d) => fmtDM(d.date)).join(', ')}.`);
  if (a.balance && a.balance.short) w.push(`${a.emp.name} only has ${a.balance.left} ${a.balance.key} day(s) left but is asking for ${req.dates.length}.`);
  return w;
}

/** Shared approve / reject flow used by Home and Approvals. Guards risky approvals. */
export default function DecisionHost() {
  const { state, actions, decision } = useStore();
  const [reason, setReason] = useState('');
  const req = decision ? state.requests.find((r) => r.id === decision.id) : null;
  const safe = !!req && decision.kind === 'approve' && !analyseWarnings(state, req).length;

  // Nothing risky about this approval: do it straight away (the reducer ignores repeats).
  useEffect(() => {
    if (safe) {
      actions.approve(req.id);
      actions.closeDecision();
    }
  }, [safe]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!decision || !req || safe) return null;
  const close = () => {
    setReason('');
    actions.closeDecision();
  };

  if (decision.kind === 'reject') {
    return (
      <Modal
        title="Reject leave request"
        onClose={close}
        width={480}
        actions={
          <>
            <button className="btn ghost" onClick={close}>
              Cancel
            </button>
            <button
              className="btn danger"
              onClick={() => {
                actions.reject(req.id, reason.trim());
                close();
              }}
            >
              Reject request
            </button>
          </>
        }
      >
        <p className="modal-note">Add a short reason. The employee sees this on their request.</p>
        <textarea className="field" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" autoFocus />
      </Modal>
    );
  }

  const a = analyseRequest(state, req);
  const warnings = analyseWarnings(state, req);

  return (
    <Modal
      title="Approve with warnings?"
      onClose={close}
      width={500}
      actions={
        <>
          <button className="btn ghost" onClick={close}>
            Go back
          </button>
          <button
            className="btn approve"
            onClick={() => {
              actions.approve(req.id);
              close();
            }}
          >
            Approve anyway
          </button>
        </>
      }
    >
      <p className="modal-note">
        {a.emp.name} · {req.dates.length} day(s) from {fmtDMY(req.start)}
      </p>
      <ul className="warn-list">
        {warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </Modal>
  );
}
