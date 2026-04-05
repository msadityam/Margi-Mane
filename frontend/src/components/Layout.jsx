import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userLabel = user
    ? user.role === "ADMIN"
      ? user.name?.toLowerCase() === "admin"
        ? "Admin Panel"
        : `Hi, ${user.name}`
      : `Hi, ${user.name}`
    : null;

  return (
    <div className="mx-auto min-h-screen max-w-5xl p-3 sm:p-6">
      <header className="mb-4 rounded-xl bg-white p-3 shadow sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/margi_mane_logo.jpeg" alt="Margi Mane" className="h-10" />
          </Link>
          <div className="hidden items-center gap-2 text-sm sm:flex">
            {user ? (
              <>
                <span className="rounded bg-amber-100 px-2 py-1 text-amber-900">{userLabel}</span>
                {user.role === "ADMIN" && <Link to="/admin" className="rounded bg-amber-700 px-2 py-1 text-white">Admin</Link>}
                {location.pathname === "/dashboard" ? (
                  <Link to="/" className="rounded bg-amber-700 px-2 py-1 text-white">Home</Link>
                ) : (
                  <Link to="/dashboard" className="rounded bg-amber-700 px-2 py-1 text-white">Dashboard</Link>
                )}
                <button onClick={logout} className="rounded bg-red-600 px-2 py-1 text-white">Logout</button>
              </>
            ) : (
              <Link to="/login" className="rounded bg-amber-600 px-2 py-1 text-white">
                Login
              </Link>
            )}
          </div>
        </div>
        {user && (
          <div className="mt-3 space-y-2 sm:hidden">
            <div className="rounded bg-amber-100 px-2 py-1 text-sm text-amber-900">{userLabel}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {user.role === "ADMIN" && (
                <Link to="/admin" className="rounded bg-amber-700 px-2 py-2 text-center text-white">Admin</Link>
              )}
              {location.pathname === "/dashboard" ? (
                <Link to="/" className="rounded bg-amber-700 px-2 py-2 text-center text-white">Home</Link>
              ) : (
                <Link to="/dashboard" className="rounded bg-amber-700 px-2 py-2 text-center text-white">Dashboard</Link>
              )}
              <button onClick={logout} className="rounded bg-red-600 px-2 py-2 text-center text-white">Logout</button>
            </div>
          </div>
        )}
        {!user && (
          <div className="mt-3 sm:hidden">
            <Link to="/login" className="block rounded bg-amber-600 px-2 py-2 text-center text-sm text-white">
              Login
            </Link>
          </div>
        )}
      </header>
      {children}
    </div>
  );
}
