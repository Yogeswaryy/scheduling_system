import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { MANAGER } from '../lib/constants';

export default function Login() {
  const { state, actions } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState(MANAGER.email);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  if (state.session.loggedIn) return <Navigate to="/" replace />;

  return (
    <div className="login-wrap">
      <form
        className="glass login-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.trim() || !pw) return setErr('Enter your email and password.');
          // TODO: replace with the real auth call; any non-empty password works in the demo.
          actions.login();
          nav('/');
        }}
      >
        <div className="logo big">L</div>
        <h1>Manager sign in</h1>
        <p className="fineprint">Leave Management System</p>
        <label className="form-row">
          Email
          <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        </label>
        <label className="form-row">
          Password
          <input className="field" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" autoFocus />
        </label>
        {err && <p className="form-errors-line">{err}</p>}
        <button className="btn full" type="submit">
          Sign in
        </button>
        <p className="fineprint">Demo: enter any password.</p>
      </form>
    </div>
  );
}
