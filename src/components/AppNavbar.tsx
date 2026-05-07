import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../features/auth/hooks';
import { logout } from '../features/auth/authSlice';

export default function AppNavbar() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const dispatch = useAppDispatch();

  return (
    <nav className="navbar navbar-expand-lg bg-light border-bottom mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          Blogixy
        </Link>
        <div className="navbar-nav gap-2">
          <Link className="nav-link" to="/">
            Home
          </Link>
          <Link className="nav-link" to="/explore">
            Explore
          </Link>
          <Link className="nav-link" to="/dashboard">
            Dashboard
          </Link>
          <Link className="nav-link" to="/notifications">
            Notifications
          </Link>
          <Link className="nav-link" to="/messages">
            Messages
          </Link>
          {!token ? (
            <Link className="btn btn-primary btn-sm" to="/auth">
              Sign In
            </Link>
          ) : (
            <button className="btn btn-outline-danger btn-sm" onClick={() => dispatch(logout())}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
