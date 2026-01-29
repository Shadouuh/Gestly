import type { User } from '@shared/services/usersService'

type UsersListProps = {
  users: User[]
}

export function UsersList({ users }: UsersListProps) {
  return (
    <ul className="divide-y divide-[color:var(--border)] overflow-hidden rounded-[--radius] border border-[color:var(--border)] bg-[color:var(--card-bg)]">
      {users.map((u) => (
        <li key={u.id} className="flex items-center justify-between px-3 py-2">
          <div className="text-sm font-medium tracking-tight min-w-0 truncate pr-2">{u.name}</div>
          <div className="flex-shrink-0 text-xs tracking-tight text-[color:var(--muted)]">#{u.id}</div>
        </li>
      ))}
    </ul>
  )
}
