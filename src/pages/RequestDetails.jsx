import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { MANAGER, typeById } from '../lib/constants';
import { balanceOf, displayStatus, personName } from '../lib/calc';
import { TODAY, fmtDMY, fmtDateTime, fmtDatesLong, year } from '../lib/dates';
import { Confirm, Empty, PageTitle, StatusPill } from '../components/ui';

function Tracker({ req }) {
  const decided = req.history.find((h) => ['Approved', 'Rejected', 'Cancelled'].includes(h.action));
  const submitted = req.history.find((h) => h.action === 'Submitted');
  const pending = req.status === 'pending';
  const outcome = decided?.action === 'Rejected' ? 'Declined' : decided?.action || 'Approved/Declined';
  const tone = !decided ? 'idle' : decided.action === 'Approved' ? 'ok' : decided.action === 'Rejected' ? 'bad' : 'grey';
  // Wireframe rule: a circle is only filled once that step is completed.
  return (
    <div className="tracker" role="list">
      <div className="t-line">
        <span className="seg ok" />
        <span className={`seg ${decided ? 'ok' : 'idle'}`} />
      </div>
      <div className="t-step" role="listitem">
        <span className="dot ok" />
        <b className="ok">Request submitted</b>
        <small>{fmtDateTime(submitted?.at)}</small>
      </div>
      <div className="t-step" role="listitem">
        <span className={`dot ${pending ? 'wait' : 'ok'}`} />
        <b className={pending ? 'wait' : 'ok'}>Pending Approval</b>
        <small>{pending ? 'Waiting for a decision' : fmtDateTime(decided?.at)}</small>
      </div>
      <div className="t-step" role="listitem">
        <span className={`dot ${tone}`} />
        <b className={tone}>{outcome}</b>
        <small>{decided ? fmtDateTime(decided.at) : ''}</small>
      </div>
    </div>
  );
}

export default function RequestDetails() {
  const { id } = useParams();
  const { state, actions } = useStore();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const req = state.requests.find((r) => r.id === id);

  if (!req) {
    return (
      <div className="page">
        <PageTitle searchPlaceholder="Ask about this request, its status or approval progress…">Leave Request Details</PageTitle>
        <section className="glass card center-card">
          <Empty>We couldn't find that request.</Empty>
          <button className="btn" onClick={() => nav('/history')}>
            Back to history
          </button>
        </section>
      </div>
    );
  }

  const type = typeById(req.typeId);
  const mine = req.employeeId === MANAGER.id;
  const days = req.dates.length;
  const bal = type.balanceKey && year(req.start) === year(TODAY) ? balanceOf(state, req.employeeId, type.balanceKey, year(req.start)) : null;
  const status = displayStatus(req);
  const canCancel = mine && (req.status === 'pending' || (req.status === 'approved' && req.start > TODAY));

  let card3 = ['Current balance', bal ? `${bal.left} DAYS` : '—'];
  let card4;
  if (req.status === 'pending') card4 = ['Balance once approved', bal ? `${bal.left - days} DAYS` : '—'];
  else if (req.status === 'approved') card4 = ['Balance after this leave', bal ? `${bal.left} DAYS` : '—'];
  else card4 = ['Balance impact', 'NONE'];

  return (
    <div className="page request">
      <PageTitle searchPlaceholder="Ask about this request, its status or approval progress…">Leave Request Details</PageTitle>

      <section className="glass card req-head">
        <div>
          <h2>{type.name}</h2>
          <p className="req-dates">{fmtDatesLong(req.dates)}</p>
          <p className="req-id">Request ID: {req.id}</p>
          {req.status === 'rejected' && (
            <p className="rejection-reason"><strong>Rejection reason:</strong> {req.reason || 'No rejection reason provided.'}</p>
          )}
          {!mine && <p className="fineprint">Employee: {personName(state, req.employeeId)}</p>}
          {req.status !== 'rejected' && req.reason && <p className="fineprint">Reason: {req.reason}</p>}
          {req.attachment && <p className="fineprint">Attachment: {req.attachment}</p>}
        </div>
        <StatusPill request={req} long />
      </section>

      <div className="grid-4 info-cards">
        <div className="glass stat">
          <span className="stat-label">Duration</span>
          <span className="stat-value">
            {days} {days === 1 ? 'DAY' : 'DAYS'}
          </span>
        </div>
        <div className="glass stat">
          <span className="stat-label">Submitted</span>
          <span className="stat-value">{fmtDMY(req.submittedAt.slice(0, 10)).toUpperCase()}</span>
        </div>
        <div className="glass stat">
          <span className="stat-label">{card3[0]}</span>
          <span className="stat-value">{card3[1]}</span>
        </div>
        <div className="glass stat">
          <span className="stat-label">{card4[0]}</span>
          <span className="stat-value">{card4[1]}</span>
        </div>
      </div>

      <section className="glass card">
        <h3 className="caps">Approval progress</h3>
        <Tracker req={req} />
      </section>

      <div className="req-actions">
        <button className="btn ghost-dark" onClick={() => nav(-1)}>
          Back
        </button>
        {!mine && req.status === 'pending' && (
          <button className="btn" onClick={() => nav(`/approvals?id=${req.id}`)}>
            Review in Approvals
          </button>
        )}
        {canCancel && (
          <button className="btn" onClick={() => setConfirm(true)}>
            Cancel Request
          </button>
        )}
      </div>
      <p className="sr-only">{status}</p>

      {confirm && (
        <Confirm title="Cancel this request?" confirmLabel="Cancel request" cancelLabel="Keep it" danger onClose={() => setConfirm(false)} onConfirm={() => actions.cancel(req.id)}>
          {req.status === 'approved' ? 'This leave is already approved. Cancelling returns the days to your balance.' : 'The request will be withdrawn and no balance will be deducted.'}
        </Confirm>
      )}
    </div>
  );
}
