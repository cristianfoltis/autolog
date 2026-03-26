import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <button
            onClick={logout}
            className="text-sm text-text-muted hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>

        <p className="text-text-secondary">Welcome, {user?.name ?? user?.email}</p>
      </div>
    </div>
  );
}
