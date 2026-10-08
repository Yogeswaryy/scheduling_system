import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import Shell from './components/Shell';
import Home from './pages/Home';
import Approvals from './pages/Approvals';
import Calendar from './pages/Calendar';
import History from './pages/History';
import Apply from './pages/Apply';
import RequestDetails from './pages/RequestDetails';
import Team from './pages/Team';
import Analytics from './pages/Analytics';
import Policy from './pages/Policy';
import Profile from './pages/Profile';
import Login from './pages/Login';

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Shell />}>
            <Route path="/" element={<Home />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/history" element={<History />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/request/:id" element={<RequestDetails />} />
            <Route path="/team" element={<Team />} />
            <Route path="/team/analytics" element={<Analytics />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
