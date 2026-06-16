export interface CoreSession {
  id: string
  createdAt: number
  expiresAt: number
  evaporated: boolean
}

export interface CoreIdentity {
  commitment: string
}

export type AppDomain =
  | 'healthcare'
  | 'civic-life'
  | 'creative-economy'
  | 'education'

export interface AppManifest {
  domain: AppDomain
  version: string
  coreProtocolVersion: string
  allowsCrossAppData: false
}

export type ProtocolResult<T> =
  | { ok: true; data: T; evaporatesAt: number }
  | { ok: false; error: string;
      code: 'GATE_BLOCKED' | 'SESSION_EXPIRED' |
            'ZK_FAILED' | 'UNKNOWN' }