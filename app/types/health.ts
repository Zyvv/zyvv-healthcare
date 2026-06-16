import type { CoreIdentity } from '@/core/types'

export interface PatientIdentity extends CoreIdentity {
  capsuleId: string
  createdAt: number
}

export interface VitalReading {
  type: 'heart_rate' | 'blood_pressure' | 'temperature' |
        'oxygen' | 'glucose' | 'custom'
  value: number
  unit: string
  recordedAt: number
  note?: string
}

export interface BiologicalSignal {
  readingId: string
  patientCommitment: string
  vitals: VitalReading[]
  encryptedAt: number
  expiresAt: number
}

export interface DiagnosticView {
  capsuleId: string
  signalCount: number
  latestVitals: VitalReading[]
  trend: 'stable' | 'improving' | 'declining' |
         'insufficient_data'
  generatedAt: number
  evaporatesAt: number
}

export type CapsuleResult<T> =
  | { ok: true; data: T; localOnly: true }
  | { ok: false; error: string;
      code: 'EXPIRED' | 'INVALID_PROOF' |
            'GATE_BLOCKED' | 'UNKNOWN' }