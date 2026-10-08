import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { MANAGER, typeById } from '../lib/constants';
import { analyseRequest } from '../lib/calc';
import { fmtDatesLong, fmtLong } from '../lib/dates';
import { Empty, PageTitle } from '../components/ui';

export default function Approvals() {
  const { state, actions } = useStore();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();

  const pending = useMemo(
    () => state.requests.filter((r) => r.status === 'pending' && r.employeeId !== MANAGER.id).sort((a, b) => a.start.localeCompare(b.start)),
    [state.requests]
  );
  const id = params.get('id');
  const idx = Math.max(0, pending.findIndex((r) => r.id === id));
  const req = pending[idx];

  // Keep the URL pointing at a request that is still pending (e.g. after approving one).
  useEffect(() => {
    if (req && req.id !== id) setParams({ id: req.id }, { replace: true });
  }, [req, id, setParams]);

  if (!req) {
    return (
      <div className="page">
        <PageTitle searchPlaceholder="Ask about pending approvals, staffing coverage or replacements…">Approvals</PageTitle>
        <section className="glass card center-card">
          <Empty>All caught up. There are no requests waiting for your approval.</Empty>
          <button className="btn" onClick={() => nav('/')}>
            Back to Home
          </button>
        </section>
      </div>
    );
  }

  const a = analyseRequest(state, req);
  const type = typeById(req.typeId);
  const go = (n) => setParams({ id: pending[(idx + n + pending.length) % pending.length].id });

  return (
    <div className="page approvals">
      <PageTitle
        right={
          pending.length > 1 ? (
            <div className="queue-nav">
              <button className="icon-btn" onClick={() => go(-1)} aria-label="Previous request">
                <ChevronLeft size={18} />
              </button>
              <span>
                Request {idx + 1} of {pending.length}
              </span>
              <button className="icon-btn" onClick={() => go(1)} aria-label="Next request">
                <ChevronRight size={18} />
              </button>
            </div>
          ) : null
        }
       searchPlaceholder="Ask about pending approvals, staffing coverage or replacements…"
      >
        Approvals
      </PageTitle>

      <div className="approvals-grid">
        <section className="glass card detail-card">
          <h3>Leave Request Details</h3>
          <dl className="detail-list">
            <dt>Employee</dt>
            <dd>{a.emp.name}</dd>
            <dt>Employee ID</dt>
            <dd>{a.emp.code}</dd>
            <dt>Leave dates</dt>
            <dd>{fmtDatesLong(req.dates)}</dd>
            <dt>Type</dt>
            <dd>{type.short}</dd>
            <dt>Status</dt>
            <dd className="v-pending">Pending Approval</dd>
            <dt>Coverage impact</dt>
            <dd className={`impact-${a.impact.toLowerCase()}`}>{a.impact}</dd>
            <dt>Suggested cover</dt>
            <dd>{a.suggested ? a.suggested.name : 'No one available'}</dd>
          </dl>
          {a.balance && (
            <p className={`fineprint ${a.balance.short ? 'bad' : ''}`}>
              {a.emp.name.split(' ')[0]} has {a.balance.left} {a.balance.key} day(s) left; {a.balance.short ? 'this request exceeds the balance.' : `${a.balance.after} would remain after approval.`}
            </p>
          )}
          {req.attachment && <p className="fineprint">Attachment: {req.attachment}</p>}
          {req.alternatives?.length > 0 && (
            <div className="alternative-dates">
              <strong>Alternative leave dates</strong>
              <p>The assessment service found lower-risk options:</p>
              <ul>
                {req.alternatives.map((option) => (
                  <li key={`${option.start}-${option.end}`}>
                    <b>{fmtDatesLong([option.start, option.end])}</b>
                    <span>{option.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <div className="stack">
          <section className="glass card">
            <h3>Coverage and Replacement Analysis</h3>
            <div className="table-wrap">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Can Cover?</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {a.cover.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No one in the team can cover this role.</td>
                    </tr>
                  ) : (
                    a.cover.map((c) => (
                      <tr key={c.emp.id}>
                        <td>{c.emp.name}</td>
                        <td>{c.emp.role}</td>
                        <td>
                          <span className={`can can-${c.can.toLowerCase()}`}>{c.can}</span>
                        </td>
                        <td>{c.type}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="glass card">
            <div className="card-head wrap">
              <h3>Team Staffing Impact</h3>
              <div className="risk-key" aria-label="Staffing risk levels">
                <span className="risk-green">Green · covered</span>
                <span className="risk-amber">Amber · at minimum</span>
                <span className="risk-red">Red · below minimum</span>
              </div>
            </div>
            <div className="table-wrap scroll-y">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Required</th>
                    <th>Available Now</th>
                    <th>If Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {a.days.length === 0 ? (
                    <tr>
                      <td colSpan={4}>These dates fall on a weekend or holiday, so staffing is unaffected.</td>
                    </tr>
                  ) : (
                    a.days.map((d) => (
                      <tr key={d.date} className={d.ifApproved < d.required ? 'row-bad' : d.ifApproved === d.required ? 'row-warn' : ''}>
                        <td>{fmtLong(d.date)}</td>
                        <td>{d.required}</td>
                        <td>{d.availableNow}</td>
                        <td>{d.ifApproved}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>

      <div className="approval-footer">
        <button className="btn back-btn" onClick={() => nav('/')}>
          Back to Home
        </button>
        <div className="decision-bar">
          <button className="btn reject" onClick={() => actions.requestReject(req.id)}>
            Reject
          </button>
          <button className="btn approve" onClick={() => actions.requestApprove(req.id)}>
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
