import { UsersList } from './components/UsersList'
import { useUsers } from './hooks/useUsers'

export function DashboardPage() {
  const usersState = useUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm tracking-tight text-[color:var(--muted)]">
          Datos cargados desde JSON Server vía proxy /api.
        </p>
      </div>

      {usersState.status === 'loading' && (
        <div className="text-sm tracking-tight text-[color:var(--muted)]">Cargando usuarios…</div>
      )}
      {usersState.status === 'error' && (
        <div className="text-sm tracking-tight text-[color:var(--text)]">{usersState.error}</div>
      )}
      {usersState.status === 'success' && <UsersList users={usersState.data} />}
    </div>
  )
}
