import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Link2, Link2Off, ChevronRight } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { MANAGER } from '../lib/constants';
import { fmtDateTime } from '../lib/dates';
import { Confirm, Modal, PageTitle } from '../components/ui';

function WhatsAppMenu({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const linked = value === 'linked';
  return (
    <div className="wa" ref={ref}>
      <button className={`wa-btn ${linked ? 'ok' : 'bad'} ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{linked ? 'Linked' : 'De-Linked'}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <ul className="wa-menu" role="listbox">
          <li>
            <button role="option" aria-selected={linked} className="ok" onClick={() => { onChange('linked'); setOpen(false); }}>
              <Link2 size={14} /> Linked
            </button>
          </li>
          <li>
            <button role="option" aria-selected={!linked} className="bad" onClick={() => { onChange('delinked'); setOpen(false); }}>
              <Link2Off size={14} /> De-Link
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

export default function Profile() {
  const { state, actions } = useStore();
  const saved = { whatsapp: state.settings.whatsapp, emailNotifications: state.settings.emailNotifications };
  const [form, setForm] = useState(saved);
  const [security, setSecurity] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const dirty = form.whatsapp !== saved.whatsapp || form.emailNotifications !== saved.emailNotifications;

  return (
    <div className="page profile">
      <PageTitle
        right={
          <div className="row-actions">
            <button className="btn" disabled={!dirty} onClick={() => setForm(saved)}>
              Discard
            </button>
            <button
              className="btn"
              disabled={!dirty}
              onClick={() => {
                actions.saveSettings(form);
                actions.toast('Profile settings saved');
              }}
            >
              Save Changes
            </button>
          </div>
        }
       searchPlaceholder="Ask about account settings, notifications or security…"
      >
        Profile
      </PageTitle>

      <section className="glass card profile-card">
        <h2 className="who-name">{MANAGER.name}</h2>
        <p className="who-sub">
          {MANAGER.role} • {MANAGER.email}
        </p>
        <div className="profile-fields">
          <div>
            <div className="label">WhatsApp</div>
            <WhatsAppMenu value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
          </div>
          <div className="notif-box">
            <span id="notif-label">Email approval notifications</span>
            <button className={`switch ${form.emailNotifications ? 'on' : ''}`} role="switch" aria-checked={form.emailNotifications} aria-labelledby="notif-label" onClick={() => setForm({ ...form, emailNotifications: !form.emailNotifications })}>
              <i />
            </button>
          </div>
        </div>
        <p className={`fineprint profile-dirty-note ${dirty ? 'visible' : ''}`} aria-live="polite">
          {dirty ? 'You have unsaved changes.' : ''}
        </p>
      </section>

      <section className="glass card">
        <h3>Account &amp; Security</h3>
        <p className="fineprint">Sign in password and Whatsapp verification is required every 365 days. Reminders begin about 14–30 days before expiry.</p>
        <div className="sec-list">
          <button className="sec-item" onClick={() => setSecurity(true)}>
            <span>
              <b>Password &amp; sign-in</b>
              <small>Change password, review sessions and sign-in activity.</small>
            </span>
            <ChevronRight size={18} />
          </button>
          <div className="sec-item static">
            <span>
              <b>Last login</b>
              <small>{fmtDateTime(state.session.lastLogin).replace(/^[^,]+, /, 'Today • ')}</small>
            </span>
          </div>
        </div>
        <button className="link-btn demo-reset" onClick={() => setConfirmReset(true)}>
          Reset demo data
        </button>
      </section>

      {security && <SecurityModal onClose={() => setSecurity(false)} />}
      {confirmReset && (
        <Confirm title="Reset demo data?" confirmLabel="Reset" danger onClose={() => setConfirmReset(false)} onConfirm={() => actions.reset()}>
          This restores the sample requests and clears any approvals, rejections and new leave you created in this browser.
        </Confirm>
      )}
    </div>
  );
}

function SecurityModal({ onClose }) {
  const { state, actions } = useStore();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [msg, setMsg] = useState(null);

  const change = (e) => {
    e.preventDefault();
    if (!cur) return setMsg({ bad: true, t: 'Enter your current password.' });
    if (next.length < 8) return setMsg({ bad: true, t: 'New password must be at least 8 characters.' });
    if (next !== again) return setMsg({ bad: true, t: 'New passwords do not match.' });
    if (next === cur) return setMsg({ bad: true, t: 'New password must differ from the current one.' });
    // TODO: call the auth API here.
    setCur('');
    setNext('');
    setAgain('');
    setMsg({ t: 'Password updated.' });
    actions.toast('Password updated');
  };

  return (
    <Modal title="Password & sign-in" onClose={onClose} width={540}>
      <form onSubmit={change} className="pw-form">
        <label className="form-row">
          Current password
          <input className="field" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} />
        </label>
        <label className="form-row">
          New password
          <input className="field" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        </label>
        <label className="form-row">
          Confirm new password
          <input className="field" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />
        </label>
        {msg && <p className={msg.bad ? 'form-errors-line' : 'ok-line'}>{msg.t}</p>}
        <button className="btn" type="submit">
          Change password
        </button>
      </form>
      <h4 className="sub-head">Active sessions</h4>
      <ul className="session-list">
        {state.session.devices.map((d) => (
          <li key={d.id}>
            <span>
              <b>{d.name}</b>
              <small>
                {d.where} · {fmtDateTime(d.at)}
              </small>
            </span>
            {d.current ? (
              <em>This device</em>
            ) : (
              <button className="link-btn" onClick={() => actions.signOutDevice(d.id)}>
                Sign out
              </button>
            )}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
