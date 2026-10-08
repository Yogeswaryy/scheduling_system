import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { BadgeCheck, CalendarDays, FileText, Home, LogOut, User, Users } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { Confirm, Toasts } from './ui';
import DecisionHost from './DecisionHost';

const NAV = [
  { to: '/', label: 'Home', icon: Home, match: (p) => p === '/' },
  { to: '/approvals', label: 'Approvals', icon: BadgeCheck, match: (p) => p.startsWith('/approvals') },
  { to: '/calendar', label: 'Leave Calendar', icon: CalendarDays, match: (p) => ['/calendar', '/history', '/apply'].some((x) => p.startsWith(x)) || p.startsWith('/request') },
  { to: '/team', label: 'Team', icon: Users, match: (p) => p.startsWith('/team') },
  { to: '/policy', label: 'Policy', icon: FileText, match: (p) => p.startsWith('/policy') },
];

function NavItem({ item, active }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.to} className={`nav-btn ${active ? 'active' : ''}`} aria-label={item.label} aria-current={active ? 'page' : undefined}>
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

  if (!state.session.loggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="shell">
      <aside className="sidebar">
        <NavLink to="/" className="logo" aria-label="Leave Management home">
          L
        </NavLink>
        <div className="side-sep" />
        <nav className="side-group">
          {NAV.map((n) => (
            <NavItem key={n.to} item={n} active={n.match(pathname)} />
          ))}
        </nav>
        <div className="side-sep" />
        <div className="side-group">
          <NavItem item={{ to: '/profile', label: 'Profile', icon: User }} active={pathname.startsWith('/profile')} />
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
