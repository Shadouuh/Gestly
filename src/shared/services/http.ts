export type HttpError = {
  status: number
  message: string
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const message = await safeReadText(res)
    const err: HttpError = { status: res.status, message: message || res.statusText }
    throw err
  }
  return (await res.json()) as T
}

async function safeReadText(res: Response) {
  try {
    return await res.text()
  } catch {
    return ''
  }
}

