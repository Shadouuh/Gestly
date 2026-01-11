import { fetchJson } from './http'

export type User = {
  id: number
  name: string
}

export async function listUsers() {
  return fetchJson<User[]>('/api/users')
}

