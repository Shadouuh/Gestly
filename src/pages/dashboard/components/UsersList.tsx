import type { User } from '@shared/services/usersService'

type UsersListProps = {
  users: User[]
}

export function UsersList({ users }: UsersListProps) {
  return (
    <ul className="divide-y divide-[color:var(--border)] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-bg)]">
      {users.map((u) => (
        <li key={u.id} className="flex items-center justify-between px-4 py-3">
          <div className="font-medium tracking-tight">{u.name}</div>
          <div className="text-sm tracking-tight text-[color:var(--muted)]">#{u.id}</div>
        </li>
      ))}
    </ul>
  )
}
