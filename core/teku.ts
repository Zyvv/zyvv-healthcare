export interface TekuSession {
  id: string
  createdAt: number
  expiresAt: number
  data: Record<string, unknown>
}

const SESSION_TTL_MS = 30 * 60 * 1000

export function createSession(id: string): TekuSession {
  const now = Date.now()
  return { id, createdAt: now,
           expiresAt: now + SESSION_TTL_MS, data: {} }
}

export function isSessionExpired(session: TekuSession): boolean {
  return Date.now() > session.expiresAt
}

export function evaporateSession(session: TekuSession): void {
  for (const key in session.data) {
    session.data[key] = undefined
    delete session.data[key]
  }
  session.expiresAt = 0
}

export function createEvaporatingStore() {
  const store = new Map<string, TekuSession>()
  return {
    set(id: string, session: TekuSession) {
      store.set(id, session)
    },
    get(id: string): TekuSession | undefined {
      const session = store.get(id)
      if (!session) return undefined
      if (isSessionExpired(session)) {
        evaporateSession(session)
        store.delete(id)
        return undefined
      }
      return session
    },
    destroy(id: string): void {
      const session = store.get(id)
      if (session) evaporateSession(session)
      store.delete(id)
    },
  }
}