import { useEffect, useState } from 'react'

import { getLanding, type LandingData } from '@shared/services/landingService'

type LandingState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: LandingData; error: null }
  | { status: 'error'; data: null; error: string }

export function useLanding() {
  const [state, setState] = useState<LandingState>({
    status: 'loading',
    data: null,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    getLanding()
      .then((data) => {
        if (cancelled) return
        setState({ status: 'success', data, error: null })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setState({ status: 'error', data: null, error: getErrorMessage(e) })
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

