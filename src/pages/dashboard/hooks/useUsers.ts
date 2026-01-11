import { useEffect, useState } from 'react'

import { listUsers, type User } from '@shared/services/usersService'

type UsersState =
  | { status: 'idle' | 'loading'; data: null; error: null }
  | { status: 'success'; data: User[]; error: null }
  | { status: 'error'; data: null; error: string }

export function useUsers() {
  const [state, setState] = useState<UsersState>({
    status: 'loading',
    data: null,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    listUsers()
      .then((data) => {
        if (cancelled) return
        setState({ status: 'success', data, error: null })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const message = getErrorMessage(e)
        setState({ status: 'error', data: null, error: message })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  if (typeof e === 'object' && e) {
    const maybe = e as { message?: unknown }
    if (typeof maybe.message === 'string') return maybe.message
  }
  return 'Error'
}
