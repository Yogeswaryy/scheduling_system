import { useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { BadgeCheck, CalendarDays, FileText, Home, LogOut, User, Users } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { Confirm, Toasts } from './ui';
import DecisionHost from './DecisionHost';
import pulseMark from '../assets/pulse-mark.png';

const NAV = [
  { to: '/', label: 'Home', icon: Home, match: (p) => p === '/' },
  { to: '/approvals', label: 'Approvals', icon: BadgeCheck, match: (p) => p.startsWith('/approvals') },
  { to: '/calendar', label: 'Leave Calendar', icon: CalendarDays, match: (p) => ['/calendar', '/history', '/apply'].some((x) => p.startsWith(x)) || p.startsWith('/request') },
  { to: '/team', label: 'Team', icon: Users, match: (p) => p.startsWith('/team') },
  { to: '/policy', label: 'Policy', icon: FileText, match: (p) => p.startsWith('/policy') },
];

function NavItem({ item, active, preview }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      data-nav-to={item.to}
      className={`nav-btn ${active ? 'active' : ''} ${preview ? 'scrub-preview' : ''}`}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={22} strokeWidth={2.2} />
      <span className="nav-tip">{item.label}</span>
    </NavLink>
  );
}

export default function Shell() {
  const { state, actions, toasts } = useStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [confirmOut, setConfirmOut] = useState(false);
  const [scrubTarget, setScrubTarget] = useState(null);
  const sidebarScrub = useRef({ pointerId: null, target: null });
  const suppressScrubClick = useRef(false);

  const sidebarTargetAt = (event) => {
    const item = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-nav-to]');
    return item && event.currentTarget.contains(item) ? item.dataset.navTo : null;
  };

  const beginSidebarScrub = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const item = event.target.closest('[data-nav-to]');
    if (!item) return;
    const target = item.dataset.navTo;
    sidebarScrub.current = { pointerId: event.pointerId, target };
    event.currentTarget.setPointerCapture(event.pointerId);
    setScrubTarget(target);
  };

  const moveSidebarScrub = (event) => {
    if (sidebarScrub.current.pointerId !== event.pointerId) return;
    const target = sidebarTargetAt(event);
    if (!target || target === sidebarScrub.current.target) return;
    sidebarScrub.current.target = target;
    setScrubTarget(target);
  };

  const finishSidebarScrub = (event, shouldNavigate) => {
    if (sidebarScrub.current.pointerId !== event.pointerId) return;
    const target = sidebarScrub.current.target;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    sidebarScrub.current = { pointerId: null, target: null };
    setScrubTarget(null);
    if (shouldNavigate && target) {
      suppressScrubClick.current = true;
      navigate(target);
    }
  };

  if (!state.session.loggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="shell">
      <aside
        className={`sidebar ${scrubTarget ? 'is-scrubbing' : ''}`}
        onPointerDown={beginSidebarScrub}
        onPointerMove={moveSidebarScrub}
        onPointerUp={(event) => finishSidebarScrub(event, true)}
        onPointerCancel={(event) => finishSidebarScrub(event, false)}
        onClickCapture={(event) => {
          if (!suppressScrubClick.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressScrubClick.current = false;
        }}
      >
        <NavLink to="/" className="logo" aria-label="Leave Management home">
          <img src={pulseMark} alt="" aria-hidden="true" />
          <span className="logo-word" aria-hidden="true">ULSE</span>
        </NavLink>
        <div className="side-sep" />
        <nav className="side-group">
          {NAV.map((n) => (
            <NavItem key={n.to} item={n} active={n.match(pathname)} preview={scrubTarget === n.to} />
          ))}
        </nav>
        <div className="side-sep" />
        <div className="side-group">
          <NavItem item={{ to: '/profile', label: 'Profile', icon: User }} active={pathname.startsWith('/profile')} preview={scrubTarget === '/profile'} />
          <button className="nav-btn" aria-label="Log out" onClick={() => setConfirmOut(true)}>
            <LogOut size={22} strokeWidth={2.2} />
            <span className="nav-tip">Log out</span>
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
      <DecisionHost />
      <Toasts toasts={toasts} />
      {confirmOut && (
        <Confirm
          title="Log out?"
          confirmLabel="Log out"
          onClose={() => setConfirmOut(false)}
          onConfirm={() => {
            actions.logout();
            navigate('/login');
          }}
        >
          You will need to sign in again to review approvals.
        </Confirm>
      )}
    </div>
  );
}
